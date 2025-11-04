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
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Badge,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalDining as DiningIcon,
  Fastfood as FastfoodIcon,
  LocalBar as DrinkIcon,
  Cake as DessertIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { menuAPI, ordersAPI, tablesAPI } from '../../services/api';

const POSInterface = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [customerDialog, setCustomerDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Order form states
  const [orderForm, setOrderForm] = useState({
    orderType: 'dine-in',
    table: '',
    customer: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    notes: '',
    paymentMethod: 'cash',
    discount: {
      type: 'percentage',
      value: 0
    }
  });

  const [selectedOrder] = useState(null);
  const [paymentType, setPaymentType] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch categories, menu items, and tables
      const [categoriesRes, menuRes, tablesRes] = await Promise.all([
        menuAPI.getCategories().catch((err) => {
          console.error('Categories API error:', err);
          return { data: { categories: [] } };
        }),
        // Do not filter by isAvailable/isActive to avoid excluding items without explicit flags
        menuAPI.getMenuItems({ limit: 200 }).catch((err) => {
          console.error('Menu items API error:', err);
          return { data: [] };
        }),
        tablesAPI.getTables().catch((err) => {
          console.error('Tables API error:', err);
          return { data: { tables: [] } };
        })
      ]);

      // Handle API response format
      console.log('Categories response:', categoriesRes.data);
      console.log('Menu items response:', menuRes.data);
      console.log('Tables response:', tablesRes.data);

      // Extract data from API responses
      const categories = categoriesRes.data?.success ? categoriesRes.data.data : (categoriesRes.data?.categories || []);
      const items = menuRes.data?.success ? menuRes.data.data : (menuRes.data || []);
      const tables = tablesRes.data?.success 
        ? tablesRes.data.data 
        : (Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data?.tables || []));

      console.log('Extracted categories:', categories);
      console.log('Extracted menu items:', items);
      console.log('Extracted tables:', tables);

      setCategories(categories);
      setMenuItems(items);
      setTables(tables);
    } catch (err) {
      setError('Failed to load POS data. Please check your connection and try again.');
      console.error('POS data loading error:', err);
      // No fallback data - rely on API calls only
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (orderForm.discount.type === 'percentage') {
      return (subtotal * orderForm.discount.value) / 100;
    } else {
      return Math.min(orderForm.discount.value, subtotal);
    }
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart before placing order');
      return;
    }

    if (orderForm.orderType === 'dine-in' && !orderForm.table) {
      setError('Please select a table for dine-in orders');
      return;
    }

    try {
      setLoading(true);
      // Normalize order type to API enum
      const normalizedOrderType = orderForm.orderType === 'dine-in' ? 'dine_in' : orderForm.orderType;
      
      const orderData = {
        orderType: normalizedOrderType,
        table: orderForm.orderType === 'dine-in' ? orderForm.table : null,
        customer: orderForm.customer,
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          // backend will use menuItem.price if price not sent
          specialInstructions: ''
        })),
        tax: { rate: 10 },
        discount: { type: orderForm.discount.type, value: orderForm.discount.value },
        paymentMethod: orderForm.paymentMethod,
        notes: orderForm.notes,
        status: 'pending'
      };

      const created = await ordersAPI.createOrder(orderData);
      setSuccess('Order placed successfully!');
      
      // If card payment, immediately open Stripe checkout and show QR
      if (orderForm.paymentMethod === 'card' && created?.data?._id) {
        try {
          const checkout = await ordersAPI.createStripeCheckout(created.data._id);
          const { url, qrCode } = checkout.data || {};
          if (url) {
            window.open(url, '_blank');
          }
          if (qrCode) {
            const w = window.open('', '_blank', 'width=320,height=360');
            if (w) {
              w.document.write(`<html><body style="margin:0;padding:16px;font-family:sans-serif;">` +
                `<h3 style="margin:0 0 8px">Pay for Order ${created.data.orderNumber || ''}</h3>` +
                `<img src="${qrCode}" alt="QR Code" style="width:256px;height:256px" />` +
                (url ? `<p><a href="${url}" target="_blank">Open payment page</a></p>` : '') +
                `<p style="color:#666">Stripe test: 4242 4242 4242 4242, any future date, any CVC.</p>` +
                `</body></html>`);
            }
          }
        } catch (e) {
          console.warn('Stripe checkout (POS) failed:', e);
          setError('Could not start online payment');
        }
      }

      // Reset form and cart
      clearCart();
      setOrderForm({
        orderType: 'dine-in',
        table: '',
        customer: { name: '', phone: '', email: '', address: '' },
        notes: '',
        paymentMethod: 'cash',
        discount: { type: 'percentage', value: 0 }
      });
      setPaymentDialog(false);
      
    } catch (err) {
      setError('Failed to place order: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  // Simulate cash payment
  const handleCashPayment = () => {
    // Call backend API to mark order as paid by cash
    // await api.payOrder({ orderId: selectedOrder._id, method: 'cash' });
    setShowPayment(false);
    setPaymentType('');
    alert('Cash payment recorded!');
  };

  // Simulate Stripe payment
  const handleStripePayment = async () => {
    // Call backend to create Stripe session and get URL
    // const { url } = await api.createStripeSession({ orderId: selectedOrder._id });
    // setStripeSessionUrl(url);
    window.open('https://buy.stripe.com/test_xxx', '_blank'); // Replace with real session URL
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
      item.category === selectedCategory || 
      item.category?._id === selectedCategory ||
      (typeof item.category === 'object' && item.category?._id === selectedCategory);
    const matchesSearch = searchTerm === '' || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvailable = item.available !== false && item.isAvailable !== false;
    
    console.log('Filtering item:', {
      name: item.name,
      category: item.category,
      selectedCategory,
      matchesCategory,
      matchesSearch,
      isAvailable
    });
    
    return matchesCategory && matchesSearch && isAvailable;
  });

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('appetizer') || name.includes('starter')) return <DiningIcon />;
    if (name.includes('main') || name.includes('course')) return <RestaurantIcon />;
    if (name.includes('beverage') || name.includes('drink')) return <DrinkIcon />;
    if (name.includes('dessert') || name.includes('sweet')) return <DessertIcon />;
    return <FastfoodIcon />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Point of Sale
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderForm.orderType}
                onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                label="Order Type"
              >
                <MenuItem value="dine-in">Dine In</MenuItem>
                <MenuItem value="takeaway">Takeaway</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
              </Select>
            </FormControl>
            {cart.length > 0 && (
              <Badge badgeContent={cart.reduce((sum, item) => sum + item.quantity, 0)} color="primary">
                <CartIcon />
              </Badge>
            )}
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Menu Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
            {/* Search and Categories */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label="All Items"
                  onClick={() => setSelectedCategory('all')}
                  color={selectedCategory === 'all' ? 'primary' : 'default'}
                  icon={<RestaurantIcon />}
                />
                {categories.map((category) => {
                  console.log('Rendering category:', category);
                  return (
                    <Chip
                      key={category._id}
                      label={category.name}
                      onClick={() => {
                        console.log('Selected category:', category._id);
                        setSelectedCategory(category._id);
                      }}
                      color={selectedCategory === category._id ? 'primary' : 'default'}
                      icon={getCategoryIcon(category.name)}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Menu Items Grid */}
            <Grid container spacing={2} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
              {console.log('Total menu items:', menuItems.length, 'Filtered items:', filteredMenuItems.length)}
              {filteredMenuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                    onClick={() => addToCart(item)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(item.price)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {filteredMenuItems.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  {menuItems.length === 0
                    ? 'No menu items available. Please add menu items in the admin panel.'
                    : 'No menu items match your search or category filter.'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {menuItems.length === 0
                    ? 'Check your backend API or database connection.'
                    : 'Try adjusting your search or category filter.'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Order Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Typography>
              {cart.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={clearCart}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Cart Items */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              {cart.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Cart is empty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add items from the menu
                  </Typography>
                </Box>
              ) : (
                <List>
                  {cart.map((item) => (
                    <ListItem key={item._id} divider>
                      <ListItemText
                        primary={item.name}
                        secondary={formatCurrency(item.price)}
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Order Summary */}
            {cart.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(calculateSubtotal())}</Typography>
                </Box>
                {orderForm.discount.value > 0 && (
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography color="success.main">
                      Discount ({orderForm.discount.value}{orderForm.discount.type === 'percentage' ? '%' : ' off'}):
                    </Typography>
                    <Typography color="success.main">
                      -{formatCurrency(calculateDiscount())}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Tax (10%):</Typography>
                  <Typography>{formatCurrency(calculateTax())}</Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setCustomerDialog(true)}
                    startIcon={<PersonIcon />}
                  >
                    Customer
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setPaymentDialog(true)}
                    startIcon={<PaymentIcon />}
                    disabled={cart.length === 0}
                  >
                    Checkout
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Customer Dialog */}
      <Dialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customer Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={orderForm.customer.name}
                onChange={(e) => setOrderForm({
                  ...orderForm,
                  customer: { ...orderForm.customer, name: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={orderForm.customer.phone}
                onChange={(e) => setOrderForm({
                  ...orderForm,
                  customer: { ...orderForm.customer, phone: e.target.value }
                })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email (Optional)"
                type="email"
                value={orderForm.customer.email}
                onChange={(e) => setOrderForm({
                  ...orderForm,
                  customer: { ...orderForm.customer, email: e.target.value }
                })}
              />
            </Grid>
            {orderForm.orderType === 'delivery' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  multiline
                  rows={3}
                  value={orderForm.customer.address}
                  onChange={(e) => setOrderForm({
                    ...orderForm,
                    customer: { ...orderForm.customer, address: e.target.value }
                  })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialog(false)}>Cancel</Button>
          <Button onClick={() => setCustomerDialog(false)} variant="contained">
            Save Customer Info
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Checkout & Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Order Details</Typography>
              
              {/* Order Type and Table Selection */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={orderForm.orderType}
                    onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                    label="Order Type"
                  >
                    <MenuItem value="dine-in">Dine In</MenuItem>
                    <MenuItem value="takeaway">Takeaway</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                  </Select>
                </FormControl>

                {orderForm.orderType === 'dine-in' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Table</InputLabel>
                    <Select
                      value={orderForm.table}
                      onChange={(e) => setOrderForm({ ...orderForm, table: e.target.value })}
                      label="Select Table"
                    >
                      {tables.filter(table => table.status === 'available').map((table) => (
                        <MenuItem key={table._id} value={table._id}>
                          {(table.tableName || `Table ${table.tableNumber}`)} (Capacity: {table.capacity})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  label="Order Notes"
                  multiline
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Special instructions..."
                />
              </Box>

              {/* Discount Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Apply Discount</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                          value={orderForm.discount.type}
                          onChange={(e) => setOrderForm({
                            ...orderForm,
                            discount: { ...orderForm.discount, type: e.target.value }
                          })}
                          label="Discount Type"
                        >
                          <MenuItem value="percentage">Percentage (%)</MenuItem>
                          <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Discount Value"
                        type="number"
                        value={orderForm.discount.value}
                        onChange={(e) => setOrderForm({
                          ...orderForm,
                          discount: { ...orderForm.discount, value: parseFloat(e.target.value) || 0 }
                        })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {orderForm.discount.type === 'percentage' ? '%' : '$'}
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payment Method</Typography>
              
              <ButtonGroup fullWidth sx={{ mb: 3 }}>
                <Button
                  variant={orderForm.paymentMethod === 'cash' ? 'contained' : 'outlined'}
                  onClick={() => setOrderForm({ ...orderForm, paymentMethod: 'cash' })}
                  startIcon={<MoneyIcon />}
                >
                  Cash
                </Button>
                <Button
                  variant={orderForm.paymentMethod === 'card' ? 'contained' : 'outlined'}
                  onClick={() => setOrderForm({ ...orderForm, paymentMethod: 'card' })}
                  startIcon={<CardIcon />}
                >
                  Card
                </Button>
                <Button
                  variant={orderForm.paymentMethod === 'digital' ? 'contained' : 'outlined'}
                  onClick={() => setOrderForm({ ...orderForm, paymentMethod: 'digital' })}
                  startIcon={<BankIcon />}
                >
                  Digital
                </Button>
              </ButtonGroup>

              {/* Order Summary */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                {cart.map((item) => (
                  <Box key={item._id} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {item.quantity}x {item.name}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(calculateSubtotal())}</Typography>
                </Box>
                {orderForm.discount.value > 0 && (
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography color="success.main">Discount:</Typography>
                    <Typography color="success.main">
                      -{formatCurrency(calculateDiscount())}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography>Tax (10%):</Typography>
                  <Typography>{formatCurrency(calculateTax())}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePlaceOrder}
            variant="contained"
            size="large"
            startIcon={<CheckIcon />}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Options Dialog */}
      <Dialog open={showPayment} onClose={() => setShowPayment(false)}>
        <DialogTitle>Choose Payment Method</DialogTitle>
        <DialogContent>
          <Button variant="contained" onClick={() => { setPaymentType('cash'); handleCashPayment(); }}>
            Cash
          </Button>
          <Button variant="contained" onClick={() => setPaymentType('qr')} sx={{ ml: 2 }}>
            QR Code (UPI)
          </Button>
          <Button variant="contained" onClick={handleStripePayment} sx={{ ml: 2 }}>
            Card / Stripe
          </Button>
          {paymentType === 'qr' && selectedOrder && (
            <div style={{ marginTop: 20 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `upi://pay?pa=yourupi@upi&pn=Restaurant&am=${selectedOrder.totalAmount}&cu=INR`
                )}`}
                alt="UPI QR Code"
                width={200}
                height={200}
              />
              <div>Scan to pay ₹{selectedOrder.totalAmount}</div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayment(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSInterface;