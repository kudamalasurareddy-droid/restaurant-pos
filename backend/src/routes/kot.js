const express = require('express');
const Order = require('../models/Order');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// Handle preflight requests for PATCH routes
router.options('/:orderId/items/:itemIndex/status', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

router.options('/:orderId/complete', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// @desc    Get KOT queue (pending and preparing orders)
// @route   GET /api/kot/queue
// @access  Private (Kitchen Staff)
router.get('/queue', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    })
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName')
      .populate('items.menuItem', 'name preparationTime category')
      .populate({
        path: 'items.menuItem',
        populate: {
          path: 'category',
          select: 'name color'
        }
      })
      .sort({ createdAt: 1 });

    // Transform orders for KOT display
    const kotQueue = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      table: order.table,
      waiter: order.waiter,
      status: order.status,
      createdAt: order.createdAt,
      specialInstructions: order.specialInstructions,
      estimatedTime: order.preparationTime.estimated,
      kotNumber: order.kot.number,
      kotPrintedAt: order.kot.printedAt,
      items: order.items.map(item => ({
        _id: item._id,
        menuItem: item.menuItem,
        quantity: item.quantity,
        variant: item.variant,
        addOns: item.addOns,
        specialInstructions: item.specialInstructions,
        status: item.status,
        preparedAt: item.preparedAt
      }))
    }));

    res.json(kotQueue);
  } catch (error) {
    console.error('Get KOT queue error:', error);
    res.status(500).json({ message: 'Server error fetching KOT queue' });
  }
});

// @desc    Print KOT for order
// @route   POST /api/kot/:orderId/print
// @access  Private
router.post('/:orderId/print', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.orderId)
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName')
      .populate('items.menuItem', 'name description preparationTime')
      .populate('items.addOns.item', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate KOT number if not exists
    if (!order.kot.number) {
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
      const kotCount = await Order.countDocuments({
        'kot.printedAt': {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        }
      });
      order.kot.number = `KOT-${dateString}-${(kotCount + 1).toString().padStart(4, '0')}`;
    }

    // Update KOT print information
    const printInfo = {
      printedAt: new Date(),
      reason: reason || 'initial_print',
      printedBy: req.user._id
    };

    if (order.kot.printedAt) {
      // This is a reprint
      order.kot.reprints.push(printInfo);
    } else {
      // First print
      order.kot.printedAt = printInfo.printedAt;
      order.status = 'confirmed';
    }

    await order.save();

    // Emit socket event for KOT print
    req.io.emit('kot-printed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      kotNumber: order.kot.number,
      table: order.table,
      waiter: order.waiter,
      items: order.items,
      printedAt: printInfo.printedAt,
      printedBy: req.user._id,
      isReprint: !!order.kot.printedAt && order.kot.reprints.length > 0
    });

    res.json({
      message: 'KOT printed successfully',
      kotNumber: order.kot.number,
      printedAt: printInfo.printedAt,
      order: {
        orderNumber: order.orderNumber,
        table: order.table,
        waiter: order.waiter,
        items: order.items,
        specialInstructions: order.specialInstructions,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Print KOT error:', error);
    res.status(500).json({ message: 'Server error printing KOT' });
  }
});

// @desc    Update item status in KOT
// @route   PATCH /api/kot/:orderId/items/:itemIndex/status
// @access  Private (Kitchen Staff)
router.patch('/:orderId/items/:itemIndex/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid item status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    // Update item status
    order.items[itemIndex].status = status;

    if (status === 'preparing' && order.status === 'confirmed') {
      order.status = 'preparing';
      order.preparationTime.startedAt = new Date();
    } else if (status === 'ready') {
      order.items[itemIndex].preparedAt = new Date();
    }

    await order.save();

    // Check if all items are ready
    const allItemsReady = order.items.every(item => item.status === 'ready');
    if (allItemsReady) {
      order.status = 'ready';
      order.preparationTime.completedAt = new Date();
      if (order.preparationTime.startedAt) {
        order.preparationTime.actual = Math.ceil(
          (order.preparationTime.completedAt - order.preparationTime.startedAt) / 60000
        );
      }
      await order.save();

      // Emit socket event for order ready
      req.io.emit('order-ready', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        kotNumber: order.kot.number,
        completedAt: order.preparationTime.completedAt,
        actualTime: order.preparationTime.actual
      });
    }

    // Emit socket event for item status update
    req.io.emit('kot-item-status-update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      kotNumber: order.kot.number,
      itemIndex,
      status,
      updatedBy: req.user._id,
      updatedAt: new Date()
    });

    res.json({
      message: 'Item status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Update KOT item status error:', error);
    res.status(500).json({ message: 'Server error updating item status' });
  }
});

// @desc    Mark order as complete in kitchen
// @route   PATCH /api/kot/:orderId/complete
// @access  Private (Kitchen Staff)
router.patch('/:orderId/complete', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Mark all items as ready if not already
    order.items.forEach(item => {
      if (item.status !== 'ready') {
        item.status = 'ready';
        item.preparedAt = new Date();
      }
    });

    order.status = 'ready';
    order.preparationTime.completedAt = new Date();
    
    if (order.preparationTime.startedAt) {
      order.preparationTime.actual = Math.ceil(
        (order.preparationTime.completedAt - order.preparationTime.startedAt) / 60000
      );
    }

    await order.save();

    // Emit socket event for order completion
    req.io.emit('kot-completed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      kotNumber: order.kot.number,
      completedAt: order.preparationTime.completedAt,
      actualTime: order.preparationTime.actual,
      completedBy: req.user._id
    });

    res.json({
      message: 'Order marked as complete',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        preparationTime: order.preparationTime
      }
    });
  } catch (error) {
    console.error('Complete KOT error:', error);
    res.status(500).json({ message: 'Server error completing order' });
  }
});

// @desc    Get KOT history
// @route   GET /api/kot/history
// @access  Private (Kitchen Staff)
router.get('/history', protect, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {
      'kot.printedAt': { $exists: true }
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName')
      .select('orderNumber orderType table waiter status kot createdAt preparationTime')
      .sort({ 'kot.printedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

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
    console.error('Get KOT history error:', error);
    res.status(500).json({ message: 'Server error fetching KOT history' });
  }
});

// @desc    Get KOT statistics
// @route   GET /api/kot/stats
// @access  Private (Kitchen Staff/Manager)
router.get('/analytics/stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Get preparation time statistics
    const preparationStats = await Order.aggregate([
      { 
        $match: { 
          ...dateQuery,
          'preparationTime.actual': { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgPreparationTime: { $avg: '$preparationTime.actual' },
          minPreparationTime: { $min: '$preparationTime.actual' },
          maxPreparationTime: { $max: '$preparationTime.actual' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get peak hours
    const peakHours = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      preparationStats: preparationStats[0] || {
        avgPreparationTime: 0,
        minPreparationTime: 0,
        maxPreparationTime: 0,
        totalOrders: 0
      },
      ordersByStatus,
      peakHours
    });
  } catch (error) {
    console.error('Get KOT stats error:', error);
    res.status(500).json({ message: 'Server error fetching KOT statistics' });
  }
});

module.exports = router;