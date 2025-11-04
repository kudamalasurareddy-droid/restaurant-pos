const express = require('express');
const Order = require('../models/Order');
const Table = require('../models/Table');
const { MenuItem } = require('../models/Menu');
const { protect, checkPermission } = require('../middleware/authMiddleware');
// Stripe and QR will be required on-demand inside routes to avoid startup issues if not installed

const router = express.Router();

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      status,
      orderType,
      table,
      waiter,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = { $in: status.split(',') };
    }
    
    // Filter by order type
    if (orderType) {
      query.orderType = orderType;
    }
    
    // Filter by table
    if (table) {
      query.table = table;
    }
    
    // Filter by waiter
    if (waiter) {
      query.waiter = waiter;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // If user is a waiter, only show their orders
    if (req.user.role === 'waiter') {
      query.waiter = req.user._id;
    }
    // If user is a customer, only show their orders
    if (req.user.role === 'customer') {
      query.$or = [
        { customerUser: req.user._id },
        { 'customer.email': req.user.email }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName')
      .populate('items.menuItem', 'name price image category')
      .populate('items.addOns.item', 'name price')
      .sort(sort)
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber tableName section location')
      .populate('waiter', 'firstName lastName phone')
      .populate('customerUser', 'firstName lastName email')
      .populate('items.menuItem', 'name price description image category preparationTime')
      .populate('items.addOns.item', 'name price description')
      .populate({
        path: 'items.menuItem',
        populate: {
          path: 'category',
          select: 'name color'
        }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user.role === 'waiter' && order.waiter && order.waiter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'customer') {
      const isOwner = (order.customerUser && order.customerUser._id.toString() === req.user._id.toString()) ||
        (order.customer && order.customer.email && order.customer.email.toLowerCase() === req.user.email.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, checkPermission('orders', 'create'), async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] || req.body.clientRequestId;

    const {
      orderType,
      table,
      customer,
      items,
      specialInstructions,
      discount,
      serviceCharge,
      deliveryCharge,
      tax
    } = req.body;

    if (!orderType || !items || !items.length) {
      return res.status(400).json({ message: 'Order type and items are required' });
    }
    // If idempotency key provided and order exists, return it
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey })
        .populate('table', 'tableNumber tableName')
        .populate('waiter', 'firstName lastName')
        .populate('items.menuItem', 'name price image category')
        .populate('items.addOns.item', 'name price');
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    // Validate table for dine-in orders
    if (orderType === 'dine_in' && !table) {
      return res.status(400).json({ message: 'Table is required for dine-in orders' });
    }

    // Validate and calculate order totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found: ${item.menuItem}` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }

      let itemPrice = item.price || menuItem.price;
      let itemTotal = itemPrice * item.quantity;

      // Process add-ons
      const processedAddOns = [];
      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const addOnItem = await MenuItem.findById(addOn.item);
          if (addOnItem) {
            const addOnPrice = addOn.price || addOnItem.price;
            processedAddOns.push({
              item: addOn.item,
              quantity: addOn.quantity || 1,
              price: addOnPrice
            });
            itemTotal += addOnPrice * (addOn.quantity || 1) * item.quantity;
          }
        }
      }

      processedItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        variant: item.variant,
        price: itemPrice,
        addOns: processedAddOns,
        specialInstructions: item.specialInstructions
      });

      subtotal += itemTotal;
    }

    // Calculate tax
    const taxRate = tax?.rate || 0;
    const taxAmount = (subtotal * taxRate) / 100;

    // Calculate discount
    let discountAmount = 0;
    if (discount) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      }
    }

    // Calculate service charge
    const serviceChargeRate = serviceCharge?.rate || 0;
    const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;

    // Calculate total
    const totalAmount = subtotal + taxAmount + serviceChargeAmount + (deliveryCharge || 0) - discountAmount;

    // Set waiter
    let waiter = req.user._id;
    if (orderType === 'dine_in' && table) {
      const tableDoc = await Table.findById(table);
      if (tableDoc && tableDoc.assignedWaiter) {
        waiter = tableDoc.assignedWaiter;
      }
    }

    const orderData = {
      idempotencyKey: idempotencyKey || undefined,
      orderType,
      table: orderType === 'dine_in' ? table : null,
      customer,
      waiter,
      customerUser: req.user?.role === 'customer' ? req.user._id : undefined,
      items: processedItems,
      subtotal,
      tax: {
        rate: taxRate,
        amount: taxAmount
      },
      discount: discount ? {
        ...discount,
        amount: discountAmount
      } : undefined,
      serviceCharge: {
        rate: serviceChargeRate,
        amount: serviceChargeAmount
      },
      deliveryCharge: deliveryCharge || 0,
      totalAmount,
      specialInstructions,
      source: 'pos'
    };

    let order;
    try {
      order = await Order.create(orderData);
    } catch (e) {
      // Handle duplicate idempotency key race - return the existing order
      if (e?.code === 11000 && e?.keyPattern && e.keyPattern.idempotencyKey) {
        const existing = await Order.findOne({ idempotencyKey })
          .populate('table', 'tableNumber tableName')
          .populate('waiter', 'firstName lastName')
          .populate('items.menuItem', 'name price image category')
          .populate('items.addOns.item', 'name price');
        if (existing) {
          return res.status(200).json(existing);
        }
      }
      throw e;
    }

    // Update table status if dine-in
    if (orderType === 'dine_in' && table) {
      await Table.findByIdAndUpdate(table, {
        status: 'occupied',
        currentOrder: order._id,
        occupiedAt: new Date()
      });
    }

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName')
      .populate('customerUser', 'firstName lastName email')
      .populate('items.menuItem', 'name price image category')
      .populate('items.addOns.item', 'name price');

    // Emit socket event for new order
    req.io.emit('new-order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      table: populatedOrder.table,
      waiter: populatedOrder.waiter,
      items: populatedOrder.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order', error: process.env.NODE_ENV === 'development' ? (error?.message || 'unknown') : undefined });
  }
});

// Create Stripe Checkout Session and return url + QR code for payment
// @route   POST /api/orders/:id/payments/stripe/checkout
// @access  Private
router.post('/:id/payments/stripe/checkout', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Permissions: customers can only create checkout for their own orders
    if (req.user.role === 'customer') {
      const isOwner = (order.customerUser && order.customerUser.toString() === req.user._id.toString()) ||
        (order.customer && order.customer.email && order.customer.email.toLowerCase() === req.user.email.toLowerCase());
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ message: 'Stripe not configured. Set STRIPE_SECRET_KEY in .env' });
    }

    const Stripe = require('stripe');
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const successUrl = (process.env.CHECKOUT_SUCCESS_URL || 'http://localhost:3000/customer') + '?status=success&order=' + order._id;
    const cancelUrl = (process.env.CHECKOUT_CANCEL_URL || 'http://localhost:3000/customer') + '?status=cancelled&order=' + order._id;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY || 'usd',
            unit_amount: Math.round((order.totalAmount || 0) * 100),
            product_data: {
              name: `Order ${order.orderNumber}`,
              description: `${order.items?.length || 0} item(s)`
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        orderId: String(order._id)
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    let qrCodeDataUrl = null;
    try {
      const QRCode = require('qrcode');
      qrCodeDataUrl = await QRCode.toDataURL(session.url, { margin: 1, width: 256 });
    } catch (e) {
      // QRCode lib not installed or error; ignore
    }

    res.json({ url: session.url, qrCode: qrCodeDataUrl, sessionId: session.id });
  } catch (error) {
    console.error('Create stripe checkout error:', error);
    res.status(500).json({ message: 'Server error creating checkout', error: process.env.NODE_ENV === 'development' ? (error?.message || 'unknown') : undefined });
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
router.patch('/:id/status', protect, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;

    // Set completion times
    if (status === 'ready' && !order.preparationTime.completedAt) {
      order.preparationTime.completedAt = new Date();
      order.preparationTime.actual = Math.ceil((Date.now() - order.createdAt) / 60000); // in minutes
    }

    await order.save();

    // Update table status if order is completed or cancelled
    if ((status === 'completed' || status === 'cancelled') && order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'cleaning',
        currentOrder: null
      });
    }

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber tableName')
      .populate('waiter', 'firstName lastName');

    // Emit socket event for status update
    req.io.emit('order-status-update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      table: populatedOrder.table,
      waiter: populatedOrder.waiter,
      updatedAt: order.updatedAt,
      updatedBy: req.user._id
    });

    res.json(populatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// @desc    Update item status in order
// @route   PATCH /api/orders/:id/items/:itemIndex/status
// @access  Private
router.patch('/:id/items/:itemIndex/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'served'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid item status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    // Update item status
    order.items[itemIndex].status = status;

    if (status === 'ready') {
      order.items[itemIndex].preparedAt = new Date();
    } else if (status === 'served') {
      order.items[itemIndex].servedAt = new Date();
    }

    await order.save();

    // Check if all items are ready to update order status
    const allItemsReady = order.items.every(item => item.status === 'ready' || item.status === 'served');
    if (allItemsReady && order.status === 'preparing') {
      order.status = 'ready';
      await order.save();
    }

    res.json(order);
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ message: 'Server error updating item status' });
  }
});

// @desc    Add payment to order
// @route   POST /api/orders/:id/payments
// @access  Private
router.post('/:id/payments', protect, checkPermission('orders', 'update'), async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add payment
    order.payments.push({
      amount,
      method,
      transactionId,
      paidAt: new Date()
    });

    // Calculate total paid
    const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Update payment status
    if (totalPaid >= order.totalAmount) {
      order.paymentStatus = 'paid';
      if (order.status === 'ready' || order.status === 'served') {
        order.status = 'completed';
      }
    } else if (totalPaid > 0) {
      order.paymentStatus = 'partial';
    }

    await order.save();

    // Emit socket event for payment
    req.io.emit('payment-received', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount,
      method,
      totalPaid,
      paymentStatus: order.paymentStatus,
      paidAt: new Date(),
      receivedBy: req.user._id
    });

    res.json(order);
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
});

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, checkPermission('orders', 'delete'), async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled order' });
    }

    // Update order status
    order.status = 'cancelled';
    order.notes = `Cancelled: ${reason || 'No reason provided'}`;
    await order.save();

    // Free up table if it was dine-in
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'available',
        currentOrder: null
      });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
router.get('/analytics/stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          preparingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'preparing'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const ordersByType = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      },
      ordersByType
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error fetching order statistics' });
  }
});

module.exports = router;