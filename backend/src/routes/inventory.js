const express = require('express');
const { InventoryItem, StockMovement, PurchaseOrder } = require('../models/Inventory');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// INVENTORY ITEMS ROUTES

// @desc    Get all inventory items
// @route   GET /api/inventory/items
// @access  Private
router.get('/items', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { category, lowStock, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$reorderLevel'] };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await InventoryItem.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InventoryItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ message: 'Server error fetching inventory items' });
  }
});

// @desc    Create new inventory item
// @route   POST /api/inventory/items
// @access  Private (Admin/Manager)
router.post('/items', protect, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unit,
      currentStock,
      minimumStock,
      maximumStock,
      reorderLevel,
      costPrice,
      sellingPrice,
      supplier,
      expiryDate,
      batchNumber,
      barcode,
      location,
      isPerishable,
      shelfLife,
      description
    } = req.body;

    if (!name || !sku || !category || !unit || !costPrice) {
      return res.status(400).json({ 
        message: 'Name, SKU, category, unit, and cost price are required' 
      });
    }

    // Check if SKU already exists
    const existingSku = await InventoryItem.findOne({ sku: sku.trim() });
    if (existingSku) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const itemData = {
      name: name.trim(),
      sku: sku.trim(),
      category,
      unit,
      currentStock: parseFloat(currentStock) || 0,
      minimumStock: parseFloat(minimumStock) || 0,
      maximumStock: parseFloat(maximumStock) || 100,
      reorderLevel: parseFloat(reorderLevel) || parseFloat(minimumStock) || 10,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice) || 0,
      supplier,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      batchNumber: batchNumber?.trim(),
      barcode: barcode?.trim(),
      location,
      isPerishable: isPerishable === true,
      shelfLife: shelfLife ? parseInt(shelfLife) : null,
      description: description?.trim(),
      lastRestocked: new Date()
    };

    const item = await InventoryItem.create(itemData);

    // Create initial stock movement record
    if (item.currentStock > 0) {
      await StockMovement.create({
        item: item._id,
        type: 'adjustment',
        quantity: item.currentStock,
        unitCost: item.costPrice,
        totalCost: item.currentStock * item.costPrice,
        reason: 'Initial stock entry',
        performedBy: req.user._id
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Server error creating inventory item' });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/items/:id
// @access  Private (Admin/Manager)
router.put('/items/:id', protect, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const {
      name,
      sku,
      category,
      unit,
      minimumStock,
      maximumStock,
      reorderLevel,
      costPrice,
      sellingPrice,
      supplier,
      expiryDate,
      batchNumber,
      barcode,
      location,
      isPerishable,
      shelfLife,
      description,
      isActive
    } = req.body;

    // Check if SKU is being changed and if it already exists
    if (sku && sku !== item.sku) {
      const existingSku = await InventoryItem.findOne({ 
        sku: sku.trim(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
      item.sku = sku.trim();
    }

    // Update fields
    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (unit) item.unit = unit;
    if (minimumStock !== undefined) item.minimumStock = parseFloat(minimumStock);
    if (maximumStock !== undefined) item.maximumStock = parseFloat(maximumStock);
    if (reorderLevel !== undefined) item.reorderLevel = parseFloat(reorderLevel);
    if (costPrice !== undefined) item.costPrice = parseFloat(costPrice);
    if (sellingPrice !== undefined) item.sellingPrice = parseFloat(sellingPrice);
    if (supplier) item.supplier = supplier;
    if (expiryDate !== undefined) item.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (batchNumber !== undefined) item.batchNumber = batchNumber?.trim();
    if (barcode !== undefined) item.barcode = barcode?.trim();
    if (location) item.location = location;
    if (isPerishable !== undefined) item.isPerishable = isPerishable;
    if (shelfLife !== undefined) item.shelfLife = shelfLife ? parseInt(shelfLife) : null;
    if (description !== undefined) item.description = description?.trim();
    if (isActive !== undefined) item.isActive = isActive;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error updating inventory item' });
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/items/:id
// @access  Private (Admin)
router.delete('/items/:id', protect, checkPermission('inventory', 'delete'), async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if item has stock movements
    const movementCount = await StockMovement.countDocuments({ item: req.params.id });
    if (movementCount > 0) {
      // Soft delete by setting isActive to false instead of hard delete
      item.isActive = false;
      await item.save();
      res.json({ message: 'Inventory item deactivated successfully' });
    } else {
      // Hard delete if no movements exist
      await InventoryItem.findByIdAndDelete(req.params.id);
      res.json({ message: 'Inventory item deleted successfully' });
    }
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error deleting inventory item' });
  }
});

// @desc    Update stock level
// @route   PATCH /api/inventory/items/:id/stock
// @access  Private
router.patch('/items/:id/stock', protect, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const { quantity, type, reason, unitCost } = req.body;

    if (!quantity || !type) {
      return res.status(400).json({ message: 'Quantity and type are required' });
    }

    const validTypes = ['purchase', 'usage', 'wastage', 'adjustment', 'return'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid stock movement type' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const movementQuantity = parseFloat(quantity);
    const cost = unitCost ? parseFloat(unitCost) : item.costPrice;

    // Calculate new stock level
    let newStock = item.currentStock;
    if (type === 'purchase' || type === 'return') {
      newStock += movementQuantity;
      item.totalPurchased += movementQuantity;
      item.lastRestocked = new Date();
    } else {
      newStock -= movementQuantity;
      item.totalUsed += movementQuantity;
    }

    if (newStock < 0) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update item stock
    item.currentStock = newStock;
    await item.save();

    // Create stock movement record
    await StockMovement.create({
      item: item._id,
      type,
      quantity: Math.abs(movementQuantity),
      unitCost: cost,
      totalCost: Math.abs(movementQuantity) * cost,
      reason: reason || `Stock ${type}`,
      performedBy: req.user._id
    });

    // Check for low stock alert
    if (item.currentStock <= item.reorderLevel) {
      req.io.emit('low-stock-alert', {
        itemId: item._id,
        itemName: item.name,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        minimumStock: item.minimumStock
      });
    }

    res.json({
      message: 'Stock updated successfully',
      item: {
        _id: item._id,
        name: item.name,
        sku: item.sku,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        reorderLevel: item.reorderLevel
      },
      movement: {
        type,
        quantity: movementQuantity,
        newStock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error updating stock' });
  }
});

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
router.get('/low-stock', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).sort({ currentStock: 1 });

    res.json(lowStockItems);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error fetching low stock items' });
  }
});

// STOCK MOVEMENTS ROUTES

// @desc    Get stock movements
// @route   GET /api/inventory/movements
// @access  Private
router.get('/movements', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { item, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (item) query.item = item;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movements = await StockMovement.find(query)
      .populate('item', 'name sku unit')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockMovement.countDocuments(query);

    res.json({
      movements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + movements.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Server error fetching stock movements' });
  }
});

// PURCHASE ORDERS ROUTES

// @desc    Get all purchase orders
// @route   GET /api/inventory/purchase-orders
// @access  Private
router.get('/purchase-orders', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = { $in: status.split(',') };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await PurchaseOrder.find(query)
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Server error fetching purchase orders' });
  }
});

// @desc    Create purchase order
// @route   POST /api/inventory/purchase-orders
// @access  Private
router.post('/purchase-orders', protect, checkPermission('inventory', 'create'), async (req, res) => {
  try {
    const { supplier, items, expectedDelivery, notes } = req.body;

    if (!supplier || !supplier.name || !items || !items.length) {
      return res.status(400).json({ message: 'Supplier and items are required' });
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const inventoryItem = await InventoryItem.findById(item.item);
      if (!inventoryItem) {
        return res.status(400).json({ message: `Inventory item not found: ${item.item}` });
      }

      const quantity = parseFloat(item.quantity);
      const unitCost = parseFloat(item.unitCost);
      const totalCost = quantity * unitCost;

      processedItems.push({
        item: item.item,
        quantity,
        unitCost,
        totalCost
      });

      subtotal += totalCost;
    }

    const orderData = {
      supplier,
      items: processedItems,
      subtotal,
      totalAmount: subtotal, // Add tax/shipping calculation if needed
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
      notes: notes?.trim(),
      createdBy: req.user._id
    };

    const purchaseOrder = await PurchaseOrder.create(orderData);
    const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: 'Server error creating purchase order' });
  }
});

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
// @access  Private
router.get('/analytics/stats', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockItems = await InventoryItem.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    });
    const outOfStockItems = await InventoryItem.countDocuments({
      isActive: true,
      currentStock: 0
    });

    const totalValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$currentStock', '$costPrice'] }
          }
        }
      }
    ]);

    const categoryStats = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          itemCount: { $sum: 1 },
          totalValue: {
            $sum: { $multiply: ['$currentStock', '$costPrice'] }
          },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$reorderLevel'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      overview: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.totalValue || 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ message: 'Server error fetching inventory statistics' });
  }
});

module.exports = router;