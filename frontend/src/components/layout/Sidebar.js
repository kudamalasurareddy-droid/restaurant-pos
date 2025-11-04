import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  alpha
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  Restaurant,
  TableRestaurant,
  Inventory,
  People,
  Assessment,
  Receipt,
  PointOfSale,
  Kitchen,
  Person,
  Settings,
  AdminPanelSettings
} from '@mui/icons-material';

import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { stats } = useSocket();

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  // Navigation items configuration
  const navigationItems = [
    {
      section: 'Main',
      items: [
        {
          path: '/dashboard',
          label: 'Dashboard',
          icon: <Dashboard />,
          roles: ['admin', 'manager', 'cashier', 'waiter', 'kitchen_staff']
        }
      ]
    },
    {
      section: 'Customer',
      items: [
        {
          path: '/customer',
          label: 'Order Online',
          icon: <ShoppingCart />,
          roles: ['customer']
        }
      ]
    },
    {
      section: 'Operations',
      items: [
        {
          path: '/orders',
          label: 'Orders',
          icon: <ShoppingCart />,
          roles: ['admin', 'manager', 'cashier', 'waiter'],
          permission: { module: 'orders', action: 'read' },
          badge: stats?.pendingOrders > 0 ? stats.pendingOrders : null,
          badgeColor: 'warning'
        },
        {
          path: '/pos',
          label: 'Point of Sale',
          icon: <PointOfSale />,
          roles: ['admin', 'manager', 'cashier', 'waiter']
        },
        {
          path: '/tables',
          label: 'Tables',
          icon: <TableRestaurant />,
          roles: ['admin', 'manager', 'waiter'],
          permission: { module: 'tables', action: 'read' },
          badge: stats?.occupiedTables > 0 ? stats.occupiedTables : null,
          badgeColor: 'info'
        },
        {
          path: '/kot',
          label: 'Kitchen Orders',
          icon: <Receipt />,
          roles: ['admin', 'manager', 'kitchen_staff'],
          permission: { module: 'kot', action: 'read' },
          badge: stats?.pendingKOTs > 0 ? stats.pendingKOTs : null,
          badgeColor: 'error'
        },
        {
          path: '/kitchen',
          label: 'Kitchen Display',
          icon: <Kitchen />,
          roles: ['admin', 'manager', 'kitchen_staff']
        }
      ]
    },
    {
      section: 'Management',
      items: [
        {
          path: '/menu',
          label: 'Menu',
          icon: <Restaurant />,
          roles: ['admin', 'manager'],
          permission: { module: 'menu', action: 'read' }
        },
        {
          path: '/inventory',
          label: 'Inventory',
          icon: <Inventory />,
          roles: ['admin', 'manager'],
          permission: { module: 'inventory', action: 'read' },
          badge: stats?.lowStockItems > 0 ? stats.lowStockItems : null,
          badgeColor: 'warning'
        },
        {
          path: '/users',
          label: 'Users',
          icon: <People />,
          roles: ['admin', 'manager'],
          permission: { module: 'users', action: 'read' }
        }
      ]
    },
    {
      section: 'Analytics',
      items: [
        {
          path: '/reports',
          label: 'Reports',
          icon: <Assessment />,
          roles: ['admin', 'manager'],
          permission: { module: 'reports', action: 'read' }
        }
      ]
    },
    {
      section: 'Account',
      items: [
        {
          path: '/profile',
          label: 'Profile',
          icon: <Person />,
          roles: ['admin', 'manager', 'cashier', 'waiter', 'kitchen_staff', 'customer']
        },
        {
          path: '/settings',
          label: 'Settings',
          icon: <Settings />,
          roles: ['admin', 'manager']
        }
      ]
    }
  ];

  // Filter items based on user permissions
  const filterItems = (items) => {
    return items.filter(item => {
      // Check role access
      if (item.roles && !item.roles.includes(user?.role)) {
        return false;
      }

      // Check permission access
      if (item.permission && !hasPermission(item.permission.module, item.permission.action)) {
        return false;
      }

      return true;
    });
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Restaurant POS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.restaurant?.name || 'Management System'}
        </Typography>
      </Box>

      <Divider />

      {/* User info */}
      <Box sx={{ p: 2, bgcolor: alpha('#1976d2', 0.05) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
          {user?.role === 'admin' && (
            <AdminPanelSettings color="primary" fontSize="small" />
          )}
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {navigationItems.map((section, sectionIndex) => {
          const filteredItems = filterItems(section.items);
          
          if (filteredItems.length === 0) return null;

          return (
            <Box key={sectionIndex}>
              {section.section && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {section.section}
                </Typography>
              )}
              
              <List sx={{ px: 1 }}>
                {filteredItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActiveRoute(item.path)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: alpha('#1976d2', 0.12),
                          '&:hover': {
                            bgcolor: alpha('#1976d2', 0.16),
                          },
                        },
                        '&:hover': {
                          bgcolor: alpha('#1976d2', 0.08),
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.875rem',
                            fontWeight: isActiveRoute(item.path) ? 600 : 400,
                            color: isActiveRoute(item.path) ? 'primary.main' : 'text.primary'
                          }
                        }}
                      />
                      
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          color={item.badgeColor || 'default'}
                          sx={{
                            height: 20,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              
              {sectionIndex < navigationItems.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          );
        })}
      </Box>

      {/* Footer info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;