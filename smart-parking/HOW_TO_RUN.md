# How to Run the Smart Parking System

This document provides step-by-step instructions to run the Smart Parking System application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB connection (already provided in the .env file)

## Running the Backend

1. Open a terminal and navigate to the server directory:
   ```
   cd smart-parking/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

4. The server will start on http://localhost:5000

## Running the Frontend

1. Open a new terminal window and navigate to the client directory:
   ```
   cd smart-parking/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at http://localhost:5173

## Accessing the Application

### User Access
1. Open http://localhost:5173 in your browser
2. Register a new account or use existing credentials
3. Explore the parking layout, book slots, and manage your bookings

### Admin Access
1. Open http://localhost:5173/admin/login in your browser
2. Login with:
   - Username: `admin123`
   - Password: `admin@12345`
3. Access the admin dashboard to view bookings, statistics, and manage payments

## Troubleshooting

- If you encounter CORS issues, make sure both frontend and backend are running
- If you see MongoDB connection errors, verify that the MongoDB URI in the .env file is correct
- For Socket.IO connection issues, check that port 5000 is not blocked by a firewall

## Additional Information

- The MongoDB database is hosted on MongoDB Atlas and is pre-configured
- JWT tokens are stored in HTTP-only cookies for secure authentication
- Socket.IO is used for real-time updates of parking slot status 