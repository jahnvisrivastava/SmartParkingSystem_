# Smart Parking System

A full-stack parking management application with real-time slot booking, payment tracking, and admin management.

## Features

- **User Features**:
  - User registration and login with JWT
  - Real-time parking lot visualization
  - Book parking slots with car details and duration
  - View estimated costs
  - Manage and cancel bookings
  - Real-time slot locking to prevent double bookings

- **Admin Features**:
  - Dashboard with revenue metrics
  - View and manage all bookings
  - Mark bookings as paid
  - View floor utilization statistics

- **Real-time Updates**:
  - Socket.IO integration for live slot status updates
  - 5-minute booking window protection
  - Real-time notifications

## Tech Stack

- **Frontend**: Vite + React.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT stored in HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB connection (provided in .env file)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smart-parking
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Login Credentials

### User
- Register a new account or use the existing credentials.

### Admin
- Username: `admin123`
- Password: `admin@12345`

## Project Structure

- `/client` - React frontend
- `/server` - Node.js backend
  - `/models` - MongoDB schemas
  - `/routes` - API routes
  - `/middleware` - Authentication middleware

## Environment Variables

The backend uses the following environment variables (already configured in the .env file):

```
MONGODB_URI=mongodb+srv://srijahnvi11:tFdXkwieXbuLHD79@cluster0.qjkgbml.mongodb.net/smart_parking?retryWrites=true&w=majority
SECRET_KEY=tFdXkwieXbuLHD79
JWT_SECRET_KEY=tFdXkwieXbuLHD79
PORT=5000
```

## API Endpoints

### Authentication
- `POST /api/signup` - Register a new user
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/logout` - Logout (for both user and admin)

### Bookings
- `GET /api/init-slots` - Initialize parking slots
- `GET /api/slots` - Get all slots
- `GET /api/slots/floor/:floorNumber` - Get slots for a specific floor
- `POST /api/book-slot` - Book a parking slot
- `GET /api/my-bookings` - Get user's bookings
- `DELETE /api/cancel-booking/:id` - Cancel a booking
- `GET /api/calculate-cost/:durationHours` - Calculate booking cost

### Admin
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/stats/floors` - Get floor utilization stats
- `PATCH /api/admin/mark-paid/:id` - Mark a booking as paid
- `GET /api/admin/stats/revenue` - Get revenue statistics

## License

This project is licensed under the MIT License. 