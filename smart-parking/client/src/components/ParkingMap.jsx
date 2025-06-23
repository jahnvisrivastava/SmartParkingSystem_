import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCar, FaArrowRight, FaRegDotCircle, FaDirections, FaMapMarkedAlt } from 'react-icons/fa';

const ParkingMap = ({ floorNumber, slotNumber }) => {
  const [showFullMap, setShowFullMap] = useState(false);

  // Generate a simple schematic map based on floor and slot
  const generateMap = () => {
    // Create a grid layout for each floor
    const cols = 2; // 4 slots per row
    const totalSlots = 16; // 16 slots per floor
    
    const slotPosition = (parseInt(slotNumber) - 1) % totalSlots;
    const row = Math.floor(slotPosition / cols);
    const col = slotPosition % cols;
    
    return { row, col, cols, totalSlots };
  };

  const { row, col, cols, totalSlots } = generateMap();

  // Directions from entrance to the slot
  const getDirections = () => {
    const directions = [];
    
    // Simple algorithm to generate human-readable directions
    directions.push(`Enter the parking facility and take the ramp to Floor ${floorNumber}`);
    
    if (row === 0) {
      directions.push(`Once on Floor ${floorNumber}, your slot is in the first row`);
    } else if (row === 1) {
      directions.push(`Proceed straight to the second row of parking spots`);
    } else if (row === 2) {
      directions.push(`Drive to the third row of parking spots`);
    } else {
      directions.push(`Go to the last row of parking at the back`);
    }

    if (col === 0) {
      directions.push(`Your spot is the first one on the left`);
    } else if (col === cols - 1) {
      directions.push(`Your spot is the last one on the right`);
    } else {
      directions.push(`Your spot is the ${col + 1}${col === 0 ? 'st' : col === 1 ? 'nd' : col === 2 ? 'rd' : 'th'} spot from the left`);
    }
    
    directions.push(`Park in Slot ${slotNumber}`);
    
    return directions;
  };

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-blue-600" />
          <span className="font-medium">Parking Navigation</span>
        </div>
        <button 
          onClick={() => setShowFullMap(!showFullMap)}
          className="text-blue-600 text-sm hover:underline"
        >
          {showFullMap ? "Hide Map" : "Show Map"}
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col space-y-2 mb-3">
          <div className="flex items-center">
            <FaDirections className="text-blue-500 mr-2" />
            <span className="font-medium">How to reach your spot:</span>
          </div>
          
          <ul className="pl-8 space-y-1">
            {getDirections().map((direction, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <FaArrowRight className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                {direction}
              </li>
            ))}
          </ul>
        </div>
        
        {showFullMap && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h4 className="text-center mb-2 font-medium">Floor {floorNumber} Layout</h4>
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
              {[...Array(totalSlots)].map((_, index) => {
                const currentRow = Math.floor(index / cols);
                const currentCol = index % cols;
                const currentSlot = index + 1;
                
                const isUserSlot = currentRow === row && currentCol === col;
                
                return (
                  <div 
                    key={index}
                    className={`
                      ${isUserSlot ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} 
                      ${isUserSlot ? 'border-blue-600' : 'border-gray-300'}
                      border rounded-md h-16 flex items-center justify-center text-center
                      transition-all ${isUserSlot ? 'scale-110 shadow-md' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      {isUserSlot ? (
                        <FaCar className="mb-1" />
                      ) : (
                        <FaRegDotCircle className="text-gray-400 mb-1" />
                      )}
                      <span className="text-xs">Slot {currentSlot}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Entry and Exit indicators */}
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="bg-green-500 w-4 h-4 rounded-full mr-1"></div>
                <span>Entry</span>
              </div>
              <div className="flex items-center">
                <div className="bg-red-500 w-4 h-4 rounded-full mr-1"></div>
                <span>Exit</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingMap; 