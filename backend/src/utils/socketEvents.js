// Socket.io Event Handlers for Real-time Restaurant POS Communication

const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their role-based room
    socket.on('join-role-room', (data) => {
      const { userId, role, restaurantId } = data;
      socket.join(`${role}-${restaurantId || 'default'}`);
      socket.userId = userId;
      socket.role = role;
      socket.restaurantId = restaurantId || 'default';
      
      console.log(`User ${userId} with role ${role} joined room: ${role}-${restaurantId || 'default'}`);
      
      // Notify others in the role room
      socket.to(`${role}-${restaurantId || 'default'}`).emit('user-joined', {
        userId,
        role,
        socketId: socket.id
      });
    });

    // Order Management Events
    socket.on('new-order', (orderData) => {
      // Notify kitchen staff about new orders
      socket.to(`kitchen_staff-${socket.restaurantId}`).emit('new-order-notification', orderData);
      
      // Notify managers and admin
      socket.to(`manager-${socket.restaurantId}`).emit('new-order-notification', orderData);
      socket.to(`admin-${socket.restaurantId}`).emit('new-order-notification', orderData);
      
      // Update dashboard for all relevant users
      io.to(`admin-${socket.restaurantId}`).to(`manager-${socket.restaurantId}`)
        .emit('dashboard-update', {
          type: 'new-order',
          data: orderData
        });
    });

    socket.on('order-status-update', (data) => {
      const { orderId, status, tableId, waiterId } = data;
      
      // Notify the waiter assigned to the table
      if (waiterId) {
        io.emit('order-status-changed', {
          orderId,
          status,
          tableId,
          updatedBy: socket.userId
        });
      }
      
      // Notify all relevant staff
      io.to(`waiter-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('order-status-update', data);
    });

    // KOT (Kitchen Order Ticket) Events
    socket.on('kot-printed', (data) => {
      const { orderId, kotNumber, items } = data;
      
      // Notify kitchen staff
      socket.to(`kitchen_staff-${socket.restaurantId}`).emit('new-kot', {
        orderId,
        kotNumber,
        items,
        printedAt: new Date(),
        printedBy: socket.userId
      });
    });

    socket.on('kot-item-ready', (data) => {
      const { orderId, itemId, kotNumber } = data;
      
      // Notify waiters and managers
      io.to(`waiter-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .emit('kot-item-ready', {
          orderId,
          itemId,
          kotNumber,
          readyAt: new Date(),
          preparedBy: socket.userId
        });
    });

    socket.on('kot-complete', (data) => {
      const { orderId, kotNumber } = data;
      
      // Notify all relevant staff
      io.to(`waiter-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('kot-completed', {
          orderId,
          kotNumber,
          completedAt: new Date(),
          completedBy: socket.userId
        });
    });

    // Table Management Events
    socket.on('table-status-change', (data) => {
      const { tableId, status, assignedWaiter } = data;
      
      // Notify all waiters and managers
      io.to(`waiter-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('table-status-updated', {
          tableId,
          status,
          assignedWaiter,
          updatedAt: new Date(),
          updatedBy: socket.userId
        });
    });

    socket.on('table-assignment', (data) => {
      const { tableId, waiterId, waiterName } = data;
      
      // Notify the specific waiter
      io.emit('table-assigned', {
        tableId,
        waiterId,
        waiterName,
        assignedAt: new Date(),
        assignedBy: socket.userId
      });
    });

    // Inventory Events
    socket.on('low-stock-alert', (data) => {
      const { itemId, itemName, currentStock, minimumStock } = data;
      
      // Notify managers and admin
      io.to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('low-stock-notification', {
          itemId,
          itemName,
          currentStock,
          minimumStock,
          alertTime: new Date()
        });
    });

    socket.on('inventory-update', (data) => {
      const { itemId, newStock, updateType } = data;
      
      // Notify kitchen staff and managers
      io.to(`kitchen_staff-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('inventory-updated', {
          itemId,
          newStock,
          updateType,
          updatedAt: new Date(),
          updatedBy: socket.userId
        });
    });

    // Menu Management Events
    socket.on('menu-item-unavailable', (data) => {
      const { itemId, itemName, reason } = data;
      
      // Notify all staff
      io.emit('menu-item-availability-change', {
        itemId,
        itemName,
        isAvailable: false,
        reason,
        updatedAt: new Date(),
        updatedBy: socket.userId
      });
    });

    socket.on('menu-item-available', (data) => {
      const { itemId, itemName } = data;
      
      // Notify all staff
      io.emit('menu-item-availability-change', {
        itemId,
        itemName,
        isAvailable: true,
        updatedAt: new Date(),
        updatedBy: socket.userId
      });
    });

    // Payment Events
    socket.on('payment-received', (data) => {
      const { orderId, amount, method, tableId } = data;
      
      // Notify managers and admin
      io.to(`manager-${socket.restaurantId}`)
        .to(`admin-${socket.restaurantId}`)
        .emit('payment-notification', {
          orderId,
          amount,
          method,
          tableId,
          paidAt: new Date(),
          receivedBy: socket.userId
        });
    });

    // Customer Events (for customer app)
    socket.on('customer-order-placed', (data) => {
      const { orderId, customerInfo, items, totalAmount } = data;
      
      // Notify kitchen staff and cashiers
      io.to(`kitchen_staff-${socket.restaurantId}`)
        .to(`cashier-${socket.restaurantId}`)
        .to(`manager-${socket.restaurantId}`)
        .emit('customer-order-received', {
          orderId,
          customerInfo,
          items,
          totalAmount,
          source: 'customer-app',
          placedAt: new Date()
        });
    });

    socket.on('customer-order-status-inquiry', (data) => {
      const { orderId, customerId } = data;
      
      // This would typically query the database and return order status
      // For now, we'll just acknowledge the inquiry
      socket.emit('order-status-response', {
        orderId,
        customerId,
        inquiryTime: new Date()
      });
    });

    // Dashboard Events
    socket.on('request-dashboard-data', () => {
      // This would typically fetch and send current dashboard data
      socket.emit('dashboard-data-update', {
        timestamp: new Date(),
        requestedBy: socket.userId
      });
    });

    // General System Events
    socket.on('system-notification', (data) => {
      const { message, type, targetRoles } = data;
      
      if (targetRoles && targetRoles.length > 0) {
        targetRoles.forEach(role => {
          io.to(`${role}-${socket.restaurantId}`).emit('system-alert', {
            message,
            type,
            timestamp: new Date(),
            from: socket.userId
          });
        });
      } else {
        // Broadcast to all connected users
        io.emit('system-alert', {
          message,
          type,
          timestamp: new Date(),
          from: socket.userId
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
      socket.emit('error-notification', {
        message: 'An error occurred. Please refresh the page.',
        timestamp: new Date()
      });
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.role && socket.restaurantId) {
        // Notify others in the role room
        socket.to(`${socket.role}-${socket.restaurantId}`).emit('user-left', {
          userId: socket.userId,
          role: socket.role,
          socketId: socket.id,
          disconnectedAt: new Date()
        });
      }
    });

    // Heartbeat to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Periodic system updates
  setInterval(() => {
    io.emit('system-heartbeat', {
      serverTime: new Date(),
      connectedUsers: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds

  console.log('Socket.io events setup completed');
};

module.exports = { setupSocketEvents };