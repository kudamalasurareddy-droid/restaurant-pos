const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['ingredients', 'beverages', 'supplies', 'raw_materials', 'packaging'],
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'packets', 'boxes', 'bottles']
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  maximumStock: {
    type: Number,
    required: true
  },
  reorderLevel: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    address: String
  },
  expiryDate: Date,
  batchNumber: String,
  barcode: String,
  location: {
    warehouse: String,
    section: String,
    shelf: String
  },
  isPerishable: {
    type: Boolean,
    default: false
  },
  shelfLife: Number, // in days
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: Date,
  totalPurchased: {
    type: Number,
    default: 0
  },
  totalUsed: {
    type: Number,
    default: 0
  },
  averageConsumption: {
    daily: Number,
    weekly: Number,
    monthly: Number
  }
}, {
  timestamps: true
});

const stockMovementSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'usage', 'wastage', 'adjustment', 'return', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  reference: {
    type: String, // Order ID, Purchase ID, etc.
    trim: true
  },
  reason: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    name: String,
    contact: String,
    invoiceNumber: String
  },
  batchNumber: String,
  expiryDate: Date,
  notes: String
}, {
  timestamps: true
});

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    name: {
      type: String,
      required: true
    },
    contact: String,
    email: String,
    address: String
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0
    },
    received: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'received'],
      default: 'pending'
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    rate: Number,
    amount: Number
  },
  shipping: {
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
    enum: ['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'],
    default: 'draft'
  },
  expectedDelivery: Date,
  actualDelivery: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  paymentTerms: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate purchase order number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    this.orderNumber = `PO-${dateString}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1, isActive: 1 });
inventoryItemSchema.index({ name: 'text' });

stockMovementSchema.index({ item: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });

purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = { InventoryItem, StockMovement, PurchaseOrder };