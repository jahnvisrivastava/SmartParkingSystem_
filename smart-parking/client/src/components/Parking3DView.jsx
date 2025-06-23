import { useState } from 'react';
import { FaCube, FaArrowsAlt, FaCarSide } from 'react-icons/fa';

const Parking3DView = ({ floorNumber, slotNumber }) => {
  const [rotateView, setRotateView] = useState(false);
  
  // Calculate position in the 3D space
  const calculatePosition = () => {
    const slotInt = parseInt(slotNumber);
    const rowSize = 4; // Slots per row
    
    const row = Math.floor((slotInt - 1) / rowSize);
    const col = (slotInt - 1) % rowSize;
    
    return { row, col };
  };
  
  const { row, col } = calculatePosition();
  
  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaCube className="text-white" />
          <span className="font-medium text-white">3D Parking View</span>
        </div>
        <button 
          onClick={() => setRotateView(!rotateView)}
          className="text-white text-sm hover:underline flex items-center"
        >
          <FaArrowsAlt className="mr-1" />
          {rotateView ? "Reset View" : "Rotate View"}
        </button>
      </div>
      
      <div className="p-4 bg-gray-900 text-white">
        <div className="h-64 perspective-1000 relative">
          {/* 3D garage */}
          <div 
            className={`
              w-full h-full transition-transform duration-1000 transform-style-3d 
              ${rotateView ? 'rotate-y-30 rotate-x-20' : ''}
            `}
          >
            {/* Floor */}
            <div className="absolute inset-0 transform-3d translate-z-n20 bg-gray-700 opacity-80"></div>
            
            {/* Walls */}
            <div className="absolute top-0 left-0 w-full h-16 transform-3d rotate-x-90 translate-z-n32 origin-top bg-gray-600 opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-full h-16 transform-3d rotate-x-90 translate-z-32 origin-bottom bg-gray-600 opacity-70"></div>
            <div className="absolute top-0 left-0 w-16 h-full transform-3d rotate-y-90 translate-z-n32 origin-left bg-gray-500 opacity-70"></div>
            <div className="absolute top-0 right-0 w-16 h-full transform-3d rotate-y-90 translate-z-32 origin-right bg-gray-500 opacity-70"></div>
            
            {/* Parking grid */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 p-4">
              {[...Array(16)].map((_, index) => {
                const currentRow = Math.floor(index / 4);
                const currentCol = index % 4;
                const isUserSlot = currentRow === row && currentCol === col;
                
                return (
                  <div 
                    key={index}
                    className={`
                      relative bg-opacity-70 rounded-md border border-gray-500 flex items-center justify-center p-2
                      ${isUserSlot ? 'bg-blue-600' : 'bg-gray-800'}
                      transform-3d translate-z-4
                    `}
                  >
                    <div className="text-xs font-bold">{index + 1}</div>
                    
                    {/* Car in the user's slot */}
                    {isUserSlot && (
                      <div className="absolute inset-0 flex items-center justify-center transform-3d translate-z-2">
                        <FaCarSide className="text-white text-2xl" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Entrance and exit arrows */}
            <div className="absolute left-4 bottom-4 transform-3d translate-z-10 text-green-500 font-bold">
              ENTRY
            </div>
            <div className="absolute right-4 bottom-4 transform-3d translate-z-10 text-red-500 font-bold">
              EXIT
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center text-xs text-gray-400">
          <p>This is a simplified 3D view of Floor {floorNumber}</p>
          <p className="mt-1 text-blue-400">Your parking spot is Slot {slotNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default Parking3DView; 