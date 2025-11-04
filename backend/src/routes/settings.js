const express = require('express');
const Settings = require('../models/Settings');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Helper functions for system info
const getLastBackupInfo = async () => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    const backupFiles = await fs.readdir(backupDir).catch(() => []);
    
    if (backupFiles.length === 0) return null;
    
    const files = await Promise.all(
      backupFiles
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return { name: file, path: filePath, stats };
        })
    );
    
    files.sort((a, b) => b.stats.mtime - a.stats.mtime);
    
    return {
      filename: files[0].name,
      size: files[0].stats.size,
      created: files[0].stats.mtime
    };
  } catch (error) {
    console.error('Error getting backup info:', error);
    return null;
  }
};

const getDiskSpaceInfo = () => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percentage: Math.round((usedMem / totalMem) * 100)
    };
  } catch (error) {
    console.error('Error getting disk space info:', error);
    return null;
  }
};

const router = express.Router();

// @desc    Get all settings or specific category
// @route   GET /api/settings/:category?
// @access  Private (Admin/Manager)
router.get('/:category?', protect, checkPermission('settings', 'read'), async (req, res) => {
  try {
    const { category } = req.params;
    
    if (category) {
      // Get specific category settings
      const settings = await Settings.getOrCreateSettings(category, req.user._id);
      res.json({
        success: true,
        data: {
          [category]: settings.settings
        }
      });
    } else {
      // Get all settings
      const allSettings = await Settings.find({})
        .populate('updatedBy', 'firstName lastName')
        .sort({ category: 1 });
      
      const settingsObj = {};
      for (const setting of allSettings) {
        settingsObj[setting.category] = setting.settings;
      }
      
      // Ensure all categories have default settings
      const categories = ['restaurant', 'system', 'notification', 'payment', 'ui'];
      for (const cat of categories) {
        if (!settingsObj[cat]) {
          const defaultSetting = await Settings.getOrCreateSettings(cat, req.user._id);
          settingsObj[cat] = defaultSetting.settings;
        }
      }
      
      res.json({
        success: true,
        data: settingsObj
      });
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @desc    Update settings for specific category
// @route   PUT /api/settings/:category
// @access  Private (Admin only)
router.put('/:category', protect, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    const newSettings = req.body;
    
    // Validate category
    const validCategories = ['restaurant', 'system', 'notification', 'payment', 'ui'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid settings category' });
    }
    
    // Update or create settings
    let settings = await Settings.findOne({ category });
    
    if (settings) {
      settings.settings = { ...settings.settings, ...newSettings };
      settings.updatedBy = req.user._id;
      await settings.save();
    } else {
      settings = await Settings.create({
        category,
        settings: { ...Settings.getDefaultSettings(category), ...newSettings },
        updatedBy: req.user._id
      });
    }
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('settings-updated', {
        category,
        settings: settings.settings,
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        [category]: settings.settings
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

// @desc    Get system status
// @route   GET /api/settings/system-status
// @access  Private (Admin/Manager)
router.get('/system/status', protect, checkPermission('settings', 'read'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    const User = require('../models/User');
    
    // Get system information
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Get uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    // Database status check
    let databaseStatus = 'connected';
    try {
      await User.findOne().limit(1);
    } catch (dbError) {
      databaseStatus = 'error';
    }
    
    // Get real backup and disk space info
    const lastBackup = await getLastBackupInfo();
    const diskSpace = await getDiskSpaceInfo();
    
    res.json({
      success: true,
      data: {
        serverStatus: 'online',
        databaseStatus,
        lastBackup,
        diskSpace,
        memory: {
          used: Math.round((usedMemory / 1024 / 1024 / 1024) * 10) / 10,
          total: Math.round((totalMemory / 1024 / 1024 / 1024) * 10) / 10
        },
        uptime: `${days} days, ${hours} hours, ${minutes} minutes`,
        version: process.env.npm_package_version || '2.1.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
      }
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({ message: 'Server error fetching system status' });
  }
});

// @desc    Create system backup
// @route   POST /api/settings/backup
// @access  Private (Admin only)
router.post('/backup', protect, authorize('admin'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    const User = require('../models/User');
    const Menu = require('../models/Menu');
    const Table = require('../models/Table');
    const Inventory = require('../models/Inventory');
    
    // Create backup data
    const backupData = {
      timestamp: new Date(),
      version: process.env.npm_package_version || '2.1.0',
      data: {
        orders: await Order.find({}).limit(1000), // Limit for demo
        users: await User.find({}).select('-password').limit(100),
        menu: await Menu.find({}).limit(500),
        tables: await Table.find({}).limit(100),
        inventory: await Inventory.find({}).limit(500),
        settings: await Settings.find({})
      }
    };
    
    // In a real application, you would:
    // 1. Save to a backup storage (AWS S3, local disk, etc.)
    // 2. Compress the data
    // 3. Encrypt sensitive information
    // 4. Schedule automatic backups
    
    const backupFileName = `backup_${Date.now()}.json`;
    const backupPath = path.join(process.cwd(), 'backups', backupFileName);
    
    // Ensure backup directory exists
    try {
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
    } catch (mkdirError) {
      // Directory might already exist
    }
    
    // Save backup file (simplified)
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    // Log backup activity
    console.log(`Backup created: ${backupFileName} by user ${req.user.email}`);
    
    // Emit socket event
    if (req.io) {
      req.io.emit('backup-created', {
        fileName: backupFileName,
        timestamp: new Date(),
        createdBy: req.user._id
      });
    }
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        fileName: backupFileName,
        timestamp: backupData.timestamp,
        size: JSON.stringify(backupData).length
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ message: 'Server error creating backup' });
  }
});

// @desc    Test email configuration
// @route   POST /api/settings/test-email
// @access  Private (Admin only)
router.post('/test-email', protect, authorize('admin'), async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address is required' });
    }
    
    // Get email settings
    const emailSettings = await Settings.getOrCreateSettings('notification', req.user._id);
    const emailConfig = emailSettings.settings.emailServer;
    
    if (!emailConfig.host || !emailConfig.username) {
      return res.status(400).json({ message: 'Email configuration is incomplete' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.encryption === 'SSL',
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password
      }
    });
    
    // Send test email
    const mailOptions = {
      from: emailConfig.username,
      to: testEmail,
      subject: 'Restaurant POS - Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email from your Restaurant POS system.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sent by:</strong> ${req.user.firstName} ${req.user.lastName}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you received this email, your email configuration is working correctly.
        </p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

// @desc    Reset settings to default for a category
// @route   POST /api/settings/:category/reset
// @access  Private (Admin only)
router.post('/:category/reset', protect, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['restaurant', 'system', 'notification', 'payment', 'ui'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid settings category' });
    }
    
    // Reset to default settings
    const defaultSettings = Settings.getDefaultSettings(category);
    
    let settings = await Settings.findOne({ category });
    if (settings) {
      settings.settings = defaultSettings;
      settings.updatedBy = req.user._id;
      await settings.save();
    } else {
      settings = await Settings.create({
        category,
        settings: defaultSettings,
        updatedBy: req.user._id
      });
    }
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('settings-reset', {
        category,
        settings: settings.settings,
        resetBy: req.user._id,
        resetAt: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: {
        [category]: settings.settings
      }
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ message: 'Server error resetting settings' });
  }
});

module.exports = router;