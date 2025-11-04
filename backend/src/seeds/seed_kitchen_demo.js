/*
  Seed a few Kitchen Orders (KOT/Kitchen Display) into MongoDB without changing FE/BE.
  - Reuses existing Users (waiter), Tables, and MenuItems
  - Creates a handful of orders in statuses: pending, confirmed, preparing
  - Adds KOT metadata so they show up in KOT queue and Kitchen Display
*/

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const User = require('../models/User');
const Table = require('../models/Table');
const { MenuItem } = require('../models/Menu');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_pos_db';
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${uri}`);
}

function generateKotNumber(prefix = 'KOT') {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${dateString}-${rand}`;
}

function generateOrderNumber(prefix = 'ORD') {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${dateString}-${rand}`;
}

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60 * 1000);
}

async function pickReferences() {
  const waiter = await User.findOne({ role: 'waiter' }) || await User.findOne();
  const table = await Table.findOne() || null;
  const items = await MenuItem.find().limit(6);

  if (!waiter) throw new Error('No users found. Please ensure at least one user exists.');
  if (items.length === 0) throw new Error('No menu items found. Please ensure menu items exist.');

  return { waiter, table, items };
}

function buildOrder({ waiter, table, items, status, itemStatuses, offsetMins = 45 }) {
  const selectedItems = items.slice(0, Math.max(2, Math.min(4, items.length)));
  const orderItems = selectedItems.map((menuItem, idx) => {
    const itemStatus = itemStatuses[idx % itemStatuses.length];
    return {
      menuItem: menuItem._id,
      quantity: 1 + (idx % 2),
      price: menuItem.price || 9.99,
      status: itemStatus,
      specialInstructions: idx === 0 ? 'Medium spice level' : undefined,
      preparedAt: itemStatus === 'ready' ? minutesAgo(5) : undefined,
    };
  });

  const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const taxAmount = +(subtotal * 0.08).toFixed(2);
  const serviceAmount = +(subtotal * 0.1).toFixed(2);
  const totalAmount = +(subtotal + taxAmount + serviceAmount).toFixed(2);

  const kotPrintedAt = status === 'pending' ? undefined : minutesAgo(offsetMins - 30);

  return {
    orderNumber: generateOrderNumber(),
    orderType: 'dine_in',
    table: table ? table._id : null,
    customer: table ? undefined : { name: 'Walk-in', phone: '' },
    waiter: waiter._id,
    items: orderItems,
    subtotal,
    tax: { rate: 8, amount: taxAmount },
    serviceCharge: { rate: 10, amount: serviceAmount },
    totalAmount,
    status,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    kot: kotPrintedAt
      ? { number: generateKotNumber(), printedAt: kotPrintedAt, reprints: [] }
      : {},
    preparationTime: {
      estimated: 20,
      startedAt: status !== 'confirmed' && status !== 'pending' ? minutesAgo(offsetMins - 20) : undefined,
      completedAt: status === 'ready' ? minutesAgo(5) : undefined,
    },
    specialInstructions: 'Ensure hot serving',
    source: 'pos',
    createdAt: minutesAgo(offsetMins),
    updatedAt: minutesAgo(Math.max(1, offsetMins - 10)),
  };
}

async function run() {
  try {
    await connectDB();

    const { waiter, table, items } = await pickReferences();
    console.log(`Using waiter: ${waiter.firstName} ${waiter.lastName}`);
    if (table) console.log(`Using table: ${table.tableName || table.tableNumber}`);
    console.log(`Using ${items.length} menu items`);

    const payload = [
      // Will show in KOT queue: pending
      buildOrder({ waiter, table, items, status: 'pending', itemStatuses: ['pending', 'pending'], offsetMins: 35 }),
      // Will show in KOT queue: confirmed (printed KOT)
      buildOrder({ waiter, table, items, status: 'confirmed', itemStatuses: ['pending', 'preparing'], offsetMins: 40 }),
      // Will show in KOT queue: preparing
      buildOrder({ waiter, table, items, status: 'preparing', itemStatuses: ['preparing', 'ready'], offsetMins: 25 }),
    ];

    const created = await Order.create(payload);
    console.log(`✅ Inserted ${created.length} kitchen demo orders.`);

    created.forEach(o => {
      console.log(`- ${o.orderNumber || '(autonumber)'} ${o.status} | items: ${o.items.length}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

run();


