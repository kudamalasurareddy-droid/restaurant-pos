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
  Avatar,
  Badge,
  Divider,
  FormGroup,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  PointOfSale as CashierIcon,
  Restaurant as WaiterIcon,
  Kitchen as KitchenIcon,
  Group as CustomerIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';

const UsersPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [userDialog, setUserDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    permissions: [],
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    salary: '',
    hireDate: '',
    department: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    monday: { isWorking: false, start: '09:00', end: '17:00' },
    tuesday: { isWorking: false, start: '09:00', end: '17:00' },
    wednesday: { isWorking: false, start: '09:00', end: '17:00' },
    thursday: { isWorking: false, start: '09:00', end: '17:00' },
    friday: { isWorking: false, start: '09:00', end: '17:00' },
    saturday: { isWorking: false, start: '09:00', end: '17:00' },
    sunday: { isWorking: false, start: '09:00', end: '17:00' }
  });

  const roles = [
    { value: 'admin', label: 'Administrator', icon: AdminIcon, color: '#f44336' },
    { value: 'manager', label: 'Manager', icon: ManagerIcon, color: '#ff9800' },
    { value: 'cashier', label: 'Cashier', icon: CashierIcon, color: '#2196f3' },
    { value: 'waiter', label: 'Waiter', icon: WaiterIcon, color: '#4caf50' },
    { value: 'kitchen_staff', label: 'Kitchen Staff', icon: KitchenIcon, color: '#9c27b0' },
    { value: 'customer', label: 'Customer', icon: CustomerIcon, color: '#607d8b' }
  ];

  const allPermissions = [
    'users.read', 'users.create', 'users.update', 'users.delete',
    'menu.read', 'menu.create', 'menu.update', 'menu.delete',
    'orders.read', 'orders.create', 'orders.update', 'orders.delete',
    'tables.read', 'tables.create', 'tables.update', 'tables.delete',
    'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
    'reports.read', 'reports.create', 'reports.export',
    'kot.read', 'kot.update',
    'pos.access', 'kitchen.access', 'settings.access'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data.data || response.data.users || response.data || []);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    try {
      const formData = {
        ...userForm,
        salary: userForm.salary ? parseFloat(userForm.salary) : undefined,
        hireDate: userForm.hireDate ? new Date(userForm.hireDate) : undefined
      };

      if (editingUser) {
        await usersAPI.updateUser(editingUser._id, formData);
        setSuccess('User updated successfully');
      } else {
        // For new users, we need to include a temporary password
        formData.password = 'temp123'; // They can change it later
        await usersAPI.createUser(formData);
        setSuccess('User created successfully');
      }
      setUserDialog(false);
      resetUserForm();
      fetchUsers();
    } catch (err) {
      setError('Failed to save user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await usersAPI.resetPassword(selectedUser._id, {
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password reset successfully');
      setPasswordDialog(false);
      resetPasswordForm();
    } catch (err) {
      setError('Failed to reset password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await usersAPI.toggleUserStatus(userId);
      setSuccess('User status updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(id);
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      permissions: [],
      isActive: true,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      salary: '',
      hireDate: '',
      department: ''
    });
    setEditingUser(null);
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  const openEditUser = (user) => {
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      permissions: user.permissions || [],
      isActive: user.isActive !== false,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || ''
      },
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        phone: user.emergencyContact?.phone || '',
        relationship: user.emergencyContact?.relationship || ''
      },
      salary: user.salary?.toString() || '',
      hireDate: user.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : '',
      department: user.department || ''
    });
    setEditingUser(user);
    setUserDialog(true);
  };

  const openPasswordReset = (user) => {
    setSelectedUser(user);
    setPasswordDialog(true);
  };

  const openScheduleDialog = (user) => {
    if (user.shifts) {
      setScheduleForm(user.shifts);
    }
    setSelectedUser(user);
    setScheduleDialog(true);
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const getFilteredUsers = () => {
    switch (tabValue) {
      case 1: return users.filter(u => u.role === 'admin' || u.role === 'manager');
      case 2: return users.filter(u => ['cashier', 'waiter', 'kitchen_staff'].includes(u.role));
      case 3: return users.filter(u => u.role === 'customer');
      case 4: return users.filter(u => !u.isActive);
      default: return users;
    }
  };

  const getStatusColor = (user) => {
    if (!user.isActive) return 'error';
    if (user.role === 'admin') return 'error';
    if (user.role === 'manager') return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={`All Users (${users.length})`} />
        <Tab label={`Management (${users.filter(u => u.role === 'admin' || u.role === 'manager').length})`} />
        <Tab label={`Staff (${users.filter(u => ['cashier', 'waiter', 'kitchen_staff'].includes(u.role)).length})`} />
        <Tab label={`Customers (${users.filter(u => u.role === 'customer').length})`} />
        <Tab 
          label={
            <Badge badgeContent={users.filter(u => !u.isActive).length} color="error">
              Inactive
            </Badge>
          } 
        />
      </Tabs>

      {/* Users Display */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            {tabValue === 0 && 'All Users'}
            {tabValue === 1 && 'Management Team'}
            {tabValue === 2 && 'Staff Members'}
            {tabValue === 3 && 'Customers'}
            {tabValue === 4 && 'Inactive Users'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetUserForm();
              setUserDialog(true);
            }}
          >
            Add User
          </Button>
        </Box>

        <Grid container spacing={3}>
          {getFilteredUsers().map((user) => {
            const roleInfo = getRoleInfo(user.role);
            const RoleIcon = roleInfo.icon;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: roleInfo.color, 
                          mr: 2,
                          width: 56,
                          height: 56
                        }}
                      >
                        <RoleIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.phone}
                        </Typography>
                      </Box>
                      {!user.isActive && <LockIcon color="error" />}
                    </Box>

                    <Box mb={2}>
                      <Chip
                        label={roleInfo.label}
                        sx={{ 
                          backgroundColor: roleInfo.color + '20',
                          color: roleInfo.color,
                          mb: 1
                        }}
                        size="small"
                      />
                      <br />
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={getStatusColor(user)}
                        size="small"
                      />
                    </Box>

                    {user.department && (
                      <Typography variant="body2" color="text.secondary">
                        Department: {user.department}
                      </Typography>
                    )}

                    {user.hireDate && (
                      <Typography variant="body2" color="text.secondary">
                        Hired: {new Date(user.hireDate).toLocaleDateString()}
                      </Typography>
                    )}

                    {user.permissions && user.permissions.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Permissions: {user.permissions.length}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => openScheduleDialog(user)} title="Schedule">
                      <ScheduleIcon />
                    </IconButton>
                    <IconButton onClick={() => openPasswordReset(user)} title="Reset Password">
                      <LockIcon />
                    </IconButton>
                    <IconButton onClick={() => openEditUser(user)} title="Edit User">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleToggleStatus(user._id)} 
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <LockIcon /> : <UnlockIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user._id)} title="Delete User">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box display="flex" alignItems="center">
                        <role.icon sx={{ mr: 1, color: role.color }} />
                        {role.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                margin="normal"
              />
            </Grid>

            {/* Employment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Employment Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={userForm.salary}
                onChange={(e) => setUserForm({ ...userForm, salary: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={userForm.hireDate}
                onChange={(e) => setUserForm({ ...userForm, hireDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={userForm.address.street}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  address: { ...userForm.address, street: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={userForm.address.city}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  address: { ...userForm.address, city: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={userForm.address.state}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  address: { ...userForm.address, state: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={userForm.address.zipCode}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  address: { ...userForm.address, zipCode: e.target.value }
                })}
                margin="normal"
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Emergency Contact</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={userForm.emergencyContact.name}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  emergencyContact: { ...userForm.emergencyContact, name: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={userForm.emergencyContact.phone}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  emergencyContact: { ...userForm.emergencyContact, phone: e.target.value }
                })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={userForm.emergencyContact.relationship}
                onChange={(e) => setUserForm({ 
                  ...userForm, 
                  emergencyContact: { ...userForm.emergencyContact, relationship: e.target.value }
                })}
                margin="normal"
              />
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Permissions</Typography>
              <Divider sx={{ mb: 2 }} />
              <FormGroup row>
                {allPermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={userForm.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserForm({
                              ...userForm,
                              permissions: [...userForm.permissions, permission]
                            });
                          } else {
                            setUserForm({
                              ...userForm,
                              permissions: userForm.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                      />
                    }
                    label={permission}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reset Password - {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordReset} variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;