const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getPassengerBookings, 
  getRideBookings, 
  updateBookingStatus, 
  getBooking 
} = require('../controllers/bookingsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Booking management
router.post('/', createBooking);
router.get('/my-bookings', getPassengerBookings);
router.get('/ride/:rideId', getRideBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
