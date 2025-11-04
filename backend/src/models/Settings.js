const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['restaurant', 'system', 'notification', 'payment', 'ui']
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one document per category
settingsSchema.index({ category: 1 }, { unique: true });

// Default settings for each category
settingsSchema.statics.getDefaultSettings = function(category) {
  const defaults = {
    restaurant: {
      name: 'Restaurant POS System',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@restaurant.com',
      website: 'www.restaurant.com',
      logo: '',
      timezone: 'UTC',
      currency: 'USD',
      taxRate: 8.5,
      serviceCharge: 10,
      operatingHours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '09:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      }
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      enableTwoFactor: false,
      allowRemoteAccess: true,
      logLevel: 'info',
      maxLogSize: 100,
      enableAuditLog: true,
      dataRetentionDays: 365
    },
    notification: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderAlerts: true,
      inventoryAlerts: true,
      systemAlerts: true,
      lowStockThreshold: 10,
      emailServer: {
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password: '',
        encryption: 'TLS'
      },
      smsProvider: {
        provider: 'twilio',
        apiKey: '',
        apiSecret: '',
        fromNumber: ''
      }
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptDigitalWallet: true,
      enableTips: true,
      defaultTipPercentage: 15,
      allowCustomTips: true,
      cardProcessors: [
        { name: 'Stripe', enabled: true, apiKey: '', testMode: false },
        { name: 'PayPal', enabled: false, apiKey: '', testMode: true },
        { name: 'Square', enabled: false, apiKey: '', testMode: true }
      ],
      receiptSettings: {
        printAutomatically: true,
        emailReceipts: true,
        includeQRCode: true,
        footerMessage: 'Thank you for dining with us!'
      }
    },
    ui: {
      theme: 'light',
      primaryColor: '#1976d2',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      showWelcomeScreen: true,
      enableAnimations: true,
      compactMode: false,
      soundEnabled: true
    }
  };
  
  return defaults[category] || {};
};

// Get or create settings for a category
settingsSchema.statics.getOrCreateSettings = async function(category, userId) {
  try {
    let settings = await this.findOne({ category });
    
    if (!settings) {
      // Create default settings
      settings = await this.create({
        category,
        settings: this.getDefaultSettings(category),
        updatedBy: userId
      });
    }
    
    return settings;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Settings', settingsSchema);