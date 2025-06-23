const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin middleware - all routes in this file require both isAuthenticated and isAdmin
router.use(isAuthenticated, isAdmin);

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, isPaid, carEntered } = req.query;
    
    // Build filter based on query params
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }
    
    if (carEntered !== undefined) {
      filter.carEntered = carEntered === 'true';
    }
    
    const bookings = await Booking.find(filter)
      .populate('user', 'username email')
      .populate('slot', 'floorNumber slotNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      count: bookings.length,
      bookings
    });
    
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Mark car as entered
router.patch('/mark-car-entered/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Car entry can only be marked for active bookings' });
    }
    
    // Update booking with car entry status
    booking.carEntered = true;
    await booking.save();
    
    res.status(200).json({
      message: 'Car entry marked successfully',
      booking
    });
    
  } catch (error) {
    console.error('Error marking car entry:', error);
    res.status(500).json({ message: 'Error updating car entry status' });
  }
});

// Complete a cancelled booking (mark as paid and free up slot)
router.patch('/complete-cancelled-booking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only cancelled bookings can be completed' });
    }
    
    // Update booking payment status
    booking.isPaid = true;
    await booking.save();
    
    // Free up the slot
    await Slot.findByIdAndUpdate(booking.slot, {
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
    
    res.status(200).json({
      message: 'Cancelled booking has been marked as paid and completed',
      booking
    });
    
  } catch (error) {
    console.error('Error completing cancelled booking:', error);
    res.status(500).json({ message: 'Error completing cancelled booking' });
  }
});

// Get floor usage stats
router.get('/stats/floors', async (req, res) => {
  try {
    // Get all slots
    const slots = await Slot.find();
    
    // Calculate stats per floor
    const floorStats = {};
    
    // Initialize floor stats
    for (let i = 1; i <= 4; i++) {
      floorStats[i] = {
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        occupancyRate: 0
      };
    }
    
    // Count slots by floor and status
    slots.forEach(slot => {
      const floor = slot.floorNumber;
      
      floorStats[floor].totalSlots++;
      
      if (slot.isBooked) {
        floorStats[floor].bookedSlots++;
      } else {
        floorStats[floor].availableSlots++;
      }
    });
    
    // Calculate occupancy rates
    Object.keys(floorStats).forEach(floor => {
      const stats = floorStats[floor];
      stats.occupancyRate = (stats.bookedSlots / stats.totalSlots) * 100;
    });
    
    // Find underutilized floors (less than 30% occupancy)
    const underutilizedFloors = Object.keys(floorStats)
      .filter(floor => floorStats[floor].occupancyRate < 30)
      .map(floor => ({
        floor: parseInt(floor),
        occupancyRate: floorStats[floor].occupancyRate.toFixed(2) + '%'
      }));
    
    res.status(200).json({
      floorStats,
      underutilizedFloors
    });
    
  } catch (error) {
    console.error('Error fetching floor stats:', error);
    res.status(500).json({ message: 'Error fetching floor statistics' });
  }
});

// Mark booking as paid
router.patch('/mark-paid/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update booking payment status
    booking.isPaid = true;
    await booking.save();
    
    let message = 'Booking marked as paid successfully';
    
    // If the booking is cancelled, free up the slot after payment
    if (booking.status === 'cancelled') {
      // Free up the slot
      await Slot.findByIdAndUpdate(booking.slot, {
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
      
      message = 'Cancelled booking marked as paid and slot freed up';
    }
    
    res.status(200).json({
      message,
      booking
    });
    
  } catch (error) {
    console.error('Error marking booking as paid:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

// Get revenue statistics
router.get('/stats/revenue', async (req, res) => {
  try {
    // Get all bookings
    const bookings = await Booking.find();
    
    // Calculate total and paid revenue
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    let cancelledRevenue = 0;
    
    bookings.forEach(booking => {
      if (booking.status === 'cancelled' && !booking.carEntered) {
        // Don't count cancelled bookings where car never entered
        return;
      }
      
      totalRevenue += booking.totalCost;
      
      if (booking.isPaid) {
        paidRevenue += booking.totalCost;
      } else if (booking.status === 'cancelled' && booking.carEntered) {
        cancelledRevenue += booking.totalCost;
      } else {
        pendingRevenue += booking.totalCost;
      }
    });
    
    res.status(200).json({
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      cancelledRevenue,
      bookingCount: bookings.length
    });
    
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: 'Error fetching revenue statistics' });
  }
});

// Mark car as exited and free up slot
router.patch('/mark-car-exited/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (!booking.carEntered) {
      return res.status(400).json({ message: 'Cannot mark car as exited if it has not entered' });
    }
    
    if (booking.carExited) {
      return res.status(400).json({ message: 'Car has already been marked as exited' });
    }
    
    if (!booking.isPaid) {
      return res.status(400).json({ message: 'Booking must be paid before car can exit' });
    }
    
    // Update booking with car exit status and mark as completed
    booking.carExited = true;
    booking.status = 'completed';
    await booking.save();
    
    // Free up the slot
    await Slot.findByIdAndUpdate(booking.slot, {
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
    
    res.status(200).json({
      message: 'Car exit recorded successfully and slot is now available',
      booking
    });
    
  } catch (error) {
    console.error('Error marking car exit:', error);
    res.status(500).json({ message: 'Error updating car exit status' });
  }
});

module.exports = router; 