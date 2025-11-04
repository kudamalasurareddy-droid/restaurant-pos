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

// Seed Users with different roles
const seedUsers = async () => {
  try {
    const users = [
      // Admin Users
      {
        firstName: 'John',
        lastName: 'Anderson',
        email: 'admin@restaurant.com',
        password: 'admin123',
        phone: '+1-555-0001',
        role: 'admin',
        isActive: true,
        salary: 75000,
        hireDate: new Date('2023-01-15'),
        address: {
          street: '123 Admin St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        workShift: {
          startTime: '09:00',
          endTime: '18:00'
        }
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.admin@restaurant.com',
        password: 'admin123',
        phone: '+1-555-0002',
        role: 'admin',
        isActive: true,
        salary: 70000
      },

      // Manager Users
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'manager@restaurant.com',
        password: 'manager123',
        phone: '+1-555-0101',
        role: 'manager',
        isActive: true,
        salary: 55000,
        hireDate: new Date('2023-03-01'),
        address: {
          street: '456 Manager Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA'
        },
        workShift: {
          startTime: '10:00',
          endTime: '22:00'
        }
      },
      {
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.manager@restaurant.com',
        password: 'manager123',
        phone: '+1-555-0102',
        role: 'manager',
        isActive: true,
        salary: 52000
      },

      // Cashier Users
      {
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'cashier@restaurant.com',
        password: 'cashier123',
        phone: '+1-555-0201',
        role: 'cashier',
        isActive: true,
        salary: 35000,
        hireDate: new Date('2023-06-15'),
        workShift: {
          startTime: '09:00',
          endTime: '17:00'
        }
      },
      {
        firstName: 'Jennifer',
        lastName: 'Miller',
        email: 'jennifer.cashier@restaurant.com',
        password: 'cashier123',
        phone: '+1-555-0202',
        role: 'cashier',
        isActive: true,
        salary: 33000
      },
      {
        firstName: 'David',
        lastName: 'Garcia',
        email: 'david.cashier@restaurant.com',
        password: 'cashier123',
        phone: '+1-555-0203',
        role: 'cashier',
        isActive: true,
        salary: 34000
      },

      // Waiter Users
      {
        firstName: 'Emily',
        lastName: 'Taylor',
        email: 'waiter@restaurant.com',
        password: 'waiter123',
        phone: '+1-555-0301',
        role: 'waiter',
        isActive: true,
        salary: 28000,
        hireDate: new Date('2023-08-01'),
        workShift: {
          startTime: '11:00',
          endTime: '21:00'
        }
      },
      {
        firstName: 'James',
        lastName: 'Rodriguez',
        email: 'james.waiter@restaurant.com',
        password: 'waiter123',
        phone: '+1-555-0302',
        role: 'waiter',
        isActive: true,
        salary: 27000
      },
      {
        firstName: 'Ashley',
        lastName: 'Martinez',
        email: 'ashley.waiter@restaurant.com',
        password: 'waiter123',
        phone: '+1-555-0303',
        role: 'waiter',
        isActive: true,
        salary: 29000
      },
      {
        firstName: 'Carlos',
        lastName: 'Lopez',
        email: 'carlos.waiter@restaurant.com',
        password: 'waiter123',
        phone: '+1-555-0304',
        role: 'waiter',
        isActive: true,
        salary: 28500
      },

      // Kitchen Staff Users
      {
        firstName: 'Maria',
        lastName: 'Gonzalez',
        email: 'kitchen@restaurant.com',
        password: 'kitchen123',
        phone: '+1-555-0401',
        role: 'kitchen_staff',
        isActive: true,
        salary: 32000,
        hireDate: new Date('2023-04-20'),
        workShift: {
          startTime: '10:00',
          endTime: '22:00'
        }
      },
      {
        firstName: 'Antonio',
        lastName: 'Hernandez',
        email: 'antonio.kitchen@restaurant.com',
        password: 'kitchen123',
        phone: '+1-555-0402',
        role: 'kitchen_staff',
        isActive: true,
        salary: 35000
      },
      {
        firstName: 'Carmen',
        lastName: 'Perez',
        email: 'carmen.kitchen@restaurant.com',
        password: 'kitchen123',
        phone: '+1-555-0403',
        role: 'kitchen_staff',
        isActive: true,
        salary: 33000
      },

      // Customer Users
      {
        firstName: 'Alex',
        lastName: 'Customer',
        email: 'customer@example.com',
        password: 'customer123',
        phone: '+1-555-0501',
        role: 'customer',
        isActive: true,
        address: {
          street: '789 Customer Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA'
        }
      },
      {
        firstName: 'Jessica',
        lastName: 'Smith',
        email: 'jessica.customer@example.com',
        password: 'customer123',
        phone: '+1-555-0502',
        role: 'customer',
        isActive: true
      }
    ];

    // Set default permissions for each user based on role
    for (let userData of users) {
      let defaultPermissions = [];
      switch (userData.role) {
        case 'admin':
          defaultPermissions = [
            { module: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'sales', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'menu', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'reports', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'tables', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'kot', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'orders', actions: ['create', 'read', 'update', 'delete'] }
          ];
          break;
        case 'manager':
          defaultPermissions = [
            { module: 'dashboard', actions: ['read'] },
            { module: 'sales', actions: ['create', 'read', 'update'] },
            { module: 'menu', actions: ['read', 'update'] },
            { module: 'inventory', actions: ['create', 'read', 'update'] },
            { module: 'reports', actions: ['read'] },
            { module: 'users', actions: ['read'] },
            { module: 'tables', actions: ['read', 'update'] },
            { module: 'kot', actions: ['create', 'read', 'update'] },
            { module: 'orders', actions: ['create', 'read', 'update'] }
          ];
          break;
        case 'cashier':
          defaultPermissions = [
            { module: 'dashboard', actions: ['read'] },
            { module: 'sales', actions: ['create', 'read'] },
            { module: 'menu', actions: ['read'] },
            { module: 'tables', actions: ['read', 'update'] },
            { module: 'orders', actions: ['create', 'read', 'update'] }
          ];
          break;
        case 'waiter':
          defaultPermissions = [
            { module: 'dashboard', actions: ['read'] },
            { module: 'menu', actions: ['read'] },
            { module: 'tables', actions: ['read', 'update'] },
            { module: 'orders', actions: ['create', 'read', 'update'] }
          ];
          break;
        case 'kitchen_staff':
          defaultPermissions = [
            { module: 'dashboard', actions: ['read'] },
            { module: 'kot', actions: ['read', 'update'] },
            { module: 'orders', actions: ['read', 'update'] }
          ];
          break;
        case 'customer':
          defaultPermissions = [
            { module: 'menu', actions: ['read'] },
            { module: 'orders', actions: ['create', 'read'] }
          ];
          break;
      }
      userData.permissions = defaultPermissions;
    }

    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Seed Categories
const seedCategories = async () => {
  try {
    const categories = [
      {
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        image: '/uploads/menu/categories/appetizers.jpg',
        color: '#FF6B6B',
        sortOrder: 1
      },
      {
        name: 'Soups',
        description: 'Warm and comforting soups',
        image: '/uploads/menu/categories/soups.jpg',
        color: '#4ECDC4',
        sortOrder: 2
      },
      {
        name: 'Salads',
        description: 'Fresh and healthy salad options',
        image: '/uploads/menu/categories/salads.jpg',
        color: '#45B7D1',
        sortOrder: 3
      },
      {
        name: 'Main Courses',
        description: 'Hearty main course dishes',
        image: '/uploads/menu/categories/main-courses.jpg',
        color: '#F9CA24',
        sortOrder: 4
      },
      {
        name: 'Pasta',
        description: 'Italian pasta dishes',
        image: '/uploads/menu/categories/pasta.jpg',
        color: '#F0932B',
        sortOrder: 5
      },
      {
        name: 'Seafood',
        description: 'Fresh seafood selections',
        image: '/uploads/menu/categories/seafood.jpg',
        color: '#6C5CE7',
        sortOrder: 6
      },
      {
        name: 'Vegetarian',
        description: 'Plant-based delicious options',
        image: '/uploads/menu/categories/vegetarian.jpg',
        color: '#A29BFE',
        sortOrder: 7
      },
      {
        name: 'Desserts',
        description: 'Sweet treats to end your meal',
        image: '/uploads/menu/categories/desserts.jpg',
        color: '#FD79A8',
        sortOrder: 8
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        image: '/uploads/menu/categories/beverages.jpg',
        color: '#00B894',
        sortOrder: 9
      },
      {
        name: 'Coffee & Tea',
        description: 'Hot and cold coffee and tea',
        image: '/uploads/menu/categories/coffee-tea.jpg',
        color: '#E17055',
        sortOrder: 10
      },
      {
        name: 'Breakfast',
        description: 'Start your day right',
        image: '/uploads/menu/categories/breakfast.jpg',
        color: '#FDCB6E',
        sortOrder: 11
      },
      {
        name: 'Kids Menu',
        description: 'Special meals for little ones',
        image: '/uploads/menu/categories/kids-menu.jpg',
        color: '#E84393',
        sortOrder: 12
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created`);
    return createdCategories;
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Seed Menu Items
const seedMenuItems = async (categories) => {
  try {
    const menuItems = [];
    
    // Appetizers
    const appetizersCategory = categories.find(c => c.name === 'Appetizers');
    menuItems.push(
      {
        name: 'Buffalo Wings',
        description: 'Spicy chicken wings served with ranch dressing',
        category: appetizersCategory._id,
        price: 12.99,
        costPrice: 5.50,
        image: '/uploads/menu/buffalo-wings.jpg',
        isVegetarian: false,
        spiceLevel: 'hot',
        preparationTime: 15,
        calories: 350,
        allergens: ['dairy'],
        tags: ['popular', 'spicy'],
        rating: { average: 4.5, count: 125 }
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Crispy breaded mozzarella with marinara sauce',
        category: appetizersCategory._id,
        price: 9.99,
        costPrice: 3.75,
        image: '/uploads/menu/mozzarella-sticks.jpg',
        isVegetarian: true,
        preparationTime: 12,
        calories: 280,
        allergens: ['dairy', 'gluten'],
        tags: ['vegetarian', 'popular']
      },
      {
        name: 'Loaded Nachos',
        description: 'Tortilla chips with cheese, jalapeños, and sour cream',
        category: appetizersCategory._id,
        price: 11.49,
        costPrice: 4.25,
        isVegetarian: true,
        preparationTime: 10,
        calories: 450,
        tags: ['vegetarian', 'sharing']
      }
    );

    // Soups
    const soupsCategory = categories.find(c => c.name === 'Soups');
    menuItems.push(
      {
        name: 'Tomato Basil Soup',
        description: 'Classic tomato soup with fresh basil',
        category: soupsCategory._id,
        price: 6.99,
        costPrice: 2.25,
        isVegetarian: true,
        preparationTime: 8,
        calories: 120,
        tags: ['vegetarian', 'comfort']
      },
      {
        name: 'Chicken Noodle Soup',
        description: 'Traditional chicken soup with egg noodles',
        category: soupsCategory._id,
        price: 7.99,
        costPrice: 3.10,
        preparationTime: 12,
        calories: 180,
        tags: ['comfort', 'healthy']
      },
      {
        name: 'Clam Chowder',
        description: 'Creamy New England style clam chowder',
        category: soupsCategory._id,
        price: 8.99,
        costPrice: 4.20,
        preparationTime: 15,
        calories: 250,
        allergens: ['shellfish', 'dairy']
      }
    );

    // Main Courses
    const mainCategory = categories.find(c => c.name === 'Main Courses');
    menuItems.push(
      {
        name: 'Grilled Ribeye Steak',
        description: '12oz ribeye steak grilled to perfection',
        category: mainCategory._id,
        price: 28.99,
        costPrice: 18.50,
        preparationTime: 25,
        calories: 650,
        tags: ['premium', 'chef_special'],
        variants: [
          { name: '8oz', price: 22.99, description: 'Smaller portion' },
          { name: '12oz', price: 28.99, description: 'Standard size' },
          { name: '16oz', price: 34.99, description: 'Large portion' }
        ],
        rating: { average: 4.8, count: 89 }
      },
      {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon herb butter',
        category: mainCategory._id,
        price: 22.99,
        costPrice: 14.75,
        preparationTime: 20,
        calories: 420,
        allergens: ['fish'],
        tags: ['healthy', 'popular'],
        rating: { average: 4.6, count: 67 }
      },
      {
        name: 'BBQ Ribs',
        description: 'Full rack of baby back ribs with BBQ sauce',
        category: mainCategory._id,
        price: 24.99,
        costPrice: 12.30,
        preparationTime: 35,
        calories: 780,
        tags: ['signature', 'popular']
      }
    );

    // Pasta
    const pastaCategory = categories.find(c => c.name === 'Pasta');
    menuItems.push(
      {
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with pancetta and cream',
        category: pastaCategory._id,
        price: 16.99,
        costPrice: 6.80,
        preparationTime: 18,
        calories: 520,
        allergens: ['dairy', 'gluten', 'eggs'],
        tags: ['italian', 'popular']
      },
      {
        name: 'Chicken Alfredo',
        description: 'Fettuccine with grilled chicken in alfredo sauce',
        category: pastaCategory._id,
        price: 18.99,
        costPrice: 8.45,
        preparationTime: 20,
        calories: 680,
        allergens: ['dairy', 'gluten'],
        tags: ['popular', 'comfort']
      },
      {
        name: 'Vegetarian Pesto Pasta',
        description: 'Penne pasta with homemade basil pesto',
        category: pastaCategory._id,
        price: 15.99,
        costPrice: 5.95,
        isVegetarian: true,
        preparationTime: 15,
        calories: 450,
        allergens: ['dairy', 'gluten', 'nuts'],
        tags: ['vegetarian', 'fresh']
      }
    );

    // Desserts
    const dessertsCategory = categories.find(c => c.name === 'Desserts');
    menuItems.push(
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        category: dessertsCategory._id,
        price: 8.99,
        costPrice: 3.20,
        isVegetarian: true,
        preparationTime: 12,
        calories: 380,
        allergens: ['dairy', 'gluten', 'eggs'],
        tags: ['popular', 'indulgent']
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        category: dessertsCategory._id,
        price: 7.99,
        costPrice: 3.85,
        isVegetarian: true,
        preparationTime: 5,
        calories: 290,
        allergens: ['dairy', 'eggs', 'gluten'],
        tags: ['italian', 'coffee']
      },
      {
        name: 'New York Cheesecake',
        description: 'Rich and creamy cheesecake with berry compote',
        category: dessertsCategory._id,
        price: 6.99,
        costPrice: 2.95,
        isVegetarian: true,
        preparationTime: 3,
        calories: 420,
        allergens: ['dairy', 'eggs', 'gluten'],
        tags: ['classic', 'popular']
      }
    );

    // Beverages
    const beveragesCategory = categories.find(c => c.name === 'Beverages');
    menuItems.push(
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        category: beveragesCategory._id,
        price: 4.99,
        costPrice: 1.85,
        isVegetarian: true,
        isVegan: true,
        preparationTime: 3,
        calories: 110,
        tags: ['fresh', 'healthy'],
        variants: [
          { name: 'Small', price: 3.99, description: '8oz' },
          { name: 'Medium', price: 4.99, description: '12oz' },
          { name: 'Large', price: 5.99, description: '16oz' }
        ]
      },
      {
        name: 'Craft Beer Selection',
        description: 'Local craft beer on tap',
        category: beveragesCategory._id,
        price: 6.99,
        costPrice: 2.50,
        preparationTime: 2,
        calories: 150,
        tags: ['local', 'craft']
      },
      {
        name: 'House Wine',
        description: 'Red or white wine by the glass',
        category: beveragesCategory._id,
        price: 8.99,
        costPrice: 3.75,
        preparationTime: 2,
        calories: 125,
        variants: [
          { name: 'Red', price: 8.99, description: 'Cabernet or Merlot' },
          { name: 'White', price: 8.99, description: 'Chardonnay or Pinot Grigio' }
        ]
      }
    );

    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ ${createdMenuItems.length} menu items created`);
    return createdMenuItems;
  } catch (error) {
    console.error('Error seeding menu items:', error);
  }
};

// Seed Tables
const seedTables = async (users) => {
  try {
    const waiters = users.filter(u => u.role === 'waiter');
    
    const tables = [
      // Indoor tables
      { tableNumber: '1', capacity: 2, location: 'indoor', section: 'Main Dining', status: 'available', assignedWaiter: waiters[0]._id, coordinates: { x: 100, y: 100 }, shape: 'square' },
      { tableNumber: '2', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'occupied', assignedWaiter: waiters[0]._id, coordinates: { x: 200, y: 100 }, shape: 'square' },
      { tableNumber: '3', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'available', assignedWaiter: waiters[1]._id, coordinates: { x: 300, y: 100 }, shape: 'round' },
      { tableNumber: '4', capacity: 6, location: 'indoor', section: 'Main Dining', status: 'reserved', assignedWaiter: waiters[1]._id, coordinates: { x: 400, y: 100 }, shape: 'rectangle' },
      { tableNumber: '5', capacity: 2, location: 'indoor', section: 'Main Dining', status: 'available', assignedWaiter: waiters[2]._id, coordinates: { x: 100, y: 200 }, shape: 'square' },
      { tableNumber: '6', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'cleaning', assignedWaiter: waiters[2]._id, coordinates: { x: 200, y: 200 }, shape: 'square' },
      { tableNumber: '7', capacity: 8, location: 'indoor', section: 'Main Dining', status: 'available', assignedWaiter: waiters[0]._id, coordinates: { x: 300, y: 200 }, shape: 'rectangle' },
      { tableNumber: '8', capacity: 4, location: 'indoor', section: 'Main Dining', status: 'occupied', assignedWaiter: waiters[1]._id, coordinates: { x: 400, y: 200 }, shape: 'round' },

      // VIP Section
      { tableNumber: 'VIP1', tableName: 'Executive Table', capacity: 6, location: 'private_room', section: 'VIP', status: 'available', assignedWaiter: waiters[0]._id, minOrderAmount: 100, coordinates: { x: 100, y: 300 }, shape: 'rectangle' },
      { tableNumber: 'VIP2', tableName: 'Board Room', capacity: 10, location: 'private_room', section: 'VIP', status: 'reserved', assignedWaiter: waiters[1]._id, minOrderAmount: 150, coordinates: { x: 250, y: 300 }, shape: 'rectangle' },

      // Bar area
      { tableNumber: 'B1', capacity: 2, location: 'bar', section: 'Bar', status: 'available', assignedWaiter: waiters[2]._id, coordinates: { x: 100, y: 400 }, shape: 'round' },
      { tableNumber: 'B2', capacity: 2, location: 'bar', section: 'Bar', status: 'occupied', assignedWaiter: waiters[2]._id, coordinates: { x: 150, y: 400 }, shape: 'round' },
      { tableNumber: 'B3', capacity: 2, location: 'bar', section: 'Bar', status: 'available', assignedWaiter: waiters[2]._id, coordinates: { x: 200, y: 400 }, shape: 'round' },

      // Outdoor patio
      { tableNumber: 'P1', capacity: 4, location: 'patio', section: 'Patio', status: 'available', assignedWaiter: waiters[0]._id, coordinates: { x: 500, y: 100 }, shape: 'round' },
      { tableNumber: 'P2', capacity: 4, location: 'patio', section: 'Patio', status: 'available', assignedWaiter: waiters[1]._id, coordinates: { x: 500, y: 200 }, shape: 'round' },
      { tableNumber: 'P3', capacity: 6, location: 'patio', section: 'Patio', status: 'out_of_order', assignedWaiter: waiters[2]._id, coordinates: { x: 500, y: 300 }, shape: 'rectangle', notes: 'Umbrella needs repair' }
    ];

    // Add reservations to some tables
    const currentDate = new Date();
    tables.forEach((table, index) => {
      if (index % 3 === 0) {
        table.reservations = [{
          customerName: `Customer ${index + 1}`,
          customerPhone: `+1-555-${String(1000 + index).padStart(4, '0')}`,
          customerEmail: `customer${index + 1}@example.com`,
          reservationDate: new Date(currentDate.getTime() + (index * 2 * 60 * 60 * 1000)), // Stagger reservations
          duration: 120,
          partySize: table.capacity - 1,
          specialRequests: 'Window seating preferred',
          status: 'confirmed'
        }];
      }
    });

    const createdTables = await Table.insertMany(tables);
    console.log(`✅ ${createdTables.length} tables created`);
    return createdTables;
  } catch (error) {
    console.error('Error seeding tables:', error);
  }
};

// Seed Inventory Items
const seedInventoryItems = async () => {
  try {
    const inventoryItems = [
      // Ingredients
      { name: 'Ground Beef', sku: 'ING-BEEF-001', category: 'ingredients', unit: 'kg', currentStock: 50, minimumStock: 10, maximumStock: 100, reorderLevel: 15, costPrice: 8.99, supplier: { name: 'Premium Meats Co', contact: '+1-555-MEAT', email: 'orders@premiummeatco.com' }, isPerishable: true, shelfLife: 5 },
      { name: 'Chicken Breast', sku: 'ING-CHICK-001', category: 'ingredients', unit: 'kg', currentStock: 35, minimumStock: 8, maximumStock: 80, reorderLevel: 12, costPrice: 7.49, supplier: { name: 'Premium Meats Co', contact: '+1-555-MEAT' }, isPerishable: true, shelfLife: 7 },
      { name: 'Fresh Salmon', sku: 'ING-SALM-001', category: 'ingredients', unit: 'kg', currentStock: 15, minimumStock: 5, maximumStock: 30, reorderLevel: 8, costPrice: 18.99, supplier: { name: 'Ocean Fresh Seafood', contact: '+1-555-FISH' }, isPerishable: true, shelfLife: 3 },
      { name: 'Mozzarella Cheese', sku: 'ING-MOZZ-001', category: 'ingredients', unit: 'kg', currentStock: 25, minimumStock: 5, maximumStock: 50, reorderLevel: 10, costPrice: 12.99, supplier: { name: 'Dairy Fresh Co', contact: '+1-555-DAIRY' }, isPerishable: true, shelfLife: 14 },
      { name: 'Pasta - Spaghetti', sku: 'ING-PAST-001', category: 'ingredients', unit: 'kg', currentStock: 40, minimumStock: 10, maximumStock: 100, reorderLevel: 15, costPrice: 2.99, supplier: { name: 'Italian Imports', contact: '+1-555-PASTA' }, shelfLife: 365 },
      { name: 'Tomatoes', sku: 'ING-TOM-001', category: 'ingredients', unit: 'kg', currentStock: 30, minimumStock: 8, maximumStock: 60, reorderLevel: 12, costPrice: 3.49, supplier: { name: 'Fresh Produce Co', contact: '+1-555-PRODUCE' }, isPerishable: true, shelfLife: 7 },
      { name: 'Onions', sku: 'ING-ONION-001', category: 'ingredients', unit: 'kg', currentStock: 20, minimumStock: 5, maximumStock: 40, reorderLevel: 8, costPrice: 1.99, supplier: { name: 'Fresh Produce Co', contact: '+1-555-PRODUCE' }, shelfLife: 30 },
      { name: 'Olive Oil', sku: 'ING-OIL-001', category: 'ingredients', unit: 'l', currentStock: 12, minimumStock: 3, maximumStock: 25, reorderLevel: 5, costPrice: 15.99, supplier: { name: 'Mediterranean Imports', contact: '+1-555-MED' }, shelfLife: 730 },

      // Beverages
      { name: 'Coca Cola', sku: 'BEV-COKE-001', category: 'beverages', unit: 'bottles', currentStock: 150, minimumStock: 50, maximumStock: 300, reorderLevel: 75, costPrice: 1.25, sellingPrice: 2.99, supplier: { name: 'Beverage Distributors', contact: '+1-555-BEV' }, shelfLife: 365 },
      { name: 'Orange Juice', sku: 'BEV-OJ-001', category: 'beverages', unit: 'l', currentStock: 25, minimumStock: 8, maximumStock: 50, reorderLevel: 12, costPrice: 3.99, sellingPrice: 4.99, supplier: { name: 'Fresh Juice Co', contact: '+1-555-JUICE' }, isPerishable: true, shelfLife: 10 },
      { name: 'Coffee Beans', sku: 'BEV-COFFEE-001', category: 'beverages', unit: 'kg', currentStock: 18, minimumStock: 5, maximumStock: 40, reorderLevel: 8, costPrice: 22.99, supplier: { name: 'Coffee Roasters Inc', contact: '+1-555-COFFEE' }, shelfLife: 180 },

      // Supplies
      { name: 'Paper Napkins', sku: 'SUP-NAP-001', category: 'supplies', unit: 'packets', currentStock: 100, minimumStock: 20, maximumStock: 200, reorderLevel: 30, costPrice: 0.75, supplier: { name: 'Restaurant Supply Co', contact: '+1-555-SUPPLY' } },
      { name: 'Plastic Cups', sku: 'SUP-CUP-001', category: 'supplies', unit: 'pieces', currentStock: 500, minimumStock: 100, maximumStock: 1000, reorderLevel: 150, costPrice: 0.05, supplier: { name: 'Restaurant Supply Co', contact: '+1-555-SUPPLY' } },
      { name: 'Aluminum Foil', sku: 'SUP-FOIL-001', category: 'supplies', unit: 'boxes', currentStock: 25, minimumStock: 5, maximumStock: 50, reorderLevel: 10, costPrice: 8.99, supplier: { name: 'Kitchen Supplies Ltd', contact: '+1-555-KITCHEN' } },

      // Packaging
      { name: 'Takeout Containers', sku: 'PAK-CONT-001', category: 'packaging', unit: 'pieces', currentStock: 300, minimumStock: 50, maximumStock: 500, reorderLevel: 75, costPrice: 0.35, supplier: { name: 'Eco Pack Solutions', contact: '+1-555-ECO' } },
      { name: 'Pizza Boxes', sku: 'PAK-PIZZA-001', category: 'packaging', unit: 'pieces', currentStock: 200, minimumStock: 30, maximumStock: 400, reorderLevel: 50, costPrice: 0.85, supplier: { name: 'Eco Pack Solutions', contact: '+1-555-ECO' } }
    ];

    const createdItems = await InventoryItem.insertMany(inventoryItems);
    console.log(`✅ ${createdItems.length} inventory items created`);
    return createdItems;
  } catch (error) {
    console.error('Error seeding inventory items:', error);
  }
};

// Seed Orders
const seedOrders = async (users, tables, menuItems) => {
  try {
    const waiters = users.filter(u => u.role === 'waiter');
    const customers = users.filter(u => u.role === 'customer');
    const occupiedTables = tables.filter(t => t.status === 'occupied');
    
    const orders = [];
    
    // Create orders for occupied tables
    for (let i = 0; i < occupiedTables.length && i < 3; i++) {
      const table = occupiedTables[i];
      const waiter = waiters[i % waiters.length];
      const customer = customers[i % customers.length];
      
      // Select random menu items
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 4) + 2; // 2-5 items
      
      for (let j = 0; j < numItems; j++) {
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        
        orderItems.push({
          menuItem: randomItem._id,
          quantity: quantity,
          price: randomItem.price,
          status: ['pending', 'preparing', 'ready'][Math.floor(Math.random() * 3)],
          specialInstructions: j === 0 ? 'Extra sauce please' : undefined
        });
      }
      
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.08; // 8% tax
      const serviceChargeAmount = subtotal * 0.10; // 10% service charge
      const totalAmount = subtotal + taxAmount + serviceChargeAmount;
      
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${dateString}-${String(i + 1).padStart(4, '0')}`;
      
      orders.push({
        orderNumber: orderNumber,
        orderType: 'dine_in',
        table: table._id,
        customer: {
          name: customer.fullName,
          phone: customer.phone,
          email: customer.email
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
        status: ['confirmed', 'preparing', 'ready'][Math.floor(Math.random() * 3)],
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        kot: {
          number: `KOT-${dateString}-${String(i + 1).padStart(4, '0')}`,
          printedAt: new Date()
        },
        preparationTime: {
          estimated: 25,
          startedAt: new Date(Date.now() - 15 * 60 * 1000) // Started 15 minutes ago
        },
        notes: 'Table prefers mild spice level',
        source: 'pos'
      });
    }
    
    // Create some takeaway orders
    for (let i = 0; i < 2; i++) {
      const customer = customers[i % customers.length];
      const orderItems = [];
      const numItems = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numItems; j++) {
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        orderItems.push({
          menuItem: randomItem._id,
          quantity: 1,
          price: randomItem.price,
          status: 'ready'
        });
      }
      
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.08;
      const totalAmount = subtotal + taxAmount;
      
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${dateString}-${String(occupiedTables.length + i + 1).padStart(4, '0')}`;
      
      orders.push({
        orderNumber: orderNumber,
        orderType: 'takeaway',
        customer: {
          name: customer.fullName,
          phone: customer.phone,
          email: customer.email
        },
        items: orderItems,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: {
          rate: 8,
          amount: Math.round(taxAmount * 100) / 100
        },
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        payments: [{
          amount: Math.round(totalAmount * 100) / 100,
          method: 'card',
          transactionId: `TXN-${Date.now()}-${i}`,
          status: 'success'
        }],
        source: 'pos',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });
    }
    
    // Create delivery orders
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const deliveryOrderNumber = `ORD-${dateString}-${String(occupiedTables.length + 3).padStart(4, '0')}`;
    
    const deliveryOrder = {
      orderNumber: deliveryOrderNumber,
      orderType: 'delivery',
      customer: {
        name: 'John Delivery',
        phone: '+1-555-9999',
        email: 'john.delivery@example.com',
        address: {
          street: '123 Delivery St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      },
      items: [
        {
          menuItem: menuItems[0]._id,
          quantity: 2,
          price: menuItems[0].price,
          status: 'served'
        },
        {
          menuItem: menuItems[5]._id,
          quantity: 1,
          price: menuItems[5].price,
          status: 'served'
        }
      ],
      subtotal: (menuItems[0].price * 2) + menuItems[5].price,
      tax: { rate: 8, amount: ((menuItems[0].price * 2) + menuItems[5].price) * 0.08 },
      deliveryCharge: 3.99,
      totalAmount: ((menuItems[0].price * 2) + menuItems[5].price) * 1.08 + 3.99,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      delivery: {
        address: '123 Delivery St, New York, NY 10001',
        estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
        deliveryPerson: 'Mike Delivery',
        trackingId: 'DEL-123456'
      },
      source: 'website'
    };
    
    orders.push(deliveryOrder);
    
    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ ${createdOrders.length} orders created`);
    return createdOrders;
  } catch (error) {
    console.error('Error seeding orders:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const categories = await seedCategories();
    const menuItems = await seedMenuItems(categories);
    const tables = await seedTables(users);
    const inventoryItems = await seedInventoryItems();
    const orders = await seedOrders(users, tables, menuItems);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users?.length || 0}`);
    console.log(`- Categories: ${categories?.length || 0}`);
    console.log(`- Menu Items: ${menuItems?.length || 0}`);
    console.log(`- Tables: ${tables?.length || 0}`);
    console.log(`- Inventory Items: ${inventoryItems?.length || 0}`);
    console.log(`- Orders: ${orders?.length || 0}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Manager: manager@restaurant.com / manager123');
    console.log('Cashier: cashier@restaurant.com / cashier123');
    console.log('Waiter: waiter@restaurant.com / waiter123');
    console.log('Kitchen: kitchen@restaurant.com / kitchen123');
    console.log('Customer: customer@example.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };