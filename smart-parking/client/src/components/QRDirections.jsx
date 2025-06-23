import { useState } from 'react';
import { FaQrcode, FaInfo } from 'react-icons/fa';

const QRDirections = ({ floorNumber, slotNumber }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  // Generate a URL that would contain the parking location - in a real app, this would be a deep link
  // For demo purposes, we'll just create a fake URL
  const getDirectionsUrl = () => {
    return `https://smartparking.example.com/directions?floor=${floorNumber}&slot=${slotNumber}`;
  };
  
  // Generate a simple ASCII QR code for demo purposes
  // In a real app, you would use a QR code generation library
  const generateQRCode = () => {
    // Create a data URL for a fake QR code image
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect x="10" y="10" width="80" height="80" fill="white" stroke="black" />
      <text x="50" y="50" font-size="10" text-anchor="middle" dominant-baseline="middle">F${floorNumber}-S${slotNumber}</text>
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="black" stroke-width="2" />
      <rect x="30" y="30" width="10" height="10" fill="black" />
      <rect x="60" y="30" width="10" height="10" fill="black" />
      <rect x="30" y="60" width="10" height="10" fill="black" />
      <rect x="50" y="50" width="10" height="10" fill="black" />
    </svg>`;
  };

  return (
    <div className="mt-3 border rounded-md overflow-hidden">
      <div className="bg-purple-50 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaQrcode className="text-purple-600" />
          <span className="font-medium">Mobile Directions</span>
        </div>
        <button 
          className="text-xs text-purple-600 hover:underline flex items-center"
          onClick={() => setShowInfo(!showInfo)}
        >
          <FaInfo className="mr-1" />
          {showInfo ? "Hide Info" : "How it works"}
        </button>
      </div>
      
      {showInfo && (
        <div className="bg-purple-50 px-4 py-2 text-xs text-purple-800 border-b">
          <p>Scan this QR code with your phone to get directions to your parking spot while walking from the entrance.</p>
        </div>
      )}
      
      <div className="p-4 flex justify-center">
        <div className="text-center">
          <div className="bg-white p-2 border rounded-md inline-block mb-2">
            <img 
              src={generateQRCode()} 
              alt={`QR code for directions to Floor ${floorNumber}, Slot ${slotNumber}`}
              className="w-32 h-32"
            />
          </div>
          <p className="text-xs text-gray-500">Scan to get walking directions on your phone</p>
          <p className="text-xs text-gray-400 mt-1">{getDirectionsUrl()}</p>
        </div>
      </div>
    </div>
  );
};

export default QRDirections; 