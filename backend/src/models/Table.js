const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tableName: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'private_room', 'bar', 'patio'],
    default: 'indoor'
  },
  section: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning', 'out_of_order'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservations: [{
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    reservationDate: Date,
    duration: Number, // in minutes
    partySize: Number,
    specialRequests: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  qrCode: {
    type: String,
    default: null
  },
  coordinates: {
    x: Number,
    y: Number
  },
  shape: {
    type: String,
    enum: ['square', 'round', 'rectangle'],
    default: 'square'
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  serviceCharge: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String,
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  occupiedAt: Date,
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
tableSchema.index({ status: 1, isActive: 1 });
tableSchema.index({ section: 1, location: 1 });

module.exports = mongoose.model('Table', tableSchema);