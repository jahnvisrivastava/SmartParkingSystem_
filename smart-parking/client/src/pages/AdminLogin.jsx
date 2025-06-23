import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaUser, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Attempting admin login with:', { username });
    
    // Try to login as admin
    const success = await adminLogin({ username, password });
    
    if (!success) {
      setError('Admin login failed. Please check your credentials.');
      console.log('Admin login failed - see errors above');
    } else {
      console.log('Admin login successful, redirecting...');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-red-100 rounded-full mb-4 flex items-center justify-center">
            <FaShieldAlt className="text-4xl text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 mt-1">Smart Parking System</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center text-yellow-800">
            <div className="mr-3">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">
              <span className="font-bold">Admin credentials:</span><br />
              Username: admin123<br />
              Password: admin@12345
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                className=" text-white input pl-10"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className=" text-white input pl-10"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 btn-primary font-medium"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            <Link to="/" className="text-primary-600 hover:text-primary-800 font-medium">
              Back to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 