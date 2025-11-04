import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Avatar,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  PriorityHigh as PriorityIcon,
  Refresh as RefreshIcon,
  RestaurantMenu as MenuIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { kotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const KitchenInterface = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());


  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kotAPI.getKOTQueue();
      setOrders(response.data?.orders || response.data || []);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      setError('Failed to load kitchen orders');
      setOrders([]);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 15 seconds for real-time updates
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartItem = async (orderId, itemIndex) => {
    try {
      await kotAPI.updateItemStatus(orderId, itemIndex, { 
        status: 'preparing'
      });
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? {
              ...order,
              status: (typeof order.status === 'string' ? order.status : order.status?.name || order.status?.value) === 'pending' ? 'preparing' : order.status,
              items: order.items.map((item, index) => 
                index === itemIndex 
                  ? { ...item, status: 'preparing', startTime: new Date().toISOString() }
                  : item
              )
            }
          : order
      ));
      
      toast.success('Item preparation started');
    } catch (error) {
      console.error('Error starting item:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      toast.error(error.response?.data?.message || 'Failed to start item preparation');
    }
  };

  const handleCompleteItem = async (orderId, itemIndex) => {
    try {
      await kotAPI.updateItemStatus(orderId, itemIndex, { 
        status: 'ready'
      });
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? {
              ...order,
              items: order.items.map((item, index) => 
                index === itemIndex 
                  ? { ...item, status: 'ready', completedTime: new Date().toISOString() }
                  : item
              )
            }
          : order
      ));
      
      toast.success('Item completed and ready for service');
    } catch (error) {
      console.error('Error completing item:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      toast.error(error.response?.data?.message || 'Failed to complete item');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await kotAPI.completeOrder(orderId);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: 'completed',
              completedTime: new Date().toISOString(),
              items: order.items.map(item => ({ 
                ...item, 
                status: 'ready',
                completedTime: item.completedTime || new Date().toISOString()
              }))
            }
          : order
      ));
      
      toast.success('Order completed!');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(error.response?.data?.message || 'Failed to complete order');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    // Handle case where status might be an object
    const statusValue = typeof status === 'string' ? status : status?.name || status?.value || '';
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'default'
    };
    return colors[statusValue] || 'default';
  };

  const getStatusIcon = (status) => {
    if (!status) return <ScheduleIcon />;
    // Handle case where status might be an object
    const statusValue = typeof status === 'string' ? status : status?.name || status?.value || '';
    const icons = {
      pending: <ScheduleIcon />,
      preparing: <KitchenIcon />,
      ready: <CheckCircleIcon />,
      completed: <DoneIcon />
    };
    return icons[statusValue] || <ScheduleIcon />;
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'primary';
    // Handle case where priority might be an object
    const priorityValue = typeof priority === 'string' ? priority : priority?.name || priority?.value || '';
    const colors = {
      low: 'default',
      normal: 'primary',
      high: 'error'
    };
    return colors[priorityValue] || 'primary';
  };

  const calculateProgress = (order) => {
    if (!order.items || order.items.length === 0) return 0;
    const completedItems = order.items.filter(item => 
      (typeof item.status === 'string' ? item.status : item.status?.name || item.status?.value) === 'ready' || (typeof item.status === 'string' ? item.status : item.status?.name || item.status?.value) === 'completed'
    ).length;
    return (completedItems / order.items.length) * 100;
  };

  const getTimeElapsed = (startTime) => {
    if (!startTime) return null;
    const elapsed = Math.floor((currentTime - new Date(startTime)) / (1000 * 60));
    return elapsed;
  };

  const getEstimatedTimeRemaining = (estimatedTime) => {
    if (!estimatedTime) return null;
    const remaining = Math.floor((new Date(estimatedTime) - currentTime) / (1000 * 60));
    return remaining;
  };

  const isOverdue = (estimatedTime) => {
    if (!estimatedTime) return false;
    return new Date(estimatedTime) < currentTime;
  };

  const filteredOrders = orders.filter(order => {
    const orderStatus = typeof order?.status === 'string' ? order.status : order?.status?.name || order?.status?.value || '';
    const statusMatch = !filterStatus || orderStatus === filterStatus;
    const orderPriority = typeof order?.priority === 'string' ? order.priority : order?.priority?.name || order?.priority?.value || '';
    const priorityMatch = !filterPriority || orderPriority === filterPriority;
    
    // Only show active orders (not completed) for kitchen display
    const isActive = order?.status !== 'completed';
    
    return statusMatch && priorityMatch && isActive;
  });

  // Sort orders by priority and time
  const sortedOrders = filteredOrders.sort((a, b) => {
    // High priority first
    const aPriority = typeof a.priority === 'string' ? a.priority : a.priority?.name || a.priority?.value;
    const bPriority = typeof b.priority === 'string' ? b.priority : b.priority?.name || b.priority?.value;
    if (aPriority === 'high' && bPriority !== 'high') return -1;
    if (bPriority === 'high' && aPriority !== 'high') return 1;
    
    // Then by order time (oldest first)
    return new Date(a.orderTime) - new Date(b.orderTime);
  });

  const preparingCount = orders.filter(o => (typeof o?.status === 'string' ? o.status : o?.status?.name || o?.status?.value) === 'preparing').length;
  const pendingCount = orders.filter(o => (typeof o?.status === 'string' ? o.status : o?.status?.name || o?.status?.value) === 'pending').length;
  const overdueCount = orders.filter(o => o?.estimatedCompletionTime && isOverdue(o.estimatedCompletionTime)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <KitchenIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Kitchen Display System
              </Typography>
              <Typography variant="subtitle1">
                {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={pendingCount} color="warning">
              <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" display="block">PENDING</Typography>
                <Typography variant="h6">{pendingCount}</Typography>
              </Paper>
            </Badge>
            
            <Badge badgeContent={preparingCount} color="info">
              <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" display="block">PREPARING</Typography>
                <Typography variant="h6">{preparingCount}</Typography>
              </Paper>
            </Badge>
            
            {overdueCount > 0 && (
              <Badge badgeContent={overdueCount} color="error">
                <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block">OVERDUE</Typography>
                  <Typography variant="h6">{overdueCount}</Typography>
                </Paper>
              </Badge>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All Active Orders</MenuItem>
                <MenuItem value="pending">Pending Orders</MenuItem>
                <MenuItem value="preparing">Preparing Orders</MenuItem>
                <MenuItem value="ready">Ready Orders</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Filter by Priority"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="high">High Priority</MenuItem>
                <MenuItem value="normal">Normal Priority</MenuItem>
                <MenuItem value="low">Low Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Auto-refresh: Every 15 seconds
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Grid */}
      <Grid container spacing={3}>
        {sortedOrders.map((order) => (
          <Grid item xs={12} lg={6} xl={4} key={order._id}>
            <Card sx={{ 
              height: '100%',
              border: (typeof order.priority === 'string' ? order.priority : order.priority?.name || order.priority?.value) === 'high' ? '3px solid #f44336' : 
                     isOverdue(order.estimatedCompletionTime) ? '3px solid #ff9800' :
                     (typeof order.status === 'string' ? order.status : order.status?.name || order.status?.value) === 'preparing' ? '2px solid #2196f3' : '1px solid #e0e0e0',
              position: 'relative',
              boxShadow: (typeof order.priority === 'string' ? order.priority : order.priority?.name || order.priority?.value) === 'high' ? 6 : 3
            }}>
              {/* Priority Badge */}
              {(typeof order.priority === 'string' ? order.priority : order.priority?.name || order.priority?.value) === 'high' && (
                <Chip
                  icon={<PriorityIcon />}
                  label="HIGH PRIORITY"
                  color="error"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              <CardContent sx={{ pb: 1 }}>
                {/* Order Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(order.status), color: 'white' }}>
                      {getStatusIcon(order.status)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {order.kotNumber || order.kot?.number || 'KOT-???'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.orderNumber || 'Unknown Order'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Order Info */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Table {order.tableNumber || order.table?.tableNumber || order.table?.tableName || 'N/A'}
                    </Typography>
                    <PersonIcon fontSize="small" color="action" sx={{ ml: 2 }} />
                    <Typography variant="body2">
                      {typeof order.waiter === 'string' ? order.waiter : order.waiter?.name || 'Unassigned'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Unknown'}
                    </Typography>
                  </Box>

                  {order.startTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="primary">
                        Cooking for: {getTimeElapsed(order.startTime)} min
                      </Typography>
                    </Box>
                  )}

                  {order.estimatedCompletionTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedIcon fontSize="small" color={isOverdue(order.estimatedCompletionTime) ? 'error' : 'action'} />
                      <Typography 
                        variant="body2" 
                        color={isOverdue(order.estimatedCompletionTime) ? 'error' : 'text.secondary'}
                      >
                        {isOverdue(order.estimatedCompletionTime)
                          ? `Overdue by ${Math.abs(getEstimatedTimeRemaining(order.estimatedCompletionTime) || 0)} min`
                          : `${getEstimatedTimeRemaining(order.estimatedCompletionTime) || 0} min remaining`
                        }
                      </Typography>
                    </Box>
                  )}

                  {order.notes && (
                    <Alert severity="info" sx={{ py: 0.5 }}>
                      <Typography variant="body2">
                        <strong>Note:</strong> {order.notes}
                      </Typography>
                    </Alert>
                  )}
                </Stack>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Progress</Typography>
                    <Typography variant="caption">{Math.round(calculateProgress(order))}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(order)}
                    color={(typeof order.status === 'string' ? order.status : order.status?.name || order.status?.value) === 'ready' ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Items List */}
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuIcon fontSize="small" />
                  Order Items ({order.items?.length || 0})
                </Typography>
                <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                  {order.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {(typeof item.status === 'string' ? item.status : item.status?.name || item.status?.value) === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={<StartIcon />}
                                onClick={() => handleStartItem(order._id, index)}
                              >
                                Start
                              </Button>
                            )}
                            {(typeof item.status === 'string' ? item.status : item.status?.name || item.status?.value) === 'preparing' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<DoneIcon />}
                                onClick={() => handleCompleteItem(order._id, index)}
                              >
                                Ready
                              </Button>
                            )}
                            <Chip 
                              label={typeof item.status === 'string' 
                                ? item.status.toUpperCase() 
                                : (item.status?.name || item.status?.value || 'UNKNOWN').toUpperCase()} 
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2">
                              {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {typeof item.menuItem?.category === 'string' 
                                  ? item.menuItem.category 
                                  : item.menuItem?.category?.name || 'Unknown Category'} | 
                                Prep Time: {item.menuItem?.preparationTime || 0} min
                              </Typography>
                              {item.specialInstructions && (
                                <Typography variant="caption" color="warning.main" display="block">
                                  <strong>Special:</strong> {item.specialInstructions}
                                </Typography>
                              )}
                              {item.startTime && (
                                <Typography variant="caption" color="primary" display="block">
                                  Started: {new Date(item.startTime).toLocaleTimeString()}
                                </Typography>
                              )}
                              {item.completedTime && (
                                <Typography variant="caption" color="success.main" display="block">
                                  Completed: {new Date(item.completedTime).toLocaleTimeString()}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < order.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedOrder(order);
                    setViewDialog(true);
                  }}
                >
                  View Details
                </Button>
                
                {(typeof order.status === 'string' ? order.status : order.status?.name || order.status?.value) === 'preparing' && calculateProgress(order) === 100 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<DoneIcon />}
                    onClick={() => handleCompleteOrder(order._id)}
                  >
                    Complete Order
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedOrders.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <KitchenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No active orders in kitchen queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All orders are completed or no new orders received
          </Typography>
        </Paper>
      )}

      {/* Order Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Order Details - {selectedOrder?.kotNumber || selectedOrder?.kot?.number || 'KOT-???'}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                  <Typography variant="body1">{selectedOrder.orderNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Table</Typography>
                  <Typography variant="body1">
                    Table {selectedOrder.tableNumber || selectedOrder.table?.tableNumber || selectedOrder.table?.tableName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Server</Typography>
                  <Typography variant="body1">
                    {typeof selectedOrder.waiter === 'string' 
                      ? selectedOrder.waiter 
                      : `${selectedOrder.waiter?.name || 'Unknown'} (${selectedOrder.waiter?.employeeId || 'N/A'})`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={typeof selectedOrder.priority === 'string' 
                      ? selectedOrder.priority.toUpperCase() 
                      : (selectedOrder.priority?.name || selectedOrder.priority?.value || 'NORMAL').toUpperCase()} 
                    color={getPriorityColor(selectedOrder.priority)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Order Time</Typography>
                  <Typography variant="body1">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    icon={getStatusIcon(selectedOrder.status)}
                    label={typeof selectedOrder.status === 'string' 
                      ? selectedOrder.status.toUpperCase() 
                      : (selectedOrder.status?.name || selectedOrder.status?.value || 'UNKNOWN').toUpperCase()} 
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {selectedOrder.notes && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Kitchen Notes:</strong> {selectedOrder.notes}
                </Alert>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>Items to Prepare</Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {item.status === 'pending' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                handleStartItem(selectedOrder._id, index);
                                setViewDialog(false);
                              }}
                            >
                              Start Cooking
                            </Button>
                          )}
                          {item.status === 'preparing' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => {
                                handleCompleteItem(selectedOrder._id, index);
                                setViewDialog(false);
                              }}
                            >
                              Mark Ready
                            </Button>
                          )}
                          <Chip 
                            label={typeof item.status === 'string' 
                              ? item.status.toUpperCase() 
                              : (item.status?.name || item.status?.value || 'UNKNOWN').toUpperCase()} 
                            color={getStatusColor(item.status)}
                            size="small"
                          />
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Category: {typeof item.menuItem?.category === 'string' 
                                ? item.menuItem.category 
                                : item.menuItem?.category?.name || 'Unknown'} | 
                              Prep Time: {item.menuItem?.preparationTime || 0} minutes
                            </Typography>
                            {item.specialInstructions && (
                              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                <strong>Special Instructions:</strong> {item.specialInstructions}
                              </Typography>
                            )}
                            {item.startTime && (
                              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                <strong>Started:</strong> {new Date(item.startTime).toLocaleString()}
                              </Typography>
                            )}
                            {item.completedTime && (
                              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                <strong>Completed:</strong> {new Date(item.completedTime).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < selectedOrder.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitchenInterface;