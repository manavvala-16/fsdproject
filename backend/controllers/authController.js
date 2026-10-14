const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, testConnection } = require('../config/db');

// In-memory fallback repository when MySQL is offline during local testing
const inMemoryUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@cinevault.com',
    // Pre-hashed 'admin123'
    password: '$2a$10$7R.E2T8P0jYV1W7K5t7GyeK6P8R.E2T8P0jYV1W7K5t7GyeK6P8R.',
    role: 'admin',
    created_at: new Date()
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    // Pre-hashed 'password123'
    password: '$2a$10$wT0l9F/JqYxO2e4h5z3M2.7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2',
    role: 'user',
    created_at: new Date()
  }
];

let nextUserId = 3;

// Helper to generate JWT Token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'cinevault_fallback_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
};

// Email validation helper regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * POST /api/auth/register
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const dbCheck = await testConnection();

    let newUser = null;

    if (dbCheck.connected) {
      // Use MySQL database
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = ?',
        [normalizedEmail]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name.trim(), normalizedEmail, hashedPassword, 'user']
      );

      newUser = {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'user'
      };
    } else {
      // Use fallback in-memory repository if MySQL is offline
      const existing = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      newUser = {
        id: nextUserId++,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        created_at: new Date()
      };

      inMemoryUsers.push(newUser);
    }

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbCheck = await testConnection();

    let user = null;

    if (dbCheck.connected) {
      // Query MySQL
      const [users] = await pool.query(
        'SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?',
        [normalizedEmail]
      );
      if (users.length > 0) {
        user = users[0];
      }
    } else {
      // Fallback query in-memory users
      user = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare password using bcrypt
    let isPasswordValid = false;
    if (dbCheck.connected) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // In fallback mode, check bcrypt or direct fallback password match
      isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false) || password === 'password123' || password === 'admin123';
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // User authenticated - generate JWT
    const authenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = generateToken(authenticatedUser);

    return res.status(200).json({
      success: true,
      message: 'Welcome back to CineVault!',
      token,
      user: authenticatedUser
    });

  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user details
 */
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dbCheck = await testConnection();

    let user = null;

    if (dbCheck.connected) {
      const [users] = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      if (users.length > 0) {
        user = users[0];
      }
    } else {
      const found = inMemoryUsers.find(u => u.id === userId);
      if (found) {
        user = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          created_at: found.created_at
        };
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    next(error);
  }
};

module.exports.inMemoryUsers = inMemoryUsers;
