import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ParkingLayout from '../components/ParkingLayout';
import Parking3DView from '../components/Parking3DView';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user?.username}!</h1>
        <p className="text-gray-600">
          Find and book a parking slot from the layout below. Your booked slots will appear in blue.
        </p>
      </div>
      
      <ParkingLayout />
    </div>
  );
};

export default Dashboard; 