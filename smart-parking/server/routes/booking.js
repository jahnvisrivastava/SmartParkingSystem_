const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const { isAuthenticated } = require('../middleware/auth');

// Initialize parking slots if they don't exist
router.get('/init-slots', async (req, res) => {
  try {
    // Check if slots already exist
    const existingSlots = await Slot.countDocuments({});
    
    // If slots already exist, return
    if (existingSlots > 0) {
      return res.status(200).json({
        message: 'Slots already initialized',
        count: existingSlots
      });
    }
    
    // Create slots for 4 floors with 16 slots each
    const slots = [];
    for (let floor = 1; floor <= 4; floor++) {
      for (let slotNum = 1; slotNum <= 16; slotNum++) {
        slots.push({
          floorNumber: floor,
          slotNumber: slotNum,
          isBooked: false
        });
      }
    }
    
    // Insert all slots
    await Slot.insertMany(slots);
    
    res.status(201).json({
      message: 'Parking slots initialized successfully',
      count: slots.length
    });
    
  } catch (error) {
    console.error('Error initializing slots:', error);
    res.status(500).json({ message: 'Error initializing parking slots' });
  }
});

// Get all slots (grouped by floor)
router.get('/slots', async (req, res) => {
  try {
    const slots = await Slot.find().populate('bookedBy', 'username email');
    
    // Group slots by floor
    const floorMap = {};
    slots.forEach(slot => {
      const floor = slot.floorNumber;
      if (!floorMap[floor]) {
        floorMap[floor] = [];
      }
      floorMap[floor].push(slot);
    });
    
    res.status(200).json({
      floors: floorMap
    });
    
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Error fetching parking slots' });
  }
});

// Get a specific floor
router.get('/slots/floor/:floorNumber', async (req, res) => {
  try {
    const { floorNumber } = req.params;
    
    const slots = await Slot.find({ floorNumber: parseInt(floorNumber) })
      .populate('bookedBy', 'username email');
    
    res.status(200).json({
      floor: parseInt(floorNumber),
      slots
    });
    
  } catch (error) {
    console.error('Error fetching floor slots:', error);
    res.status(500).json({ message: 'Error fetching floor slots' });
  }
});

// Book a slot
router.post('/book-slot', isAuthenticated, async (req, res) => {
  try {
    const { floorNumber, slotNumber, carNumberPlate, carColor, duration } = req.body;
    
    if (!floorNumber || !slotNumber || !carNumberPlate || !carColor || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find the slot
    const slot = await Slot.findOne({
      floorNumber: parseInt(floorNumber),
      slotNumber: parseInt(slotNumber)
    });
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }
    
    // Calculate cost and times
    const durationHours = parseInt(duration);
    const totalCost = Slot.calculateCost(durationHours);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    
    // Update slot status
    slot.isBooked = true;
    slot.bookedBy = req.user._id;
    slot.carDetails = {
      numberPlate: carNumberPlate,
      color: carColor
    };
    slot.startTime = startTime;
    slot.duration = durationHours;
    slot.totalCost = totalCost;
    
    await slot.save();
    
    // Create booking record
    const booking = new Booking({
      user: req.user._id,
      slot: slot._id,
      carDetails: {
        numberPlate: carNumberPlate,
        color: carColor
      },
      startTime,
      endTime,
      duration: durationHours,
      totalCost,
      status: 'active'
    });
    
    await booking.save();
    
    res.status(201).json({
      message: 'Slot booked successfully',
      booking: {
        id: booking._id,
        slot: {
          floorNumber,
          slotNumber
        },
        carDetails: booking.carDetails,
        startTime,
        endTime,
        duration: durationHours,
        totalCost,
        status: booking.status
      }
    });
    
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Error booking slot' });
  }
});

// Get my bookings
router.get('/my-bookings', isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user._id,
      status: { $ne: 'cancelled' }
    })
    .populate('slot', 'floorNumber slotNumber')
    .sort({ createdAt: -1 });
    
    // Calculate time remaining for each booking
    const bookingsWithDetails = bookings.map(booking => {
      const now = new Date();
      const endTime = new Date(booking.endTime);
      let timeRemaining = null;
      
      if (now < endTime) {
        const diffMs = endTime - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = `${diffHrs}h ${diffMins}m`;
      } else {
        timeRemaining = "Expired";
      }
      
      return {
        ...booking.toObject(),
        timeRemaining
      };
    });
    
    res.status(200).json({
      bookings: bookingsWithDetails
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching your bookings' });
  }
});

// Cancel booking
router.delete('/cancel-booking/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id
    }).populate('slot');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }
    
    // If car has entered, require payment
    if (booking.carEntered) {
      booking.status = 'cancelled';
      // Don't free up the slot yet, requiring admin intervention for payment
      await booking.save();
      
      return res.status(200).json({
        message: 'Your booking has been cancelled. Since your car has already entered the parking area, please visit the payment counter to complete the payment.',
        requiresPayment: true
      });
    } else {
      // Standard cancellation if car hasn't entered
      booking.status = 'cancelled';
      await booking.save();
      
      // Free up the slot
      await Slot.findByIdAndUpdate(booking.slot._id, {
        isBooked: false,
        bookedBy: null,
        carDetails: {
          numberPlate: '',
          color: ''
        },
        startTime: null,
        duration: 0,
        totalCost: 0
      });
      
      return res.status(200).json({
        message: 'Booking cancelled successfully',
        requiresPayment: false
      });
    }
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Calculate cost for a given duration (for client-side estimation)
router.get('/calculate-cost/:durationHours', (req, res) => {
  try {
    const { durationHours } = req.params;
    const totalCost = Slot.calculateCost(parseInt(durationHours));
    
    res.status(200).json({
      durationHours: parseInt(durationHours),
      totalCost
    });
    
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ message: 'Error calculating cost' });
  }
});

module.exports = router; 