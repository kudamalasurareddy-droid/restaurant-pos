import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button
} from '@mui/material';
import {
  Close,
  ShoppingCart,
  Kitchen,
  Warning,
  Info,
  CheckCircle,
  Error,
  NotificationImportant
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ open, onClose, notifications = [] }) => {
  const getNotificationIcon = (type) => {
    const iconMap = {
      order: <ShoppingCart color="primary" />,
      kitchen: <Kitchen color="warning" />,
      inventory: <Warning color="error" />,
      system: <Info color="info" />,
      success: <CheckCircle color="success" />,
      error: <Error color="error" />,
      warning: <Warning color="warning" />,
      info: <NotificationImportant color="info" />
    };
    return iconMap[type] || iconMap.info;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      order: 'primary',
      kitchen: 'warning',
      inventory: 'error',
      system: 'info',
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return colorMap[type] || 'default';
  };

  const getPriorityLabel = (priority) => {
    const labelMap = {
      high: 'High Priority',
      medium: 'Medium',
      low: 'Low'
    };
    return labelMap[priority] || '';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return colorMap[priority] || 'default';
  };

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read functionality
    console.log('Mark all notifications as read');
  };

  const handleClearAll = () => {
    // TODO: Implement clear all notifications functionality
    console.log('Clear all notifications');
  };

  const sortedNotifications = notifications.sort((a, b) => {
    // Sort by priority first, then by timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          Notifications
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {notifications.length > 0 && (
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleMarkAllAsRead}
            sx={{ flex: 1 }}
          >
            Mark All Read
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleClearAll}
            sx={{ flex: 1 }}
          >
            Clear All
          </Button>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {sortedNotifications.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <NotificationImportant sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">
              No notifications
            </Typography>
            <Typography variant="body2">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedNotifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    bgcolor: notification.read ? 'transparent' : 'action.selected',
                    borderLeft: notification.priority === 'high' ? '4px solid' : 'none',
                    borderLeftColor: 'error.main'
                  }}
                >
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                        {notification.priority && notification.priority !== 'low' && (
                          <Chip
                            label={getPriorityLabel(notification.priority)}
                            size="small"
                            color={getPriorityColor(notification.priority)}
                            sx={{ height: 18, fontSize: '0.625rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </Typography>
                          {notification.type && (
                            <Chip
                              label={notification.type.toUpperCase()}
                              size="small"
                              variant="outlined"
                              color={getNotificationColor(notification.type)}
                              sx={{ height: 16, fontSize: '0.625rem' }}
                            />
                          )}
                        </Box>
                        {notification.data && notification.data.orderId && (
                          <Typography variant="caption" color="primary.main">
                            Order #{notification.data.orderId}
                          </Typography>
                        )}
                        {notification.data && notification.data.tableNumber && (
                          <Typography variant="caption" color="secondary.main">
                            Table {notification.data.tableNumber}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          mt: 1
                        }}
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < sortedNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;