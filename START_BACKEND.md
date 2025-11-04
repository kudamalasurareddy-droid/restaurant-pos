# How to Start the Backend Server

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file** (if it doesn't exist):
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. **Edit .env file** and set your MongoDB connection:
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/restaurant_pos_db`
   - For MongoDB Atlas: Get connection string from MongoDB Atlas dashboard

4. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

5. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # OR Production mode
   npm start
   ```

6. **Verify it's running:**
   - Open browser: http://localhost:5000/api/health
   - You should see: `{"status":"OK","message":"Restaurant POS Server is running",...}`

## Using the Root Script

From the project root directory, you can also run:
```bash
npm run server
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally, OR
- Check your MongoDB Atlas connection string in .env file
- Verify MONGODB_URI is correct

### Port Already in Use
- Change PORT in .env file to a different port (e.g., 5001)
- Or stop the process using port 5000

### Missing Dependencies
```bash
cd backend
npm install
```

## Environment Variables Required

Minimum required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)

Recommended:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS

