import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCar, FaRupeeSign, FaCalendarAlt, FaClock, FaTimes, FaExclamationTriangle, FaMapMarkedAlt, FaCube, FaQrcode } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import { bookingService } from '../services/api';
import ParkingMap from '../components/ParkingMap';
import QRDirections from '../components/QRDirections';
import Parking3DView from '../components/Parking3DView';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map', 'qr', or '3d'
  const { notifyBookingCancelled } = useSocket();

  useEffect(() => {
    fetchBookings();
  }, []);

  // Refresh time remaining every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setBookings(prevBookings => 
        prevBookings.map(booking => ({
          ...booking,
          timeRemaining: getLocalRemainingTime(booking.endTime)
        }))
      );
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId, floorNumber, slotNumber) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await bookingService.cancelBooking(bookingId);
      
      if (response.requiresPayment) {
        toast.warning(response.message);
      } else {
        // Notify other users via socket that the slot is now available
        notifyBookingCancelled(floorNumber, slotNumber);
        toast.success('Booking cancelled successfully!');
      }
      
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate time remaining locally (for UI updates)
  const getLocalRemainingTime = (endTimeStr) => {
    const now = new Date();
    const end = new Date(endTimeStr);
    
    // If already expired
    if (now > end) {
      return 'Expired';
    }
    
    const diffMs = end - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // New function for view toggle buttons
  const renderViewToggle = (booking) => {
    return (
      <div className="mb-4 flex justify-center border-b pb-2">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === 'map' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            <FaMapMarkedAlt className="inline-block mr-1" />
            Map View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('qr')}
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === 'qr' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-r border-gray-300`}
          >
            <FaQrcode className="inline-block mr-1" />
            QR Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === '3d' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-r border-gray-300`}
          >
            <FaCube className="inline-block mr-1" />
            3D View
          </button>
        </div>
      </div>
    );
  };

  // Render the selected navigation view
  const renderNavigationView = (booking) => {
    switch(viewMode) {
      case 'qr':
        return (
          <QRDirections
            floorNumber={booking.slot.floorNumber}
            slotNumber={booking.slot.slotNumber}
          />
        );
      case '3d':
        return (
          <Parking3DView
            floorNumber={booking.slot.floorNumber}
            slotNumber={booking.slot.slotNumber}
          />
        );
      case 'map':
      default:
        return (
          <ParkingMap 
            floorNumber={booking.slot.floorNumber} 
            slotNumber={booking.slot.slotNumber} 
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have any active bookings.</p>
          <a href="/dashboard" className="mt-4 inline-block btn-primary">
            Book a Slot
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-cent er space-x-2">
                  <FaCar className="text-primary-600" />
                  <span className="font-medium text-primary-960">
                    Floor {booking.slot.floorNumber}, Slot {booking.slot.slotNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.isPaid ? 'Paid' : 'Payment Pending'}
                  </span>
                  
                  {booking.carEntered && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Car In Parking
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCar className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Car Details</p>
                        <p className="font-medium text-primary-960">{booking.carDetails.numberPlate} ({booking.carDetails.color})</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Booking Time</p>
                        <p className="font-medium text-primary-960">{formatDate(booking.startTime)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FaClock className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-primary-960">{booking.duration} hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <FaRupeeSign className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total Cost</p>
                        <p className="font-medium text-primary-960">₹{booking.totalCost}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Time Remaining</p>
                    <p className={`font-medium ${booking.timeRemaining === 'Expired' ? 'text-red-600' : 'text-green-600'}`}>
                      {booking.timeRemaining}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => cancelBooking(booking._id, booking.slot.floorNumber, booking.slot.slotNumber)}
                    className="btn-danger flex items-center space-x-1"
                    disabled={booking.status === 'cancelled'}
                  >
                    <FaTimes />
                    <span>Cancel Booking</span>
                  </button>
                </div>
                
                {/* Parking Navigation Map */}
                {booking.status === 'active' && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-800 mb-2">Find Your Parking Spot</h3>
                    {renderViewToggle(booking)}
                    {renderNavigationView(booking)}
                  </div>
                )}
                
                {booking.carEntered && booking.status === 'cancelled' && (
                  <div className="mt-3 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Your booking has been cancelled, but your car is still in the parking area. 
                        Please visit the payment counter to complete the payment before leaving.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings; 