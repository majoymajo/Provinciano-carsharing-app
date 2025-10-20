const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, isDriver, driverLicense, carModel, carPlate } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_driver, driver_license, car_model, car_plate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, first_name, last_name, phone, is_driver, rating, created_at`,
      [email, passwordHash, firstName, lastName, phone, isDriver || false, driverLicense, carModel, carPlate]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isDriver: user.is_driver },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isDriver: user.is_driver,
        rating: user.rating,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isDriver: user.is_driver },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isDriver: user.is_driver,
        rating: user.rating,
        carModel: user.car_model,
        carPlate: user.car_plate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, profile_image, is_driver, driver_license, car_model, car_plate, rating, total_ratings, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      profileImage: user.profile_image,
      isDriver: user.is_driver,
      driverLicense: user.driver_license,
      carModel: user.car_model,
      carPlate: user.car_plate,
      rating: user.rating,
      totalRatings: user.total_ratings,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage, isDriver, driverLicense, carModel, carPlate } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           phone = COALESCE($3, phone), 
           profile_image = COALESCE($4, profile_image), 
           is_driver = COALESCE($5, is_driver), 
           driver_license = COALESCE($6, driver_license), 
           car_model = COALESCE($7, car_model), 
           car_plate = COALESCE($8, car_plate),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, email, first_name, last_name, phone, profile_image, is_driver, driver_license, car_model, car_plate, rating`,
      [firstName, lastName, phone, profileImage, isDriver, driverLicense, carModel, carPlate, req.user.userId]
    );

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profileImage: user.profile_image,
        isDriver: user.is_driver,
        driverLicense: user.driver_license,
        carModel: user.car_model,
        carPlate: user.car_plate,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
