import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaCar, FaRupeeSign } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import { slotService } from '../services/api';

const BookingModal = ({ slot, onClose, onSuccess }) => {
  const [carNumberPlate, setCarNumberPlate] = useState('');
  const [carColor, setCarColor] = useState('');
  const [duration, setDuration] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(50);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  const { cancelBookingProcess, completeBooking } = useSocket();

  // Calculate estimated cost when duration changes
  useEffect(() => {
    const calculateCost = async () => {
      try {
        const { totalCost } = await slotService.calculateCost(duration);
        setEstimatedCost(totalCost);
      } catch (error) {
        console.error('Error calculating cost:', error);
        // Fallback calculation in case API call fails
        const baseCost = 50;
        const additionalBlocks = Math.max(0, Math.ceil(duration / 12) - 1);
        setEstimatedCost(baseCost + (additionalBlocks * 20));
      }
    };

    calculateCost();
  }, [duration]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleCancel();
          toast.error('Time expired. Please try booking again.');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!carNumberPlate || !carColor || !duration) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Book the slot
      await slotService.bookSlot({
        floorNumber: slot.floorNumber,
        slotNumber: slot.slotNumber,
        carNumberPlate,
        carColor,
        duration
      });
      
      // Notify socket that booking is complete
      completeBooking(slot.floorNumber, slot.slotNumber);
      
      toast.success('Slot booked successfully!');
      
      // Close modal and refresh parent
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error booking slot. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Notify socket to unlock the slot
    cancelBookingProcess(slot.floorNumber, slot.slotNumber);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button 
          onClick={handleCancel} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
        
        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-primary-800">Book Parking Slot</h2>
        
        {/* Slot info */}
        <div className="mb-6 bg-gray-100 p-3 rounded-md flex items-center justify-between ">
          <div>
            <p className="text-sm text-gray-500">Floor {slot.floorNumber}</p>
            <p className="font-medium text-black">Slot {slot.slotNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-500 font-medium">Time remaining:</p>
            <p className="font-bold text-black">{formatTime(timeLeft)}</p>
          </div>
        </div>
        
        {/* Booking form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Car Number Plate
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={carNumberPlate}
                onChange={(e) => setCarNumberPlate(e.target.value)}
                className="input pl-10"
                placeholder="e.g. KA-01-AB-1234"
                required
              />
              <FaCar className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Car Color
            </label>
            <input 
              type="text" 
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              className="input"
              placeholder="e.g. Red"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Duration (hours)
            </label>
            <input 
              type="number" 
              min="1"
              max="72"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="input"
              required
            />
          </div>
          
          {/* Cost estimation */}
          <div className="bg-gray-50 p-3 rounded-md mb-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-medium">Estimated Cost:</p>
              <p className="text-xl font-bold flex items-center text-primary-800">
                <FaRupeeSign className="text-sm" />
                {estimatedCost}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base charge: ₹50 for up to 12 hours + ₹20 per additional 12 hours
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 