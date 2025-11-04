import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { menuAPI } from '../../services/api';

const MenuPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [menuItemDialog, setMenuItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 1,
    isActive: true
  });

  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    preparationTime: '',
    ingredients: '',
    allergens: '',
    tags: '',
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, menuItemsRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getMenuItems()
      ]);
      
      // Handle different response formats
      setCategories(categoriesRes.data.data || categoriesRes.data || []);
      setMenuItems(menuItemsRes.data.data || menuItemsRes.data.items || menuItemsRes.data || []);
    } catch (err) {
      setError('Failed to fetch menu data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await menuAPI.updateCategory(editingCategory._id, categoryForm);
        setSuccess('Category updated successfully');
      } else {
        await menuAPI.createCategory(categoryForm);
        setSuccess('Category created successfully');
      }
      setCategoryDialog(false);
      resetCategoryForm();
      fetchData();
    } catch (err) {
      setError('Failed to save category: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMenuItemSubmit = async () => {
    try {
      const formData = {
        ...menuItemForm,
        price: parseFloat(menuItemForm.price),
        preparationTime: parseInt(menuItemForm.preparationTime),
        ingredients: menuItemForm.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: menuItemForm.allergens.split(',').map(a => a.trim()).filter(a => a),
        tags: menuItemForm.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingMenuItem) {
        await menuAPI.updateMenuItem(editingMenuItem._id, formData);
        setSuccess('Menu item updated successfully');
      } else {
        await menuAPI.createMenuItem(formData);
        setSuccess('Menu item created successfully');
      }
      setMenuItemDialog(false);
      resetMenuItemForm();
      fetchData();
    } catch (err) {
      setError('Failed to save menu item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await menuAPI.deleteCategory(id);
        setSuccess('Category deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete category: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuAPI.deleteMenuItem(id);
        setSuccess('Menu item deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete menu item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      sortOrder: 1,
      isActive: true
    });
    setEditingCategory(null);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
      preparationTime: '',
      ingredients: '',
      allergens: '',
      tags: '',
      image: ''
    });
    setEditingMenuItem(null);
  };

  const openEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    setEditingCategory(category);
    setCategoryDialog(true);
  };

  const openEditMenuItem = (item) => {
    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category._id || item.category,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime?.toString() || '',
      ingredients: item.ingredients?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      tags: item.tags?.join(', ') || '',
      image: item.image || ''
    });
    setEditingMenuItem(item);
    setMenuItemDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Menu Management
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Categories" />
        <Tab label="Menu Items" />
      </Tabs>

      {/* Categories Tab */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Categories ({categories.length})</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetCategoryForm();
                setCategoryDialog(true);
              }}
            >
              Add Category
            </Button>
          </Box>

          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <CategoryIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{category.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Order: {category.sortOrder}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                    <Chip
                      label={category.isActive ? 'Active' : 'Inactive'}
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => openEditCategory(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCategory(category._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Menu Items Tab */}
      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Menu Items ({menuItems.length})</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetMenuItemForm();
                setMenuItemDialog(true);
              }}
            >
              Add Menu Item
            </Button>
          </Box>

          <Grid container spacing={3}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <RestaurantIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="h5" color="primary">
                          ${item.price}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Category: {item.category?.name || 'N/A'}
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={item.isAvailable ? 'Available' : 'Unavailable'}
                        color={item.isAvailable ? 'success' : 'default'}
                        size="small"
                      />
                      {item.preparationTime && (
                        <Chip
                          label={`${item.preparationTime} min`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => openEditMenuItem(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMenuItem(item._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Display Order"
            type="number"
            value={categoryForm.sortOrder}
            onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={categoryForm.isActive}
                onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCategorySubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialog} onClose={() => setMenuItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                step="0.01"
                value={menuItemForm.price}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={menuItemForm.category}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preparation Time (minutes)"
                type="number"
                value={menuItemForm.preparationTime}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, preparationTime: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ingredients (comma-separated)"
                value={menuItemForm.ingredients}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, ingredients: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Allergens (comma-separated)"
                value={menuItemForm.allergens}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, allergens: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={menuItemForm.tags}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, tags: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={menuItemForm.image}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, image: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={menuItemForm.isAvailable}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
                  />
                }
                label="Available"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuItemDialog(false)}>Cancel</Button>
          <Button onClick={handleMenuItemSubmit} variant="contained">
            {editingMenuItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPage;