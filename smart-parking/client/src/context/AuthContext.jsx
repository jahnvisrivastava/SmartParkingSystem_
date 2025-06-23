import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`);
        setUser(res.data.user);
        console.log('User is logged in:', res.data.user);
      } catch (error) {
        console.log('Not logged in or session expired');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Registering with data:', userData);
      const res = await axios.post(`${API_URL}/signup`, userData);
      console.log('Registration response:', res.data);
      setUser(res.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (userData) => {
    try {
      setLoading(true);
      console.log('Logging in with:', userData);
      
      // Add timeout to the request to prevent hanging
      const res = await axios.post(`${API_URL}/login`, userData, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Login response:', res.data);
      setUser(res.data.user);
      toast.success('Login successful!');
      
      // Redirect admin to admin dashboard, regular users to user dashboard
      if (res.data.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 'Invalid credentials. Please check your username and password.';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Server not responding. Please check your internet connection and try again.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const adminLogin = async (userData) => {
    try {
      setLoading(true);
      console.log('Admin login with:', userData);
      
      // Add timeout to the request to prevent hanging
      const res = await axios.post(`${API_URL}/admin/login`, userData, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Admin login response:', res.data);
      setUser(res.data.user);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Admin login failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Invalid credentials. Please check your username and password.';
      } else if (error.request) {
        errorMessage = 'Server not responding. Please check your internet connection and try again.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      navigate('/');
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    adminLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 