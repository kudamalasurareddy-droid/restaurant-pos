const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Table = require('../models/Table');
const { MenuItem } = require('../models/Menu');

// Enhanced Orders Seed Data for MongoDB Compass
const ordersSeedData = [
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0001',
    orderType: 'dine-in',
    status: 'completed',
    table: new mongoose.Types.ObjectId(), // Will be replaced with actual table ID
    customer: {
      name: 'John Smith',
      phone: '+1234567890',
      email: 'john.smith@email.com'
    },
    waiter: new mongoose.Types.ObjectId(), // Will be replaced with actual waiter ID
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(), // Will be replaced with actual menu item ID
        name: 'Grilled Chicken Salad',
        price: 12.99,
        quantity: 2,
        specialInstructions: 'No onions',
        status: 'served'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Fresh Orange Juice',
        price: 3.99,
        quantity: 2,
        specialInstructions: '',
        status: 'served'
      }
    ],
    subtotal: 33.96,
    tax: {
      rate: 10,
      amount: 3.40
    },
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0.00
    },
    totalAmount: 37.36,
    paymentMethod: 'card',
    paymentStatus: 'completed',
    notes: 'Customer requested extra napkins',
    estimatedTime: 25,
    actualTime: 23,
    createdAt: new Date('2024-10-29T10:30:00.000Z'),
    updatedAt: new Date('2024-10-29T11:15:00.000Z'),
    completedAt: new Date('2024-10-29T11:15:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0002',
    orderType: 'takeaway',
    status: 'ready',
    customer: {
      name: 'Mary Johnson',
      phone: '+1234567891',
      email: 'mary.johnson@email.com'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Margherita Pizza',
        price: 14.99,
        quantity: 1,
        specialInstructions: 'Extra cheese',
        status: 'ready'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Chocolate Cake',
        price: 6.99,
        quantity: 1,
        specialInstructions: '',
        status: 'ready'
      }
    ],
    subtotal: 21.98,
    tax: {
      rate: 10,
      amount: 2.20
    },
    discount: {
      type: 'fixed',
      value: 2.00,
      amount: 2.00
    },
    totalAmount: 22.18,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: 'Customer will pick up in 10 minutes',
    estimatedTime: 20,
    createdAt: new Date('2024-10-29T12:15:00.000Z'),
    updatedAt: new Date('2024-10-29T12:35:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0003',
    orderType: 'delivery',
    status: 'preparing',
    customer: {
      name: 'David Brown',
      phone: '+1234567892',
      email: 'david.brown@email.com',
      address: '123 Main St, City, State 12345'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Pasta Carbonara',
        price: 13.99,
        quantity: 2,
        specialInstructions: 'Extra parmesan',
        status: 'preparing'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Caesar Salad',
        price: 9.99,
        quantity: 1,
        specialInstructions: 'Dressing on the side',
        status: 'preparing'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Red Wine',
        price: 8.99,
        quantity: 1,
        specialInstructions: '',
        status: 'ready'
      }
    ],
    subtotal: 46.96,
    tax: {
      rate: 10,
      amount: 4.70
    },
    discount: {
      type: 'percentage',
      value: 5,
      amount: 2.35
    },
    deliveryFee: 3.99,
    totalAmount: 53.30,
    paymentMethod: 'digital',
    paymentStatus: 'completed',
    notes: 'Delivery address: 123 Main St, buzzer #4',
    estimatedTime: 35,
    deliveryInfo: {
      address: '123 Main St, City, State 12345',
      instructions: 'Ring doorbell, apartment 4B',
      estimatedDeliveryTime: new Date('2024-10-29T13:45:00.000Z')
    },
    createdAt: new Date('2024-10-29T12:45:00.000Z'),
    updatedAt: new Date('2024-10-29T13:20:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0004',
    orderType: 'dine-in',
    status: 'confirmed',
    table: new mongoose.Types.ObjectId(),
    customer: {
      name: 'Lisa Wilson',
      phone: '+1234567893'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Fish & Chips',
        price: 15.99,
        quantity: 1,
        specialInstructions: 'Tartar sauce on the side',
        status: 'confirmed'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Beer',
        price: 4.99,
        quantity: 2,
        specialInstructions: '',
        status: 'served'
      }
    ],
    subtotal: 25.97,
    tax: {
      rate: 10,
      amount: 2.60
    },
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0.00
    },
    totalAmount: 28.57,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    notes: 'Table celebration - birthday',
    estimatedTime: 30,
    createdAt: new Date('2024-10-29T13:00:00.000Z'),
    updatedAt: new Date('2024-10-29T13:05:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0005',
    orderType: 'dine-in',
    status: 'pending',
    table: new mongoose.Types.ObjectId(),
    customer: {
      name: 'Tom Davis',
      phone: '+1234567894'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Vegetarian Burger',
        price: 11.99,
        quantity: 1,
        specialInstructions: 'No pickles',
        status: 'pending'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'French Fries',
        price: 4.99,
        quantity: 1,
        specialInstructions: 'Extra crispy',
        status: 'pending'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Coca Cola',
        price: 2.99,
        quantity: 1,
        specialInstructions: 'No ice',
        status: 'pending'
      }
    ],
    subtotal: 19.97,
    tax: {
      rate: 10,
      amount: 2.00
    },
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0.00
    },
    totalAmount: 21.97,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: 'Customer is vegetarian',
    estimatedTime: 20,
    createdAt: new Date('2024-10-29T13:30:00.000Z'),
    updatedAt: new Date('2024-10-29T13:30:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0006',
    orderType: 'takeaway',
    status: 'cancelled',
    customer: {
      name: 'Sarah Miller',
      phone: '+1234567895'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Chicken Wings',
        price: 9.99,
        quantity: 2,
        specialInstructions: 'Hot sauce',
        status: 'cancelled'
      }
    ],
    subtotal: 19.98,
    tax: {
      rate: 10,
      amount: 2.00
    },
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0.00
    },
    totalAmount: 21.98,
    paymentMethod: 'card',
    paymentStatus: 'refunded',
    notes: 'Customer cancelled - changed mind',
    estimatedTime: 15,
    cancelledAt: new Date('2024-10-29T14:10:00.000Z'),
    cancelReason: 'Customer request - changed mind',
    createdAt: new Date('2024-10-29T14:00:00.000Z'),
    updatedAt: new Date('2024-10-29T14:10:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0007',
    orderType: 'dine-in',
    status: 'served',
    table: new mongoose.Types.ObjectId(),
    customer: {
      name: 'Robert Taylor',
      phone: '+1234567896'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Ribeye Steak',
        price: 24.99,
        quantity: 1,
        specialInstructions: 'Medium rare',
        status: 'served'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Mashed Potatoes',
        price: 5.99,
        quantity: 1,
        specialInstructions: 'Extra butter',
        status: 'served'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Red Wine',
        price: 8.99,
        quantity: 1,
        specialInstructions: '',
        status: 'served'
      }
    ],
    subtotal: 39.97,
    tax: {
      rate: 10,
      amount: 4.00
    },
    discount: {
      type: 'percentage',
      value: 10,
      amount: 4.00
    },
    totalAmount: 39.97,
    paymentMethod: 'card',
    paymentStatus: 'completed',
    notes: 'VIP customer - complimentary dessert offered',
    estimatedTime: 40,
    actualTime: 38,
    createdAt: new Date('2024-10-29T11:45:00.000Z'),
    updatedAt: new Date('2024-10-29T12:30:00.000Z'),
    servedAt: new Date('2024-10-29T12:30:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0008',
    orderType: 'delivery',
    status: 'ready',
    customer: {
      name: 'Jennifer White',
      phone: '+1234567897',
      email: 'jennifer.white@email.com',
      address: '456 Oak Ave, City, State 12345'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Chicken Alfredo',
        price: 16.99,
        quantity: 1,
        specialInstructions: 'Extra sauce',
        status: 'ready'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Garlic Bread',
        price: 3.99,
        quantity: 2,
        specialInstructions: '',
        status: 'ready'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Tiramisu',
        price: 7.99,
        quantity: 1,
        specialInstructions: '',
        status: 'ready'
      }
    ],
    subtotal: 32.96,
    tax: {
      rate: 10,
      amount: 3.30
    },
    discount: {
      type: 'fixed',
      value: 5.00,
      amount: 5.00
    },
    deliveryFee: 3.99,
    totalAmount: 35.25,
    paymentMethod: 'digital',
    paymentStatus: 'completed',
    notes: 'Contactless delivery requested',
    estimatedTime: 30,
    deliveryInfo: {
      address: '456 Oak Ave, City, State 12345',
      instructions: 'Leave at door, ring doorbell',
      estimatedDeliveryTime: new Date('2024-10-29T14:45:00.000Z')
    },
    createdAt: new Date('2024-10-29T14:00:00.000Z'),
    updatedAt: new Date('2024-10-29T14:30:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0009',
    orderType: 'takeaway',
    status: 'preparing',
    customer: {
      name: 'Michael Johnson',
      phone: '+1234567898'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'BBQ Ribs',
        price: 18.99,
        quantity: 1,
        specialInstructions: 'Extra BBQ sauce',
        status: 'preparing'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Coleslaw',
        price: 3.99,
        quantity: 1,
        specialInstructions: '',
        status: 'ready'
      }
    ],
    subtotal: 22.98,
    tax: {
      rate: 10,
      amount: 2.30
    },
    discount: {
      type: 'percentage',
      value: 0,
      amount: 0.00
    },
    totalAmount: 25.28,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: 'Customer will pay on pickup',
    estimatedTime: 25,
    createdAt: new Date('2024-10-29T14:15:00.000Z'),
    updatedAt: new Date('2024-10-29T14:25:00.000Z')
  },
  {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: 'ORD0010',
    orderType: 'dine-in',
    status: 'completed',
    table: new mongoose.Types.ObjectId(),
    customer: {
      name: 'Amanda Garcia',
      phone: '+1234567899'
    },
    waiter: new mongoose.Types.ObjectId(),
    items: [
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Salmon Teriyaki',
        price: 19.99,
        quantity: 1,
        specialInstructions: 'No vegetables',
        status: 'served'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Jasmine Rice',
        price: 2.99,
        quantity: 1,
        specialInstructions: '',
        status: 'served'
      },
      {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Green Tea',
        price: 2.99,
        quantity: 1,
        specialInstructions: 'Hot',
        status: 'served'
      }
    ],
    subtotal: 25.97,
    tax: {
      rate: 10,
      amount: 2.60
    },
    discount: {
      type: 'percentage',
      value: 15,
      amount: 3.90
    },
    totalAmount: 24.67,
    paymentMethod: 'card',
    paymentStatus: 'completed',
    notes: 'Customer has fish allergy - confirmed salmon is okay',
    estimatedTime: 28,
    actualTime: 25,
    tip: 5.00,
    createdAt: new Date('2024-10-29T12:30:00.000Z'),
    updatedAt: new Date('2024-10-29T13:10:00.000Z'),
    completedAt: new Date('2024-10-29T13:10:00.000Z')
  }
];

// Export for use in seeding scripts or manual import
module.exports = ordersSeedData;

// For MongoDB Compass import (JSON format)
console.log('Orders Seed Data for MongoDB Compass:');
console.log(JSON.stringify(ordersSeedData, null, 2));