const Notification = ({ message, imageUrl, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative border border-gray-200 rounded-lg shadow-lg bg-white">
          <button
            onClick={onClose}
            className="absolute p-1 bg-gray-100 border border-gray-300 rounded-full -top-1 -right-1"
          >
            {/* SVG icon */}
          </button>
  
          <div className="flex items-center p-4">
            <img
              className="object-cover w-12 h-12 rounded-lg"
              src={imageUrl}
              alt="Product"
            />
            <div className="ml-3 overflow-hidden">
              <p className="font-medium text-gray-900">{message}</p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Notification