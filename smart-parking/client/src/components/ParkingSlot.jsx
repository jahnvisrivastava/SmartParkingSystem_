import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaCar } from 'react-icons/fa';
import { BsLockFill } from 'react-icons/bs';
import BookingModal from './BookingModal';

const ParkingSlot = ({ slot, onBookingSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { isSlotLockedByMe, isSlotLockedByOthers, lockSlot } = useSocket();

  const handleSlotClick = () => {
    // If slot is already booked, don't do anything
    if (slot.isBooked) return;
    
    // Check if the slot is locked by someone else
    if (isSlotLockedByOthers(slot.floorNumber, slot.slotNumber)) return;
    
    // Lock the slot for this user
    lockSlot(slot.floorNumber, slot.slotNumber);
    
    // Show the booking modal
    setShowModal(true);
  };

  // Determine slot color/status
  const getSlotStatusClasses = () => {
    // If the slot is booked by the current user
    if (slot.isBooked && slot.bookedBy?._id === user?.id) {
      return 'bg-user text-white cursor-default';
    }
    
    // If the slot is booked by someone else
    if (slot.isBooked) {
      return 'bg-booked text-white cursor-default';
    }
    
    // If the slot is currently locked by this user for booking
    if (isSlotLockedByMe(slot.floorNumber, slot.slotNumber)) {
      return 'bg-yellow-500 text-white cursor-pointer';
    }
    
    // If the slot is locked by someone else
    if (isSlotLockedByOthers(slot.floorNumber, slot.slotNumber)) {
      return 'bg-gray-500 text-white cursor-not-allowed';
    }
    
    // Available slot
    return 'bg-available text-white hover:bg-available/80 cursor-pointer';
  };

  return (
    <>
      <div 
        className={`relative rounded-md w-20 h-20 flex flex-col items-center justify-center transition-colors ${getSlotStatusClasses()}`}
        onClick={handleSlotClick}
      >
        <FaCar className="text-2xl mb-1" />
        <span className="text-sm font-medium">{slot.slotNumber}</span>
        
        {/* Lock icon for locked slots */}
        {(isSlotLockedByMe(slot.floorNumber, slot.slotNumber) || isSlotLockedByOthers(slot.floorNumber, slot.slotNumber)) && (
          <BsLockFill className="absolute top-1 right-1 text-sm" />
        )}
      </div>
      
      {/* Booking Modal */}
      {showModal && (
        <BookingModal 
          slot={slot} 
          onClose={() => setShowModal(false)} 
          onSuccess={onBookingSuccess}
        />
      )}
    </>
  );
};

export default ParkingSlot; 