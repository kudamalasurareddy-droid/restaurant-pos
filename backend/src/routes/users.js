const express = require('express');
const User = require('../models/User');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
router.get('/', protect, checkPermission('users', 'read'), async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;

    const query = {};
    
    if (role) {
      query.role = { $in: role.split(',') };
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      permissions,
      isActive,
      workShift,
      salary,
      address,
      emergencyContact,
      hireDate,
      department
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone: phone?.trim(),
      password,
      role: role || 'customer',
      permissions: permissions || [],
      isActive: isActive !== false,
      workShift,
      salary,
      address,
      emergencyContact,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      department: department?.trim()
    };

    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
router.get('/:id', protect, checkPermission('users', 'read'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Manager)
router.put('/:id', protect, checkPermission('users', 'update'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      permissions,
      isActive,
      workShift,
      salary,
      address,
      emergencyContact
    } = req.body;

    // Only admin can change roles and permissions
    if ((role || permissions) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can change roles and permissions' });
    }

    // Update fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (email) {
      const emailExists = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email.toLowerCase();
    }
    if (phone) user.phone = phone.trim();
    if (role && req.user.role === 'admin') user.role = role;
    if (permissions && req.user.role === 'admin') user.permissions = permissions;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;
    if (workShift) user.workShift = workShift;
    if (salary !== undefined) user.salary = salary;
    if (address) user.address = address;
    if (emergencyContact) user.emergencyContact = emergencyContact;

    const updatedUser = await user.save();
    
    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @desc    Get waiters for assignment
// @route   GET /api/users/waiters
// @access  Private
router.get('/roles/waiters', protect, async (req, res) => {
  try {
    const waiters = await User.find({ 
      role: 'waiter', 
      isActive: true 
    })
      .select('firstName lastName phone')
      .sort({ firstName: 1 });

    res.json(waiters);
  } catch (error) {
    console.error('Get waiters error:', error);
    res.status(500).json({ message: 'Server error fetching waiters' });
  }
});

// @desc    Get user statistics (Admin/Manager view)
// @route   GET /api/users/analytics/stats
// @access  Private: personal=true for any user; otherwise requires users.read
router.get('/analytics/stats', protect, async (req, res) => {
  try {
    // If user is requesting their own stats
    if (req.query.personal === 'true') {
      const Order = require('../models/Order');
      const userId = req.user._id;

      // Get user's personal statistics
      const ordersHandled = await Order.countDocuments({ 
        waiter: userId,
        status: { $in: ['completed', 'paid'] }
      });

      const tablesServed = await Order.distinct('table', { 
        waiter: userId,
        status: { $in: ['completed', 'paid'] }
      });

      // Calculate customer rating (mock for now)
    // Get real customer rating from orders
    const customerRating = await Order.aggregate([
      { $match: { waiter: userId } },
      { $group: { _id: null, avgRating: { $avg: '$customerRating' } } }
    ]).then(result => result[0]?.avgRating || null);

      const totalShifts = await User.findById(userId).select('totalShifts') || 0;
      const hoursWorked = await User.findById(userId).select('hoursWorked') || 0;

      return res.json({
        stats: {
          ordersHandled,
          tablesServed: tablesServed.length,
          customerRating,
          totalShifts: totalShifts.totalShifts || 0,
          hoursWorked: hoursWorked.hoursWorked || 0
        }
      });
    }

    // Non-personal stats require permission
    const hasUsersRead = req.user.role === 'admin' || (req.user.permissions || []).some(p => p.module === 'users' && p.actions.includes('read'));
    if (!hasUsersRead) {
      return res.status(403).json({ message: 'Access denied. Required permission: read on users' });
    }

    // Admin/Manager stats (existing code)
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);

    const recentLogins = await User.find({ 
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    })
      .select('firstName lastName lastLogin role')
      .sort({ lastLogin: -1 })
      .limit(10);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers
      },
      usersByRole,
      recentLogins
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

// @desc    Get user activity history
// @route   GET /api/users/analytics/activity
// @access  Private
router.get('/analytics/activity', protect, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get recent orders handled by the user
    const recentOrders = await Order.find({ 
      waiter: userId 
    })
      .populate('table', 'tableNumber tableName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber status createdAt table');

    // Transform orders into activity format
    const activities = recentOrders.map((order, index) => {
      const timeAgo = getTimeAgo(order.createdAt);
      let action = '';
      let type = 'order';

      switch (order.status) {
        case 'completed':
          action = `Completed Order #${order.orderNumber}`;
          break;
        case 'paid':
          action = `Processed payment for Order #${order.orderNumber}`;
          type = 'payment';
          break;
        case 'preparing':
          action = `Order #${order.orderNumber} in preparation`;
          break;
        default:
          action = `Handled Order #${order.orderNumber}`;
      }

      if (order.table) {
        action += ` at Table ${order.table.tableNumber || order.table.tableName}`;
        if (order.status === 'completed') {
          type = 'service';
        }
      }

      return {
        id: order._id,
        action,
        time: timeAgo,
        type
      };
    });

    // Add some system activities (mock)

    res.json({
      activities: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error fetching user activity' });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private (Admin only)
router.post('/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// @desc    Toggle user status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin only)
router.patch('/:id/toggle-status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error toggling user status' });
  }
});

module.exports = router;