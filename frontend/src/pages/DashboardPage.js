import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Restaurant,
  TableRestaurant,
  ShoppingCart,
  AttachMoney,
  People,
  Kitchen,
  Inventory,
  Warning,
  CheckCircle,
  Schedule,
  Refresh
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportsAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const { stats: liveStats } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Minimal dummy data to prevent runtime errors
  const salesData = [
    { time: '6 AM', sales: 0 },
    { time: '9 AM', sales: 0 },
    { time: '12 PM', sales: 0 },
    { time: '3 PM', sales: 0 },
    { time: '6 PM', sales: 0 },
    { time: '9 PM', sales: 0 },
  ];

  const categoryData = [
    { name: 'Main Course', value: 0, color: '#8884d8' },
    { name: 'Beverages', value: 0, color: '#82ca9d' },
    { name: 'Appetizers', value: 0, color: '#ffc658' },
    { name: 'Desserts', value: 0, color: '#ff7300' },
  ];

  const recentOrders = [];


  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      served: 'secondary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      preparing: <Kitchen />,
      ready: <CheckCircle />,
      served: <Restaurant />,
      completed: <CheckCircle />,
      cancelled: <Warning />
    };
    return icons[status] || <Schedule />;
  };

  const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend === 'up' ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend === 'up' ? 'success.main' : 'error.main'}
            >
              {trendValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening at your restaurant today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={timeRange === 'today' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('today')}
            size="small"
          >
            Today
          </Button>
          <Button
            variant={timeRange === 'week' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('week')}
            size="small"
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('month')}
            size="small"
          >
            This Month
          </Button>
          <IconButton onClick={fetchDashboardData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value="$2,840"
            icon={<AttachMoney />}
            trend="up"
            trendValue="+12%"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Orders"
            value={liveStats?.totalOrders || 156}
            icon={<ShoppingCart />}
            trend="up"
            trendValue="+8%"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupied Tables"
            value={`${liveStats?.occupiedTables || 8}/20`}
            icon={<TableRestaurant />}
            trend="down"
            trendValue="-3%"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kitchen Orders"
            value={liveStats?.pendingKOTs || 12}
            icon={<Kitchen />}
            trend="up"
            trendValue="+5%"
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts and Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Sales Overview
              </Typography>
              <Chip label="Today" color="primary" size="small" />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {categoryData.map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.name} (${item.value}%)`}
                  size="small"
                  sx={{ bgcolor: item.color, color: 'white' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Orders
              </Typography>
              <Button size="small" href="/orders">
                View All
              </Button>
            </Box>
            <List>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {order.id}
                          </Typography>
                          <Chip
                            label={order.status}
                            size="small"
                            color={getStatusColor(order.status)}
                            icon={getStatusIcon(order.status)}
                          />
                        </Box>
                      }
                      secondary={`${order.table} • $${order.amount} • ${order.time}`}
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions & Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Status
            </Typography>
            
            {/* System health indicators */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Kitchen Load</Typography>
                <Typography variant="body2" color="text.secondary">
                  {liveStats?.pendingKOTs || 12}/25
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((liveStats?.pendingKOTs || 12) / 25) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Table Occupancy</Typography>
                <Typography variant="body2" color="text.secondary">
                  {liveStats?.occupiedTables || 8}/20
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((liveStats?.occupiedTables || 8) / 20) * 100}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Low Stock Items</Typography>
                <Typography variant="body2" color="error.main">
                  {liveStats?.lowStockItems || 3} items
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={30}
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Quick Actions */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShoppingCart />}
                href="/pos"
              >
                New Order
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TableRestaurant />}
                href="/tables"
              >
                Manage Tables
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Kitchen />}
                href="/kot"
              >
                Kitchen View
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;