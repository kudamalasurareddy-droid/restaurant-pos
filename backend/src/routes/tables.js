const express = require('express');
const Table = require('../models/Table');
const Order = require('../models/Order');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, location, section, isActive = true } = req.query;

    const query = { isActive };
    
    if (status) {
      query.status = { $in: status.split(',') };
    }
    
    if (location) {
      query.location = location;
    }
    
    if (section) {
      query.section = section;
    }

    const tables = await Table.find(query)
      .populate('currentOrder', 'orderNumber status totalAmount createdAt')
      .populate('assignedWaiter', 'firstName lastName')
      .sort({ tableNumber: 1 });

    res.json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ message: 'Server error fetching tables' });
  }
});

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('currentOrder')
      .populate('assignedWaiter', 'firstName lastName phone')
      .populate({
        path: 'currentOrder',
        populate: {
          path: 'items.menuItem',
          select: 'name price'
        }
      });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ message: 'Server error fetching table' });
  }
});

// @desc    Create new table
// @route   POST /api/tables
// @access  Private (Admin/Manager)
router.post('/', protect, checkPermission('tables', 'create'), async (req, res) => {
  try {
    const {
      tableNumber,
      tableName,
      capacity,
      location = 'indoor',
      section,
      shape = 'square',
      coordinates,
      minOrderAmount = 0,
      serviceCharge = 0
    } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: 'Table number and capacity are required' });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const tableData = {
      tableNumber: tableNumber.trim(),
      tableName: tableName?.trim(),
      capacity: parseInt(capacity),
      location,
      section: section?.trim(),
      shape,
      coordinates,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      serviceCharge: parseFloat(serviceCharge) || 0
    };

    const table = await Table.create(tableData);
    res.status(201).json(table);
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ message: 'Server error creating table' });
  }
});

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Admin/Manager)
router.put('/:id', protect, checkPermission('tables', 'update'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const {
      tableNumber,
      tableName,
      capacity,
      location,
      section,
      shape,
      coordinates,
      minOrderAmount,
      serviceCharge,
      isActive,
      notes
    } = req.body;

    // Check if table number is being changed and if it already exists
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ 
        tableNumber: tableNumber.trim(),
        _id: { $ne: req.params.id }
      });
      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
      table.tableNumber = tableNumber.trim();
    }

    if (tableName !== undefined) table.tableName = tableName?.trim();
    if (capacity) table.capacity = parseInt(capacity);
    if (location) table.location = location;
    if (section !== undefined) table.section = section?.trim();
    if (shape) table.shape = shape;
    if (coordinates) table.coordinates = coordinates;
    if (minOrderAmount !== undefined) table.minOrderAmount = parseFloat(minOrderAmount) || 0;
    if (serviceCharge !== undefined) table.serviceCharge = parseFloat(serviceCharge) || 0;
    if (isActive !== undefined) table.isActive = isActive;
    if (notes !== undefined) table.notes = notes;

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ message: 'Server error updating table' });
  }
});

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'out_of_order'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Handle status changes
    if (status === 'available') {
      table.currentOrder = null;
      table.assignedWaiter = null;
      table.lastCleaned = new Date();
    } else if (status === 'cleaning') {
      table.lastCleaned = new Date();
    }

    table.status = status;
    const updatedTable = await table.save();

    // Emit socket event for table status change
    req.io.emit('table-status-update', {
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: table.status,
      updatedAt: table.updatedAt,
      updatedBy: req.user._id
    });

    res.json(updatedTable);
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({ message: 'Server error updating table status' });
  }
});

// @desc    Assign waiter to table
// @route   PATCH /api/tables/:id/assign-waiter
// @access  Private (Manager/Admin)
router.patch('/:id/assign-waiter', protect, checkPermission('tables', 'update'), async (req, res) => {
  try {
    const { waiterId } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    table.assignedWaiter = waiterId || null;
    const updatedTable = await table.save();

    const populatedTable = await Table.findById(updatedTable._id)
      .populate('assignedWaiter', 'firstName lastName');

    // Emit socket event for waiter assignment
    req.io.emit('table-assignment', {
      tableId: table._id,
      tableNumber: table.tableNumber,
      waiter: populatedTable.assignedWaiter,
      assignedAt: new Date(),
      assignedBy: req.user._id
    });

    res.json(populatedTable);
  } catch (error) {
    console.error('Assign waiter error:', error);
    res.status(500).json({ message: 'Server error assigning waiter' });
  }
});

// @desc    Add table reservation
// @route   POST /api/tables/:id/reservations
// @access  Private
router.post('/:id/reservations', protect, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      duration = 120,
      partySize,
      specialRequests
    } = req.body;

    if (!customerName || !customerPhone || !reservationDate || !partySize) {
      return res.status(400).json({ 
        message: 'Customer name, phone, reservation date, and party size are required' 
      });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (partySize > table.capacity) {
      return res.status(400).json({ 
        message: `Party size (${partySize}) exceeds table capacity (${table.capacity})` 
      });
    }

    const reservation = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim(),
      reservationDate: new Date(reservationDate),
      duration: parseInt(duration),
      partySize: parseInt(partySize),
      specialRequests: specialRequests?.trim(),
      status: 'pending'
    };

    table.reservations.push(reservation);
    await table.save();

    res.status(201).json(table);
  } catch (error) {
    console.error('Add reservation error:', error);
    res.status(500).json({ message: 'Server error adding reservation' });
  }
});

// @desc    Update reservation status
// @route   PATCH /api/tables/:id/reservations/:reservationId
// @access  Private
router.patch('/:id/reservations/:reservationId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid reservation status' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const reservation = table.reservations.id(req.params.reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;

    // If reservation is confirmed, update table status
    if (status === 'confirmed') {
      const reservationTime = new Date(reservation.reservationDate);
      const currentTime = new Date();
      
      // If reservation is for now or within 30 minutes, mark table as reserved
      if (reservationTime <= new Date(currentTime.getTime() + 30 * 60000)) {
        table.status = 'reserved';
      }
    }

    await table.save();
    res.json(table);
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Server error updating reservation' });
  }
});

// @desc    Get table layout/floor plan
// @route   GET /api/tables/layout
// @access  Private
router.get('/layout/floor-plan', protect, async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })
      .populate('currentOrder', 'orderNumber status totalAmount')
      .populate('assignedWaiter', 'firstName lastName')
      .select('tableNumber tableName capacity location section status coordinates shape currentOrder assignedWaiter');

    // Group tables by section
    const layout = {};
    tables.forEach(table => {
      const section = table.section || 'main';
      if (!layout[section]) {
        layout[section] = [];
      }
      layout[section].push(table);
    });

    res.json(layout);
  } catch (error) {
    console.error('Get table layout error:', error);
    res.status(500).json({ message: 'Server error fetching table layout' });
  }
});

// @desc    Get table statistics
// @route   GET /api/tables/stats
// @access  Private
router.get('/analytics/stats', protect, async (req, res) => {
  try {
    const totalTables = await Table.countDocuments({ isActive: true });
    const availableTables = await Table.countDocuments({ status: 'available', isActive: true });
    const occupiedTables = await Table.countDocuments({ status: 'occupied', isActive: true });
    const reservedTables = await Table.countDocuments({ status: 'reserved', isActive: true });
    const cleaningTables = await Table.countDocuments({ status: 'cleaning', isActive: true });
    const outOfOrderTables = await Table.countDocuments({ status: 'out_of_order', isActive: true });

    // Calculate occupancy rate
    const occupancyRate = totalTables > 0 ? ((occupiedTables + reservedTables) / totalTables * 100).toFixed(1) : 0;

    // Get table turnover data (orders per table today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tableStats = await Table.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'orders',
          let: { tableId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$table', '$$tableId'] },
                createdAt: { $gte: today, $lt: tomorrow },
                status: { $in: ['completed', 'served'] }
              }
            }
          ],
          as: 'todayOrders'
        }
      },
      {
        $project: {
          tableNumber: 1,
          capacity: 1,
          totalRevenue: 1,
          totalOrders: 1,
          todayOrderCount: { $size: '$todayOrders' },
          todayRevenue: {
            $sum: '$todayOrders.totalAmount'
          }
        }
      },
      { $sort: { todayRevenue: -1 } }
    ]);

    res.json({
      overview: {
        totalTables,
        availableTables,
        occupiedTables,
        reservedTables,
        cleaningTables,
        outOfOrderTables,
        occupancyRate: `${occupancyRate}%`
      },
      topTables: tableStats.slice(0, 10)
    });
  } catch (error) {
    console.error('Get table stats error:', error);
    res.status(500).json({ message: 'Server error fetching table statistics' });
  }
});

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
router.delete('/:id', protect, checkPermission('tables', 'delete'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.status === 'occupied' && table.currentOrder) {
      return res.status(400).json({ message: 'Cannot delete table with active order' });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ message: 'Server error deleting table' });
  }
});

module.exports = router;