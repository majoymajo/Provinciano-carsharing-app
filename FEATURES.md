# CarPool Features

This document provides a comprehensive overview of all features in the CarPool application.

## 🔐 Authentication & User Management

### User Registration
- Email and password-based registration
- User type selection (Passenger/Driver)
- Driver-specific information (car model, license plate)
- Secure password hashing with bcrypt
- JWT token generation for session management

### User Login
- Email and password authentication
- JWT token-based sessions
- Automatic token storage in browser

### Profile Management
- View user profile information
- Update personal details
- Update driver information (car model, license plate)
- View user rating and total ratings

### Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Token expiration (configurable, default 7 days)
- Protected API endpoints
- CORS configuration

## 🚗 Ride Management (Driver Features)

### Post a Ride
- Set origin location (address, latitude, longitude)
- Set destination location (address, latitude, longitude)
- Define departure time
- Specify total available seats (1-8)
- Set price per seat
- Add optional notes (preferences, route details)
- Automatic ride status (scheduled)

### View My Rides
- List all rides posted by the driver
- See ride details (route, time, seats, price)
- View booking count for each ride
- Check ride status (scheduled, in_progress, completed, cancelled)

### Update Ride
- Modify departure time
- Change price per seat
- Update seat availability
- Change ride status
- Add or edit notes

### Delete Ride
- Remove rides from the system
- Automatic cleanup of associated bookings
- Confirmation required before deletion

### View Ride Bookings
- See all passengers who booked a ride
- View passenger details (name, rating, contact)
- Check seats booked per passenger
- Monitor booking status

## 🔍 Ride Search & Booking (Passenger Features)

### Search Rides
- Search by date
- Filter by number of seats needed
- Location-based search (origin and destination)
- View available rides with:
  - Route information
  - Departure time
  - Available seats
  - Price per seat
  - Driver information
  - Driver rating
  - Car details

### Book a Ride
- Select number of seats to book
- Specify pickup and dropoff locations (optional)
- Automatic price calculation
- Seat availability validation
- Prevent double booking
- Prevent drivers from booking their own rides

### View My Bookings
- List all booked rides
- See booking details:
  - Ride route and time
  - Number of seats booked
  - Total price paid
  - Booking status
  - Driver information
  - Car details
  - Contact information

### Cancel Booking
- Cancel pending or confirmed bookings
- Automatic seat refund to ride
- Cannot cancel completed bookings
- Update booking status to cancelled

## 📍 Real-time Location Tracking

### Location Updates (Driver)
- Send location updates during active rides
- Include latitude, longitude
- Optional speed and heading data
- Only for rides with "in_progress" status
- WebSocket broadcasting to passengers

### Current Location (Passenger/Driver)
- View current location of active ride
- See timestamp of last update
- Monitor driver progress
- Real-time map integration ready

### Location History
- View complete route history
- Track all location points
- See speed and heading at each point
- Timestamp for each location update
- Limited to last 100 points

### WebSocket Features
- Join ride room for real-time updates
- Leave ride room when needed
- Broadcast location to all participants
- Real-time seat availability updates (future)

## 💺 Dynamic Seat Management

### Automatic Seat Tracking
- Total seats defined by driver
- Available seats decrease on booking
- Available seats increase on cancellation
- Prevent overbooking
- Validation on each booking

### Seat Availability Display
- Show remaining seats in search results
- Display seats booked in driver's view
- Update in real-time on bookings/cancellations
- Show seats per booking in booking list

## ⭐ Rating System (Database Ready)

### Database Schema
- Rate users after completed rides
- 1-5 star rating system
- Add optional comments
- Link ratings to specific rides
- Prevent duplicate ratings

### User Ratings
- Average rating display
- Total number of ratings
- Rating visible in profiles
- Rating shown in ride listings

## 🗄️ Database Features

### Comprehensive Schema
- Users table with driver information
- Rides table with route and timing
- Bookings table with passenger details
- Location tracking table
- Ratings table for reviews

### Data Integrity
- Foreign key constraints
- Cascade deletions
- Unique constraints (email, booking per user per ride)
- Check constraints (rating range 1-5)
- Timestamp tracking (created_at, updated_at)

### Performance Optimization
- Indexed columns for fast queries:
  - Driver ID on rides
  - Departure time on rides
  - Ride status
  - Passenger ID on bookings
  - Booking status
  - Ride ID on location tracking

## 🎨 Frontend Features

### Responsive Design
- Mobile-friendly interface
- Tablet-optimized layout
- Desktop-optimized layout
- Consistent across devices

### User Interface
- Modern gradient design
- Card-based layout
- Smooth animations and transitions
- Intuitive navigation
- Loading spinners
- Error and success messages

### Interactive Elements
- Form validation
- Real-time search
- Dynamic content updates
- Section-based navigation
- Conditional menu items

### Map Integration Ready
- Leaflet.js included
- OpenStreetMap support
- Location display ready
- Route visualization ready

## 🔧 Technical Features

### Backend (Node.js/Express)
- RESTful API design
- Modular architecture
- Separation of concerns (routes, controllers, models)
- Error handling middleware
- Request validation
- Database connection pooling

### Database (PostgreSQL)
- Relational data model
- Transaction support
- ACID compliance
- Prepared statements (SQL injection prevention)
- Connection pooling

### Real-time (Socket.io)
- WebSocket server
- Room-based communication
- Event-driven architecture
- Cross-origin support

### Security
- Password hashing
- JWT authentication
- CORS protection
- Environment variables
- Parameterized queries
- Input validation

## 📦 Deployment Features

### Docker Support
- Dockerfile for containerization
- Docker Compose for multi-container setup
- Database initialization script
- Environment configuration
- Volume persistence

### Configuration
- Environment-based configuration
- Separate dev/prod settings
- Database connection options
- JWT settings
- CORS settings

## 🚀 Future Enhancement Ready

### Payment Integration Ready
- Price calculation in place
- Total price tracking
- Booking confirmation flow

### Email Notifications Ready
- User registration events
- Booking confirmations
- Ride updates
- Cancellation notices

### Advanced Search Ready
- Geospatial queries (PostGIS integration point)
- Route matching algorithms
- Multi-stop rides
- Recurring rides

### Mobile App Ready
- RESTful API for mobile consumption
- WebSocket support for real-time features
- Stateless authentication (JWT)

## 📊 API Completeness

### Fully Documented
- Complete API documentation (API.md)
- Request/response examples
- Error handling documented
- WebSocket events documented

### RESTful Design
- Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Meaningful status codes
- Consistent response format
- Versioned endpoints ready

### Comprehensive Coverage
- Authentication endpoints
- User profile management
- Ride CRUD operations
- Booking management
- Location tracking
- Search functionality

## 🧪 Testing Ready

### Test Infrastructure
- Jest configuration
- Test coverage setup
- Test environment configuration
- Unit test ready
- Integration test ready

### Code Quality
- ESLint configuration
- Code style enforcement
- Consistent formatting
- Lint scripts in package.json

## 📚 Documentation

### User Documentation
- Comprehensive README
- Quick start guide (SETUP.md)
- API documentation (API.md)
- Troubleshooting guide
- Feature overview (this document)

### Developer Documentation
- Contributing guidelines (CONTRIBUTING.md)
- Code structure documented
- Setup instructions
- Development workflow
- Deployment guide

## 🌟 Highlights

### Best of TuShare Integration
- Real-time tracking capabilities
- Location history
- WebSocket implementation
- Dynamic data updates

### Best of SafeDrive Integration
- Safety-focused user verification
- Driver information tracking
- Rating system
- Booking validation

### BlaBlaCar-like Features
- Ride posting and search
- Seat management
- Price per seat
- User profiles
- Driver and passenger roles

## 🎯 Unique Features

1. **Real-time Everything** - WebSocket integration for live updates
2. **Dynamic Seat Management** - Automatic tracking with validation
3. **Comprehensive API** - Well-documented, RESTful design
4. **Security First** - JWT, bcrypt, input validation
5. **Production Ready** - Docker, environment config, error handling
6. **Extensible** - Modular architecture, easy to add features
7. **Database Optimized** - Indexed, relational, transaction support
8. **Developer Friendly** - Clear code, documentation, setup guides
