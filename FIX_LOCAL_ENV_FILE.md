# Fix Local .env File

## Issue

Your local backend is using the **OLD password** (`hFTMidztnsdQ9aOr`) instead of the **NEW password** (`RestaurantPOS2024`).

## Solution

Create or update `backend/.env` file with the correct connection string.

### Step 1: Create/Edit `.env` file

**Location**: `backend/.env`

**Content**:
```env
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
PORT=10000
NODE_ENV=development
JWT_SECRET=restaurant-pos-secret-2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Step 2: Important Notes

1. **NO QUOTES** around `MONGODB_URI`:
   - ❌ Wrong: `MONGODB_URI="mongodb+srv://..."`
   - ✅ Correct: `MONGODB_URI=mongodb+srv://...`

2. **Password must be**: `RestaurantPOS2024` (not `hFTMidztnsdQ9aOr`)

3. **Database name**: `/restaurant_pos_db` (before the `?`)

### Step 3: Restart Server

After updating the `.env` file:

1. Stop the current server (Ctrl+C)
2. Restart: `cd backend && npm start`
3. You should see: `✅ MongoDB Connected`

## Quick Fix Command (Windows)

Create the file using PowerShell:

```powershell
cd backend
@"
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
PORT=10000
NODE_ENV=development
JWT_SECRET=restaurant-pos-secret-2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
```

## Verify

After restarting, check the server output. You should see:
- ✅ `MongoDB Connected: cluster0-shard-00-00.jn1bkky.mongodb.net`
- ✅ `📊 Database: restaurant_pos_db`
- ❌ NOT: `bad auth : authentication failed`

## Also Fixed

- ✅ Removed duplicate index warnings in models
- ✅ Improved error messages for MongoDB connection

