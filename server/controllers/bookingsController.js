const { query } = require('../config/database');

// Create a booking (Passenger)
const createBooking = async (req, res) => {
  try {
    const { rideId, seatsBooked, pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress } = req.body;
    const passengerId = req.user.userId;

    // Check if ride exists and has available seats
    const rideResult = await query(
      'SELECT * FROM rides WHERE id = $1 AND status = $2',
      [rideId, 'scheduled']
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found or not available' });
    }

    const ride = rideResult.rows[0];

    // Prevent driver from booking their own ride
    if (ride.driver_id === passengerId) {
      return res.status(400).json({ error: 'Drivers cannot book their own rides' });
    }

    // Check if enough seats are available
    if (ride.available_seats < seatsBooked) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    // Calculate total price
    const totalPrice = parseFloat(ride.price_per_seat) * seatsBooked;

    // Start transaction
    await query('BEGIN');

    try {
      // Create booking
      const bookingResult = await query(
        `INSERT INTO bookings (ride_id, passenger_id, seats_booked, total_price, pickup_lat, pickup_lng, 
         pickup_address, dropoff_lat, dropoff_lng, dropoff_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [rideId, passengerId, seatsBooked, totalPrice, pickupLat, pickupLng, pickupAddress, 
         dropoffLat, dropoffLng, dropoffAddress]
      );

      // Update available seats
      await query(
        'UPDATE rides SET available_seats = available_seats - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [seatsBooked, rideId]
      );

      await query('COMMIT');

      res.status(201).json({
        message: 'Booking created successfully',
        booking: formatBooking(bookingResult.rows[0])
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create booking error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'You have already booked this ride' });
    } else {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
};

// Get passenger bookings
const getPassengerBookings = async (req, res) => {
  try {
    const passengerId = req.user.userId;

    const result = await query(
      `SELECT b.*, r.origin_address, r.destination_address, r.departure_time, r.status as ride_status,
       u.first_name, u.last_name, u.phone, u.car_model, u.car_plate
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON r.driver_id = u.id
       WHERE b.passenger_id = $1
       ORDER BY r.departure_time DESC`,
      [passengerId]
    );

    res.json({
      bookings: result.rows.map(booking => ({
        ...formatBooking(booking),
        ride: {
          originAddress: booking.origin_address,
          destinationAddress: booking.destination_address,
          departureTime: booking.departure_time,
          status: booking.ride_status
        },
        driver: {
          firstName: booking.first_name,
          lastName: booking.last_name,
          phone: booking.phone,
          carModel: booking.car_model,
          carPlate: booking.car_plate
        }
      }))
    });
  } catch (error) {
    console.error('Get passenger bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Get bookings for a ride (Driver)
const getRideBookings = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.userId;

    // Verify the ride belongs to the driver
    const rideCheck = await query('SELECT id FROM rides WHERE id = $1 AND driver_id = $2', [rideId, driverId]);
    if (rideCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view these bookings' });
    }

    const result = await query(
      `SELECT b.*, u.first_name, u.last_name, u.phone, u.rating
       FROM bookings b
       JOIN users u ON b.passenger_id = u.id
       WHERE b.ride_id = $1
       ORDER BY b.created_at DESC`,
      [rideId]
    );

    res.json({
      bookings: result.rows.map(booking => ({
        ...formatBooking(booking),
        passenger: {
          firstName: booking.first_name,
          lastName: booking.last_name,
          phone: booking.phone,
          rating: booking.rating
        }
      }))
    });
  } catch (error) {
    console.error('Get ride bookings error:', error);
    res.status(500).json({ error: 'Failed to get ride bookings' });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Get booking details
    const bookingResult = await query(
      `SELECT b.*, r.driver_id FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check authorization (passenger or driver can update)
    if (booking.passenger_id !== userId && booking.driver_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Start transaction for cancellations
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await query('BEGIN');
      try {
        // Return seats to ride
        await query(
          'UPDATE rides SET available_seats = available_seats + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [booking.seats_booked, booking.ride_id]
        );

        // Update booking status
        await query(
          'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [status, id]
        );

        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } else {
      await query(
        'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
    }

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

// Get booking details
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `SELECT b.*, r.*, u.first_name as driver_first_name, u.last_name as driver_last_name,
       u.phone as driver_phone, u.car_model, u.car_plate,
       p.first_name as passenger_first_name, p.last_name as passenger_last_name, p.phone as passenger_phone
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON r.driver_id = u.id
       JOIN users p ON b.passenger_id = p.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Check authorization
    if (booking.passenger_id !== userId && booking.driver_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json({
      ...formatBooking(booking),
      ride: {
        id: booking.ride_id,
        originAddress: booking.origin_address,
        destinationAddress: booking.destination_address,
        departureTime: booking.departure_time,
        status: booking.status
      },
      driver: {
        firstName: booking.driver_first_name,
        lastName: booking.driver_last_name,
        phone: booking.driver_phone,
        carModel: booking.car_model,
        carPlate: booking.car_plate
      },
      passenger: {
        firstName: booking.passenger_first_name,
        lastName: booking.passenger_last_name,
        phone: booking.passenger_phone
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking details' });
  }
};

// Helper function to format booking data
const formatBooking = (booking) => ({
  id: booking.id,
  rideId: booking.ride_id,
  passengerId: booking.passenger_id,
  seatsBooked: booking.seats_booked,
  totalPrice: parseFloat(booking.total_price),
  status: booking.status,
  pickup: booking.pickup_lat ? {
    lat: parseFloat(booking.pickup_lat),
    lng: parseFloat(booking.pickup_lng),
    address: booking.pickup_address
  } : null,
  dropoff: booking.dropoff_lat ? {
    lat: parseFloat(booking.dropoff_lat),
    lng: parseFloat(booking.dropoff_lng),
    address: booking.dropoff_address
  } : null,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at
});

module.exports = {
  createBooking,
  getPassengerBookings,
  getRideBookings,
  updateBookingStatus,
  getBooking
};
