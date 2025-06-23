import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lockedSlots, setLockedSlots] = useState(new Map());
  const { user } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is logged in
    if (user) {
      const socketInstance = io('http://localhost:5000', {
        withCredentials: true,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle slot locking events
      socketInstance.on('slot-locked', ({ floorId, slotId, userId }) => {
        setLockedSlots(prevState => {
          const newMap = new Map(prevState);
          newMap.set(`${floorId}-${slotId}`, { userId, timestamp: Date.now() });
          return newMap;
        });
      });

      socketInstance.on('slot-unlocked', ({ floorId, slotId }) => {
        setLockedSlots(prevState => {
          const newMap = new Map(prevState);
          newMap.delete(`${floorId}-${slotId}`);
          return newMap;
        });
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  // Lock a slot
  const lockSlot = (floorId, slotId) => {
    if (socket && user) {
      socket.emit('lock-slot', {
        floorId,
        slotId,
        userId: user.id
      });
    }
  };

  // Complete booking
  const completeBooking = (floorId, slotId) => {
    if (socket) {
      socket.emit('complete-booking', {
        floorId,
        slotId
      });
    }
  };

  // Cancel booking process
  const cancelBookingProcess = (floorId, slotId) => {
    if (socket) {
      socket.emit('cancel-booking-process', {
        floorId,
        slotId
      });
    }
  };

  // Notify booking cancellation
  const notifyBookingCancelled = (floorId, slotId) => {
    if (socket) {
      socket.emit('booking-cancelled', {
        floorId,
        slotId
      });
    }
  };

  // Check if a slot is locked by the current user
  const isSlotLockedByMe = (floorId, slotId) => {
    const key = `${floorId}-${slotId}`;
    return lockedSlots.has(key) && lockedSlots.get(key).userId === user?.id;
  };

  // Check if a slot is locked by someone else
  const isSlotLockedByOthers = (floorId, slotId) => {
    const key = `${floorId}-${slotId}`;
    return lockedSlots.has(key) && lockedSlots.get(key).userId !== user?.id;
  };

  const value = {
    socket,
    isConnected,
    lockSlot,
    completeBooking,
    cancelBookingProcess,
    notifyBookingCancelled,
    isSlotLockedByMe,
    isSlotLockedByOthers,
    lockedSlots
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 