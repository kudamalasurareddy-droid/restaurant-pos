# Restaurant POS System 🍽️

A comprehensive Point of Sale (POS) system designed specifically for restaurants, built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with real-time features powered by Socket.io.

## 🚀 Features

### Core Modules
- **📊 Dashboard** - Real-time analytics and business overview
- **🛒 Order Management** - Complete order lifecycle management
- **🍕 Menu Management** - Categories, items, pricing, and availability
- **🪑 Table Management** - Table layout, reservations, and status tracking
- **📋 KOT System** - Kitchen Order Ticket management with real-time updates
- **📦 Inventory Management** - Stock tracking, low-stock alerts, and purchasing
- **👥 User Management** - Role-based access control for staff
- **📈 Reports & Analytics** - Sales reports, performance metrics, and insights

### Specialized Interfaces
- **💳 POS Interface** - Cashier/waiter interface for order taking
- **🍳 Kitchen Display** - Kitchen staff interface for order preparation
- **📱 Mobile App** - Staff mobile application for table management
- **🛍️ Customer App** - Customer self-ordering interface

### Key Features
- **⚡ Real-time Updates** - Live order status, kitchen notifications, table updates
- **🔐 Role-based Access Control** - Admin, Manager, Cashier, Waiter, Kitchen Staff roles
- **💰 Multiple Payment Methods** - Cash, Card, Digital payments
- **🧾 Split Billing** - Divide bills among multiple customers
- **📊 Live Analytics** - Real-time sales metrics and performance tracking
- **🔔 Notifications** - System-wide notifications for orders, inventory, etc.
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **Date-fns** - Date utility library

### Development Tools
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands simultaneously
- **Jest** - Testing framework
- **ESLint** - Code linting

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.4.0 or higher) or MongoDB Atlas account
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-pos-system
```

### 2. Install Dependencies
```bash
# Install root dependencies (for running both servers)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/restaurant-pos

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10000000
FILE_UPLOAD_PATH=./uploads

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Other Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database and collections

#### Option B: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 5. Start the Application

#### Development Mode (Both servers simultaneously)
```bash
npm run dev
```

#### Start Servers Individually
```bash
# Backend server (runs on http://localhost:5000)
npm run server

# Frontend server (runs on http://localhost:3000)
npm run client
```

## 👥 Default User Accounts

The system comes with pre-configured demo accounts for testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@restaurant.com | admin123 | Full system access |
| Manager | manager@restaurant.com | manager123 | Management operations |
| Cashier | cashier@restaurant.com | cashier123 | POS operations |
| Waiter | waiter@restaurant.com | waiter123 | Order taking, table management |
| Kitchen Staff | kitchen@restaurant.com | kitchen123 | Kitchen operations |

## 📁 Project Structure

```
restaurant-pos-system/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── socket/         # Socket.io event handlers
│   ├── uploads/            # File uploads directory
│   ├── tests/              # Test files
│   └── server.js           # Server entry point
├── frontend/               # React frontend
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── theme/          # Material-UI theme
│   │   └── utils/          # Utility functions
│   └── package.json
├── .github/                # GitHub configuration
├── README.md
└── package.json            # Root package.json
```

## 🔧 Configuration

### Environment Variables

#### Backend Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `MAX_FILE_SIZE` - Maximum file upload size
- `FILE_UPLOAD_PATH` - File upload directory
- `FRONTEND_URL` - Frontend URL for CORS

### Database Collections

The application uses the following MongoDB collections:

- **users** - User accounts and authentication
- **menucategories** - Menu categories
- **menuitems** - Menu items
- **tables** - Restaurant table information
- **orders** - Customer orders
- **orderitems** - Individual order items
- **inventory** - Inventory items
- **customers** - Customer information
- **payments** - Payment records
- **reports** - Generated reports

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Menu Management
- `GET /api/menu/categories` - Get all categories
- `POST /api/menu/categories` - Create category
- `GET /api/menu/items` - Get all menu items
- `POST /api/menu/items` - Create menu item
- `PUT /api/menu/items/:id` - Update menu item

### Order Management
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Table Management
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/:id/status` - Update table status

### Reports
- `GET /api/reports/dashboard` - Dashboard metrics
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/inventory` - Inventory reports

## 🔄 Real-time Features

The application uses Socket.io for real-time communication:

### Socket Events
- `new_order` - New order placed
- `order_updated` - Order status changed
- `table_updated` - Table status changed
- `kitchen_notification` - Kitchen order updates
- `inventory_alert` - Low stock notifications
- `user_notification` - System notifications

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for controllers
- Integration tests for API endpoints
- Socket.io event testing
- Component testing for React

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
npm run build

# Start production server
cd backend
npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use production MongoDB database
3. Configure proper JWT secrets
4. Set up SSL certificates
5. Configure reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- MongoDB for the excellent database solution
- Express.js team for the robust web framework
- React.js team for the powerful frontend library
- Material-UI team for the beautiful component library
- Socket.io team for real-time communication capabilities

---

**Restaurant POS System** - Streamlining restaurant operations with modern technology! 🍽️✨#   r e s t a u r a n t _ P O S  
 #   r e s t a u r a n t _ P O S  
 