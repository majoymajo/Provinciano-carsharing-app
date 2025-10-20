const express = require('express');
const router = express.Router();
const { 
  createRide, 
  searchRides, 
  getRide, 
  getDriverRides, 
  updateRide, 
  deleteRide 
} = require('../controllers/ridesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Ride management
router.post('/', createRide);
router.get('/search', searchRides);
router.get('/my-rides', getDriverRides);
router.get('/:id', getRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);

module.exports = router;
