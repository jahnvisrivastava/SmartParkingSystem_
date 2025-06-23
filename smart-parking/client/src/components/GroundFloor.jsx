export default function GroundFloor({ showPath }) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold">Ground Floor Layout</div>
        {/* Add your ground floor layout components */}
        <div className="grid grid-cols-4 gap-4">
          {/* Example parking slots */}
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 h-16 rounded-md flex items-center justify-center"
            >
              Slot {index + 1}
            </div>
          ))}
        </div>
  
        {/* Show the car path if the state is true */}
        {showPath && (
          <div className="mt-4 text-gray-500">Car Path: Entry → Up Ramp → Parking Slots</div>
        )}
      </div>
    );
  }