# Quick Setup Guide

## Prerequisites
- Node.js v14 or higher
- PostgreSQL v12 or higher
- npm or yarn

## Option 1: Using Docker (Recommended)

This is the easiest way to get started:

```bash
# Build and start the application
docker-compose up -d

# The application will be available at http://localhost:3000
```

To stop the application:
```bash
docker-compose down
```

## Option 2: Manual Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database

Create a PostgreSQL database:
```bash
createdb carpool_db
```

Run the schema:
```bash
psql carpool_db < database/schema.sql
```

Or if you have a password:
```bash
psql -U postgres -d carpool_db -f database/schema.sql
```

### Step 3: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carpool_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_change_this
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=*
```

### Step 4: Start the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Step 5: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Testing the Application

### 1. Register a Driver Account
- Go to http://localhost:3000
- Click "Register"
- Fill in the form and check "I want to register as a driver"
- Add car details (model and license plate)
- Submit the form

### 2. Post a Ride
- After login, click "Post a Ride"
- Fill in origin and destination details
- Set departure time and price
- Submit the ride

### 3. Register a Passenger Account
- Open an incognito/private window
- Go to http://localhost:3000
- Register a new account (without driver checkbox)

### 4. Search and Book a Ride
- Click "Find a Ride"
- Search for available rides
- Click "Book Now" on a ride
- Enter number of seats needed

### 5. View Bookings
- As a driver: Click "My Rides" to see your posted rides and bookings
- As a passenger: Click "My Bookings" to see your booked rides

## API Testing

You can test the API using curl or any API client like Postman:

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "isDriver": true,
    "carModel": "Toyota Camry",
    "carPlate": "TEST123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Ride (use token from login)
```bash
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "originLat": 40.7128,
    "originLng": -74.0060,
    "originAddress": "New York, NY",
    "destinationLat": 42.3601,
    "destinationLng": -71.0589,
    "destinationAddress": "Boston, MA",
    "departureTime": "2024-12-31T10:00:00",
    "totalSeats": 3,
    "pricePerSeat": 25.00,
    "notes": "Highway route, no stops"
  }'
```

### Search Rides
```bash
curl "http://localhost:3000/api/rides/search?seats=1&date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep carpool`

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 3001)
- Or find and kill the process: `lsof -ti:3000 | xargs kill`

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and run `npm install` fresh

### JWT Errors
- Make sure JWT_SECRET is set in `.env`
- Don't use spaces in JWT_SECRET

## Features to Try

1. **Real-time Location Tracking** - Drivers can update location during rides
2. **Dynamic Seat Management** - Seats automatically decrease when booked
3. **Booking Management** - Cancel bookings and see seat refunds
4. **User Profiles** - View and update user information
5. **Rating System** - Database schema supports ratings (UI can be extended)

## Development

To run with auto-reload during development:
```bash
npm run dev
```

This uses nodemon to watch for file changes and automatically restart the server.

## Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/HTTPS
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name carpool
   pm2 save
   pm2 startup
   ```

## Next Steps

- Add email notifications for bookings
- Implement payment integration
- Add more sophisticated location-based search
- Implement the rating system UI
- Add profile pictures
- Mobile app development

## Support

For issues or questions, please refer to:
- API Documentation: `API.md`
- Database Schema: `database/schema.sql`
- Main README: `README.md`
