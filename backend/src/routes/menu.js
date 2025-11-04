const express = require('express');
const { Category, MenuItem } = require('../models/Menu');
const { protect, authorize, checkPermission } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menu/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// CATEGORY ROUTES

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// @desc    Create new category
// @route   POST /api/menu/categories
// @access  Private (Admin/Manager)
router.post('/categories', protect, checkPermission('menu', 'create'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, parentCategory, color, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
      parentCategory: parentCategory || null,
      color: color || '#007bff',
      sortOrder: sortOrder || 0
    };

    if (req.file) {
      categoryData.image = `/uploads/menu/${req.file.filename}`;
    }

    const category = await Category.create(categoryData);
    const populatedCategory = await Category.findById(category._id).populate('parentCategory', 'name');

    res.status(201).json(populatedCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private (Admin/Manager)
router.put('/categories/:id', protect, checkPermission('menu', 'update'), upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, parentCategory, color, sortOrder, isActive } = req.body;

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description?.trim();
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (color) category.color = color;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
      category.image = `/uploads/menu/${req.file.filename}`;
    }

    const updatedCategory = await category.save();
    const populatedCategory = await Category.findById(updatedCategory._id).populate('parentCategory', 'name');

    res.json(populatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
});

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private (Admin)
router.delete('/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has menu items
    const itemCount = await MenuItem.countDocuments({ category: req.params.id });
    if (itemCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${itemCount} menu items assigned to it.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
});

// MENU ITEM ROUTES

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Private
router.get('/items', protect, async (req, res) => {
  try {
    const { category, search, isAvailable, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MenuItem.find(query)
      .populate('category', 'name color')
      .populate('addOns', 'name price')
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MenuItem.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error fetching menu items' });
  }
});

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Private
router.get('/items/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('category', 'name color')
      .populate('addOns', 'name price description');

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ message: 'Server error fetching menu item' });
  }
});

// @desc    Create new menu item
// @route   POST /api/menu/items
// @access  Private (Admin/Manager)
router.post('/items', protect, checkPermission('menu', 'create'), upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, description, category, price, costPrice, isVegetarian, isVegan, 
      isGlutenFree, spiceLevel, preparationTime, calories, allergens,
      ingredients, nutritionalInfo, variants, addOns, tags, discount
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const itemData = {
      name: name.trim(),
      description: description?.trim(),
      category,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      isVegetarian: isVegetarian === 'true' || isVegetarian === true,
      isVegan: isVegan === 'true' || isVegan === true,
      isGlutenFree: isGlutenFree === 'true' || isGlutenFree === true,
      spiceLevel: spiceLevel || 'mild',
      preparationTime: preparationTime ? parseInt(preparationTime) : 15,
      calories: calories ? parseInt(calories) : 0
    };

    // Handle arrays and objects only if they are strings
    if (allergens) itemData.allergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    if (ingredients) itemData.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    if (nutritionalInfo) itemData.nutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
    if (variants) itemData.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    if (addOns) itemData.addOns = typeof addOns === 'string' ? JSON.parse(addOns) : addOns;
    if (tags) itemData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (discount) itemData.discount = typeof discount === 'string' ? JSON.parse(discount) : discount;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map(file => `/uploads/menu/${file.filename}`);
      itemData.image = itemData.images[0]; // First image as primary
    }

    const item = await MenuItem.create(itemData);
    const populatedItem = await MenuItem.findById(item._id)
      .populate('category', 'name color')
      .populate('addOns', 'name price');

    res.status(201).json(populatedItem);
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('Create menu item error:', error);
    console.error('Request body:', req.body);
    console.error('Constructed itemData:', itemData);
    if (error.errors) {
      // Mongoose validation errors
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    if (error.stack) console.error(error.stack);
    res.status(500).json({ 
      message: 'Server error creating menu item', 
      error: error.message,
      validation: error.errors ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v.message])) : undefined
    });
  }
});

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private (Admin/Manager)
router.put('/items/:id', protect, checkPermission('menu', 'update'), upload.array('images', 5), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const {
      name, description, category, price, costPrice, isVegetarian, isVegan,
      isGlutenFree, spiceLevel, preparationTime, calories, allergens,
      ingredients, nutritionalInfo, variants, addOns, tags, discount,
      isAvailable, isActive, sortOrder
    } = req.body;

    // Update basic fields
    if (name) item.name = name.trim();
    if (description !== undefined) item.description = description?.trim();
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      item.category = category;
    }
    if (price) item.price = parseFloat(price);
    if (costPrice !== undefined) item.costPrice = parseFloat(costPrice) || 0;
    if (isVegetarian !== undefined) item.isVegetarian = isVegetarian === 'true' || isVegetarian === true;
    if (isVegan !== undefined) item.isVegan = isVegan === 'true' || isVegan === true;
    if (isGlutenFree !== undefined) item.isGlutenFree = isGlutenFree === 'true' || isGlutenFree === true;
    if (spiceLevel) item.spiceLevel = spiceLevel;
    if (preparationTime) item.preparationTime = parseInt(preparationTime);
    if (calories !== undefined) item.calories = parseInt(calories) || 0;
    if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isActive !== undefined) item.isActive = isActive === 'true' || isActive === true;
    if (sortOrder !== undefined) item.sortOrder = parseInt(sortOrder) || 0;

    // Handle arrays and objects only if they are strings
    if (allergens) item.allergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    if (ingredients) item.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    if (nutritionalInfo) item.nutritionalInfo = typeof nutritionalInfo === 'string' ? JSON.parse(nutritionalInfo) : nutritionalInfo;
    if (variants) item.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    if (addOns) item.addOns = typeof addOns === 'string' ? JSON.parse(addOns) : addOns;
    if (tags) item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (discount) item.discount = typeof discount === 'string' ? JSON.parse(discount) : discount;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/menu/${file.filename}`);
      item.images = [...(item.images || []), ...newImages];
      if (!item.image) item.image = newImages[0];
    }

    const updatedItem = await item.save();
    const populatedItem = await MenuItem.findById(updatedItem._id)
      .populate('category', 'name color')
      .populate('addOns', 'name price');

    res.json(populatedItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error updating menu item' });
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private (Admin)
router.delete('/items/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error deleting menu item' });
  }
});

// @desc    Update menu item availability
// @route   PATCH /api/menu/items/:id/availability
// @access  Private
router.patch('/items/:id/availability', protect, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    ).populate('category', 'name color');

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Emit real-time update
    req.io.emit('menuItemAvailabilityUpdate', {
      itemId: item._id,
      isAvailable: item.isAvailable,
      name: item.name
    });

    res.json(item);
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error updating availability' });
  }
});

// @desc    Get menu for public display (customer app/website)
// @route   GET /api/menu/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    const items = await MenuItem.find({ 
      isActive: true, 
      isAvailable: true 
    })
      .populate('category', 'name color')
      .select('-costPrice -ingredients -totalSold -popularity')
      .sort({ sortOrder: 1, name: 1 });

    // Group items by category
    const menuByCategory = categories.map(category => ({
      category,
      items: items.filter(item => item.category._id.toString() === category._id.toString())
    }));

    res.json(menuByCategory);
  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({ message: 'Server error fetching menu' });
  }
});

module.exports = router;