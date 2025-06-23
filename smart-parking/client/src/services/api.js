import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Slots API
export const slotService = {
  // Initialize slots
  initializeSlots: async () => {
    const response = await axios.get(`${API_URL}/init-slots`);
    return response.data;
  },
  
  // Get all slots
  getAllSlots: async () => {
    const response = await axios.get(`${API_URL}/slots`);
    return response.data;
  },
  
  // Get slots for a specific floor
  getFloorSlots: async (floorNumber) => {
    const response = await axios.get(`${API_URL}/slots/floor/${floorNumber}`);
    return response.data;
  },
  
  // Book a slot
  bookSlot: async (bookingData) => {
    const response = await axios.post(`${API_URL}/book-slot`, bookingData);
    return response.data;
  },
  
  // Calculate cost
  calculateCost: async (durationHours) => {
    const response = await axios.get(`${API_URL}/calculate-cost/${durationHours}`);
    return response.data;
  }
};

// Bookings API
export const bookingService = {
  // Get user's bookings
  getMyBookings: async () => {
    const response = await axios.get(`${API_URL}/my-bookings`);
    return response.data;
  },
  
  // Cancel a booking
  cancelBooking: async (bookingId) => {
    const response = await axios.delete(`${API_URL}/cancel-booking/${bookingId}`);
    return response.data;
  }
};

// Admin API
export const adminService = {
  // Get all bookings
  getAllBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/admin/bookings?${queryParams}`);
    return response.data;
  },
  
  // Get floor statistics
  getFloorStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats/floors`);
    return response.data;
  },
  
  // Mark booking as paid
  markBookingAsPaid: async (bookingId) => {
    const response = await axios.patch(`${API_URL}/admin/mark-paid/${bookingId}`);
    return response.data;
  },
  
  // Mark car as entered
  markCarEntered: async (bookingId) => {
    const response = await axios.patch(`${API_URL}/admin/mark-car-entered/${bookingId}`);
    return response.data;
  },
  
  // Mark car as exited and free up slot
  markCarExited: async (bookingId) => {
    const response = await axios.patch(`${API_URL}/admin/mark-car-exited/${bookingId}`);
    return response.data;
  },
  
  // Complete cancelled booking
  completeCancelledBooking: async (bookingId) => {
    const response = await axios.patch(`${API_URL}/admin/complete-cancelled-booking/${bookingId}`);
    return response.data;
  },
  
  // Get revenue statistics
  getRevenueStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats/revenue`);
    return response.data;
  },
  
  // Get cancelled bookings that need payment
  getCancelledBookingsWithPayment: async () => {
    const queryParams = new URLSearchParams({
      status: 'cancelled',
      carEntered: 'true',
      isPaid: 'false'
    }).toString();
    
    const response = await axios.get(`${API_URL}/admin/bookings?${queryParams}`);
    return response.data;
  }
};