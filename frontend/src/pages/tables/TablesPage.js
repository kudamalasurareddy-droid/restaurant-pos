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
  Fab,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TableRestaurant as TableIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CleaningServices as CleanIcon,
  Build as RepairIcon,
  CheckCircle as CheckCircleIcon,
  Restaurant as RestaurantIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Visibility as ViewIcon,
  Assignment as ReservationIcon
} from '@mui/icons-material';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { tablesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TablesPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    capacity: '',
    location: '',
    status: 'available',
    isActive: true
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionTable, setActionTable] = useState(null);
  const [viewReservationDialog, setViewReservationDialog] = useState(false);
  const [reservationDialog, setReservationDialog] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    customerName: '',
    customerPhone: '',
    reservationTime: '',
    partySize: '',
    specialRequests: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');


  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tablesAPI.getTables();
      setTables(response.data?.tables || response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables');
      setTables([]);
      toast.error('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async () => {
    try {
      const tableData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await tablesAPI.createTable(tableData);
      setTables(prev => [...prev, response.data?.table || response.data]);
      toast.success('Table created successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error(error.response?.data?.message || 'Failed to create table');
    }
  };

  const handleUpdateTable = async () => {
    try {
      const tableData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await tablesAPI.updateTable(selectedTable._id, tableData);
      setTables(prev => prev.map(table => 
        table._id === selectedTable._id ? (response.data?.table || response.data) : table
      ));
      toast.success('Table updated successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error(error.response?.data?.message || 'Failed to update table');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await tablesAPI.deleteTable(tableId);
      setTables(prev => prev.filter(table => table._id !== tableId));
      toast.success('Table deleted successfully');
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error(error.response?.data?.message || 'Failed to delete table');
    }
  };

  const handleStatusUpdate = async (tableId, newStatus) => {
    try {
      await tablesAPI.updateTableStatus(tableId, { status: newStatus });
      setTables(prev => prev.map(table => 
        table._id === tableId ? { ...table, status: newStatus } : table
      ));
      toast.success(`Table status updated to ${newStatus}`);
      handleCloseMenu();
    } catch (error) {
      console.error('Error updating table status:', error);
      toast.error(error.response?.data?.message || 'Failed to update table status');
    }
  };

  const handleAddReservation = async () => {
    try {
      const reservationData = {
        ...reservationForm,
        partySize: parseInt(reservationForm.partySize),
        reservationTime: new Date(reservationForm.reservationTime).toISOString()
      };
      
      await tablesAPI.addReservation(actionTable._id, reservationData);
      
      // Update table with reservation
      setTables(prev => prev.map(table => 
        table._id === actionTable._id 
          ? { 
              ...table, 
              status: 'reserved',
              reservations: [...(table.reservations || []), reservationData]
            }
          : table
      ));
      
      toast.success('Reservation added successfully');
      setReservationDialog(false);
      setReservationForm({
        customerName: '',
        customerPhone: '',
        reservationTime: '',
        partySize: '',
        specialRequests: ''
      });
      handleCloseMenu();
    } catch (error) {
      console.error('Error adding reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to add reservation');
    }
  };

  const handleOpenDialog = (table = null) => {
    if (table) {
      setSelectedTable(table);
      setFormData({
        number: table.number?.toString() || '',
        name: table.name || '',
        capacity: table.capacity?.toString() || '',
        location: table.location || 'main_dining',
        status: table.status || 'available',
        isActive: table.isActive !== undefined ? table.isActive : true
      });
    } else {
      setSelectedTable(null);
      setFormData({
        number: '',
        name: '',
        capacity: '',
        location: 'main_dining',
        status: 'available',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTable(null);
  };

  const handleOpenMenu = (event, table) => {
    setMenuAnchor(event.currentTarget);
    setActionTable(table);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActionTable(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      occupied: 'error',
      reserved: 'warning',
      cleaning: 'info',
      out_of_order: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircleIcon />,
      occupied: <RestaurantIcon />,
      reserved: <ScheduleIcon />,
      cleaning: <CleanIcon />,
      out_of_order: <RepairIcon />
    };
    return icons[status] || <TableIcon />;
  };

  const getLocationLabel = (location) => {
    if (!location) return 'Unknown Location';
    const labels = {
      main_dining: 'Main Dining',
      private_dining: 'Private Dining',
      bar_area: 'Bar Area',
      patio: 'Patio'
    };
    return labels[location] || location;
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = !searchTerm || 
      table.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.number?.toString().includes(searchTerm);
    const matchesLocation = !filterLocation || table.location === filterLocation;
    const matchesStatus = !filterStatus || table.status === filterStatus;
    
    switch (activeTab) {
      case 0: return matchesSearch && matchesLocation && matchesStatus; // All Tables
      case 1: return matchesSearch && matchesLocation && matchesStatus && table.status === 'available';
      case 2: return matchesSearch && matchesLocation && matchesStatus && table.status === 'occupied';
      case 3: return matchesSearch && matchesLocation && matchesStatus && table.status === 'reserved';
      case 4: return matchesSearch && matchesLocation && matchesStatus && 
                     (table.status === 'cleaning' || table.status === 'out_of_order');
      default: return matchesSearch && matchesLocation && matchesStatus;
    }
  });

  const tabCounts = {
    all: tables?.length || 0,
    available: tables?.filter(t => t?.status === 'available')?.length || 0,
    occupied: tables?.filter(t => t?.status === 'occupied')?.length || 0,
    reserved: tables?.filter(t => t?.status === 'reserved')?.length || 0,
    maintenance: tables?.filter(t => t?.status === 'cleaning' || t?.status === 'out_of_order')?.length || 0
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableIcon color="primary" />
          Table Management
        </Typography>
        <Fab color="primary" onClick={() => handleOpenDialog()}>
          <AddIcon />
        </Fab>
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
              label="Search Tables"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or number..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                label="Location"
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="main_dining">Main Dining</MenuItem>
                <MenuItem value="private_dining">Private Dining</MenuItem>
                <MenuItem value="bar_area">Bar Area</MenuItem>
                <MenuItem value="patio">Patio</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="cleaning">Cleaning</MenuItem>
                <MenuItem value="out_of_order">Out of Order</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="outlined" onClick={fetchTables} fullWidth>
              Refresh
            </Button>
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
                All Tables
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.available} color="success">
                Available
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.occupied} color="error">
                Occupied
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.reserved} color="warning">
                Reserved
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={tabCounts.maintenance} color="info">
                Maintenance
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Tables Grid */}
      <Grid container spacing={3}>
        {filteredTables.map((table) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={table._id}>
            <Card sx={{ 
              height: '100%',
              border: table.status === 'occupied' ? '2px solid #f44336' : 
                     table.status === 'reserved' ? '2px solid #ff9800' : 
                     table.status === 'available' ? '2px solid #4caf50' : '1px solid #e0e0e0'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getStatusIcon(table.status)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {table.name || 'Unnamed Table'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Table #{table.number || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={(e) => handleOpenMenu(e, table)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Stack spacing={1}>
                  <Chip
                    icon={getStatusIcon(table.status)}
                    label={table.status?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN'}
                    color={getStatusColor(table.status)}
                    size="small"
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Capacity: {table.capacity || 0} people
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {getLocationLabel(table.location)}
                    </Typography>
                  </Box>

                  {table.currentOrder && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RestaurantIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="error">
                        Active Order
                      </Typography>
                    </Box>
                  )}

                  {table.reservations?.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ReservationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="warning.main">
                        {table.reservations.length} Reservation(s)
                      </Typography>
                    </Box>
                  )}

                  {table.lastCleaned && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Cleaned: {new Date(table.lastCleaned).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleOpenDialog(table)}>
                  <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Edit
                </Button>
                {table.reservations?.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={() => {
                      setActionTable(table);
                      setViewReservationDialog(true);
                    }}
                  >
                    <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
                    View
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTables.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TableIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No tables found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterLocation || filterStatus 
              ? 'Try adjusting your search criteria' 
              : 'Click the + button to add your first table'
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
        <MenuItem onClick={() => handleOpenDialog(actionTable)}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Edit Table</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleStatusUpdate(actionTable?._id, 'available')}>
          <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
          <ListItemText>Mark Available</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(actionTable?._id, 'occupied')}>
          <ListItemIcon><RestaurantIcon color="error" /></ListItemIcon>
          <ListItemText>Mark Occupied</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(actionTable?._id, 'cleaning')}>
          <ListItemIcon><CleanIcon color="info" /></ListItemIcon>
          <ListItemText>Mark for Cleaning</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(actionTable?._id, 'out_of_order')}>
          <ListItemIcon><RepairIcon /></ListItemIcon>
          <ListItemText>Mark Out of Order</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setReservationDialog(true);
          handleCloseMenu();
        }}>
          <ListItemIcon><ReservationIcon color="warning" /></ListItemIcon>
          <ListItemText>Add Reservation</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteTable(actionTable?._id)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Delete Table</ListItemText>
        </MenuItem>
      </Menu>

      {/* Table Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTable ? 'Edit Table' : 'Add New Table'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Table Number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Table Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  label="Location"
                >
                  <MenuItem value="main_dining">Main Dining</MenuItem>
                  <MenuItem value="private_dining">Private Dining</MenuItem>
                  <MenuItem value="bar_area">Bar Area</MenuItem>
                  <MenuItem value="patio">Patio</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="out_of_order">Out of Order</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={selectedTable ? handleUpdateTable : handleCreateTable}
            variant="contained"
          >
            {selectedTable ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reservation Dialog */}
      <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Reservation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                value={reservationForm.customerName}
                onChange={(e) => setReservationForm(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Phone"
                value={reservationForm.customerPhone}
                onChange={(e) => setReservationForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Reservation Time"
                type="datetime-local"
                value={reservationForm.reservationTime}
                onChange={(e) => setReservationForm(prev => ({ ...prev, reservationTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Party Size"
                type="number"
                value={reservationForm.partySize}
                onChange={(e) => setReservationForm(prev => ({ ...prev, partySize: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={3}
                value={reservationForm.specialRequests}
                onChange={(e) => setReservationForm(prev => ({ ...prev, specialRequests: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReservationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddReservation} variant="contained">
            Add Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reservations Dialog */}
      <Dialog 
        open={viewReservationDialog} 
        onClose={() => setViewReservationDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Table Reservations - {actionTable?.name}
        </DialogTitle>
        <DialogContent>
          {actionTable?.reservations?.length > 0 ? (
            <List>
              {actionTable.reservations.map((reservation, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemButton>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="h6">
                          {reservation.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {reservation.customerPhone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <TimeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {new Date(reservation.reservationTime).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <PeopleIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Party of {reservation.partySize}
                        </Typography>
                        {reservation.specialRequests && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Special Requests:</strong> {reservation.specialRequests}
                          </Typography>
                        )}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < actionTable.reservations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No reservations found for this table.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewReservationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablesPage;