# Restaurant POS System API Documentation

## Overview
This document provides comprehensive information about all API endpoints available in the Restaurant POS System, including dummy login credentials and sample data.

## Authentication

### Demo Login Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@restaurant.com | admin123 | Full system access |
| **Manager** | manager@restaurant.com | manager123 | Most features except user management |
| **Cashier** | cashier@restaurant.com | cashier123 | Sales, orders, basic operations |
| **Waiter** | waiter@restaurant.com | waiter123 | Orders, tables, menu viewing |
| **Kitchen Staff** | kitchen@restaurant.com | kitchen123 | KOT management, order status |
| **Customer** | customer@example.com | customer123 | Menu viewing, order placement |

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

#### POST /api/auth/register
Register new user (Admin only in production)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@restaurant.com",
  "password": "password123",
  "phone": "+1-555-0000",
  "role": "waiter"
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication)

#### PUT /api/auth/profile
Update user profile

#### PUT /api/auth/change-password
Change user password

#### GET /api/auth/verify
Verify JWT token

## Menu Management

### Categories

#### GET /api/menu/categories
Get all menu categories
- **Access**: All authenticated users
- **Sample Response**:
```json
[
  {
    "_id": "category_id",
    "name": "Appetizers",
    "description": "Start your meal with our delicious appetizers",
    "color": "#FF6B6B",
    "sortOrder": 1,
    "isActive": true
  }
]
```

#### POST /api/menu/categories
Create new category (Admin/Manager only)
- **Body**: name, description, color, sortOrder, parentCategory
- **File Upload**: image (optional)

#### PUT /api/menu/categories/:id
Update category (Admin/Manager only)

#### DELETE /api/menu/categories/:id
Delete category (Admin only)

### Menu Items

#### GET /api/menu/items
Get all menu items with pagination
- **Query Parameters**: category, search, isAvailable, isActive, page, limit
- **Sample Response**:
```json
{
  "items": [
    {
      "_id": "item_id",
      "name": "Buffalo Wings",
      "description": "Spicy chicken wings served with ranch dressing",
      "price": 12.99,
      "category": {
        "name": "Appetizers",
        "color": "#FF6B6B"
      },
      "isVegetarian": false,
      "spiceLevel": "hot",
      "preparationTime": 15,
      "calories": 350,
      "allergens": ["dairy"],
      "tags": ["popular", "spicy"],
      "rating": {
        "average": 4.5,
        "count": 125
      }
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 45,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/menu/items/:id
Get single menu item details

#### POST /api/menu/items
Create new menu item (Admin/Manager only)
- **File Upload**: Multiple images supported
- **Body**: All menu item properties

#### PUT /api/menu/items/:id
Update menu item (Admin/Manager only)

#### DELETE /api/menu/items/:id
Delete menu item (Admin only)

#### PATCH /api/menu/items/:id/availability
Update item availability quickly

#### GET /api/menu/public
Get public menu (no authentication required)
- Returns menu grouped by categories for customer display

## Table Management

### Tables

#### GET /api/tables
Get all tables
- **Query Parameters**: status, location, section
- **Sample Response**:
```json
[
  {
    "_id": "table_id",
    "tableNumber": "1",
    "capacity": 4,
    "location": "indoor",
    "section": "Main Dining",
    "status": "occupied",
    "assignedWaiter": {
      "firstName": "Emily",
      "lastName": "Taylor"
    },
    "currentOrder": {
      "orderNumber": "ORD-20241028-0001",
      "status": "preparing",
      "totalAmount": 45.99
    },
    "coordinates": { "x": 100, "y": 100 },
    "shape": "square"
  }
]
```

#### GET /api/tables/:id
Get single table details with full order information

#### POST /api/tables
Create new table (Admin/Manager only)

#### PUT /api/tables/:id
Update table details (Admin/Manager only)

#### DELETE /api/tables/:id
Delete table (Admin only)

#### PATCH /api/tables/:id/status
Update table status quickly

#### POST /api/tables/:id/reservations
Add reservation to table

#### PUT /api/tables/:id/reservations/:reservationId
Update reservation

#### DELETE /api/tables/:id/reservations/:reservationId
Cancel reservation

## Order Management

### Orders

#### GET /api/orders
Get all orders with advanced filtering
- **Query Parameters**: status, orderType, table, waiter, startDate, endDate, page, limit
- **Sample Response**:
```json
{
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20241028-0001",
      "orderType": "dine_in",
      "table": {
        "tableNumber": "1",
        "tableName": null
      },
      "waiter": {
        "firstName": "Emily",
        "lastName": "Taylor"
      },
      "items": [
        {
          "menuItem": {
            "name": "Buffalo Wings",
            "price": 12.99
          },
          "quantity": 2,
          "price": 12.99,
          "status": "preparing",
          "specialInstructions": "Extra sauce please"
        }
      ],
      "subtotal": 25.98,
      "tax": {
        "rate": 8,
        "amount": 2.08
      },
      "totalAmount": 30.64,
      "status": "preparing",
      "paymentStatus": "pending",
      "createdAt": "2024-10-28T12:00:00Z"
    }
  ]
}
```

#### GET /api/orders/:id
Get single order details

#### POST /api/orders
Create new order
- **Body**: orderType, table, customer, items, specialInstructions, discount, tax

#### PATCH /api/orders/:id/status
Update order status

#### PATCH /api/orders/:id/items/:itemIndex/status
Update individual item status

#### POST /api/orders/:id/payments
Add payment to order
- **Body**: amount, method, transactionId

#### DELETE /api/orders/:id
Cancel order

#### GET /api/orders/analytics/stats
Get order statistics

## Kitchen Order Ticket (KOT) System

### KOT Management

#### GET /api/kot/queue
Get KOT queue for kitchen staff
- **Returns**: All pending and preparing orders formatted for kitchen display

#### POST /api/kot/:orderId/print
Print KOT for order
- **Body**: reason (optional)
- **Emits**: Socket event 'kot-printed'

#### PATCH /api/kot/:orderId/items/:itemIndex/status
Update item status in KOT
- **Body**: status (pending, preparing, ready)
- **Emits**: Socket events for status updates

#### PATCH /api/kot/:orderId/complete
Mark entire order as complete in kitchen
- **Emits**: Socket event 'kot-completed'

#### GET /api/kot/history
Get KOT history with pagination

#### GET /api/kot/analytics/stats
Get KOT performance statistics

## User Management

### Users

#### GET /api/users
Get all users (Admin/Manager only)

#### GET /api/users/:id
Get single user details

#### POST /api/users
Create new user (Admin only)

#### PUT /api/users/:id
Update user (Admin/Manager only)

#### DELETE /api/users/:id
Delete user (Admin only)

#### PATCH /api/users/:id/status
Activate/deactivate user

## Inventory Management

### Inventory Items

#### GET /api/inventory/items
Get all inventory items
- **Query Parameters**: category, lowStock, search

#### POST /api/inventory/items
Add new inventory item

#### PUT /api/inventory/items/:id
Update inventory item

#### DELETE /api/inventory/items/:id
Delete inventory item

#### POST /api/inventory/items/:id/movement
Record stock movement (purchase, usage, wastage)

### Purchase Orders

#### GET /api/inventory/purchase-orders
Get all purchase orders

#### POST /api/inventory/purchase-orders
Create new purchase order

#### PUT /api/inventory/purchase-orders/:id
Update purchase order

#### PATCH /api/inventory/purchase-orders/:id/receive
Receive items from purchase order

## Reports & Analytics

### Dashboard

#### GET /api/reports/dashboard
Get dashboard overview
- **Returns**: Today's orders, revenue, table occupancy, low stock alerts

### Sales Reports

#### GET /api/reports/sales
Get sales reports
- **Query Parameters**: startDate, endDate, groupBy (day, week, month)

#### GET /api/reports/sales/items
Get item-wise sales report

#### GET /api/reports/sales/waiters
Get waiter performance report

### Kitchen Reports

#### GET /api/reports/kitchen/performance
Get kitchen performance metrics

#### GET /api/reports/kitchen/popular-items
Get most popular menu items

### Financial Reports

#### GET /api/reports/financial/summary
Get financial summary

#### GET /api/reports/financial/payments
Get payment method breakdown

## Real-time Features (Socket.io)

### Socket Events

| Event | Description | Data |
|-------|-------------|------|
| `new-order` | New order created | Order details |
| `order-status-update` | Order status changed | Order ID, new status |
| `kot-printed` | KOT printed for order | Order and KOT details |
| `kot-item-status-update` | Item status updated in kitchen | Item details |
| `order-ready` | Order ready for serving | Order completion details |
| `payment-received` | Payment processed | Payment details |
| `table-status-update` | Table status changed | Table details |
| `menuItemAvailabilityUpdate` | Menu item availability changed | Item availability |

## File Upload Endpoints

### Menu Images
- **POST** `/uploads/menu/` - Upload menu item images
- **Supported formats**: JPG, PNG, GIF
- **Max size**: 5MB per file
- **Multiple files**: Up to 5 images per item

## Error Handling

All endpoints return standardized error responses:

```json
{
  "message": "Error description",
  "status": 400,
  "timestamp": "2024-10-28T12:00:00Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
- **Default limit**: 100 requests per 15 minutes per IP
- **Environment configurable**: Set RATE_LIMIT_MAX_REQUESTS and RATE_LIMIT_WINDOW_MS

## Development Setup

### Environment Variables Required
```
MONGODB_URI=mongodb://localhost:27017/restaurant_pos_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
UPLOAD_PATH=uploads/
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Seeding Database
```bash
# Run the seeding script
npm run seed

# Or with environment
npm run seed:dev
```

This will create all the dummy data including:
- 15+ users across all roles
- 12 menu categories
- 20+ menu items with full details
- 16 tables with different configurations
- Sample orders and KOTs
- Inventory items and stock movements

## Advanced Features

### Split Billing
Orders support split billing with multiple payment methods:
```json
{
  "splitBilling": {
    "enabled": true,
    "splits": [
      {
        "customerId": "customer1",
        "customerName": "John Doe",
        "items": [0, 1],
        "amount": 25.50,
        "paymentStatus": "paid",
        "paymentMethod": "card"
      }
    ]
  }
}
```

### Menu Variants
Menu items support variants (sizes, options):
```json
{
  "variants": [
    {
      "name": "Small",
      "price": 8.99,
      "description": "8oz portion"
    },
    {
      "name": "Large",
      "price": 12.99,
      "description": "12oz portion"
    }
  ]
}
```

### Add-ons System
Menu items can have add-ons for customization:
```json
{
  "addOns": [
    {
      "item": "addon_item_id",
      "quantity": 1,
      "price": 2.99
    }
  ]
}
```

### Comprehensive Permissions
Role-based access control with granular permissions:
- **Modules**: dashboard, sales, menu, inventory, reports, users, tables, kot, orders
- **Actions**: create, read, update, delete

## Testing the API

### Using the Seeded Data
1. Start the server: `npm run dev`
2. Run seeding: `npm run seed`
3. Login with any of the demo credentials
4. Test all endpoints with realistic data

### Sample API Calls

#### Create Order
```bash
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderType": "dine_in",
  "table": "table_id_from_seeded_data",
  "customer": {
    "name": "John Customer",
    "phone": "+1-555-1234"
  },
  "items": [
    {
      "menuItem": "menu_item_id",
      "quantity": 2,
      "specialInstructions": "Medium spice level"
    }
  ],
  "tax": { "rate": 8 },
  "serviceCharge": { "rate": 10 }
}
```

#### Update KOT Item Status
```bash
PATCH /api/kot/order_id/items/0/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "ready"
}
```

This API documentation provides comprehensive coverage of all Restaurant POS System endpoints with realistic dummy data and examples for testing all functionality.