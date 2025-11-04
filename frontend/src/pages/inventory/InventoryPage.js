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
  Alert,
  Tab,
  Tabs,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingDown as LowStockIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { inventoryAPI } from '../../services/api';

const InventoryPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [itemDialog, setItemDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    reorderLevel: '',
    costPrice: '',
    sellingPrice: '',
    supplier: {
      name: '',
      contact: '',
      email: ''
    },
    description: ''
  });

  const [stockForm, setStockForm] = useState({
    type: 'in',
    quantity: '',
    reason: '',
    reference: '',
    notes: ''
  });

  const categories = ['ingredients', 'beverages', 'supplies', 'raw_materials', 'packaging'];
  const units = ['kg', 'g', 'l', 'ml', 'pieces', 'packets', 'boxes', 'bottles'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, lowStockRes, movementsRes] = await Promise.all([
        inventoryAPI.getInventoryItems(),
        inventoryAPI.getLowStockItems(),
        inventoryAPI.getStockMovements({ limit: 50 })
      ]);
      
      // Handle different response formats from backend
      setInventoryItems(itemsRes.data.items || itemsRes.data || []);
      setLowStockItems(lowStockRes.data || []);
      setStockMovements(movementsRes.data.movements || movementsRes.data || []);
    } catch (err) {
      setError('Failed to fetch inventory data: ' + (err.response?.data?.message || err.message));
    } finally {
    }
  };

  const handleItemSubmit = async () => {
    try {
      const formData = {
        ...itemForm,
        currentStock: parseInt(itemForm.currentStock),
        minimumStock: parseInt(itemForm.minimumStock),
        maximumStock: parseInt(itemForm.maximumStock),
        reorderLevel: parseInt(itemForm.reorderLevel),
        costPrice: parseFloat(itemForm.costPrice),
        sellingPrice: parseFloat(itemForm.sellingPrice) || 0
      };

      if (editingItem) {
        await inventoryAPI.updateInventoryItem(editingItem._id, formData);
        setSuccess('Inventory item updated successfully');
      } else {
        await inventoryAPI.createInventoryItem(formData);
        setSuccess('Inventory item created successfully');
      }
      setItemDialog(false);
      resetItemForm();
      fetchData();
    } catch (err) {
      setError('Failed to save inventory item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStockUpdate = async () => {
    try {
      const stockData = {
        type: stockForm.type,
        quantity: parseInt(stockForm.quantity),
        reason: stockForm.reason,
        reference: stockForm.reference,
        notes: stockForm.notes
      };

      await inventoryAPI.updateStock(selectedItem._id, stockData);
      setSuccess(`Stock ${stockForm.type === 'in' ? 'added' : 'removed'} successfully`);
      setStockDialog(false);
      resetStockForm();
      fetchData();
    } catch (err) {
      setError('Failed to update stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryAPI.deleteInventoryItem(id);
        setSuccess('Inventory item deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete inventory item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      sku: '',
      category: '',
      unit: '',
      currentStock: '',
      minimumStock: '',
      maximumStock: '',
      reorderLevel: '',
      costPrice: '',
      sellingPrice: '',
      supplier: {
        name: '',
        contact: '',
        email: ''
      },
      description: ''
    });
    setEditingItem(null);
  };

  const resetStockForm = () => {
    setStockForm({
      type: 'in',
      quantity: '',
      reason: '',
      reference: '',
      notes: ''
    });
    setSelectedItem(null);
  };

  const openEditItem = (item) => {
    setItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minimumStock: item.minimumStock.toString(),
      maximumStock: item.maximumStock.toString(),
      reorderLevel: item.reorderLevel.toString(),
      costPrice: item.costPrice.toString(),
      sellingPrice: item.sellingPrice?.toString() || '0',
      supplier: {
        name: item.supplier?.name || '',
        contact: item.supplier?.contact || '',
        email: item.supplier?.email || ''
      },
      description: item.description || ''
    });
    setEditingItem(item);
    setItemDialog(true);
  };

  const openStockDialog = (item) => {
    setSelectedItem(item);
    setStockDialog(true);
  };

  const getStockStatus = (item) => {
    if (item.currentStock <= item.minimumStock) return 'critical';
    if (item.currentStock <= item.reorderLevel) return 'low';
    if (item.currentStock >= item.maximumStock) return 'overstock';
    return 'normal';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'critical': return 'error';
      case 'low': return 'warning';
      case 'overstock': return 'info';
      default: return 'success';
    }
  };

  const getStockPercentage = (item) => {
    return Math.min((item.currentStock / item.maximumStock) * 100, 100);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`All Items (${inventoryItems.length})`} />
        <Tab 
          label={
            <Badge badgeContent={lowStockItems.length} color="error">
              Low Stock
            </Badge>
          } 
        />
        <Tab label="Stock Movements" />
      </Tabs>

      {/* All Items Tab */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Inventory Items</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetItemForm();
                setItemDialog(true);
              }}
            >
              Add Item
            </Button>
          </Box>

          <Grid container spacing={3}>
            {inventoryItems.map((item) => {
              const status = getStockStatus(item);
              const percentage = getStockPercentage(item);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getStockColor(status) + '.main', 
                            mr: 2 
                          }}
                        >
                          <InventoryIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {item.sku}
                          </Typography>
                        </Box>
                        {status === 'critical' && <WarningIcon color="error" />}
                        {status === 'low' && <LowStockIcon color="warning" />}
                      </Box>

                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">
                            Stock: {item.currentStock} {item.unit}
                          </Typography>
                          <Typography variant="body2">
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage}
                          color={getStockColor(status)}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Category: <Chip label={item.category} size="small" />
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Min: {item.minimumStock} | Max: {item.maximumStock}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Cost: ${item.costPrice} per {item.unit}
                      </Typography>

                      {item.supplier?.name && (
                        <Typography variant="caption" color="text.secondary">
                          Supplier: {item.supplier.name}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => openStockDialog(item)}>
                        <StoreIcon />
                      </IconButton>
                      <IconButton onClick={() => openEditItem(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Low Stock Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Low Stock Items ({lowStockItems.length})
          </Typography>
          
          {lowStockItems.length === 0 ? (
            <Alert severity="success">
              All items are well stocked!
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Minimum Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.minimumStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStockStatus(item)}
                          color={getStockColor(getStockStatus(item))}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => openStockDialog(item)}
                        >
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Stock Movements Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recent Stock Movements
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockMovements.map((movement, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{movement.item?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={movement.type}
                        color={movement.type === 'in' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {movement.quantity} {movement.item?.unit}
                    </TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>{movement.reference || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog} onClose={() => setItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={itemForm.sku}
                onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Unit</InputLabel>
                <Select
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={itemForm.currentStock}
                onChange={(e) => setItemForm({ ...itemForm, currentStock: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={itemForm.minimumStock}
                onChange={(e) => setItemForm({ ...itemForm, minimumStock: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Stock"
                type="number"
                value={itemForm.maximumStock}
                onChange={(e) => setItemForm({ ...itemForm, maximumStock: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                value={itemForm.reorderLevel}
                onChange={(e) => setItemForm({ ...itemForm, reorderLevel: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                step="0.01"
                value={itemForm.costPrice}
                onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                step="0.01"
                value={itemForm.sellingPrice}
                onChange={(e) => setItemForm({ ...itemForm, sellingPrice: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={itemForm.supplier.name}
                onChange={(e) => setItemForm({ 
                  ...itemForm, 
                  supplier: { ...itemForm.supplier, name: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Supplier Contact"
                value={itemForm.supplier.contact}
                onChange={(e) => setItemForm({ 
                  ...itemForm, 
                  supplier: { ...itemForm.supplier, contact: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Supplier Email"
                value={itemForm.supplier.email}
                onChange={(e) => setItemForm({ 
                  ...itemForm, 
                  supplier: { ...itemForm.supplier, email: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>Cancel</Button>
          <Button onClick={handleItemSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialog} onClose={() => setStockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Stock - {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Stock: {selectedItem?.currentStock} {selectedItem?.unit}
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={stockForm.type}
              onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
            >
              <MenuItem value="in">Stock In</MenuItem>
              <MenuItem value="out">Stock Out</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={stockForm.quantity}
            onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Reason"
            value={stockForm.reason}
            onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Reference (PO#, Invoice#, etc.)"
            value={stockForm.reference}
            onChange={(e) => setStockForm({ ...stockForm, reference: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Notes"
            value={stockForm.notes}
            onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialog(false)}>Cancel</Button>
          <Button onClick={handleStockUpdate} variant="contained">
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;