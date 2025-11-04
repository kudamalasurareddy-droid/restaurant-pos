const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const { Category, MenuItem } = require('../models/Menu');
const Table = require('../models/Table');
const Order = require('../models/Order');
const { InventoryItem, StockMovement, PurchaseOrder } = require('../models/Inventory');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_pos_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});
    await InventoryItem.deleteMany({});
    await StockMovement.deleteMany({});
    await PurchaseOrder.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Enhanced dummy data with comprehensive operations examples
const seedEnhancedData = async () => {
  try {
    console.log('🌱 Starting enhanced database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    // 1. Create Users with Enhanced Profiles
    console.log('👥 Creating users with detailed profiles...');
    const users = await createEnhancedUsers();
    
    // 2. Create Menu with Popular Restaurant Items
    console.log('🍽️ Creating comprehensive menu...');
    const { categories, menuItems } = await createComprehensiveMenu();
    
    // 3. Create Tables with Different Scenarios
    console.log('🪑 Setting up tables with various scenarios...');
    const tables = await createRealisticTables(users);
    
    // 4. Create Active Orders for Operations Testing
    console.log('📋 Creating active orders for operations...');
    const orders = await createActiveOrders(users, tables, menuItems);
    
    // 5. Create KOT Queue Data
    console.log('👨‍🍳 Setting up kitchen operations...');
    await createKitchenOperations(orders);
    
    // 6. Create Inventory for Restaurant Operations
    console.log('📦 Setting up inventory management...');
    await createRestaurantInventory();
    
    // 7. Create Historical Data for Reports
    console.log('📊 Creating historical data for reports...');
    await createHistoricalData(users, tables, menuItems);
    
    console.log('\n✅ Enhanced database seeding completed successfully!');
    
    console.log('\n🎯 RESTAURANT POS OPERATIONS OVERVIEW:');
    console.log('=====================================');
    
    console.log('\n📋 ORDERS SYSTEM:');
    console.log('- View all orders (pending, preparing, ready, completed)');
    console.log('- Track order status and progress');
    console.log('- Manage customer information');
    console.log('- Handle payments and refunds');
    
    console.log('\n🏪 POINT OF SALE (POS):');
    console.log('- Create new orders quickly');
    console.log('- Select menu items and customize');
    console.log('- Calculate totals with tax and service charge');
    console.log('- Process multiple payment methods');
    
    console.log('\n🪑 TABLES MANAGEMENT:');
    console.log('- View floor plan with table status');
    console.log('- Assign waiters to tables');
    console.log('- Manage reservations');
    console.log('- Track table occupancy and turnover');
    
    console.log('\n🧾 KITCHEN ORDERS (KOT):');
    console.log('- Kitchen staff can see order queue');
    console.log('- Update item preparation status');
    console.log('- Mark items as ready when cooked');
    console.log('- Track preparation times');
    
    console.log('\n👨‍🍳 KITCHEN DISPLAY:');
    console.log('- Live view of orders being prepared');
    console.log('- Color-coded priority system');
    console.log('- Timer for each order');
    console.log('- Communication with front-of-house');
    
    console.log('\n🔐 ROLE-BASED ACCESS:');
    console.log('- Admin: Full access to all features');
    console.log('- Manager: Operations + reporting');
    console.log('- Cashier: POS + order management');
    console.log('- Waiter: Tables + order taking');
    console.log('- Kitchen Staff: KOT + kitchen display');
    
    console.log('\n🎮 TEST SCENARIOS CREATED:');
    console.log('- Active orders in different stages');
    console.log('- Tables with customers (occupied/available)');
    console.log('- Kitchen queue with pending items');
    console.log('- Payment scenarios (pending/partial/paid)');
    console.log('- Reservation system examples');
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Manager: manager@restaurant.com / manager123');
    console.log('Cashier: cashier@restaurant.com / cashier123');
    console.log('Waiter: waiter@restaurant.com / waiter123');
    console.log('Kitchen: kitchen@restaurant.com / kitchen123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Create enhanced users with realistic profiles
const createEnhancedUsers = async () => {
  const users = [
    // Admin - Restaurant Owner
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'admin@restaurant.com',
      password: 'admin123',
      phone: '+1-555-0001',
      role: 'admin',
      salary: 85000,
      hireDate: new Date('2020-01-15'),
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      workShift: { startTime: '08:00', endTime: '20:00' }
    },
    
    // Managers
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'manager@restaurant.com',
      password: 'manager123',
      phone: '+1-555-0101',
      role: 'manager',
      salary: 65000,
      hireDate: new Date('2021-03-01'),
      workShift: { startTime: '10:00', endTime: '22:00' }
    },
    
    // Cashiers
    {
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'cashier@restaurant.com',
      password: 'cashier123',
      phone: '+1-555-0201',
      role: 'cashier',
      salary: 35000,
      hireDate: new Date('2022-06-15'),
      workShift: { startTime: '09:00', endTime: '17:00' }
    },
    {
      firstName: 'Lisa',
      lastName: 'Wilson',
      email: 'cashier2@restaurant.com',
      password: 'cashier123',
      phone: '+1-555-0202',
      role: 'cashier',
      salary: 34000,
      hireDate: new Date('2023-01-10'),
      workShift: { startTime: '17:00', endTime: '01:00' }
    },
    
    // Waiters/Waitresses
    {
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'waiter@restaurant.com',
      password: 'waiter123',
      phone: '+1-555-0301',
      role: 'waiter',
      salary: 28000,
      hireDate: new Date('2022-08-01'),
      workShift: { startTime: '11:00', endTime: '21:00' }
    },
    {
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      email: 'waiter2@restaurant.com',
      password: 'waiter123',
      phone: '+1-555-0302',
      role: 'waiter',
      salary: 29000,
      workShift: { startTime: '17:00', endTime: '01:00' }
    },
    {
      firstName: 'Anna',
      lastName: 'Garcia',
      email: 'waiter3@restaurant.com',
      password: 'waiter123',
      phone: '+1-555-0303',
      role: 'waiter',
      salary: 27500,
      workShift: { startTime: '11:00', endTime: '19:00' }
    },
    
    // Kitchen Staff
    {
      firstName: 'Chef Marco',
      lastName: 'Italiano',
      email: 'kitchen@restaurant.com',
      password: 'kitchen123',
      phone: '+1-555-0401',
      role: 'kitchen_staff',
      salary: 45000,
      hireDate: new Date('2020-05-20'),
      workShift: { startTime: '10:00', endTime: '22:00' }
    },
    {
      firstName: 'Isabella',
      lastName: 'Martinez',
      email: 'kitchen2@restaurant.com',
      password: 'kitchen123',
      phone: '+1-555-0402',
      role: 'kitchen_staff',
      salary: 38000,
      workShift: { startTime: '14:00', endTime: '02:00' }
    }
  ];

  // Set permissions for each role
  const createdUsers = [];
  for (const userData of users) {
    let permissions = [];
    
    switch (userData.role) {
      case 'admin':
        permissions = [
          { module: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'menu', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'tables', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'kot', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'reports', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'users', actions: ['create', 'read', 'update', 'delete'] }
        ];
        break;
      case 'manager':
        permissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'orders', actions: ['create', 'read', 'update'] },
          { module: 'menu', actions: ['read', 'update'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'kot', actions: ['create', 'read', 'update'] },
          { module: 'inventory', actions: ['read', 'update'] },
          { module: 'reports', actions: ['read'] },
          { module: 'users', actions: ['read'] }
        ];
        break;
      case 'cashier':
        permissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'orders', actions: ['create', 'read', 'update'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'menu', actions: ['read'] }
        ];
        break;
      case 'waiter':
        permissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'orders', actions: ['create', 'read', 'update'] },
          { module: 'tables', actions: ['read', 'update'] },
          { module: 'menu', actions: ['read'] }
        ];
        break;
      case 'kitchen_staff':
        permissions = [
          { module: 'dashboard', actions: ['read'] },
          { module: 'kot', actions: ['read', 'update'] },
          { module: 'orders', actions: ['read', 'update'] }
        ];
        break;
    }
    
    userData.permissions = permissions;
    const user = await User.create(userData);
    createdUsers.push(user);
  }
  
  console.log(`✅ ${createdUsers.length} users created with enhanced profiles`);
  return createdUsers;
};

// Create comprehensive menu with popular restaurant items
const createComprehensiveMenu = async () => {
  // Categories
  const categories = await Category.create([
    { name: 'Appetizers', description: 'Start your meal right', color: '#FF6B6B', sortOrder: 1 },
    { name: 'Soups & Salads', description: 'Fresh and healthy options', color: '#4ECDC4', sortOrder: 2 },
    { name: 'Pizza', description: 'Wood-fired authentic pizzas', color: '#45B7D1', sortOrder: 3 },
    { name: 'Pasta', description: 'Traditional Italian pasta', color: '#F9CA24', sortOrder: 4 },
    { name: 'Main Courses', description: 'Hearty main dishes', color: '#F0932B', sortOrder: 5 },
    { name: 'Seafood', description: 'Fresh from the ocean', color: '#6C5CE7', sortOrder: 6 },
    { name: 'Steaks & Grills', description: 'Premium cuts grilled to perfection', color: '#A29BFE', sortOrder: 7 },
    { name: 'Desserts', description: 'Sweet endings', color: '#FD79A8', sortOrder: 8 },
    { name: 'Beverages', description: 'Refreshing drinks', color: '#00B894', sortOrder: 9 },
    { name: 'Kids Menu', description: 'Special for little ones', color: '#E84393', sortOrder: 10 }
  ]);

  // Menu Items with realistic restaurant fare
  const menuItems = [];
  
  // Appetizers
  const appetizersCategory = categories.find(c => c.name === 'Appetizers');
  menuItems.push(
    {
      name: 'Buffalo Wings',
      description: '12 pieces of spicy chicken wings with ranch dressing',
      category: appetizersCategory._id,
      price: 14.99,
      costPrice: 6.50,
      preparationTime: 15,
      isVegetarian: false,
      spiceLevel: 'hot',
      calories: 450,
      tags: ['popular', 'spicy'],
      variants: [
        { name: '6 pieces', price: 8.99 },
        { name: '12 pieces', price: 14.99 },
        { name: '24 pieces', price: 26.99 }
      ],
      rating: { average: 4.5, count: 230 }
    },
    {
      name: 'Mozzarella Sticks',
      description: '8 crispy breaded mozzarella sticks with marinara sauce',
      category: appetizersCategory._id,
      price: 11.99,
      costPrice: 4.75,
      preparationTime: 12,
      isVegetarian: true,
      calories: 380,
      tags: ['popular', 'vegetarian'],
      rating: { average: 4.3, count: 180 }
    },
    {
      name: 'Loaded Nachos',
      description: 'Tortilla chips with cheese, jalapeños, sour cream, and guacamole',
      category: appetizersCategory._id,
      price: 13.99,
      costPrice: 5.25,
      preparationTime: 10,
      isVegetarian: true,
      calories: 520,
      tags: ['sharing', 'popular']
    }
  );

  // Pizza
  const pizzaCategory = categories.find(c => c.name === 'Pizza');
  menuItems.push(
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      category: pizzaCategory._id,
      price: 16.99,
      costPrice: 7.20,
      preparationTime: 20,
      isVegetarian: true,
      calories: 680,
      variants: [
        { name: 'Personal (10")', price: 12.99 },
        { name: 'Medium (14")', price: 16.99 },
        { name: 'Large (18")', price: 21.99 }
      ],
      tags: ['classic', 'vegetarian'],
      rating: { average: 4.6, count: 340 }
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Traditional pizza with pepperoni and mozzarella cheese',
      category: pizzaCategory._id,
      price: 18.99,
      costPrice: 8.50,
      preparationTime: 20,
      calories: 750,
      variants: [
        { name: 'Personal (10")', price: 14.99 },
        { name: 'Medium (14")', price: 18.99 },
        { name: 'Large (18")', price: 23.99 }
      ],
      tags: ['popular', 'classic'],
      rating: { average: 4.7, count: 520 }
    }
  );

  // Main Courses
  const mainCategory = categories.find(c => c.name === 'Main Courses');
  menuItems.push(
    {
      name: 'Grilled Chicken Breast',
      description: 'Juicy grilled chicken with herbs, served with vegetables and mashed potatoes',
      category: mainCategory._id,
      price: 22.99,
      costPrice: 12.50,
      preparationTime: 25,
      calories: 580,
      tags: ['healthy', 'protein'],
      rating: { average: 4.4, count: 160 }
    },
    {
      name: 'BBQ Ribs',
      description: 'Full rack of baby back ribs with our signature BBQ sauce',
      category: mainCategory._id,
      price: 28.99,
      costPrice: 15.20,
      preparationTime: 35,
      calories: 820,
      tags: ['signature', 'popular'],
      variants: [
        { name: 'Half Rack', price: 19.99 },
        { name: 'Full Rack', price: 28.99 }
      ],
      rating: { average: 4.8, count: 290 }
    }
  );

  // Steaks
  const steakCategory = categories.find(c => c.name === 'Steaks & Grills');
  menuItems.push(
    {
      name: 'Ribeye Steak',
      description: '12oz premium ribeye steak grilled to your preference',
      category: steakCategory._id,
      price: 34.99,
      costPrice: 22.50,
      preparationTime: 30,
      calories: 750,
      variants: [
        { name: '8oz', price: 26.99 },
        { name: '12oz', price: 34.99 },
        { name: '16oz', price: 42.99 }
      ],
      tags: ['premium', 'signature'],
      rating: { average: 4.9, count: 120 }
    }
  );

  // Beverages
  const beverageCategory = categories.find(c => c.name === 'Beverages');
  menuItems.push(
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      category: beverageCategory._id,
      price: 5.99,
      costPrice: 2.10,
      preparationTime: 3,
      isVegetarian: true,
      isVegan: true,
      calories: 120,
      variants: [
        { name: 'Regular', price: 5.99 },
        { name: 'Large', price: 7.99 }
      ],
      tags: ['fresh', 'healthy']
    },
    {
      name: 'Craft Beer',
      description: 'Local craft beer selection',
      category: beverageCategory._id,
      price: 7.99,
      costPrice: 3.20,
      preparationTime: 2,
      calories: 180,
      tags: ['local', 'alcohol']
    }
  );

  const createdMenuItems = await MenuItem.create(menuItems);
  console.log(`✅ ${categories.length} categories and ${createdMenuItems.length} menu items created`);
  
  return { categories, menuItems: createdMenuItems };
};

// Create realistic table scenarios
const createRealisticTables = async (users) => {
  const waiters = users.filter(u => u.role === 'waiter');
  
  const tables = [
    // Main dining area - mix of occupied and available
    { tableNumber: '1', capacity: 2, location: 'indoor', section: 'Main Dining', status: 'occupied', assignedWaiter: waiters[0]._id, coordinates: { x: 100, y: 100 } },
    { tableNumber: '2', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'available', assignedWaiter: waiters[0]._id, coordinates: { x: 200, y: 100 } },
    { tableNumber: '3', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'occupied', assignedWaiter: waiters[1]._id, coordinates: { x: 300, y: 100 } },
    { tableNumber: '4', capacity: 6, location: 'indoor', section: 'Main Dining', status: 'reserved', assignedWaiter: waiters[1]._id, coordinates: { x: 400, y: 100 } },
    { tableNumber: '5', capacity: 2, location: 'indoor', section: 'Main Dining', status: 'cleaning', assignedWaiter: waiters[2]._id, coordinates: { x: 100, y: 200 } },
    { tableNumber: '6', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'occupied', assignedWaiter: waiters[2]._id, coordinates: { x: 200, y: 200 } },
    
    // VIP section
    { tableNumber: 'VIP1', tableName: 'Executive Suite', capacity: 8, location: 'private_room', section: 'VIP', status: 'available', assignedWaiter: waiters[0]._id, minOrderAmount: 150 },
    { tableNumber: 'VIP2', tableName: 'Business Meeting', capacity: 6, location: 'private_room', section: 'VIP', status: 'reserved', assignedWaiter: waiters[1]._id, minOrderAmount: 120 },
    
    // Bar area
    { tableNumber: 'B1', capacity: 2, location: 'bar', section: 'Bar', status: 'occupied', assignedWaiter: waiters[0]._id },
    { tableNumber: 'B2', capacity: 2, location: 'bar', section: 'Bar', status: 'available', assignedWaiter: waiters[0]._id },
    
    // Patio (outdoor)
    { tableNumber: 'P1', capacity: 4, location: 'patio', section: 'Patio', status: 'available', assignedWaiter: waiters[1]._id },
    { tableNumber: 'P2', capacity: 4, location: 'patio', section: 'Patio', status: 'occupied', assignedWaiter: waiters[2]._id }
  ];

  // Add reservations to some tables
  const currentTime = new Date();
  tables.forEach((table, index) => {
    if (table.status === 'reserved') {
      table.reservations = [{
        customerName: `Business Party ${index}`,
        customerPhone: `+1-555-${String(2000 + index).padStart(4, '0')}`,
        customerEmail: `party${index}@company.com`,
        reservationDate: new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)), // 2 hours from now
        duration: 180, // 3 hours
        partySize: table.capacity - 1,
        specialRequests: 'Quiet corner preferred, celebrating business deal',
        status: 'confirmed'
      }];
    }
  });

  const createdTables = await Table.create(tables);
  console.log(`✅ ${createdTables.length} tables created with realistic scenarios`);
  return createdTables;
};

// Create active orders for testing operations
const createActiveOrders = async (users, tables, menuItems) => {
  const waiters = users.filter(u => u.role === 'waiter');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  
  const orders = [];
  
  // Create orders for each occupied table
  for (let i = 0; i < occupiedTables.length; i++) {
    const table = occupiedTables[i];
    const waiter = waiters[i % waiters.length];
    
    // Different order scenarios
    const scenarios = [
      { status: 'confirmed', paymentStatus: 'pending', itemStatuses: ['pending', 'preparing'] },
      { status: 'preparing', paymentStatus: 'pending', itemStatuses: ['preparing', 'ready'] },
      { status: 'ready', paymentStatus: 'pending', itemStatuses: ['ready', 'ready'] },
      { status: 'served', paymentStatus: 'partial', itemStatuses: ['served', 'served'] }
    ];
    
    const scenario = scenarios[i % scenarios.length];
    
    // Select menu items for this order
    const orderItems = [];
    const numItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
    
    for (let j = 0; j < numItems; j++) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
      
      orderItems.push({
        menuItem: randomItem._id,
        quantity: quantity,
        price: randomItem.price,
        status: scenario.itemStatuses[j % scenario.itemStatuses.length],
        specialInstructions: j === 0 ? 'Medium spice level' : undefined,
        preparedAt: scenario.itemStatuses[j % scenario.itemStatuses.length] === 'ready' ? new Date() : undefined
      });
    }
    
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.08;
    const serviceChargeAmount = subtotal * 0.10;
    const totalAmount = subtotal + taxAmount + serviceChargeAmount;
    
    const order = {
      orderNumber: `ORD-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
      orderType: 'dine_in',
      table: table._id,
      customer: {
        name: `Customer ${i + 1}`,
        phone: `+1-555-${String(3000 + i).padStart(4, '0')}`,
        email: `customer${i + 1}@email.com`
      },
      waiter: waiter._id,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: {
        rate: 8,
        amount: Math.round(taxAmount * 100) / 100
      },
      serviceCharge: {
        rate: 10,
        amount: Math.round(serviceChargeAmount * 100) / 100
      },
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: scenario.status,
      paymentStatus: scenario.paymentStatus,
      paymentMethod: 'cash',
      kot: {
        number: `KOT-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
        printedAt: new Date(Date.now() - (30 * 60 * 1000)) // 30 minutes ago
      },
      preparationTime: {
        estimated: 25,
        startedAt: scenario.status !== 'confirmed' ? new Date(Date.now() - (20 * 60 * 1000)) : undefined,
        completedAt: scenario.status === 'ready' || scenario.status === 'served' ? new Date(Date.now() - (5 * 60 * 1000)) : undefined
      },
      specialInstructions: 'Please ensure food is served hot',
      source: 'pos',
      createdAt: new Date(Date.now() - (45 * 60 * 1000)) // 45 minutes ago
    };

    // Add partial payment for some orders
    if (scenario.paymentStatus === 'partial') {
      order.payments = [{
        amount: Math.round(totalAmount * 0.5 * 100) / 100,
        method: 'card',
        transactionId: `TXN-${Date.now()}-${i}`,
        paidAt: new Date(Date.now() - (10 * 60 * 1000))
      }];
    }
    
    orders.push(order);
  }
  
  // Add some takeaway orders
  for (let i = 0; i < 3; i++) {
    const waiter = waiters[0]; // Cashier handles takeaway
    
    const orderItems = [{
      menuItem: menuItems[0]._id,
      quantity: 2,
      price: menuItems[0].price,
      status: 'ready'
    }];
    
    const subtotal = orderItems[0].price * orderItems[0].quantity;
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;
    
    orders.push({
      orderNumber: `ORD-TO-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
      orderType: 'takeaway',
      customer: {
        name: `Takeaway Customer ${i + 1}`,
        phone: `+1-555-${String(4000 + i).padStart(4, '0')}`
      },
      waiter: waiter._id,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: {
        rate: 8,
        amount: Math.round(taxAmount * 100) / 100
      },
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'ready',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      payments: [{
        amount: Math.round(totalAmount * 100) / 100,
        method: 'card',
        transactionId: `TXN-TAKEAWAY-${i}`,
        paidAt: new Date()
      }],
      kot: {
        number: `KOT-TO-${Date.now()}-${i}`,
        printedAt: new Date(Date.now() - (15 * 60 * 1000))
      },
      source: 'pos',
      createdAt: new Date(Date.now() - (20 * 60 * 1000))
    });
  }
  
  const createdOrders = await Order.create(orders);
  console.log(`✅ ${createdOrders.length} active orders created for operations testing`);
  return createdOrders;
};

// Create kitchen operations data
const createKitchenOperations = async (orders) => {
  // The orders already have KOT data and item statuses
  // This function could add more kitchen-specific data if needed
  console.log('✅ Kitchen operations configured with order statuses');
};

// Create restaurant inventory
const createRestaurantInventory = async () => {
  const inventoryItems = [
    // Fresh ingredients
    { name: 'Ground Beef', sku: 'BEEF-001', category: 'ingredients', unit: 'kg', currentStock: 25, minimumStock: 10, maximumStock: 100, reorderLevel: 15, costPrice: 12.99, isPerishable: true, shelfLife: 5 },
    { name: 'Chicken Breast', sku: 'CHICK-001', category: 'ingredients', unit: 'kg', currentStock: 18, minimumStock: 8, maximumStock: 80, reorderLevel: 12, costPrice: 9.99, isPerishable: true, shelfLife: 7 },
    { name: 'Fresh Salmon', sku: 'FISH-001', category: 'ingredients', unit: 'kg', currentStock: 8, minimumStock: 5, maximumStock: 30, reorderLevel: 8, costPrice: 24.99, isPerishable: true, shelfLife: 3 },
    { name: 'Mozzarella Cheese', sku: 'CHEESE-001', category: 'ingredients', unit: 'kg', currentStock: 15, minimumStock: 5, maximumStock: 50, reorderLevel: 10, costPrice: 8.99, isPerishable: true, shelfLife: 14 },
    
    // Produce
    { name: 'Roma Tomatoes', sku: 'PRODUCE-001', category: 'ingredients', unit: 'kg', currentStock: 12, minimumStock: 8, maximumStock: 40, reorderLevel: 12, costPrice: 4.99, isPerishable: true, shelfLife: 7 },
    { name: 'Fresh Basil', sku: 'HERB-001', category: 'ingredients', unit: 'kg', currentStock: 3, minimumStock: 2, maximumStock: 10, reorderLevel: 3, costPrice: 12.99, isPerishable: true, shelfLife: 5 },
    { name: 'Red Onions', sku: 'PRODUCE-002', category: 'ingredients', unit: 'kg', currentStock: 20, minimumStock: 10, maximumStock: 50, reorderLevel: 15, costPrice: 2.99, shelfLife: 21 },
    
    // Pantry items
    { name: 'Pizza Dough', sku: 'DOUGH-001', category: 'ingredients', unit: 'kg', currentStock: 30, minimumStock: 15, maximumStock: 100, reorderLevel: 20, costPrice: 3.99, isPerishable: true, shelfLife: 3 },
    { name: 'Olive Oil', sku: 'OIL-001', category: 'ingredients', unit: 'l', currentStock: 8, minimumStock: 3, maximumStock: 20, reorderLevel: 5, costPrice: 18.99, shelfLife: 365 },
    
    // Beverages
    { name: 'Orange Juice', sku: 'JUICE-001', category: 'beverages', unit: 'l', currentStock: 20, minimumStock: 10, maximumStock: 50, reorderLevel: 15, costPrice: 4.99, sellingPrice: 5.99, isPerishable: true, shelfLife: 10 },
    { name: 'Craft Beer Cases', sku: 'BEER-001', category: 'beverages', unit: 'boxes', currentStock: 15, minimumStock: 5, maximumStock: 30, reorderLevel: 8, costPrice: 24.99, sellingPrice: 7.99, shelfLife: 120 },
    
    // Supplies
    { name: 'Paper Napkins', sku: 'SUPPLY-001', category: 'supplies', unit: 'packets', currentStock: 50, minimumStock: 20, maximumStock: 200, reorderLevel: 30, costPrice: 1.25 },
    { name: 'Takeout Containers', sku: 'CONTAINER-001', category: 'packaging', unit: 'pieces', currentStock: 200, minimumStock: 50, maximumStock: 500, reorderLevel: 75, costPrice: 0.45 }
  ];

  await InventoryItem.create(inventoryItems);
  console.log(`✅ ${inventoryItems.length} inventory items created for restaurant operations`);
};

// Create historical data for reporting
const createHistoricalData = async (users, tables, menuItems) => {
  // This would create historical orders, sales data, etc.
  // For now, we'll just add a few completed orders from previous days
  const completedOrders = [];
  
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const orderDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
    
    const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const subtotal = randomItem.price * quantity;
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;
    
    completedOrders.push({
      orderNumber: `ORD-HIST-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
      orderType: Math.random() > 0.5 ? 'dine_in' : 'takeaway',
      customer: {
        name: `Historic Customer ${i + 1}`,
        phone: `+1-555-${String(5000 + i).padStart(4, '0')}`
      },
      waiter: users.filter(u => u.role === 'waiter')[0]._id,
      items: [{
        menuItem: randomItem._id,
        quantity: quantity,
        price: randomItem.price,
        status: 'served'
      }],
      subtotal: subtotal,
      tax: { rate: 8, amount: taxAmount },
      totalAmount: totalAmount,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
      payments: [{
        amount: totalAmount,
        method: Math.random() > 0.5 ? 'card' : 'cash',
        paidAt: orderDate
      }],
      source: 'pos',
      createdAt: orderDate,
      updatedAt: orderDate
    });
  }
  
  await Order.create(completedOrders);
  console.log(`✅ ${completedOrders.length} historical orders created for reporting`);
};

// Run the enhanced seeding
if (require.main === module) {
  seedEnhancedData();
}

module.exports = { seedEnhancedData };