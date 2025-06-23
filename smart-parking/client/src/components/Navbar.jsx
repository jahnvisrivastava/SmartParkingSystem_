import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaParking, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2">
            <FaParking className="text-2xl text-white" />
            <span className="text-xl font-bold text-white">Smart Parking</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center space-x-4">
            {isAdmin ? (
              // Admin Navigation
              <>
                <Link to="/admin/dashboard" className="py-2 px-3 hover:bg-primary-700 rounded">
                  Dashboard
                </Link>
              </>
            ) : (
              // User Navigation
              <>
                <Link to="/dashboard" className="py-2 px-3 hover:bg-primary-700 rounded text-white">
                  Parking Layout
                </Link>
                <Link to="/my-bookings" className="py-2 px-3 hover:bg-primary-700 rounded text-white">
                  My Bookings
                </Link>
              </>
            )}
            
            {/* User Menu */}
            <div className="flex items-center ml-4">
              <div className="flex items-center space-x-2 border-l pl-4 border-primary-400">
                <FaUserCircle className="h-6 w-6" />
                <span>{user?.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-4 flex items-center space-x-1 py-2 px-3 bg-primary-700 hover:bg-primary-800 rounded"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-400">
            {isAdmin ? (
              // Admin Mobile Navigation
              <Link 
                to="/admin/dashboard" 
                className="block py-2 px-4 hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              // User Mobile Navigation
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-4 hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Parking Layout
                </Link>
                <Link 
                  to="/my-bookings" 
                  className="block py-2 px-4 hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              </>
            )}
            
            {/* Mobile User Info & Logout */}
            <div className="mt-4 pt-4 border-t border-primary-400">
              <div className="px-4 py-2 flex items-center">
                <FaUserCircle className="h-5 w-5 mr-2" />
                <span>{user?.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full mt-2 text-left px-4 py-2 flex items-center hover:bg-primary-700"
              >
                <FaSignOutAlt className="mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 