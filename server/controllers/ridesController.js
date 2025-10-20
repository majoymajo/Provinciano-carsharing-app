const { query } = require('../config/database');

// Create a new ride (Driver)
const createRide = async (req, res) => {
  try {
    const {
      originLat, originLng, originAddress,
      destinationLat, destinationLng, destinationAddress,
      departureTime, totalSeats, pricePerSeat, notes
    } = req.body;

    const driverId = req.user.userId;

    // Verify user is a driver
    const userCheck = await query('SELECT is_driver FROM users WHERE id = $1', [driverId]);
    if (userCheck.rows.length === 0 || !userCheck.rows[0].is_driver) {
      return res.status(403).json({ error: 'Only drivers can create rides' });
    }

    const result = await query(
      `INSERT INTO rides (driver_id, origin_lat, origin_lng, origin_address, destination_lat, destination_lng, 
       destination_address, departure_time, total_seats, available_seats, price_per_seat, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, $11)
       RETURNING *`,
      [driverId, originLat, originLng, originAddress, destinationLat, destinationLng, 
       destinationAddress, departureTime, totalSeats, pricePerSeat, notes]
    );

    res.status(201).json({
      message: 'Ride created successfully',
      ride: formatRide(result.rows[0])
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Failed to create ride' });
  }
};

// Search for available rides
const searchRides = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, date, seats } = req.query;
    
    // Basic search query - in production, use PostGIS for proper location search
    let queryText = `
      SELECT r.*, u.first_name, u.last_name, u.rating, u.car_model, u.car_plate
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.status = 'scheduled' 
        AND r.available_seats >= $1
    `;
    const params = [seats || 1];
    
    if (date) {
      queryText += ` AND DATE(r.departure_time) = DATE($${params.length + 1})`;
      params.push(date);
    }
    
    // Simple distance calculation (in production, use proper geospatial queries)
    if (originLat && originLng) {
      queryText += ` AND (
        ABS(r.origin_lat - $${params.length + 1}) < 0.5 
        AND ABS(r.origin_lng - $${params.length + 2}) < 0.5
      )`;
      params.push(originLat, originLng);
    }
    
    if (destLat && destLng) {
      queryText += ` AND (
        ABS(r.destination_lat - $${params.length + 1}) < 0.5 
        AND ABS(r.destination_lng - $${params.length + 2}) < 0.5
      )`;
      params.push(destLat, destLng);
    }
    
    queryText += ' ORDER BY r.departure_time ASC';
    
    const result = await query(queryText, params);
    
    res.json({
      rides: result.rows.map(ride => ({
        ...formatRide(ride),
        driver: {
          firstName: ride.first_name,
          lastName: ride.last_name,
          rating: ride.rating,
          carModel: ride.car_model,
          carPlate: ride.car_plate
        }
      }))
    });
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({ error: 'Failed to search rides' });
  }
};

// Get ride details
const getRide = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT r.*, u.first_name, u.last_name, u.phone, u.rating, u.car_model, u.car_plate
       FROM rides r
       JOIN users u ON r.driver_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    const ride = result.rows[0];
    res.json({
      ...formatRide(ride),
      driver: {
        firstName: ride.first_name,
        lastName: ride.last_name,
        phone: ride.phone,
        rating: ride.rating,
        carModel: ride.car_model,
        carPlate: ride.car_plate
      }
    });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: 'Failed to get ride details' });
  }
};

// Get rides by driver
const getDriverRides = async (req, res) => {
  try {
    const driverId = req.user.userId;
    
    const result = await query(
      `SELECT * FROM rides WHERE driver_id = $1 ORDER BY departure_time DESC`,
      [driverId]
    );
    
    res.json({
      rides: result.rows.map(formatRide)
    });
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({ error: 'Failed to get driver rides' });
  }
};

// Update ride
const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;
    const { departureTime, totalSeats, pricePerSeat, status, notes } = req.body;
    
    // Check if ride belongs to driver
    const rideCheck = await query('SELECT * FROM rides WHERE id = $1 AND driver_id = $2', [id, driverId]);
    if (rideCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this ride' });
    }
    
    const currentRide = rideCheck.rows[0];
    const bookedSeats = currentRide.total_seats - currentRide.available_seats;
    
    // Ensure available seats are updated correctly if total seats change
    let availableSeats = currentRide.available_seats;
    if (totalSeats && totalSeats !== currentRide.total_seats) {
      availableSeats = Math.max(0, totalSeats - bookedSeats);
    }
    
    const result = await query(
      `UPDATE rides 
       SET departure_time = COALESCE($1, departure_time),
           total_seats = COALESCE($2, total_seats),
           available_seats = COALESCE($3, available_seats),
           price_per_seat = COALESCE($4, price_per_seat),
           status = COALESCE($5, status),
           notes = COALESCE($6, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND driver_id = $8
       RETURNING *`,
      [departureTime, totalSeats, availableSeats, pricePerSeat, status, notes, id, driverId]
    );
    
    res.json({
      message: 'Ride updated successfully',
      ride: formatRide(result.rows[0])
    });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ error: 'Failed to update ride' });
  }
};

// Delete ride
const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;
    
    const result = await query(
      'DELETE FROM rides WHERE id = $1 AND driver_id = $2 RETURNING id',
      [id, driverId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this ride or ride not found' });
    }
    
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ error: 'Failed to delete ride' });
  }
};

// Helper function to format ride data
const formatRide = (ride) => ({
  id: ride.id,
  driverId: ride.driver_id,
  origin: {
    lat: parseFloat(ride.origin_lat),
    lng: parseFloat(ride.origin_lng),
    address: ride.origin_address
  },
  destination: {
    lat: parseFloat(ride.destination_lat),
    lng: parseFloat(ride.destination_lng),
    address: ride.destination_address
  },
  departureTime: ride.departure_time,
  arrivalTime: ride.arrival_time,
  totalSeats: ride.total_seats,
  availableSeats: ride.available_seats,
  pricePerSeat: parseFloat(ride.price_per_seat),
  status: ride.status,
  notes: ride.notes,
  createdAt: ride.created_at,
  updatedAt: ride.updated_at
});

module.exports = {
  createRide,
  searchRides,
  getRide,
  getDriverRides,
  updateRide,
  deleteRide
};
