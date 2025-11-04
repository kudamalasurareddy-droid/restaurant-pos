const express = require('express');
const Order = require('../models/Order');
const Table = require('../models/Table');
const { MenuItem } = require('../models/Menu');
const User = require('../models/User');
const { InventoryItem } = require('../models/Inventory');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's statistics
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    const occupiedTables = await Table.countDocuments({
      status: 'occupied'
    });

    const totalTables = await Table.countDocuments({ isActive: true });

    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
      isActive: true
    });

    const totalActiveUsers = await User.countDocuments({ isActive: true });

    res.json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      realtime: {
        pendingOrders,
        occupiedTables,
        totalTables,
        lowStockItems,
        activeUsers: totalActiveUsers
      },
      tableOccupancy: {
        occupied: occupiedTables,
        total: totalTables,
        percentage: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// @desc    Get sales analytics
// @route   GET /api/reports/sales
// @access  Private
router.get('/sales', protect, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = { $dateToString: { format: "%Y-%m-%d-%H", date: "$createdAt" } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default: // day
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const salesData = await Order.aggregate([
      { 
        $match: { 
          ...dateQuery,
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryBreakdown = await Order.aggregate([
      { 
        $match: { 
          ...dateQuery,
          status: { $in: ['completed', 'served'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      },
      { $unwind: '$menuItemDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'menuItemDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails.name',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      salesOverTime: salesData,
      categoryBreakdown,
      summary: {
        totalRevenue: salesData.reduce((sum, item) => sum + item.totalSales, 0),
        totalOrders: salesData.reduce((sum, item) => sum + item.orderCount, 0),
        avgOrderValue: salesData.length > 0 
          ? salesData.reduce((sum, item) => sum + item.avgOrderValue, 0) / salesData.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ message: 'Server error fetching sales analytics' });
  }
});

// @desc    Get popular menu items
// @route   GET /api/reports/popular-items
// @access  Private
router.get('/popular-items', protect, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const popularItems = await Order.aggregate([
      { 
        $match: { 
          ...dateQuery,
          status: { $in: ['completed', 'served'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'categories',
          localField: 'menuItem.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$menuItem.name',
          category: '$category.name',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgPrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(popularItems);
  } catch (error) {
    console.error('Popular items error:', error);
    res.status(500).json({ message: 'Server error fetching popular items' });
  }
});

// @desc    Get waiter performance
// @route   GET /api/reports/waiters
// @access  Private
router.get('/waiters', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const waiterStats = await Order.aggregate([
      { 
        $match: { 
          ...dateQuery,
          waiter: { $exists: true },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: '$waiter',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'waiter'
        }
      },
      { $unwind: '$waiter' },
      {
        $project: {
          name: { $concat: ['$waiter.firstName', ' ', '$waiter.lastName'] },
          email: '$waiter.email',
          totalOrders: 1,
          totalRevenue: 1,
          avgOrderValue: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(waiterStats);
  } catch (error) {
    console.error('Waiter performance error:', error);
    res.status(500).json({ message: 'Server error fetching waiter performance' });
  }
});

// @desc    Get kitchen performance metrics
// @route   GET /api/reports/kitchen/performance
// @access  Private
router.get('/kitchen/performance', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const kitchenStats = await Order.aggregate([
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
          totalOrders: { $sum: 1 },
          onTimeOrders: {
            $sum: {
              $cond: [
                { $lte: ['$preparationTime.actual', '$preparationTime.estimated'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const hourlyLoad = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = kitchenStats[0] || {
      avgPreparationTime: 0,
      minPreparationTime: 0,
      maxPreparationTime: 0,
      totalOrders: 0,
      onTimeOrders: 0
    };

    res.json({
      ...stats,
      onTimePercentage: stats.totalOrders > 0 
        ? Math.round((stats.onTimeOrders / stats.totalOrders) * 100) 
        : 0,
      hourlyLoad
    });
  } catch (error) {
    console.error('Kitchen performance error:', error);
    res.status(500).json({ message: 'Server error fetching kitchen performance' });
  }
});

// @desc    Get inventory status
// @route   GET /api/reports/inventory
// @access  Private
router.get('/inventory', protect, async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).populate('supplier.name', 'name contact');

    const outOfStockItems = await InventoryItem.find({
      isActive: true,
      currentStock: 0
    });

    const totalInventoryValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      }
    ]);

    res.json({
      lowStockItems,
      outOfStockItems,
      totalInventoryValue: totalInventoryValue[0]?.totalValue || 0,
      alerts: {
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length
      }
    });
  } catch (error) {
    console.error('Get inventory status error:', error);
    res.status(500).json({ message: 'Server error fetching inventory status' });
  }
});

// @desc    Get financial summary
// @route   GET /api/reports/financial/summary
// @access  Private
router.get('/financial/summary', protect, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let matchQuery = {
      status: { $in: ['completed', 'served'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Group by format
    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          totalTax: { $sum: '$tax.amount' },
          totalDiscount: { $sum: '$discount.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Sales by order type
    const salesByType = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$orderType',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Sales by payment method
    const salesByPayment = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Top selling items
    const topSellingItems = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          name: '$item.name',
          category: '$item.category',
          quantity: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      salesData,
      salesByType,
      salesByPayment,
      topSellingItems
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ message: 'Server error fetching sales report' });
  }
});

// @desc    Get menu performance report
// @route   GET /api/reports/menu-performance
// @access  Private
router.get('/menu-performance', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {
      status: { $in: ['completed', 'served'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const menuPerformance = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 },
          avgQuantityPerOrder: { $avg: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $lookup: {
          from: 'categories',
          localField: 'item.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$item.name',
          category: '$category.name',
          price: '$item.price',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgQuantityPerOrder: { $round: ['$avgQuantityPerOrder', 2] },
          profitMargin: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$item.price', '$item.costPrice'] },
                      '$item.price'
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Category performance
    const categoryPerformance = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $lookup: {
          from: 'categories',
          localField: 'item.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          itemCount: { $addToSet: '$items.menuItem' }
        }
      },
      {
        $project: {
          categoryName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          uniqueItems: { $size: '$itemCount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      menuPerformance,
      categoryPerformance
    });
  } catch (error) {
    console.error('Get menu performance error:', error);
    res.status(500).json({ message: 'Server error fetching menu performance report' });
  }
});

// @desc    Get staff performance report
// @route   GET /api/reports/staff-performance
// @access  Private (Admin/Manager)
router.get('/staff-performance', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {
      status: { $in: ['completed', 'served'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const waiterPerformance = await Order.aggregate([
      { $match: { ...matchQuery, waiter: { $exists: true } } },
      {
        $group: {
          _id: '$waiter',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'waiter'
        }
      },
      { $unwind: '$waiter' },
      {
        $project: {
          waiterName: { $concat: ['$waiter.firstName', ' ', '$waiter.lastName'] },
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      waiterPerformance
    });
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ message: 'Server error fetching staff performance report' });
  }
});

// @desc    Get table utilization report
// @route   GET /api/reports/table-utilization
// @access  Private
router.get('/table-utilization', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {
      table: { $exists: true },
      status: { $in: ['completed', 'served'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const tableUtilization = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$table',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'tables',
          localField: '_id',
          foreignField: '_id',
          as: 'table'
        }
      },
      { $unwind: '$table' },
      {
        $project: {
          tableNumber: '$table.tableNumber',
          tableName: '$table.tableName',
          capacity: '$table.capacity',
          location: '$table.location',
          section: '$table.section',
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          revenuePerSeat: {
            $round: [{ $divide: ['$totalRevenue', '$table.capacity'] }, 2]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      tableUtilization
    });
  } catch (error) {
    console.error('Get table utilization error:', error);
    res.status(500).json({ message: 'Server error fetching table utilization report' });
  }
});

// @desc    Get customer analysis report
// @route   GET /api/reports/customer-analysis
// @access  Private
router.get('/customer-analysis', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {
      status: { $in: ['completed', 'served'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Orders by hour analysis
    const ordersByHour = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Orders by day of week
    const ordersByDayOfWeek = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Average order value by order type
    const avgOrderValueByType = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$orderType',
          avgOrderValue: { $avg: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      ordersByHour,
      ordersByDayOfWeek,
      avgOrderValueByType
    });
  } catch (error) {
    console.error('Get customer analysis error:', error);
    res.status(500).json({ message: 'Server error fetching customer analysis report' });
  }
});

// @desc    Export report data
// @route   POST /api/reports/export
// @access  Private
router.post('/export', protect, checkPermission('reports', 'read'), async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = 'json' } = req.body;

    let data;
    let filename;

    switch (reportType) {
      case 'sales':
        // Implementation would generate sales report data
        data = { message: 'Sales report export not fully implemented' };
        filename = 'sales-report';
        break;
      case 'menu':
        // Implementation would generate menu performance data
        data = { message: 'Menu report export not fully implemented' };
        filename = 'menu-report';
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
      res.json(data);
    } else {
      res.status(400).json({ message: 'Only JSON format is currently supported' });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error exporting report' });
  }
});

module.exports = router;