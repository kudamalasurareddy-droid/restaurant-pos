# Migrate from MongoDB Compass (Local) to MongoDB Atlas (Cloud)

## Step 1: Create MongoDB Atlas Account & Cluster

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (use Google/GitHub for faster)
3. **Create Cluster**:
   - Click "Build a Database"
   - Choose **FREE** (M0) tier
   - Choose region closest to you
   - Click "Create"
   - Wait 3-5 minutes for cluster to be ready

## Step 2: Get Connection String

1. **Click "Connect"** on your cluster
2. **Choose "Connect your application"**
3. **Copy the connection string**
   - Example: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. **Replace `<password>`** with your MongoDB Atlas password
5. **Add database name** at the end: `?retryWrites=true&w=majority` → `/restaurant_pos_db?retryWrites=true&w=majority`
6. **Final connection string**:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
   ```

## Step 3: Allow Network Access

1. **Click "Network Access"** in left sidebar
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (0.0.0.0/0)
4. **Click "Confirm"**

## Step 4: Export Data from Local MongoDB (MongoDB Compass)

### Option A: Using MongoDB Compass GUI

1. **Open MongoDB Compass**
2. **Connect** to your local database: `mongodb://localhost:27017`
3. **Select your database** (usually `restaurant_pos_db` or `restaurant-pos`)
4. **For each collection**:
   - Click on the collection
   - Click "..." menu → **Export Collection**
   - Choose format: **JSON** or **CSV**
   - Save the file

### Option B: Using mongodump (Command Line - Recommended)

Open terminal/command prompt and run:

```bash
# Navigate to MongoDB bin directory (usually in Program Files)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Export entire database
mongodump --uri="mongodb://localhost:27017/restaurant_pos_db" --out=./backup

# Or export specific database
mongodump --host localhost:27017 --db restaurant_pos_db --out ./backup
```

**This will create a backup folder** with all your data.

## Step 5: Import Data to MongoDB Atlas

### Option A: Using MongoDB Compass GUI

1. **Open MongoDB Compass**
2. **Connect** using your Atlas connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
   ```
3. **Create database** if it doesn't exist: `restaurant_pos_db`
4. **For each collection**:
   - Click "Create Collection"
   - Name it (e.g., `users`, `menuitems`, `orders`)
   - Click the collection
   - Click "Add Data" → "Import File"
   - Select your exported JSON/CSV file
   - Click "Import"

### Option B: Using mongorestore (Command Line - Recommended)

```bash
# Navigate to MongoDB bin directory
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Restore to Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority" ./backup/restaurant_pos_db
```

### Option C: Using mongoimport (For JSON files)

```bash
# For each collection file
mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority" --collection=users --file=users.json --jsonArray

mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority" --collection=menuitems --file=menuitems.json --jsonArray

mongoimport --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority" --collection=orders --file=orders.json --jsonArray
```

## Step 6: Update Your Backend .env File

1. **Open** `backend/.env` file
2. **Replace** the MONGODB_URI:

**Old (Local):**
```env
MONGODB_URI=mongodb://localhost:27017/restaurant_pos_db
```

**New (Atlas):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
```

## Step 7: Test Connection

1. **Restart your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs** - should see:
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   ```

3. **Test in browser**: http://localhost:5000/api/health
   - Should work without errors

## Quick Script: Export & Import (Windows)

Save this as `migrate-to-atlas.bat`:

```batch
@echo off
echo ========================================
echo MongoDB Migration to Atlas
echo ========================================
echo.

echo Step 1: Exporting from local MongoDB...
mongodump --host localhost:27017 --db restaurant_pos_db --out ./backup
echo Export complete!
echo.

echo Step 2: Enter your Atlas connection string:
set /p ATLAS_URI="Connection string: "

echo.
echo Step 3: Importing to MongoDB Atlas...
mongorestore --uri="%ATLAS_URI%" ./backup/restaurant_pos_db
echo.
echo Migration complete!
pause
```

## Common Collections to Migrate

Based on your project, these are the main collections:

- `users` - User accounts
- `menucategories` - Menu categories
- `menuitems` - Menu items
- `tables` - Restaurant tables
- `orders` - Customer orders
- `orderitems` - Order items
- `inventory` - Inventory items
- `settings` - App settings
- `kots` - Kitchen order tickets

## Verify Migration

1. **Open MongoDB Compass**
2. **Connect to Atlas** using connection string
3. **Check each collection** has data
4. **Count documents** - should match local database

## Troubleshooting

### Connection Timeout
- Check Network Access allows your IP (or 0.0.0.0/0)
- Verify connection string is correct
- Check username/password are correct

### Import Errors
- Make sure database name is correct
- Check collection names match
- Verify JSON format is correct

### Data Not Showing
- Refresh MongoDB Compass
- Check you're connected to the right cluster
- Verify database name matches

## After Migration

✅ **Your data is now in the cloud!**
✅ **Update backend .env** with Atlas connection string
✅ **Deploy backend** to Railway/Render
✅ **Your app will work** with cloud database

---

## Quick Summary

1. Create Atlas account & cluster
2. Get connection string
3. Export from local (mongodump)
4. Import to Atlas (mongorestore)
5. Update backend .env
6. Test connection

**Done!** 🎉

