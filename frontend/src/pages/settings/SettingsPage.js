import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Restaurant as RestaurantIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Print as PrintIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  LocalTaxi as TaxIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState({});
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Restaurant Settings
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    timezone: 'UTC',
    currency: 'USD',
    taxRate: 0,
    serviceCharge: 0,
    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableTwoFactor: false,
    allowRemoteAccess: true,
    logLevel: 'info',
    maxLogSize: 100,
    enableAuditLog: true,
    dataRetentionDays: 365
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderAlerts: true,
    inventoryAlerts: true,
    systemAlerts: true,
    lowStockThreshold: 10,
    emailServer: {
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      encryption: 'TLS'
    },
    smsProvider: {
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      fromNumber: ''
    }
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptDigitalWallet: true,
    enableTips: true,
    defaultTipPercentage: 15,
    allowCustomTips: true,
    cardProcessors: [
      { name: 'Stripe', enabled: true, apiKey: '••••••••', testMode: false },
      { name: 'PayPal', enabled: false, apiKey: '', testMode: true },
      { name: 'Square', enabled: false, apiKey: '', testMode: true }
    ],
    receiptSettings: {
      printAutomatically: true,
      emailReceipts: true,
      includeQRCode: true,
      footerMessage: 'Thank you for dining with us!'
    }
  });

  // UI Settings
  const [, setUiSettings] = useState({
    theme: 'light',
    primaryColor: '#1976d2',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    showWelcomeScreen: true,
    enableAnimations: true,
    compactMode: false,
    soundEnabled: true
  });

  // System Status
  const [systemStatus, setSystemStatus] = useState({
    serverStatus: 'online',
    databaseStatus: 'connected',
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
    diskSpace: { used: 45, total: 100 },
    memory: { used: 2.1, total: 8 },
    uptime: ' 7 days, 14 hours',
    version: '2.1.0',
    environment: 'production'
  });

  useEffect(() => {
    // Load settings from API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load restaurant settings
      const restaurantRes = await settingsAPI.getSettings('restaurant');
      if (restaurantRes.success && restaurantRes.data) {
        setRestaurantSettings(restaurantRes.data.settings || restaurantRes.data);
      }
      
      // Load system settings
      const systemRes = await settingsAPI.getSettings('system');
      if (systemRes.success && systemRes.data) {
        setSystemSettings(systemRes.data.settings || systemRes.data);
      }
      
      // Load notification settings
      const notificationRes = await settingsAPI.getSettings('notification');
      if (notificationRes.success && notificationRes.data) {
        setNotificationSettings(notificationRes.data.settings || notificationRes.data);
      }
      
      // Load payment settings
      const paymentRes = await settingsAPI.getSettings('payment');
      if (paymentRes.success && paymentRes.data) {
        setPaymentSettings(paymentRes.data.settings || paymentRes.data);
      }
      
      // Load UI settings
      const uiRes = await settingsAPI.getSettings('ui');
      if (uiRes.success && uiRes.data) {
        setUiSettings(uiRes.data.settings || uiRes.data);
      }
      
      // Load system status
      const statusRes = await settingsAPI.getSystemStatus();
      if (statusRes.success && statusRes.data) {
        setSystemStatus(statusRes.data);
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = async (settingsType) => {
    try {
      setLoading(true);
      // In a real app, you'd save to API
      // await settingsAPI.updateSettings(settingsType, settings);
      
      toast.success('Settings saved successfully');
      setEditMode({ ...editMode, [settingsType]: false });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      // In a real app, you'd trigger backup API
      // await systemAPI.createBackup();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Backup created successfully');
      setShowBackupDialog(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'success';
      case 'warning':
        return 'warning';
      case 'offline':
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'offline':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const RestaurantSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon /> Restaurant Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Restaurant Name"
                  value={restaurantSettings.name}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, name: e.target.value})}
                  disabled={!editMode.restaurant}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={restaurantSettings.address}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, address: e.target.value})}
                  disabled={!editMode.restaurant}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={restaurantSettings.phone}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, phone: e.target.value})}
                  disabled={!editMode.restaurant}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={restaurantSettings.email}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, email: e.target.value})}
                  disabled={!editMode.restaurant}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={restaurantSettings.website}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, website: e.target.value})}
                  disabled={!editMode.restaurant}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant={editMode.restaurant ? "outlined" : "contained"}
              startIcon={editMode.restaurant ? <SaveIcon /> : <EditIcon />}
              onClick={() => {
                if (editMode.restaurant) {
                  handleSaveSettings('restaurant');
                } else {
                  setEditMode({...editMode, restaurant: true});
                }
              }}
              disabled={loading}
            >
              {editMode.restaurant ? 'Save' : 'Edit'}
            </Button>
            {editMode.restaurant && (
              <Button
                onClick={() => setEditMode({...editMode, restaurant: false})}
              >
                Cancel
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaxIcon /> Financial Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={restaurantSettings.currency}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, currency: e.target.value})}
                    disabled={!editMode.financial}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={restaurantSettings.timezone}
                    onChange={(e) => setRestaurantSettings({...restaurantSettings, timezone: e.target.value})}
                    disabled={!editMode.financial}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="EST">Eastern Time</MenuItem>
                    <MenuItem value="PST">Pacific Time</MenuItem>
                    <MenuItem value="CST">Central Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Rate"
                  type="number"
                  value={restaurantSettings.taxRate}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, taxRate: parseFloat(e.target.value)})}
                  disabled={!editMode.financial}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Service Charge"
                  type="number"
                  value={restaurantSettings.serviceCharge}
                  onChange={(e) => setRestaurantSettings({...restaurantSettings, serviceCharge: parseFloat(e.target.value)})}
                  disabled={!editMode.financial}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant={editMode.financial ? "outlined" : "contained"}
              startIcon={editMode.financial ? <SaveIcon /> : <EditIcon />}
              onClick={() => {
                if (editMode.financial) {
                  handleSaveSettings('financial');
                } else {
                  setEditMode({...editMode, financial: true});
                }
              }}
              disabled={loading}
            >
              {editMode.financial ? 'Save' : 'Edit'}
            </Button>
            {editMode.financial && (
              <Button
                onClick={() => setEditMode({...editMode, financial: false})}
              >
                Cancel
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon /> Operating Hours
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Open Time</TableCell>
                    <TableCell>Close Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(restaurantSettings.operatingHours).map(([day, hours]) => (
                    <TableRow key={day}>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{day}</TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={hours.open}
                          onChange={(e) => setRestaurantSettings({
                            ...restaurantSettings,
                            operatingHours: {
                              ...restaurantSettings.operatingHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          })}
                          disabled={!editMode.hours || hours.closed}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={hours.close}
                          onChange={(e) => setRestaurantSettings({
                            ...restaurantSettings,
                            operatingHours: {
                              ...restaurantSettings.operatingHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          })}
                          disabled={!editMode.hours || hours.closed}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!hours.closed}
                              onChange={(e) => setRestaurantSettings({
                                ...restaurantSettings,
                                operatingHours: {
                                  ...restaurantSettings.operatingHours,
                                  [day]: { ...hours, closed: !e.target.checked }
                                }
                              })}
                              disabled={!editMode.hours}
                            />
                          }
                          label={hours.closed ? "Closed" : "Open"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions>
            <Button
              variant={editMode.hours ? "outlined" : "contained"}
              startIcon={editMode.hours ? <SaveIcon /> : <EditIcon />}
              onClick={() => {
                if (editMode.hours) {
                  handleSaveSettings('hours');
                } else {
                  setEditMode({...editMode, hours: true});
                }
              }}
              disabled={loading}
            >
              {editMode.hours ? 'Save' : 'Edit'}
            </Button>
            {editMode.hours && (
              <Button
                onClick={() => setEditMode({...editMode, hours: false})}
              >
                Cancel
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  const SystemSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon /> Security Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Enable Two-Factor Authentication" secondary="Add extra security to user accounts" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={systemSettings.enableTwoFactor}
                    onChange={(e) => setSystemSettings({...systemSettings, enableTwoFactor: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Allow Remote Access" secondary="Enable access from outside network" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={systemSettings.allowRemoteAccess}
                    onChange={(e) => setSystemSettings({...systemSettings, allowRemoteAccess: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Enable Audit Log" secondary="Track all system activities" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={systemSettings.enableAuditLog}
                    onChange={(e) => setSystemSettings({...systemSettings, enableAuditLog: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={systemSettings.maxLoginAttempts}
                  onChange={(e) => setSystemSettings({...systemSettings, maxLoginAttempts: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BackupIcon /> Backup & Maintenance
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Auto Backup" secondary="Automatically backup data" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary={`Last Backup: ${systemStatus.lastBackup.toLocaleDateString()}`} />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowBackupDialog(true)}
                  >
                    Backup Now
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Data Retention (days)"
                  type="number"
                  value={systemSettings.dataRetentionDays}
                  onChange={(e) => setSystemSettings({...systemSettings, dataRetentionDays: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon /> System Status
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {getStatusIcon(systemStatus.serverStatus)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Server
                    </Typography>
                  </Box>
                  <Chip 
                    label={systemStatus.serverStatus.toUpperCase()} 
                    color={getStatusColor(systemStatus.serverStatus)}
                    size="small"
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {getStatusIcon(systemStatus.databaseStatus)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Database
                    </Typography>
                  </Box>
                  <Chip 
                    label={systemStatus.databaseStatus.toUpperCase()} 
                    color={getStatusColor(systemStatus.databaseStatus)}
                    size="small"
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Memory</Typography>
                  <Typography variant="body2">
                    {systemStatus.memory.used}GB / {systemStatus.memory.total}GB
                  </Typography>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.300', borderRadius: 1, mt: 1 }}>
                    <Box 
                      sx={{ 
                        width: `${(systemStatus.memory.used / systemStatus.memory.total) * 100}%`, 
                        height: '100%', 
                        bgcolor: 'primary.main', 
                        borderRadius: 1 
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Disk Space</Typography>
                  <Typography variant="body2">
                    {systemStatus.diskSpace.used}GB / {systemStatus.diskSpace.total}GB
                  </Typography>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.300', borderRadius: 1, mt: 1 }}>
                    <Box 
                      sx={{ 
                        width: `${(systemStatus.diskSpace.used / systemStatus.diskSpace.total) * 100}%`, 
                        height: '100%', 
                        bgcolor: 'success.main', 
                        borderRadius: 1 
                      }} 
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Uptime:</strong> {systemStatus.uptime}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Version:</strong> {systemStatus.version}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Environment:</strong> {systemStatus.environment}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSettings}
              disabled={loading}
            >
              Refresh Status
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('system')}
              disabled={loading}
            >
              Save Settings
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  const NotificationSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon /> Notification Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Email Notifications" secondary="Receive alerts via email" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="SMS Notifications" secondary="Receive alerts via SMS" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Order Alerts" secondary="New order notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.orderAlerts}
                    onChange={(e) => setNotificationSettings({...notificationSettings, orderAlerts: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Inventory Alerts" secondary="Low stock notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.inventoryAlerts}
                    onChange={(e) => setNotificationSettings({...notificationSettings, inventoryAlerts: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <TextField
              fullWidth
              label="Low Stock Threshold"
              type="number"
              value={notificationSettings.lowStockThreshold}
              onChange={(e) => setNotificationSettings({...notificationSettings, lowStockThreshold: parseInt(e.target.value)})}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon /> Email Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={notificationSettings.emailServer.host}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailServer: {...notificationSettings.emailServer, host: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={notificationSettings.emailServer.port}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailServer: {...notificationSettings.emailServer, port: parseInt(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={notificationSettings.emailServer.username}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailServer: {...notificationSettings.emailServer, username: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={notificationSettings.emailServer.password}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailServer: {...notificationSettings.emailServer, password: e.target.value}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Encryption</InputLabel>
                  <Select
                    value={notificationSettings.emailServer.encryption}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailServer: {...notificationSettings.emailServer, encryption: e.target.value}
                    })}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="TLS">TLS</MenuItem>
                    <MenuItem value="SSL">SSL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              onClick={() => setShowEmailDialog(true)}
            >
              Test Email
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('notifications')}
              disabled={loading}
            >
              Save
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  const PaymentSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon /> Payment Methods
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Accept Cash" secondary="Allow cash payments" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.acceptCash}
                    onChange={(e) => setPaymentSettings({...paymentSettings, acceptCash: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Accept Cards" secondary="Credit/Debit card payments" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.acceptCard}
                    onChange={(e) => setPaymentSettings({...paymentSettings, acceptCard: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Digital Wallets" secondary="PayPal, ApplePay, GooglePay" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.acceptDigitalWallet}
                    onChange={(e) => setPaymentSettings({...paymentSettings, acceptDigitalWallet: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Enable Tips" secondary="Allow customers to add tips" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.enableTips}
                    onChange={(e) => setPaymentSettings({...paymentSettings, enableTips: e.target.checked})}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Default Tip %"
                  type="number"
                  value={paymentSettings.defaultTipPercentage}
                  onChange={(e) => setPaymentSettings({...paymentSettings, defaultTipPercentage: parseInt(e.target.value)})}
                  disabled={!paymentSettings.enableTips}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentSettings.allowCustomTips}
                      onChange={(e) => setPaymentSettings({...paymentSettings, allowCustomTips: e.target.checked})}
                      disabled={!paymentSettings.enableTips}
                    />
                  }
                  label="Custom Tips"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon /> Receipt Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText primary="Auto Print Receipts" secondary="Print receipts automatically" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.receiptSettings.printAutomatically}
                    onChange={(e) => setPaymentSettings({
                      ...paymentSettings,
                      receiptSettings: {...paymentSettings.receiptSettings, printAutomatically: e.target.checked}
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Email Receipts" secondary="Send receipts via email" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.receiptSettings.emailReceipts}
                    onChange={(e) => setPaymentSettings({
                      ...paymentSettings,
                      receiptSettings: {...paymentSettings.receiptSettings, emailReceipts: e.target.checked}
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Include QR Code" secondary="Add QR code for reviews/feedback" />
                <ListItemSecondaryAction>
                  <Switch
                    checked={paymentSettings.receiptSettings.includeQRCode}
                    onChange={(e) => setPaymentSettings({
                      ...paymentSettings,
                      receiptSettings: {...paymentSettings.receiptSettings, includeQRCode: e.target.checked}
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <TextField
              fullWidth
              label="Footer Message"
              multiline
              rows={2}
              value={paymentSettings.receiptSettings.footerMessage}
              onChange={(e) => setPaymentSettings({
                ...paymentSettings,
                receiptSettings: {...paymentSettings.receiptSettings, footerMessage: e.target.value}
              })}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon /> Payment Processors
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>API Key</TableCell>
                    <TableCell>Test Mode</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentSettings.cardProcessors.map((processor, index) => (
                    <TableRow key={processor.name}>
                      <TableCell>{processor.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={processor.enabled ? "Enabled" : "Disabled"}
                          color={processor.enabled ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={processor.apiKey}
                          type="password"
                          placeholder="Enter API key"
                          onChange={(e) => {
                            const updatedProcessors = [...paymentSettings.cardProcessors];
                            updatedProcessors[index].apiKey = e.target.value;
                            setPaymentSettings({...paymentSettings, cardProcessors: updatedProcessors});
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={processor.testMode}
                          onChange={(e) => {
                            const updatedProcessors = [...paymentSettings.cardProcessors];
                            updatedProcessors[index].testMode = e.target.checked;
                            setPaymentSettings({...paymentSettings, cardProcessors: updatedProcessors});
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={processor.enabled}
                          onChange={(e) => {
                            const updatedProcessors = [...paymentSettings.cardProcessors];
                            updatedProcessors[index].enabled = e.target.checked;
                            setPaymentSettings({...paymentSettings, cardProcessors: updatedProcessors});
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('payment')}
              disabled={loading}
            >
              Save Payment Settings
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SettingsIcon fontSize="large" />
        System Settings
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Restaurant" />
          <Tab label="System" />
          <Tab label="Notifications" />
          <Tab label="Payments" />
        </Tabs>
      </Paper>

      {tabValue === 0 && <RestaurantSettingsTab />}
      {tabValue === 1 && <SystemSettingsTab />}
      {tabValue === 2 && <NotificationSettingsTab />}  
      {tabValue === 3 && <PaymentSettingsTab />}

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onClose={() => setShowBackupDialog(false)}>
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            This will create a complete backup of your system data including:
          </Typography>
          <List dense>
            <ListItem><ListItemText primary="• All orders and transactions" /></ListItem>
            <ListItem><ListItemText primary="• Menu items and categories" /></ListItem>
            <ListItem><ListItemText primary="• User accounts and permissions" /></ListItem>
            <ListItem><ListItemText primary="• System settings and configuration" /></ListItem>
            <ListItem><ListItemText primary="• Inventory and stock levels" /></ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            The backup process may take a few minutes to complete.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBackup} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {loading ? 'Creating...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Email Configuration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test Email Address"
            type="email"
            margin="normal"
            placeholder="Enter email to send test message"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            A test email will be sent using your current SMTP configuration.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<EmailIcon />}>
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;