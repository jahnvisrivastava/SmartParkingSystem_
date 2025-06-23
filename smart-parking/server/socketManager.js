// Track locked slots with timeout IDs
const lockedSlots = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When user starts booking process - lock the slot for 5 minutes
    socket.on('lock-slot', ({ floorId, slotId, userId }) => {
      const slotKey = `${floorId}-${slotId}`;
      
      // If slot is already locked by someone else, reject
      if (lockedSlots.has(slotKey) && lockedSlots.get(slotKey).userId !== userId) {
        socket.emit('slot-lock-rejected', { 
          floorId, 
          slotId, 
          message: 'Slot is currently being booked by another user' 
        });
        return;
      }
      
      // If slot was previously locked by same user, clear the timeout
      if (lockedSlots.has(slotKey)) {
        clearTimeout(lockedSlots.get(slotKey).timeoutId);
      }
      
      // Create a timeout to automatically unlock after 5 minutes (300000ms)
      const timeoutId = setTimeout(() => {
        if (lockedSlots.has(slotKey)) {
          lockedSlots.delete(slotKey);
          // Broadcast to all clients that slot is now available
          io.emit('slot-unlocked', { floorId, slotId });
          // Notify the user who locked it that their time expired
          socket.emit('slot-lock-expired', { floorId, slotId });
        }
      }, 300000); // 5 minutes
      
      // Store the lock information
      lockedSlots.set(slotKey, { userId, timeoutId });
      
      // Broadcast to all clients that slot is now locked
      io.emit('slot-locked', { floorId, slotId, userId });
      
      // Send confirmation to the user who locked it
      socket.emit('slot-lock-confirmed', { 
        floorId, 
        slotId, 
        expiresIn: 300 // seconds
      });
    });
    
    // When user completes the booking process
    socket.on('complete-booking', ({ floorId, slotId }) => {
      const slotKey = `${floorId}-${slotId}`;
      
      // Clear the timeout if exists
      if (lockedSlots.has(slotKey)) {
        clearTimeout(lockedSlots.get(slotKey).timeoutId);
        lockedSlots.delete(slotKey);
      }
      
      // Broadcast to all clients that slot is now booked
      io.emit('slot-booked', { floorId, slotId });
    });
    
    // When user manually cancels the booking process
    socket.on('cancel-booking-process', ({ floorId, slotId }) => {
      const slotKey = `${floorId}-${slotId}`;
      
      // Clear the timeout if exists
      if (lockedSlots.has(slotKey)) {
        clearTimeout(lockedSlots.get(slotKey).timeoutId);
        lockedSlots.delete(slotKey);
      }
      
      // Broadcast to all clients that slot is now available
      io.emit('slot-unlocked', { floorId, slotId });
    });
    
    // When a booking is cancelled
    socket.on('booking-cancelled', ({ floorId, slotId }) => {
      io.emit('slot-unlocked', { floorId, slotId });
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 