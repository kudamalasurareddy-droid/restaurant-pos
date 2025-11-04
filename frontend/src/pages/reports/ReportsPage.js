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
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Receipt as SalesIcon,
  Restaurant as MenuIcon,
  Group as StaffIcon,
  TableChart as TableIcon,
  People as CustomerIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as OrderIcon,
  Timer as TimeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { reportsAPI } from '../../services/api';

const ReportsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [menuPerformance, setMenuPerformance] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState(null);
  const [tableUtilization, setTableUtilization] = useState(null);
  const [customerAnalysis, setCustomerAnalysis] = useState(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const [exportDialog, setExportDialog] = useState(false);
  const [exportForm, setExportForm] = useState({
    reportType: 'sales',
    format: 'pdf',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (tabValue > 0) {
      fetchReportData();
    }
  }, [tabValue, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getDashboard();
      setDashboardData(response.data || {});
    } catch (err) {
      setError('Failed to fetch dashboard data: ' + (err.response?.data?.message || err.message));
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      switch (tabValue) {
        case 1: // Sales Report
          const salesRes = await reportsAPI.getSalesReport(params);
          setSalesReport(salesRes.data || {});
          break;
        case 2: // Menu Performance
          const menuRes = await reportsAPI.getMenuPerformance(params);
          setMenuPerformance(menuRes.data || {});
          break;
        case 3: // Staff Performance
          const staffRes = await reportsAPI.getStaffPerformance(params);
          setStaffPerformance(staffRes.data || {});
          break;
        case 4: // Table Utilization
          const tableRes = await reportsAPI.getTableUtilization(params);
          setTableUtilization(tableRes.data || {});
          break;
        case 5: // Customer Analysis
          const customerRes = await reportsAPI.getCustomerAnalysis(params);
          setCustomerAnalysis(customerRes.data || {});
          break;
      }
    } catch (err) {
      setError('Failed to fetch report data: ' + (err.response?.data?.message || err.message));
      // Clear data on error instead of showing mock data
      switch (tabValue) {
        case 1: setSalesReport({}); break;
        case 2: setMenuPerformance({}); break;
        case 3: setStaffPerformance({}); break;
        case 4: setTableUtilization({}); break;
        case 5: setCustomerAnalysis({}); break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportsAPI.exportReport(exportForm);
      setSuccess('Report exported successfully');
      setExportDialog(false);
    } catch (err) {
      setError('Failed to export report: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue !== 0) {
      fetchReportData();
    }
  };

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value}%`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Reports & Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialog(true)}
        >
          Export Report
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Dashboard" />
        <Tab label="Sales Report" />
        <Tab label="Menu Performance" />
        <Tab label="Staff Performance" />
        <Tab label="Table Utilization" />
        <Tab label="Customer Analysis" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {/* Dashboard Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {loading && <LinearProgress sx={{ mb: 2, width: '100%' }} />}
            
            {/* Overview Cards */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Overview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <MoneyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Total Revenue</Typography>
                      </Box>
                      <Typography variant="h4">
                        {formatCurrency(dashboardData.overview?.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData.overview?.dailyGrowth > 0 ? '+' : ''}{dashboardData.overview?.dailyGrowth}% vs yesterday
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <OrderIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Total Orders</Typography>
                      </Box>
                      <Typography variant="h4">
                        {dashboardData.overview?.totalOrders || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${dashboardData.overview?.averageOrderValue || 0} avg order value
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CustomerIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Active Customers</Typography>
                      </Box>
                      <Typography variant="h4">
                        {dashboardData.overview?.activeCustomers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData.overview?.staffOnDuty || 0} staff on duty
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TableIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Table Occupancy</Typography>
                      </Box>
                      <Typography variant="h4">
                        {dashboardData.overview?.tableOccupancy || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dashboardData.overview?.popularItems || 0} popular items
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                  {dashboardData.recentActivity?.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <Box>
                          <Typography variant="body2">{activity.action}</Typography>
                          <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" color={activity.amount?.startsWith('-') ? 'error' : 'success'}>
                            {activity.amount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{activity.table}</Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Categories */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Categories</Typography>
                  {dashboardData.topCategories?.length > 0 ? (
                    dashboardData.topCategories.map((category, index) => (
                      <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <Typography variant="body2">{category.name}</Typography>
                        <Box textAlign="right">
                          <Typography variant="body2">{formatCurrency(category.revenue)}</Typography>
                          <Typography variant="caption" color="text.secondary">{category.percentage}%</Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No category data available</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Other tabs content - display message that data comes from API */}
        {tabValue !== 0 && (
          <Box textAlign="center" py={4}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Reports Loading from Database
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This report data is now pulled directly from MongoDB via API calls.
              {loading && ' Loading...'}
            </Typography>
            {!loading && Object.keys(salesReport || {}).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No data available. Make sure your MongoDB has order data and the backend is running.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={exportForm.type}
                  onChange={(e) => setExportForm({ ...exportForm, type: e.target.value })}
                  label="Report Type"
                >
                  <MenuItem value="sales">Sales Report</MenuItem>
                  <MenuItem value="menu">Menu Performance</MenuItem>
                  <MenuItem value="staff">Staff Performance</MenuItem>
                  <MenuItem value="tables">Table Utilization</MenuItem>
                  <MenuItem value="customers">Customer Analysis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={exportForm.startDate}
                onChange={(e) => setExportForm({ ...exportForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={exportForm.endDate}
                onChange={(e) => setExportForm({ ...exportForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportForm.format}
                  onChange={(e) => setExportForm({ ...exportForm, format: e.target.value })}
                  label="Format"
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;
