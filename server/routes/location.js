const express = require('express');
const router = express.Router();
const { 
  updateLocation, 
  getLocationHistory, 
  getCurrentLocation 
} = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Location tracking
router.post('/update', updateLocation);
router.get('/ride/:rideId/history', getLocationHistory);
router.get('/ride/:rideId/current', getCurrentLocation);

module.exports = router;
