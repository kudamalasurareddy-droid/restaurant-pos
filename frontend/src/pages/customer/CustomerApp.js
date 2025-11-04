import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Chip,
  Tabs,
  Tab,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { menuAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomerApp = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [menuByCategory, setMenuByCategory] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('takeaway'); // takeaway | delivery
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | card
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', address: '' });
  const [cart, setCart] = useState([]); // [{ item, quantity }]
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const res = await menuAPI.getPublicMenu();
        const data = Array.isArray(res.data) ? res.data : [];
        setMenuByCategory(data);
        if (data.length > 0) setActiveCategoryId('all');
      } catch (err) {
        console.error('Public menu load error:', err);
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const loadMyOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setOrdersLoading(true);
      const res = await ordersAPI.getMyOrders();
      const list = res.data?.orders || res.data?.data || res.data || [];
      setMyOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Load my orders failed:', err.response?.data || err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadMyOrders();
    const id = setInterval(loadMyOrders, 10000);
    return () => clearInterval(id);
  }, [isAuthenticated, loadMyOrders]);

  const allItems = useMemo(() => {
    return menuByCategory.flatMap(group => group.items || []);
  }, [menuByCategory]);

  const filteredItems = useMemo(() => {
    return allItems.filter(it => {
      const matchesCat = activeCategoryId === 'all' || it.category?._id === activeCategoryId;
      const matchesSearch = !search || it.name?.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allItems, activeCategoryId, search]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item._id === item._id);
      if (existing) {
        return prev.map(ci => ci.item._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId, qty) => {
    setCart(prev => prev
      .map(ci => ci.item._id === itemId ? { ...ci, quantity: Math.max(1, qty) } : ci)
      .filter(ci => ci.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(ci => ci.item._id !== itemId));
  };

  const subtotal = useMemo(() => cart.reduce((sum, ci) => sum + (ci.item.price * ci.quantity), 0), [cart]);
  const taxRate = 0; // customer app keeps pricing simple, backend can compute if needed
  const total = subtotal; // no extras client-side

  const placeOrder = async () => {
    try {
      if (!isAuthenticated || !user) {
        toast.error('Please login to place order');
        navigate('/login', { replace: true, state: { from: '/customer' } });
        return;
      }

      if (cart.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      const items = cart.map(ci => ({
        menuItem: ci.item._id,
        quantity: ci.quantity,
      }));

      const payload = {
        orderType: orderType === 'delivery' ? 'delivery' : 'takeaway',
        customer: customerInfo.address
          ? { ...customerInfo, address: { street: customerInfo.address, city: '', state: '', zipCode: '' } }
          : { name: customerInfo.name, phone: customerInfo.phone, email: customerInfo.email },
        items,
        tax: { rate: taxRate },
        paymentMethod: paymentMethod === 'card' ? 'card' : 'cash',
        source: 'website',
        status: 'pending',
        notes: ''
      };

      const res = await ordersAPI.createOrder(payload);
      toast.success(`Order placed! #${res.data.orderNumber}`);
      setCart([]);
      loadMyOrders();

      // If card payment, initiate Stripe Checkout
      if (paymentMethod === 'card') {
        try {
          const checkout = await ordersAPI.createStripeCheckout(res.data._id);
          const { url, qrCode } = checkout.data || {};
          if (url) {
            window.open(url, '_blank');
          }
          if (qrCode) {
            toast.success('Scan QR to pay');
            // Render a lightweight QR preview in a new window
            const w = window.open('', '_blank', 'width=320,height=360');
            if (w) {
              w.document.write(`<html><body style="margin:0;padding:16px;font-family:sans-serif;">` +
                `<h3 style="margin:0 0 8px">Pay for Order ${res.data.orderNumber}</h3>` +
                `<img src="${qrCode}" alt="QR Code" style="width:256px;height:256px" />` +
                (url ? `<p><a href="${url}" target="_blank">Open payment page</a></p>` : '') +
                `<p style="color:#666">Use Stripe test card 4242 4242 4242 4242, any future date, any CVC.</p>` +
                `</body></html>`);
            }
          }
        } catch (e) {
          console.warn('Stripe checkout failed:', e);
          toast.error('Could not start online payment');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    }
  };

  const fmt = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading menu..." />;
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Order Online</Typography>

      {/* Category Tabs and Search */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Tabs
          value={activeCategoryId}
          onChange={(_, v) => setActiveCategoryId(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          <Tab label="All" value="all" />
          {menuByCategory.map(group => (
            <Tab key={group.category?._id} label={group.category?.name} value={group.category?._id} />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {filteredItems.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card>
                  {item.image && (
                    <CardMedia component="img" height="140" image={item.image} alt={item.name} />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.description}
                    </Typography>
                    <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
                      <Chip label={`$${item.price.toFixed(2)}`} color="primary" size="small" />
                      <Button size="small" variant="contained" onClick={() => addToCart(item)}>Add</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredItems.length === 0 && (
              <Box p={2}><Typography>No items found.</Typography></Box>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Your Cart</Typography>
              <Divider sx={{ my: 1 }} />
              {cart.length === 0 && <Typography color="text.secondary">No items yet.</Typography>}
              {cart.map(ci => (
                <Box key={ci.item._id} display="flex" alignItems="center" justifyContent="space-between" my={1}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{ci.item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">${ci.item.price.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button size="small" onClick={() => updateQty(ci.item._id, ci.quantity - 1)}>-</Button>
                    <Typography>{ci.quantity}</Typography>
                    <Button size="small" onClick={() => updateQty(ci.item._id, ci.quantity + 1)}>+</Button>
                    <Button size="small" color="error" onClick={() => removeFromCart(ci.item._id)}>Remove</Button>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Subtotal</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>

              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="order-type-label">Order Type</InputLabel>
                <Select
                  labelId="order-type-label"
                  label="Order Type"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <MenuItem value="takeaway">Takeaway</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel id="payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-method-label"
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="cash">Cash on Delivery</MenuItem>
                  <MenuItem value="card">Card (Stripe Test)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth size="small" label="Name" sx={{ mb: 1 }}
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              />
              <TextField
                fullWidth size="small" label="Phone" sx={{ mb: 1 }}
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              />
              <TextField
                fullWidth size="small" label="Email" sx={{ mb: 1 }}
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
              {orderType === 'delivery' && (
                <TextField
                  fullWidth size="small" label="Address" sx={{ mb: 1 }} multiline minRows={2}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                />
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={cart.length === 0}
                onClick={placeOrder}
              >
                Place Order (${total.toFixed(2)})
              </Button>
            </CardContent>
          </Card>

          <Box mt={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">My Orders</Typography>
                  <Button size="small" onClick={loadMyOrders} disabled={ordersLoading}>Refresh</Button>
                </Box>
                <Divider sx={{ my: 1 }} />
                {myOrders.length === 0 && (
                  <Typography color="text.secondary">No orders yet.</Typography>
                )}
                {myOrders.map(order => (
                  <Box key={order._id} mb={1.5} p={1} borderRadius={1} border="1px solid rgba(0,0,0,0.08)">
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>#{order.orderNumber}</Typography>
                      <Chip size="small" label={order.status} color={
                        order.status === 'ready' ? 'success' :
                        order.status === 'preparing' ? 'warning' :
                        order.status === 'pending' ? 'default' : 'primary'
                      } />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Placed: {fmt(order.createdAt)}
                      {order.preparationTime?.startedAt ? ` • Started: ${fmt(order.preparationTime.startedAt)}` : ''}
                      {order.preparationTime?.completedAt ? ` • Ready: ${fmt(order.preparationTime.completedAt)}` : ''}
                    </Typography>
                    <Box mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {order.items?.length || 0} item(s) • Total ${order.totalAmount?.toFixed ? order.totalAmount.toFixed(2) : order.totalAmount}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerApp;