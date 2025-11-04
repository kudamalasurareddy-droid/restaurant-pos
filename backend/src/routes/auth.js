const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (but should be restricted in production)
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role = 'cashier',
      permissions = []
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Set default permissions based on role
    let defaultPermissions = [];
    switch (role) {
      case 'admin':
        defaultPermissions = [
          { module: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'sales', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'menu', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'reports', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'tables', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'kot', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['create', 'read', 'update', 'delete'] }
        ];
        break;
      case 'manager':
        defaultPermissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'sales', actions: ['create', 'read', 'update'] },
          { module: 'menu', actions: ['read', 'update'] },
          { module: 'inventory', actions: ['create', 'read', 'update'] },
          { module: 'reports', actions: ['read'] },
          { module: 'users', actions: ['read'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'kot', actions: ['create', 'read', 'update'] },
          { module: 'orders', actions: ['create', 'read', 'update'] }
        ];
        break;
      case 'cashier':
        defaultPermissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'sales', actions: ['create', 'read'] },
          { module: 'menu', actions: ['read'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'orders', actions: ['create', 'read', 'update'] }
        ];
        break;
      case 'waiter':
        defaultPermissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'menu', actions: ['read'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'orders', actions: ['create', 'read', 'update'] }
        ];
        break; 
      case 'kitchen_staff':
        defaultPermissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'kot', actions: ['read', 'update'] },
          { module: 'orders', actions: ['read', 'update'] }
        ];
        break;
      case 'customer':
        defaultPermissions = [
          { module: 'menu', actions: ['read'] },
          { module: 'orders', actions: ['create', 'read'] }
        ];
        break;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      permissions: permissions.length > 0 ? permissions : defaultPermissions
    });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profileImage: user.profileImage,
      workShift: user.workShift,
      address: user.address,
      emergencyContact: user.emergencyContact,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'profileImage', 
      'workShift', 'address', 'emergencyContact'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      isActive: updatedUser.isActive,
      lastLogin: updatedUser.lastLogin,
      profileImage: updatedUser.profileImage,
      workShift: updatedUser.workShift,
      address: updatedUser.address,
      emergencyContact: updatedUser.emergencyContact,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, (req, res) => {
  res.json({
    valid: true,
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
      isActive: req.user.isActive
    }
  });
});

// @desc    Get available roles and permissions
// @route   GET /api/auth/roles
// @access  Public (for registration form)
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'manager', label: 'Manager', description: 'Management operations' },
      { value: 'cashier', label: 'Cashier', description: 'POS operations' },
      { value: 'waiter', label: 'Waiter', description: 'Order taking, table management' },
      { value: 'kitchen_staff', label: 'Kitchen Staff', description: 'Kitchen operations' },
      { value: 'customer', label: 'Customer', description: 'Menu viewing, order placement' }
    ];

    const roleNames = {
      admin: 'Administrator',
      manager: 'Manager',
      cashier: 'Cashier',
      waiter: 'Waiter',
      kitchen_staff: 'Kitchen Staff',
      customer: 'Customer'
    };

    res.json({ 
      success: true, 
      data: { 
        roles, 
        roleNames 
      } 
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;