# 🚗 Provinciano - Ride Sharing Application

A comprehensive car pooling application similar to BlaBlaCar, enabling users to share rides, reduce travel costs, and minimize environmental impact.

## ✨ Features

### Core Functionality
- **🔐 Secure Authentication** - JWT-based user authentication and profile management
- **🚘 Ride Posting** - Drivers can list rides with route, time, and seat availability
- **🔍 Ride Booking** - Passengers can search for and book available rides
- **📍 Real-time Location Tracking** - Integrated with OpenStreetMap for navigation
- **💺 Dynamic Seat Availability** - Automatic tracking of remaining seats per ride
- **⭐ Rating System** - Rate drivers and passengers after completed rides
- **📱 Real-time Updates** - WebSocket support for live location updates

### User Roles
- **Passengers** - Search and book rides
- **Drivers** - Post rides, manage bookings, track locations

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Socket.io** for real-time communication
- **bcrypt** for password hashing

### Frontend
- **HTML5, CSS3, JavaScript**
- **Leaflet.js** for OpenStreetMap integration
- **Socket.io-client** for real-time features
- Responsive design for mobile and desktop

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Database Setup

First, create a PostgreSQL database:

```bash
createdb carpool_db
```

Then, run the schema:

```bash
psql carpool_db < database/schema.sql
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carpool_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isDriver": true,
  "carModel": "Toyota Camry",
  "carPlate": "ABC123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Rides Endpoints

#### Create Ride
```http
POST /api/rides
Authorization: Bearer <token>
Content-Type: application/json
{
  "originLat": 40.7128,
  "originLng": -74.0060,
  "originAddress": "New York, NY",
  "destinationLat": 42.3601,
  "destinationLng": -71.0589,
  "destinationAddress": "Boston, MA",
  "departureTime": "2024-01-15T10:00:00",
  "totalSeats": 3,
  "pricePerSeat": 25.00,
  "notes": "No smoking please"
}
```

#### Search Rides
```http
GET /api/rides/search?date=2024-01-15&seats=2
Authorization: Bearer <token>
```

#### Get My Rides
```http
GET /api/rides/my-rides
Authorization: Bearer <token>
```

### Bookings Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
{
  "rideId": 1,
  "seatsBooked": 2
}
```

#### Get My Bookings
```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PATCH /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json
{
  "status": "cancelled"
}
```

### Location Tracking Endpoints

#### Update Location
```http
POST /api/location/update
Authorization: Bearer <token>
Content-Type: application/json
{
  "rideId": 1,
  "latitude": 40.7580,
  "longitude": -73.9855,
  "speed": 55.5,
  "heading": 45.0
}
```

#### Get Current Location
```http
GET /api/location/ride/:rideId/current
Authorization: Bearer <token>
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **rides** - Posted rides with route and timing
- **bookings** - Passenger bookings for rides
- **location_tracking** - Real-time location data
- **ratings** - User ratings and reviews

See `database/schema.sql` for complete schema definition.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- SQL injection prevention with parameterized queries
- Input validation
- Secure session management

## 🌍 Real-time Features

The application uses WebSocket (Socket.io) for:
- Live location tracking during rides
- Real-time seat availability updates
- Instant booking notifications

## 📱 Frontend Features

- Responsive design for all devices
- Interactive maps with OpenStreetMap
- Real-time ride search
- User-friendly booking interface
- Driver dashboard for ride management
- Passenger dashboard for bookings

## 🧪 Testing

Run tests:
```bash
npm test
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists

### Port Already in Use
- Change the PORT in `.env`
- Or stop the process using port 3000

### Authentication Errors
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

Inspired by BlaBlaCar and similar ride-sharing platforms, with elements from TuShare and SafeDrive projects.
## Programming Languages & Technologies:
 
<code><img width="15%" src="https://www.vectorlogo.zone/logos/w3_html5/w3_html5-ar21.svg"></code><code><img width="15%" src="https://www.vectorlogo.zone/logos/javascript/javascript-ar21.svg"></code>
<code><img width="15%" src="https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg"></code>

<br />
<code><img width="15%" src="https://www.vectorlogo.zone/logos/w3_css/w3_css-ar21.svg"></code>
<code><img width="15%" src="https://www.vectorlogo.zone/logos/postgresql/postgresql-ar21.svg"></code>
<br />
