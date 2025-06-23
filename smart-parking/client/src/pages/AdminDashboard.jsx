import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaCar, 
  FaMoneyBillWave, 
  FaExclamationTriangle,
  FaCheck,
  FaFilter,
  FaRupeeSign,
  FaUser,
  FaCarSide,
  FaDollarSign
} from 'react-icons/fa';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [floorStats, setFloorStats] = useState({});
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    cancelledRevenue: 0,
    bookingCount: 0
  });
  const [underutilizedFloors, setUnderutilizedFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [filterPaid, setFilterPaid] = useState('all'); // 'all', 'paid', 'unpaid'
  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'completed', 'cancelled', 'all'

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
      await fetchCancelledBookings();
    };
    
    loadData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsData = await adminService.getAllBookings({ status: filterStatus });
      setBookings(bookingsData.bookings || []);
      
      // Fetch floor statistics
      const floorData = await adminService.getFloorStats();
      setFloorStats(floorData.floorStats || {});
      setUnderutilizedFloors(floorData.underutilizedFloors || []);
      
      // Fetch revenue statistics
      const revenueData = await adminService.getRevenueStats();
      setRevenueStats(revenueData);
      
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCancelledBookings = async () => {
    try {
      const response = await adminService.getCancelledBookingsWithPayment();
      setCancelledBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error);
    }
  };

  const markAsPaid = async (bookingId) => {
    try {
      await adminService.markBookingAsPaid(bookingId);
      toast.success('Booking marked as paid successfully!');
      fetchDashboardData();
      fetchCancelledBookings();
    } catch (error) {
      console.error('Error marking booking as paid:', error);
      toast.error('Failed to update payment status. Please try again.');
    }
  };

  const markCarEntered = async (bookingId) => {
    try {
      await adminService.markCarEntered(bookingId);
      toast.success('Car entry recorded successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking car entry:', error);
      toast.error('Failed to update car entry status. Please try again.');
    }
  };

  const completeCancelledBooking = async (bookingId) => {
    try {
      await adminService.completeCancelledBooking(bookingId);
      toast.success('Cancelled booking has been completed and payment processed!');
      fetchDashboardData();
      fetchCancelledBookings();
    } catch (error) {
      console.error('Error completing cancelled booking:', error);
      toast.error('Failed to complete cancelled booking. Please try again.');
    }
  };

  const markCarExited = async (bookingId) => {
    try {
      await adminService.markCarExited(bookingId);
      toast.success('Car checkout completed. Parking slot is now available!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking car as exited:', error);
      toast.error('Failed to checkout car. Please try again.');
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    adminService.getAllBookings({ status }).then(data => {
      setBookings(data.bookings || []);
    });
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter bookings based on payment status
  const filteredBookings = bookings.filter(booking => {
    if (filterPaid === 'all') return true;
    if (filterPaid === 'paid') return booking.isPaid;
    if (filterPaid === 'unpaid') return !booking.isPaid;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold">{revenueStats.bookingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <FaMoneyBillWave className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold flex items-center">
                <FaRupeeSign className="text-lg mr-1" />
                {revenueStats.totalRevenue}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <FaCheck className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Paid Amount</p>
              <p className="text-2xl font-bold flex items-center">
                <FaRupeeSign className="text-lg mr-1" />
                {revenueStats.paidRevenue}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold flex items-center">
                <FaRupeeSign className="text-lg mr-1" />
                {revenueStats.pendingRevenue}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cancelled Bookings Requiring Payment */}
      {cancelledBookings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            Cancelled Bookings Requiring Payment ({cancelledBookings.length})
          </h3>
          <p className="text-sm text-red-700 mb-4">
            The following bookings were cancelled but the car entered the parking area and requires payment processing.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {cancelledBookings.map((booking) => (
                  <tr key={booking._id} className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        Floor {booking.slot.floorNumber}, Slot {booking.slot.slotNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.user?.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.carDetails.numberPlate} ({booking.carDetails.color})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{booking.totalCost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => completeCancelledBooking(booking._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center ml-auto"
                      >
                        <FaDollarSign className="mr-1" />
                        Mark As Paid & Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`bg-white px-6 py-4 text-sm font-medium ${
              activeTab === 'bookings' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaCar className="inline mr-2" />
            Bookings
          </button>
          <button
            className={`bg-white px-6 py-4 text-sm font-medium ${
              activeTab === 'floors' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('floors')}
          >
            <FaExclamationTriangle className= "inline mr-2" />
            Floor Stats
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Current Bookings</h2>
                
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className=" bg-white border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FaFilter className="text-gray-400" />
                    <select
                      value={filterPaid}
                      onChange={(e) => setFilterPaid(e.target.value)}
                      className=" bg-white border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {filteredBookings.length === 0 ? (
                <p className="text-center py-4 bg-white">No bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Car Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              Floor {booking.slot.floorNumber}, Slot {booking.slot.slotNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaUser className="text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.carDetails.numberPlate}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.carDetails.color}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.duration} hours
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.startTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium flex items-center">
                              <FaRupeeSign className="text-xs mr-1" />
                              {booking.totalCost}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.isPaid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.isPaid ? 'Paid' : 'Payment Pending'}
                              </span>
                              
                              {booking.carEntered && !booking.carExited && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Car In Parking
                                </span>
                              )}
                              
                              {booking.carExited && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Car Checked Out
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-y-2">
                            {!booking.isPaid && (
                              <button
                                onClick={() => markAsPaid(booking._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center ml-auto"
                              >
                                <FaDollarSign className="mr-1" />
                                Mark As Paid
                              </button>
                            )}
                            
                            {booking.status === 'active' && !booking.carEntered && (
                              <button
                                onClick={() => markCarEntered(booking._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center ml-auto"
                              >
                                <FaCarSide className="mr-1" />
                                Mark Car Entered
                              </button>
                            )}

                            {booking.isPaid && booking.carEntered && !booking.carExited && (
                              <button
                                onClick={() => markCarExited(booking._id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center ml-auto"
                              >
                                <FaCarSide className="mr-1" />
                                Checkout Car
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'floors' && (
            <div>
              <h2 className="text-lg font-bold mb-6">Floor Utilization</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.keys(floorStats).map(floor => {
                  const stats = floorStats[floor];
                  const occupancyRate = stats.occupancyRate.toFixed(2);
                  
                  return (
                    <div key={floor} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-medium">Floor {floor}</h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                              <span className="text-sm font-medium text-gray-700">{occupancyRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  occupancyRate < 30 
                                    ? 'bg-red-600' 
                                    : occupancyRate < 70 
                                      ? 'bg-yellow-600' 
                                      : 'bg-green-600'
                                }`} 
                                style={{ width: `${occupancyRate}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-500">Total Slots</p>
                              <p className="text-lg font-bold">{stats.totalSlots}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-500">Booked Slots</p>
                              <p className="text-lg font-bold">{stats.bookedSlots}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-500">Available Slots</p>
                              <p className="text-lg font-bold">{stats.availableSlots}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {underutilizedFloors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="font-medium text-red-800 mb-2 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Underutilized Floors
                  </h3>
                  <p className="text-sm text-red-700 mb-2">
                    The following floors have less than 30% occupancy:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {underutilizedFloors.map((item, index) => (
                      <li key={index}>
                        Floor {item.floor} - {item.occupancyRate} occupancy
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 