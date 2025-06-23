import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Attempting login with:', { username });
    
    // Try to login
    const success = await login({ username, password });
    
    if (!success) {
      setError('Login failed. Please check your credentials.');
      console.log('Login failed - see errors above');
    } else {
      console.log('Login successful, redirecting...');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-9rem)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-100 rounded-full mb-4">
            <FaParking className="text-4xl text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-800">Smart Parking System</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                className=" text-white input pl-10"
                placeholder="Enter your username or email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary py-3 font-medium"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
              Create Account
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            <Link to="/admin/login" className="text-gray-500 hover:text-gray-700 text-sm">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 