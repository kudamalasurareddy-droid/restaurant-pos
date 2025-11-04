import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated && user) {
      const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      // Initialize socket connection
      socketRef.current = io(serverUrl, {
        auth: {
          userId: user._id,
          role: user.role,
          restaurantId: process.env.REACT_APP_RESTAURANT_ID || 'default',
        },
        transports: ['websocket', 'polling'],
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        
        // Join role-based room
        socket.emit('join-role-room', {
          userId: user._id,
          role: user.role,
          restaurantId: 'default',
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Real-time updates may not work.');
      });

      // Real-time event handlers
      setupEventHandlers(socket);

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated, user]);

  const setupEventHandlers = (socket) => {
    // Order Management Events
    socket.on('new-order-notification', (data) => {
      toast.success(`New order received: ${data.orderNumber}`, {
        duration: 5000,
      });
      
      // You can dispatch events to update local state here
      window.dispatchEvent(new CustomEvent('newOrder', { detail: data }));
    });

    socket.on('order-status-update', (data) => {
      toast(`Order ${data.orderNumber} status: ${data.status}`);
      window.dispatchEvent(new CustomEvent('orderStatusUpdate', { detail: data }));
    });

    // KOT Events
    socket.on('new-kot', (data) => {
      if (user.role === 'kitchen_staff') {
        toast(`New KOT: ${data.kotNumber}`, {
          duration: 5000,
        });
      }
      window.dispatchEvent(new CustomEvent('newKOT', { detail: data }));
    });

    socket.on('kot-item-ready', (data) => {
      if (user.role === 'waiter' || user.role === 'manager') {
        toast.success(`Item ready for order ${data.orderId}`);
      }
      window.dispatchEvent(new CustomEvent('kotItemReady', { detail: data }));
    });

    socket.on('kot-completed', (data) => {
      toast.success(`Order ${data.orderNumber} ready for serving!`);
      window.dispatchEvent(new CustomEvent('kotCompleted', { detail: data }));
    });

    // Table Management Events
    socket.on('table-status-updated', (data) => {
      toast(`Table ${data.tableId} status: ${data.status}`);
      window.dispatchEvent(new CustomEvent('tableStatusUpdate', { detail: data }));
    });

    socket.on('table-assigned', (data) => {
      if (data.waiterId === user._id) {
        toast(`You've been assigned to table ${data.tableId}`);
      }
      window.dispatchEvent(new CustomEvent('tableAssignment', { detail: data }));
    });

    // Inventory Events
    socket.on('low-stock-notification', (data) => {
      if (user.role === 'admin' || user.role === 'manager') {
        toast.warning(`Low stock alert: ${data.itemName}`, {
          duration: 8000,
        });
      }
      window.dispatchEvent(new CustomEvent('lowStockAlert', { detail: data }));
    });

    socket.on('inventory-updated', (data) => {
      window.dispatchEvent(new CustomEvent('inventoryUpdate', { detail: data }));
    });

    // Menu Events
    socket.on('menu-item-availability-change', (data) => {
      const status = data.isAvailable ? 'available' : 'unavailable';
      toast(`${data.itemName} is now ${status}`);
      window.dispatchEvent(new CustomEvent('menuItemAvailabilityChange', { detail: data }));
    });

    // Payment Events
    socket.on('payment-notification', (data) => {
      if (user.role === 'admin' || user.role === 'manager') {
        toast.success(`Payment received: $${data.amount} for order ${data.orderNumber}`);
      }
      window.dispatchEvent(new CustomEvent('paymentReceived', { detail: data }));
    });

    // Customer Events
    socket.on('customer-order-received', (data) => {
      toast(`New customer order: ${data.orderId}`, {
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('customerOrderReceived', { detail: data }));
    });

    // System Events
    socket.on('system-alert', (data) => {
      switch (data.type) {
        case 'error':
          toast.error(data.message);
          break;
        case 'warning':
          toast.warning(data.message);
          break;
        case 'info':
          toast(data.message);
          break;
        default:
          toast(data.message);
      }
      window.dispatchEvent(new CustomEvent('systemAlert', { detail: data }));
    });

    // Dashboard Updates
    socket.on('dashboard-update', (data) => {
      window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: data }));
    });

    // User Events
    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
    });

    socket.on('user-left', (data) => {
      console.log('User left:', data);
    });

    // Error handling
    socket.on('error-notification', (data) => {
      toast.error(data.message);
    });

    // Heartbeat
    socket.on('system-heartbeat', (data) => {
      // Update connection status if needed
      window.dispatchEvent(new CustomEvent('systemHeartbeat', { detail: data }));
    });

    // Ping/Pong for connection health
    socket.on('pong', () => {
      // Connection is healthy
    });

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    // Cleanup interval on disconnect
    socket.on('disconnect', () => {
      clearInterval(pingInterval);
    });
  };

  // Socket utility functions
  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const emitOrderUpdate = (orderData) => {
    emit('order-status-update', orderData);
  };

  const emitKOTUpdate = (kotData) => {
    emit('kot-item-ready', kotData);
  };

  const emitTableUpdate = (tableData) => {
    emit('table-status-change', tableData);
  };

  const emitInventoryAlert = (inventoryData) => {
    emit('low-stock-alert', inventoryData);
  };

  const emitMenuUpdate = (menuData) => {
    emit('menu-item-unavailable', menuData);
  };

  const emitPaymentUpdate = (paymentData) => {
    emit('payment-received', paymentData);
  };

  const emitSystemNotification = (message, type = 'info', targetRoles = null) => {
    emit('system-notification', {
      message,
      type,
      targetRoles,
    });
  };

  const isConnected = () => {
    return socketRef.current?.connected || false;
  };

  const getSocketId = () => {
    return socketRef.current?.id || null;
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    getSocketId,
    emit,
    emitOrderUpdate,
    emitKOTUpdate,
    emitTableUpdate,
    emitInventoryAlert,
    emitMenuUpdate,
    emitPaymentUpdate,
    emitSystemNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;