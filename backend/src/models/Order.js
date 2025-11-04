const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Optional key to make order creation idempotent
  idempotencyKey: {
    type: String,
    index: { unique: true, sparse: true }
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'delivery', 'online'],
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },
  customer: {
    name: String,
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  // When orders are placed by authenticated customers, link to their user id
  customerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variant: String, // Small, Medium, Large
    price: {
      type: Number,
      required: true
    },
    addOns: [{
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
      },
      quantity: Number,
      price: Number
    }],
    specialInstructions: String,
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending'
    },
    preparedAt: Date,
    servedAt: Date
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'coupon'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    },
    couponCode: String,
    reason: String
  },
  serviceCharge: {
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'online'],
    default: 'cash'
  },
  payments: [{
    amount: Number,
    method: String,
    transactionId: String,
    paidAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    }
  }],
  splitBilling: {
    enabled: {
      type: Boolean,
      default: false
    },
    splits: [{
      customerId: String,
      customerName: String,
      items: [Number], // indices of items
      amount: Number,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
      },
      paymentMethod: String,
      transactionId: String
    }]
  },
  kot: {
    number: String,
    printedAt: Date,
    reprints: [{
      printedAt: Date,
      reason: String,
      printedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  preparationTime: {
    estimated: Number, // in minutes
    actual: Number,
    startedAt: Date,
    completedAt: Date
  },
  delivery: {
    address: String,
    estimatedTime: Date,
    actualTime: Date,
    deliveryPerson: String,
    trackingId: String,
    instructions: String
  },
  ratings: {
    food: Number,
    service: Number,
    overall: Number,
    review: String,
    ratedAt: Date
  },
  notes: String,
  specialInstructions: String,
  source: {
    type: String,
    enum: ['pos', 'website', 'mobile_app', 'phone', 'walk_in'],
    default: 'pos'
  },
  loyaltyPoints: {
    earned: {
      type: Number,
      default: 0
    },
    redeemed: {
      type: Number,
      default: 0
    }
  },
  refunds: [{
    amount: Number,
    reason: String,
    refundedAt: {
      type: Date,
      default: Date.now
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [Number] // indices of refunded items
  }]
}, {
  timestamps: true
});

// Generate order number before validation so required check passes
orderSchema.pre('validate', async function(next) {
  if (!this.orderNumber) {
    try {
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
      const count = await this.constructor.countDocuments({
        createdAt: {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        }
      });
      this.orderNumber = `ORD-${dateString}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ table: 1, status: 1 });
orderSchema.index({ waiter: 1, createdAt: -1 });
orderSchema.index({ orderType: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);