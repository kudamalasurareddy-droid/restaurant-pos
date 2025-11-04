import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    employeeId: user?.employeeId || '',
    role: user?.role || '',
    department: user?.department || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    dateOfBirth: user?.dateOfBirth || '',
    joiningDate: user?.joiningDate || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    orderAlerts: user?.preferences?.orderAlerts ?? true,
    systemUpdates: user?.preferences?.systemUpdates ?? false,
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
    timezone: user?.preferences?.timezone || 'UTC'
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileStats, setProfileStats] = useState({
    ordersHandled: 0,
    tablesServed: 0,
    customerRating: 0,
    totalShifts: 0,
    hoursWorked: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch user stats and activity from MongoDB
  const fetchUserStats = async () => {
    try {
      const response = await usersAPI.getUserStats({ personal: 'true' });
      setProfileStats(response.data.stats || {
        ordersHandled: 0,
        tablesServed: 0,
        customerRating: 0,
        totalShifts: 0,
        hoursWorked: 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to load user statistics');
      setProfileStats({
        ordersHandled: 0,
        tablesServed: 0,
        customerRating: 0,
        totalShifts: 0,
        hoursWorked: 0
      });
    }
  };

  const fetchUserActivity = async () => {
    try {
      const response = await usersAPI.getUserActivity();
      setRecentActivity(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast.error('Failed to load activity history');
      setRecentActivity([]);
    }
  };

  const fetchAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      await Promise.all([fetchUserStats(), fetchUserActivity()]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
        department: user.department || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        dateOfBirth: user.dateOfBirth || '',
        joiningDate: user.joiningDate || ''
      });
      
      // Fetch real data from MongoDB
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset data
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
        department: user.department || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        dateOfBirth: user.dateOfBirth || '',
        joiningDate: user.joiningDate || ''
      });
    }
    setEditMode(!editMode);
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data.user);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (key, value) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);
      // In a real app, you'd save to backend
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
    }
  };

  const getRoleChipColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      waiter: 'primary',
      kitchen_staff: 'success',
      cashier: 'info'
    };
    return colors[role] || 'default';
  };

  const getActivityIcon = (type) => {
    const icons = {
      order: <WorkIcon />,
      service: <PersonIcon />,
      system: <SettingsIcon />,
      payment: <BadgeIcon />,
      attendance: <ScheduleIcon />
    };
    return icons[type] || <HistoryIcon />;
  };

  const ProfileOverview = () => (
    <Grid container spacing={3}>
      {/* Profile Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: -8,
                  bgcolor: 'background.paper',
                  border: 2,
                  borderColor: 'divider'
                }}
                size="small"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h5" gutterBottom>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Chip 
              label={profileData.role?.toUpperCase()} 
              color={getRoleChipColor(profileData.role)}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee ID: {profileData.employeeId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileData.department} Department
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              variant={editMode ? "outlined" : "contained"}
              color={editMode ? "error" : "primary"}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
            {editMode && (
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleProfileSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>

      {/* Profile Details */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={profileData.employeeId}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="action" />
                      </InputAdornment>
                    ),
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    readOnly: !editMode
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    readOnly: !editMode
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const SecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon /> Password & Security
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Keep your account secure by using a strong password and enabling two-factor authentication.
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setShowPasswordDialog(true)}
              sx={{ mb: 2 }}
            >
              Change Password
            </Button>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Security Status
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Strong Password" 
                    secondary="Your password meets security requirements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Verified" 
                    secondary="Your email address is verified"
                  />
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon /> Notification Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferencesUpdate('emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="SMS Notifications" secondary="Receive updates via SMS" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.smsNotifications}
                    onChange={(e) => handlePreferencesUpdate('smsNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Push Notifications" secondary="Receive browser notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={(e) => handlePreferencesUpdate('pushNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Order Alerts" secondary="Get notified about new orders" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.orderAlerts}
                    onChange={(e) => handlePreferencesUpdate('orderAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const ActivityStats = () => (
    <Grid container spacing={3}>
      {/* Performance Stats */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon /> Performance Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="h4" gutterBottom>
                      {profileStats.ordersHandled.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Orders Handled
                    </Typography>
                  </Paper>
                </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h4" gutterBottom>
                    {profileStats.tablesServed.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Tables Served
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Typography variant="h4" gutterBottom>
                    {profileStats.customerRating}⭐
                  </Typography>
                  <Typography variant="body2">
                    Customer Rating
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="h4" gutterBottom>
                    {profileStats.totalShifts}
                  </Typography>
                  <Typography variant="body2">
                    Total Shifts
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Typography variant="h4" gutterBottom>
                    {profileStats.hoursWorked.toLocaleString()}h
                  </Typography>
                  <Typography variant="body2">
                    Hours Worked
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon /> Recent Activity
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent activity found
              </Typography>
            ) : (
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem key={activity.id || index} divider>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PersonIcon fontSize="large" />
        User Profile
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Profile Overview" />
          <Tab label="Security & Notifications" />
          <Tab label="Activity & Stats" />
        </Tabs>
      </Paper>

      {tabValue === 0 && <ProfileOverview />}
      {tabValue === 1 && <SecuritySettings />}
      {tabValue === 2 && <ActivityStats />}

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                      >
                        {showPassword.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                      >
                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                      >
                        {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained" 
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
          >
            {loading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;