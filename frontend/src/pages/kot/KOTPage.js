import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Avatar,
  Stack,
  LinearProgress,
  Menu,
  ListItemIcon
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  AccessTime as TimeIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Print as PrintIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityIcon,
  Notes as NotesIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  LocalDining as DiningIcon
} from '@mui/icons-material';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { kotAPI } from '../../services/api';
import toast from 'react-hot-toast';

const KOTPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [kotOrders, setKotOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionOrder, setActionOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterWaiter, setFilterWaiter] = useState('');


  const fetchKotOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kotAPI.getKOTQueue();
      setKotOrders(response.data?.orders || response.data || []);
    } catch (error) {
      console.error('Error fetching KOT orders:', error);
      setError('Failed to load KOT orders');
      setKotOrders([]);
      toast.error('Failed to load KOT orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKotOrders();
    // Set up auto refresh every 30 seconds
    const interval = setInterval(fetchKotOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchKotOrders]);

  const handleStartOrder = async (orderId) => {
    try {
      await kotAPI.updateItemStatus(orderId, 0, { status: 'preparing' });
      setKotOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: 'preparing',
              startTime: new Date().toISOString(),
              items: order.items.map(item => ({ ...item, status: 'preparing' }))
            }
          : order
      ));
      toast.success('Order started in kitchen');
      handleCloseMenu();
    } catch (error) {
      console.error('Error starting order:', error);
      toast.error(error.response?.data?.message || 'Failed to start order');
    }
  };

  const handleCompleteItem = async (orderId, itemIndex) => {
    try {
      await kotAPI.updateItemStatus(orderId, itemIndex, { status: 'ready' });
      setKotOrders(prev => prev.map(order => 
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
      toast.success('Item marked as ready');
    } catch (error) {
      console.error('Error completing item:', error);
      toast.error(error.response?.data?.message || 'Failed to complete item');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await kotAPI.completeOrder(orderId);
      setKotOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: 'completed',
              completedTime: new Date().toISOString(),
              items: order.items.map(item => ({ ...item, status: 'ready' }))
            }
          : order
      ));
      toast.success('Order completed');
      handleCloseMenu();
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(error.response?.data?.message || 'Failed to complete order');
    }
  };

  const handlePrintKOT = async (orderId) => {
    try {
      await kotAPI.printKOT(orderId, { reprint: true });
      toast.success('KOT printed successfully');
      handleCloseMenu();
    } catch (error) {
      console.error('Error printing KOT:', error);
      toast.error(error.response?.data?.message || 'Failed to print KOT');
    }
  };

  const handleOpenMenu = (event, order) => {
    setMenuAnchor(event.currentTarget);
    setActionOrder(order);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActionOrder(null);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialog(true);
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    if (!status) return <ScheduleIcon />;
    const icons = {
      pending: <ScheduleIcon />,
      preparing: <KitchenIcon />,
      ready: <CheckCircleIcon />,
      completed: <DoneIcon />
    };
    return icons[status] || <ScheduleIcon />;
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'primary';
    const colors = {
      low: 'default',
      normal: 'primary',
      high: 'error'
    };
    return colors[priority] || 'primary';
  };

  const calculateProgress = (order) => {
    if (!order.items || order.items.length === 0) return 0;
    const completedItems = order.items.filter(item => 
      item.status === 'ready' || item.status === 'completed'
    ).length;
    return (completedItems / order.items.length) * 100;
  };

  const getTimeElapsed = (startTime) => {
    if (!startTime) return 'Not started';
    const elapsed = Math.floor((new Date() - new Date(startTime)) / (1000 * 60));
    return `${elapsed} min ago`;
  };

  const getEstimatedTime = (estimatedTime) => {
    if (!estimatedTime) return 'N/A';
    const remaining = Math.floor((new Date(estimatedTime) - new Date()) / (1000 * 60));
    return remaining > 0 ? `${remaining} min left` : 'Overdue';
  };

  const filteredOrders = kotOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.kotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchTerm);
    const matchesPriority = !filterPriority || order.priority === filterPriority;
    const matchesWaiter = !filterWaiter || order.waiter?.name?.toLowerCase().includes(filterWaiter.toLowerCase());
    
    switch (activeTab) {
      case 0: return matchesSearch && matchesPriority && matchesWaiter; // All Orders
      case 1: return matchesSearch && matchesPriority && matchesWaiter && order.status === 'pending';
      case 2: return matchesSearch && matchesPriority && matchesWaiter && order.status === 'preparing';
      case 3: return matchesSearch && matchesPriority && matchesWaiter && order.status === 'ready';
      case 4: return matchesSearch && matchesPriority && matchesWaiter && order.status === 'completed';
      default: return matchesSearch && matchesPriority && matchesWaiter;
    }
  });

  const tabCounts = {
    all: kotOrders?.length || 0,
    pending: kotOrders?.filter(o => o?.status === 'pending')?.length || 0,
    preparing: kotOrders?.filter(o => o?.status === 'preparing')?.length || 0,
    ready: kotOrders?.filter(o => o?.status === 'ready')?.length || 0,
    completed: kotOrders?.filter(o => o?.status === 'completed')?.length || 0
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KitchenIcon color="primary" />
          Kitchen Order Tickets (KOT)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchKotOrders}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Orders"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by KOT, Order number, or Table..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Waiter Name"
              variant="outlined"
              value={filterWaiter}
              onChange={(e) => setFilterWaiter(e.target.value)}
              placeholder="Filter by waiter name..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" align="center">
              Auto-refresh: 30s
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Badge badgeContent={tabCounts.all} color="default">
                All Orders
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.pending} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.preparing} color="info">
                Preparing
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.ready} color="success">
                Ready
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.completed} color="default">
                Completed
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* KOT Orders Grid */}
      <Grid container spacing={3}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order._id}>
            <Card sx={{ 
              height: '100%',
              border: order.priority === 'high' ? '2px solid #f44336' : 
                     order.status === 'ready' ? '2px solid #4caf50' : '1px solid #e0e0e0',
              position: 'relative'
            }}>
              {order.priority === 'high' && (
                <Chip
                  icon={<PriorityIcon />}
                  label="HIGH PRIORITY"
                  color="error"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1
                  }}
                />
              )}
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(order.status), color: 'white' }}>
                      {getStatusIcon(order.status)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {order.kotNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.orderNumber}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={(e) => handleOpenMenu(e, order)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Stack spacing={1.5}>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status?.toUpperCase() || 'UNKNOWN'}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Table {order.tableNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {order.waiter?.name || 'Unassigned'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(order.orderTime).toLocaleTimeString()}
                    </Typography>
                  </Box>

                  {order.startTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimerIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="info.main">
                        {getTimeElapsed(order.startTime)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DiningIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {order.items?.length || 0} items
                    </Typography>
                  </Box>

                  {order.estimatedCompletionTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography 
                        variant="body2" 
                        color={new Date(order.estimatedCompletionTime) < new Date() ? 'error' : 'text.secondary'}
                      >
                        {getEstimatedTime(order.estimatedCompletionTime)}
                      </Typography>
                    </Box>
                  )}

                  {order.notes && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <NotesIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="warning.main" noWrap>
                        {order.notes}
                      </Typography>
                    </Box>
                  )}

                  {/* Progress Bar */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Progress</Typography>
                      <Typography variant="caption">{Math.round(calculateProgress(order))}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(order)}
                      color={order.status === 'ready' ? 'success' : 'primary'}
                    />
                  </Box>
                </Stack>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleViewOrder(order)}>
                  View Details
                </Button>
                {order.status === 'pending' && (
                  <Button 
                    size="small" 
                    color="primary"
                    startIcon={<StartIcon />}
                    onClick={() => handleStartOrder(order._id)}
                  >
                    Start
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button 
                    size="small" 
                    color="success"
                    startIcon={<DoneIcon />}
                    onClick={() => handleCompleteOrder(order._id)}
                  >
                    Complete
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOrders.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <KitchenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No KOT orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterPriority || filterWaiter 
              ? 'Try adjusting your search criteria' 
              : 'All orders are completed or no orders in queue'
            }
          </Typography>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleViewOrder(actionOrder)}>
          <ListItemIcon><AssignmentIcon /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handlePrintKOT(actionOrder?._id)}>
          <ListItemIcon><PrintIcon /></ListItemIcon>
          <ListItemText>Print KOT</ListItemText>
        </MenuItem>
        <Divider />
        {actionOrder?.status === 'pending' && (
          <MenuItem onClick={() => handleStartOrder(actionOrder._id)}>
            <ListItemIcon><StartIcon color="primary" /></ListItemIcon>
            <ListItemText>Start Preparation</ListItemText>
          </MenuItem>
        )}
        {actionOrder?.status === 'preparing' && (
          <MenuItem onClick={() => handleCompleteOrder(actionOrder._id)}>
            <ListItemIcon><DoneIcon color="success" /></ListItemIcon>
            <ListItemText>Mark Complete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Order Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          KOT Details - {selectedOrder?.kotNumber}
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
                  <Typography variant="subtitle2" color="text.secondary">Table Number</Typography>
                  <Typography variant="body1">Table {selectedOrder.tableNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Waiter</Typography>
                  <Typography variant="body1">{selectedOrder.waiter?.name} ({selectedOrder.waiter?.employeeId})</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={selectedOrder.priority?.toUpperCase() || 'NORMAL'} 
                    color={getPriorityColor(selectedOrder.priority)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Order Time</Typography>
                  <Typography variant="body1">{new Date(selectedOrder.orderTime).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    icon={getStatusIcon(selectedOrder.status)}
                    label={selectedOrder.status?.toUpperCase() || 'UNKNOWN'} 
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {selectedOrder.notes && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Notes:</strong> {selectedOrder.notes}
                </Alert>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>Order Items</Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {item.menuItem?.name} ({item.menuItem?.category})
                            </Typography>
                            <Chip 
                              label={item.status?.toUpperCase() || 'UNKNOWN'} 
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity} | Prep Time: {item.preparationTime} min
                            </Typography>
                            {item.specialInstructions && (
                              <Typography variant="body2" color="warning.main">
                                Special Instructions: {item.specialInstructions}
                              </Typography>
                            )}
                            {item.completedTime && (
                              <Typography variant="body2" color="success.main">
                                Completed: {new Date(item.completedTime).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {item.status === 'preparing' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleCompleteItem(selectedOrder._id, index)}
                          >
                            Mark Ready
                          </Button>
                        )}
                      </ListItemSecondaryAction>
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
          {selectedOrder?.status === 'pending' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<StartIcon />}
              onClick={() => {
                handleStartOrder(selectedOrder._id);
                setViewDialog(false);
              }}
            >
              Start Order
            </Button>
          )}
          {selectedOrder?.status === 'preparing' && (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<DoneIcon />}
              onClick={() => {
                handleCompleteOrder(selectedOrder._id);
                setViewDialog(false);
              }}
            >
              Complete Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KOTPage;