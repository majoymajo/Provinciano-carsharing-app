# CarPool API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isDriver": true,
  "driverLicense": "DL123456",
  "carModel": "Toyota Camry",
  "carPlate": "ABC123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "isDriver": true,
    "rating": 5.00,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "isDriver": true,
    "rating": 5.00,
    "carModel": "Toyota Camry",
    "carPlate": "ABC123"
  }
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profileImage": null,
  "isDriver": true,
  "driverLicense": "DL123456",
  "carModel": "Toyota Camry",
  "carPlate": "ABC123",
  "rating": 5.00,
  "totalRatings": 10,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /auth/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+9876543210",
  "carModel": "Honda Accord"
}
```

### Rides

#### POST /rides
Create a new ride (requires authentication, driver only).

**Request Body:**
```json
{
  "originLat": 40.7128,
  "originLng": -74.0060,
  "originAddress": "New York, NY 10001",
  "destinationLat": 42.3601,
  "destinationLng": -71.0589,
  "destinationAddress": "Boston, MA 02101",
  "departureTime": "2024-01-15T10:00:00",
  "totalSeats": 3,
  "pricePerSeat": 25.00,
  "notes": "No smoking, music allowed"
}
```

**Response (201 Created):**
```json
{
  "message": "Ride created successfully",
  "ride": {
    "id": 1,
    "driverId": 1,
    "origin": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "New York, NY 10001"
    },
    "destination": {
      "lat": 42.3601,
      "lng": -71.0589,
      "address": "Boston, MA 02101"
    },
    "departureTime": "2024-01-15T10:00:00.000Z",
    "arrivalTime": null,
    "totalSeats": 3,
    "availableSeats": 3,
    "pricePerSeat": 25.00,
    "status": "scheduled",
    "notes": "No smoking, music allowed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /rides/search
Search for available rides.

**Query Parameters:**
- `originLat` (optional): Origin latitude
- `originLng` (optional): Origin longitude
- `destLat` (optional): Destination latitude
- `destLng` (optional): Destination longitude
- `date` (optional): Date in YYYY-MM-DD format
- `seats` (optional): Number of seats needed (default: 1)

**Example:**
```
GET /rides/search?date=2024-01-15&seats=2
```

**Response (200 OK):**
```json
{
  "rides": [
    {
      "id": 1,
      "driverId": 1,
      "origin": {
        "lat": 40.7128,
        "lng": -74.0060,
        "address": "New York, NY 10001"
      },
      "destination": {
        "lat": 42.3601,
        "lng": -71.0589,
        "address": "Boston, MA 02101"
      },
      "departureTime": "2024-01-15T10:00:00.000Z",
      "totalSeats": 3,
      "availableSeats": 3,
      "pricePerSeat": 25.00,
      "status": "scheduled",
      "driver": {
        "firstName": "John",
        "lastName": "Doe",
        "rating": 4.85,
        "carModel": "Toyota Camry",
        "carPlate": "ABC123"
      }
    }
  ]
}
```

#### GET /rides/:id
Get ride details by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "driverId": 1,
  "origin": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY 10001"
  },
  "destination": {
    "lat": 42.3601,
    "lng": -71.0589,
    "address": "Boston, MA 02101"
  },
  "departureTime": "2024-01-15T10:00:00.000Z",
  "totalSeats": 3,
  "availableSeats": 3,
  "pricePerSeat": 25.00,
  "status": "scheduled",
  "notes": "No smoking, music allowed",
  "driver": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "rating": 4.85,
    "carModel": "Toyota Camry",
    "carPlate": "ABC123"
  }
}
```

#### GET /rides/my-rides
Get all rides posted by the current user (requires authentication, driver only).

**Response (200 OK):**
```json
{
  "rides": [
    {
      "id": 1,
      "driverId": 1,
      "origin": { ... },
      "destination": { ... },
      "departureTime": "2024-01-15T10:00:00.000Z",
      "totalSeats": 3,
      "availableSeats": 2,
      "pricePerSeat": 25.00,
      "status": "scheduled"
    }
  ]
}
```

#### PUT /rides/:id
Update a ride (requires authentication, ride owner only).

**Request Body:**
```json
{
  "departureTime": "2024-01-15T11:00:00",
  "pricePerSeat": 30.00,
  "status": "scheduled"
}
```

#### DELETE /rides/:id
Delete a ride (requires authentication, ride owner only).

**Response (200 OK):**
```json
{
  "message": "Ride deleted successfully"
}
```

### Bookings

#### POST /bookings
Create a booking for a ride (requires authentication).

**Request Body:**
```json
{
  "rideId": 1,
  "seatsBooked": 2,
  "pickupLat": 40.7128,
  "pickupLng": -74.0060,
  "pickupAddress": "123 Main St, New York, NY",
  "dropoffLat": 42.3601,
  "dropoffLng": -71.0589,
  "dropoffAddress": "456 Park Ave, Boston, MA"
}
```

**Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "rideId": 1,
    "passengerId": 2,
    "seatsBooked": 2,
    "totalPrice": 50.00,
    "status": "pending",
    "pickup": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "dropoff": {
      "lat": 42.3601,
      "lng": -71.0589,
      "address": "456 Park Ave, Boston, MA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /bookings/my-bookings
Get all bookings made by the current user (requires authentication).

**Response (200 OK):**
```json
{
  "bookings": [
    {
      "id": 1,
      "rideId": 1,
      "passengerId": 2,
      "seatsBooked": 2,
      "totalPrice": 50.00,
      "status": "confirmed",
      "ride": {
        "originAddress": "New York, NY 10001",
        "destinationAddress": "Boston, MA 02101",
        "departureTime": "2024-01-15T10:00:00.000Z",
        "status": "scheduled"
      },
      "driver": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "carModel": "Toyota Camry",
        "carPlate": "ABC123"
      }
    }
  ]
}
```

#### GET /bookings/ride/:rideId
Get all bookings for a specific ride (requires authentication, ride owner only).

**Response (200 OK):**
```json
{
  "bookings": [
    {
      "id": 1,
      "rideId": 1,
      "passengerId": 2,
      "seatsBooked": 2,
      "totalPrice": 50.00,
      "status": "confirmed",
      "passenger": {
        "firstName": "Jane",
        "lastName": "Smith",
        "phone": "+9876543210",
        "rating": 4.92
      }
    }
  ]
}
```

#### GET /bookings/:id
Get booking details by ID (requires authentication).

**Response (200 OK):**
```json
{
  "id": 1,
  "rideId": 1,
  "passengerId": 2,
  "seatsBooked": 2,
  "totalPrice": 50.00,
  "status": "confirmed",
  "ride": {
    "id": 1,
    "originAddress": "New York, NY 10001",
    "destinationAddress": "Boston, MA 02101",
    "departureTime": "2024-01-15T10:00:00.000Z",
    "status": "scheduled"
  },
  "driver": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "carModel": "Toyota Camry",
    "carPlate": "ABC123"
  },
  "passenger": {
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+9876543210"
  }
}
```

#### PATCH /bookings/:id/status
Update booking status (requires authentication).

**Request Body:**
```json
{
  "status": "cancelled"
}
```

**Possible status values:**
- `pending`
- `confirmed`
- `cancelled`
- `completed`

**Response (200 OK):**
```json
{
  "message": "Booking status updated successfully"
}
```

### Location Tracking

#### POST /location/update
Update location for an active ride (requires authentication, driver only).

**Request Body:**
```json
{
  "rideId": 1,
  "latitude": 40.7580,
  "longitude": -73.9855,
  "speed": 55.5,
  "heading": 45.0
}
```

**Response (200 OK):**
```json
{
  "message": "Location updated successfully"
}
```

#### GET /location/ride/:rideId/current
Get current location for a ride (requires authentication, driver or passenger only).

**Response (200 OK):**
```json
{
  "latitude": 40.7580,
  "longitude": -73.9855,
  "speed": 55.5,
  "heading": 45.0,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /location/ride/:rideId/history
Get location history for a ride (requires authentication, driver or passenger only).

**Response (200 OK):**
```json
{
  "locations": [
    {
      "latitude": 40.7580,
      "longitude": -73.9855,
      "speed": 55.5,
      "heading": 45.0,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "latitude": 40.7600,
      "longitude": -73.9800,
      "speed": 60.0,
      "heading": 50.0,
      "timestamp": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## WebSocket Events

The application uses Socket.io for real-time features.

### Client Events

#### join-ride
Join a ride room to receive location updates.
```javascript
socket.emit('join-ride', rideId);
```

#### leave-ride
Leave a ride room.
```javascript
socket.emit('leave-ride', rideId);
```

#### location-update
Broadcast location update (driver only).
```javascript
socket.emit('location-update', {
  rideId: 1,
  latitude: 40.7580,
  longitude: -73.9855,
  speed: 55.5,
  heading: 45.0
});
```

### Server Events

#### location-update
Receive location updates for a ride.
```javascript
socket.on('location-update', (data) => {
  console.log('Location:', data);
  // { latitude, longitude, speed, heading, timestamp }
});
```
