const { query } = require('../config/database');

// Update location for a ride (Driver)
const updateLocation = async (req, res) => {
  try {
    const { rideId, latitude, longitude, speed, heading } = req.body;
    const driverId = req.user.userId;

    // Verify the ride belongs to the driver
    const rideCheck = await query(
      'SELECT id, status FROM rides WHERE id = $1 AND driver_id = $2',
      [rideId, driverId]
    );

    if (rideCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update location for this ride' });
    }

    const ride = rideCheck.rows[0];
    if (ride.status !== 'in_progress') {
      return res.status(400).json({ error: 'Can only track location for rides in progress' });
    }

    // Insert location record
    await query(
      'INSERT INTO location_tracking (ride_id, latitude, longitude, speed, heading) VALUES ($1, $2, $3, $4, $5)',
      [rideId, latitude, longitude, speed, heading]
    );

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// Get location history for a ride
const getLocationHistory = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.userId;

    // Check if user is driver or has a booking for this ride
    const authCheck = await query(
      `SELECT r.driver_id, b.passenger_id
       FROM rides r
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.passenger_id = $1
       WHERE r.id = $2`,
      [userId, rideId]
    );

    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view location for this ride' });
    }

    const auth = authCheck.rows[0];
    if (auth.driver_id !== userId && auth.passenger_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view location for this ride' });
    }

    // Get location history
    const result = await query(
      `SELECT latitude, longitude, speed, heading, timestamp
       FROM location_tracking
       WHERE ride_id = $1
       ORDER BY timestamp DESC
       LIMIT 100`,
      [rideId]
    );

    res.json({
      locations: result.rows.map(loc => ({
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        speed: loc.speed ? parseFloat(loc.speed) : null,
        heading: loc.heading ? parseFloat(loc.heading) : null,
        timestamp: loc.timestamp
      }))
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ error: 'Failed to get location history' });
  }
};

// Get current location for a ride
const getCurrentLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.userId;

    // Check authorization
    const authCheck = await query(
      `SELECT r.driver_id, b.passenger_id
       FROM rides r
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.passenger_id = $1
       WHERE r.id = $2`,
      [userId, rideId]
    );

    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view location for this ride' });
    }

    const auth = authCheck.rows[0];
    if (auth.driver_id !== userId && auth.passenger_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view location for this ride' });
    }

    // Get most recent location
    const result = await query(
      `SELECT latitude, longitude, speed, heading, timestamp
       FROM location_tracking
       WHERE ride_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [rideId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No location data available for this ride' });
    }

    const loc = result.rows[0];
    res.json({
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      speed: loc.speed ? parseFloat(loc.speed) : null,
      heading: loc.heading ? parseFloat(loc.heading) : null,
      timestamp: loc.timestamp
    });
  } catch (error) {
    console.error('Get current location error:', error);
    res.status(500).json({ error: 'Failed to get current location' });
  }
};

module.exports = {
  updateLocation,
  getLocationHistory,
  getCurrentLocation
};
