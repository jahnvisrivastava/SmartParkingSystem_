import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { slotService } from '../services/api';
import ParkingSlot from './ParkingSlot';

const ParkingLayout = () => {
  const [floors, setFloors] = useState({});
  const [currentFloor, setCurrentFloor] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAndFetchSlots = async () => {
      try {
        setLoading(true);
        await slotService.initializeSlots();
        const { floors } = await slotService.getAllSlots();
        setFloors(floors);
      } catch (error) {
        console.error('Error fetching slots:', error);
        toast.error('Error loading parking slots. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchSlots();
  }, []);

  const refreshSlots = async () => {
    try {
      const { floors } = await slotService.getAllSlots();
      setFloors(floors);
    } catch (error) {
      console.error('Error refreshing slots:', error);
    }
  };

  const renderFloorInstructions = () => {
    const floorNames = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'];
    const descriptions = {
      1: 'Entry from Gate → Choose slot → Way to 1st Floor → Exit from left end',
      2: 'Arrive from Ground Floor → Park → Way to 2nd Floor or back to Ground Floor',
      3: 'Arrive from 1st Floor → Park → Way to 3rd Floor',
      4: 'Same layout as 1st Floor → Park → Exit via 2nd Floor',
    };

    return (
      <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800 shadow-sm">
        <h3 className="text-lg font-semibold">{floorNames[currentFloor - 1]}</h3>
        <p className="text-sm">{descriptions[currentFloor]}</p>
      </div>
    );
  };

  const renderFloorTabs = () => (
    <div className="flex space-x-2 mb-6">
      {[1, 2, 3, 4].map((floor) => (
        <button
          key={floor}
          className={`py-2 px-4 rounded-md font-medium ${
            currentFloor === floor
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => setCurrentFloor(floor)}
        >
          Floor {floor}
        </button>
      ))}
    </div>
  );

  const renderSlotRow = (slots) => (
    <div className="grid grid-cols-8 gap-3 mb-2">
      {slots.map((slot) => (
        <ParkingSlot key={slot._id} slot={slot} onBookingSuccess={refreshSlots} />
      ))}
    </div>
  );

  const renderFloorSlots = () => {
    const currentSlots = floors[currentFloor] || [];

    if (currentSlots.length === 0) {
      return <p className="text-center text-gray-500 mt-10">No slots available.</p>;
    }

    const topRow = currentSlots.slice(0, 8);
    const bottomRow = currentSlots.slice(8, 16);

    return (
      <div className="relative p-4 border rounded bg-gray-50 shadow-inner">
        

        {/* Slot Rows */}
        <div className="mb-1">{renderSlotRow(topRow)}</div>
        <div className="text-center text-gray-400">→→→→→→→→</div>
        <div>{renderSlotRow(bottomRow)}</div>
        <div className="text-center text-gray-400">←←←←←←←←</div>

        {/* Floor direction notes */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          {currentFloor !== 1 && <span>Way to Previous Floor</span>}
          {currentFloor !== 4 && <span>Way to Next Floor</span>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-b-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Parking Layout</h2>

      {renderFloorTabs()}
      {renderFloorInstructions()}
      {renderFloorSlots()}

      {/* Legend */}
      <div className="mt-8 pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-available rounded-sm mr-2"></div> Available
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-booked rounded-sm mr-2"></div> Booked
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-user rounded-sm mr-2"></div> Your Booking
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-500 rounded-sm mr-2"></div> Currently Booking
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-500 rounded-sm mr-2"></div> Being Booked by Others
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLayout;
