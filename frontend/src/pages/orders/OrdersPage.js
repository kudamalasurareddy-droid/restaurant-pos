import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Restaurant as RestaurantIcon,
  Kitchen as KitchenIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  TableChart as TableIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
  LocalShipping as DeliveryIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { ordersAPI, menuAPI } from '../../services/api';

const OrdersPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemSelectionDialog, setItemSelectionDialog] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  // Form state
  const [orderForm, setOrderForm] = useState({
    orderType: 'dine_in',
    table: '',
    customer: '',
    waiter: '',
    items: [],
    notes: '',
    status: 'pending'
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (orderTypeFilter !== 'all') params.orderType = orderTypeFilter;
      
      const response = await ordersAPI.getOrders(params);
      setOrders(response.data?.orders || []);
    } catch (err) {
      setError('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, orderTypeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [tabValue, fetchOrders]);

  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const response = await menuAPI.getMenuItems({ isAvailable: true });
      setMenuItems(response.data?.items || []);
    } catch (err) {
      setError('Failed to fetch menu items: ' + (err.response?.data?.message || err.message));
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      // Validate required fields
      if (!orderForm.orderType) {
        setError('Order type is required');
        return;
      }
      
      if (!orderForm.items || orderForm.items.length === 0) {
        setError('At least one item is required to create an order');
        return;
      }

      if (orderForm.orderType === 'dine_in' && !orderForm.table) {
        setError('Table is required for dine-in orders');
        return;
      }

      setLoading(true);
      const response = await ordersAPI.createOrder(orderForm);
      setOrders([response.data, ...orders]);
      setSuccess('Order created successfully');
      setCreateDialog(false);
      resetForm();
    } catch (err) {
      setError('Failed to create order: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.updateOrderStatus(selectedOrder._id, { status: orderForm.status });
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, ...response.data.order } : order
      ));
      setSuccess('Order updated successfully');
      setEditDialog(false);
      resetForm();
    } catch (err) {
      setError('Failed to update order: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      await ordersAPI.cancelOrder(selectedOrder._id, 'Cancelled by admin');
      setOrders(orders.filter(order => order._id !== selectedOrder._id));
      setSuccess('Order cancelled successfully');
      setDeleteDialog(false);
      setSelectedOrder(null);
    } catch (err) {
      setError('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToOrder = (menuItem, quantity = 1) => {
    const orderItem = {
      menuItem: menuItem._id,
      name: menuItem.name,
      quantity: quantity,
      price: menuItem.price,
      variant: '',
      specialInstructions: ''
    };
    
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, orderItem]
    });
    
    setItemSelectionDialog(false);
  };

  const resetForm = () => {
    setOrderForm({
      orderType: 'dine_in',
      table: '',
      customer: '',
      waiter: '',
      items: [],
      notes: '',
      status: 'pending'
    });
    setSelectedOrder(null);
  };



  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      ready: 'success',
      served: 'success',
      completed: 'default',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <TimerIcon />,
      confirmed: <CheckCircleIcon />,
      preparing: <KitchenIcon />,
      ready: <RestaurantIcon />,
      served: <CheckCircleIcon />,
      completed: <CheckCircleIcon />,
      cancelled: <CancelIcon />
    };
    return icons[status] || <TimerIcon />;
  };

  const getOrderTypeIcon = (type) => {
    const icons = {
      'dine_in': <TableIcon />,
      'takeaway': <ReceiptIcon />,
      'delivery': <DeliveryIcon />
    };
    return icons[type] || <ReceiptIcon />;
  };

  const filteredOrders = orders.filter(order => {
    const customerName = typeof order.customer === 'object' ? order.customer?.name : order.customer;
    const tableName = typeof order.table === 'object' ? (order.table?.tableName || order.table?.tableNumber) : order.table;
    
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tableName && tableName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTab = true;
    switch (tabValue) {
      case 1: // Active Orders
        matchesTab = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
        break;
      case 2: // Completed Orders
        matchesTab = ['served', 'completed'].includes(order.status);
        break;
      case 3: // Cancelled Orders
        matchesTab = order.status === 'cancelled';
        break;
      default: // All Orders
        matchesTab = true;
    }
    
    return matchesSearch && matchesTab;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Orders Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            New Order
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`All Orders (${orders.length})`} />
        <Tab label={`Active (${orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length})`} />
        <Tab label={`Completed (${orders.filter(o => ['served', 'completed'].includes(o.status)).length})`} />
        <Tab label={`Cancelled (${orders.filter(o => o.status === 'cancelled').length})`} />
      </Tabs>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="served">Served</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="dine-in">Dine In</MenuItem>
                <MenuItem value="takeaway">Takeaway</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Orders List */}
      <Grid container spacing={2}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card>
              <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getOrderTypeIcon(order.orderType)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(order.createdAt)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Chip
                      label={order.status?.toUpperCase() || 'UNKNOWN'}
                      color={getStatusColor(order.status)}
                      size="small"
                      icon={getStatusIcon(order.status)}
                    />
                    <Chip
                      label={order.orderType?.replace('-', ' ')?.toUpperCase() || 'UNKNOWN'}
                      variant="outlined"
                      size="small"
                    />
                    {order.paymentStatus && (
                      <Chip
                        label={`Payment: ${order.paymentStatus}`}
                        color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>                  <Box textAlign="right">
                    <Typography variant="h6" color="primary">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.items?.length} items
                    </Typography>
                    {order.estimatedTime && (
                      <Typography variant="caption" color="text.secondary">
                        Est. {order.estimatedTime} min
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Customer</Typography>
                    <Typography variant="body2">
                      {typeof order.customer === 'object' ? order.customer?.name : order.customer}
                    </Typography>
                  </Grid>
                  {order.table && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Table</Typography>
                      <Typography variant="body2">
                        {typeof order.table === 'object' ? order.table?.tableName || order.table?.tableNumber : order.table}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Waiter</Typography>
                    <Typography variant="body2">
                      {typeof order.waiter === 'object' 
                        ? (order.waiter?.fullName || `${order.waiter?.firstName} ${order.waiter?.lastName}` || order.waiter?.name)
                        : order.waiter}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Payment</Typography>
                    <Typography variant="body2">{order.paymentMethod?.toUpperCase()}</Typography>
                  </Grid>
                </Grid>

                {/* Order Items Accordion */}
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Order Items ({order.items?.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {(order.items || []).map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${item.quantity}x ${item.name}`}
                            secondary={item.category}
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="body2">
                              {formatCurrency(item.total || (item.price * item.quantity))}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Subtotal" />
                        <ListItemSecondaryAction>
                          <Typography variant="body2">
                            {formatCurrency(order.subtotal)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Tax" />
                        <ListItemSecondaryAction>
                          <Typography variant="body2">
                            {formatCurrency(order.tax)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography variant="subtitle2">Total</Typography>}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="subtitle2" color="primary">
                            {formatCurrency(order.totalAmount)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                {order.notes && (
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">Notes:</Typography>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => {
                    setSelectedOrder(order);
                    setViewDialog(true);
                  }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setSelectedOrder(order);
                    setOrderForm({ ...orderForm, status: order.status });
                    setEditDialog(true);
                  }}
                >
                  Update Status
                </Button>
                <Button
                  size="small"
                  startIcon={<PrintIcon />}
                  color="info"
                >
                  Print
                </Button>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <Button
                    size="small"
                    startIcon={<CancelIcon />}
                    color="error"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDeleteDialog(true);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOrders.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? 'No orders available' : 'No orders match the current filter'}
          </Typography>
        </Paper>
      )}

      {/* Create Order Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={orderForm.orderType}
                  onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                  label="Order Type"
                >
                  <MenuItem value="dine_in">Dine In</MenuItem>
                  <MenuItem value="takeaway">Takeaway</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={orderForm.customer}
                onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
              />
            </Grid>
            {orderForm.orderType === 'dine_in' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Table"
                  value={orderForm.table}
                  onChange={(e) => setOrderForm({ ...orderForm, table: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Waiter"
                value={orderForm.waiter}
                onChange={(e) => setOrderForm({ ...orderForm, waiter: e.target.value })}
              />
            </Grid>
            
            {/* Items Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {orderForm.items.length === 0 ? (
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    No items added. Click "Add Item" to start building the order.
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  {orderForm.items.map((item, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1">
                            {item.name || 'Sample Item'} x {item.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${item.price.toFixed(2)} each
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                const newItems = [...orderForm.items];
                                if (newItems[index].quantity > 1) {
                                  newItems[index].quantity--;
                                  setOrderForm({ ...orderForm, items: newItems });
                                }
                              }}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                const newItems = [...orderForm.items];
                                newItems[index].quantity++;
                                setOrderForm({ ...orderForm, items: newItems });
                              }}
                            >
                              +
                            </IconButton>
                          </Box>
                          <Typography variant="h6">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              const newItems = orderForm.items.filter((_, i) => i !== index);
                              setOrderForm({ ...orderForm, items: newItems });
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" textAlign="right">
                      Total: ${orderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  fetchMenuItems();
                  setItemSelectionDialog(true);
                }}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateOrder} 
            variant="contained"
            disabled={orderForm.items.length === 0 || loading}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={orderForm.status}
              onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="served">Served</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateOrder} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
              {selectedOrder && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Order Information</Typography>
                      <Typography variant="body2">Type: {selectedOrder.orderType}</Typography>
                      <Typography variant="body2">Status: {selectedOrder.status}</Typography>
                      <Typography variant="body2">Created: {formatTime(selectedOrder.createdAt)}</Typography>
                      {selectedOrder.estimatedTime && (
                        <Typography variant="body2">Est. Time: {selectedOrder.estimatedTime} min</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Customer Information</Typography>
                      <Typography variant="body2">
                        Name: {typeof selectedOrder.customer === 'object' ? selectedOrder.customer?.name : selectedOrder.customer}
                      </Typography>
                      {selectedOrder.table && (
                        <Typography variant="body2">
                          Table: {typeof selectedOrder.table === 'object' 
                            ? (selectedOrder.table?.tableName || selectedOrder.table?.tableNumber) 
                            : selectedOrder.table}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        Waiter: {typeof selectedOrder.waiter === 'object' 
                          ? (selectedOrder.waiter?.fullName || `${selectedOrder.waiter?.firstName} ${selectedOrder.waiter?.lastName}` || selectedOrder.waiter?.name)
                          : selectedOrder.waiter}
                      </Typography>
                      <Typography variant="body2">Payment: {selectedOrder.paymentMethod}</Typography>
                    </Grid>
                  </Grid>              <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedOrder.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total || (item.price * item.quantity))}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4}><strong>Subtotal</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedOrder.subtotal)}</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}><strong>Tax</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedOrder.tax)}</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedOrder.notes && (
                <Box mt={3}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2">{selectedOrder.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel order {selectedOrder?.orderNumber}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>No, Keep Order</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Selection Dialog */}
      <Dialog 
        open={itemSelectionDialog} 
        onClose={() => setItemSelectionDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Select Menu Item</DialogTitle>
        <DialogContent>
          {menuLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <LinearProgress />
              <Typography ml={2}>Loading menu items...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {menuItems.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No menu items available
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                menuItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.description}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${item.price.toFixed(2)}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip 
                            label={typeof item.category === 'object' ? item.category?.name : 'Category'} 
                            size="small" 
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {item.preparationTime} min
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => handleAddItemToOrder(item, 1)}
                          disabled={!item.isAvailable}
                        >
                          {item.isAvailable ? 'Add to Order' : 'Unavailable'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemSelectionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;