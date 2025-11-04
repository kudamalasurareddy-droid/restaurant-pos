# Fix Render Bad Gateway - Step by Step

## Your Render Service
**URL**: `https://restaurant-pos-backend-bc61.onrender.com`

---

## Quick Fix (Do These Steps)

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Login to your account
3. Find service: `restaurant-pos-backend` (or similar name)
4. Click on it

---

### Step 2: Set Root Directory (CRITICAL!)

1. Click **"Settings"** tab (left sidebar)
2. Scroll to **"Build & Deploy"** section
3. Find **"Root Directory"** field
4. **IMPORTANT**: Set it to: `backend`
   - Not: `.` or `./backend` or empty
   - Exactly: `backend`
5. Click **"Save Changes"** button

**Why?** Render needs to know your backend code is in the `backend` folder, not the root.

---

### Step 3: Verify Start Command

In the same "Settings" → "Build & Deploy" section:

1. Find **"Start Command"**
2. Should be: `npm start`
   - OR: `node src/server.js`
3. If empty or wrong, set it to: `npm start`
4. Click **"Save Changes"**

---

### Step 4: Check Environment Variables

1. Click **"Environment"** tab (left sidebar)
2. Verify these variables exist:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:hFTMidztnsdQ9aOr@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
JWT_SECRET=restaurant-pos-secret-2024
```

**Optional but Recommended:**
```
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

3. If any are missing, **Add** them
4. Click **"Save Changes"**

---

### Step 5: Restart/Redeploy Service

**Option A: Manual Deploy (Recommended)**
1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**
4. Wait 2-3 minutes

**Option B: Restart**
1. Click **"Restart"** button (if available)
2. Wait 1-2 minutes

---

### Step 6: Check Deployment Status

1. Click **"Events"** or **"Logs"** tab
2. Watch for:
   - ✅ "Building..." → "Deploying..." → "Live"
   - ✅ "Server is running"
   - ✅ "MongoDB Connected"
   - ❌ Error messages

**Wait for status to show "Live"** (green)

---

### Step 7: Test the Backend

After deployment completes (status = "Live"):

1. **Wait 30-60 seconds** (if service was sleeping)
2. Open browser: `https://restaurant-pos-backend-bc61.onrender.com/api/health`
3. Should see:
   ```json
   {
     "status": "OK",
     "message": "Restaurant POS Server is running",
     ...
   }
   ```

**If still "Bad Gateway":**
- Wait another 30 seconds (service might be waking up)
- Check logs for errors
- Verify Root Directory = `backend`

---

### Step 8: Check Logs for Errors

1. Click **"Logs"** tab
2. Look for error messages:

**Common Errors:**

❌ **"Cannot find module"**
- Root Directory not set to `backend`
- Fix: Set Root Directory = `backend`

❌ **"MongoDB connection error"**
- Check MONGODB_URI is correct
- Check MongoDB Atlas Network Access

❌ **"Port already in use"**
- Render sets PORT automatically
- Remove PORT from env vars OR set to 10000

❌ **"JWT_SECRET not configured"**
- Add JWT_SECRET to environment variables

---

## Most Common Issue: Root Directory

**90% of Render Bad Gateway errors are because Root Directory is not set!**

✅ **Correct**: Root Directory = `backend`
❌ **Wrong**: Root Directory = `.` or empty or `./backend`

**Fix it first!**

---

## Render Free Tier - Sleep Behavior

**Important**: Render free tier services **sleep after 15 minutes** of inactivity.

**What this means:**
- First request after sleep: Takes 30-60 seconds
- Shows "Bad Gateway" initially
- Wait 30-60 seconds and try again
- Subsequent requests are faster

**Solution:**
- Wait 30-60 seconds after first request
- OR upgrade to paid plan ($7/month) for no sleep

---

## After Render is Working

### Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Settings → Environment Variables
4. Add/Update:

```env
REACT_APP_API_URL=https://restaurant-pos-backend-bc61.onrender.com/api
REACT_APP_SOCKET_URL=https://restaurant-pos-backend-bc61.onrender.com
```

5. Click **"Save"**
6. Go to **"Deployments"** tab
7. Click **"..."** → **"Redeploy"**

---

## Checklist

Before testing, make sure:
- [ ] Root Directory = `backend`
- [ ] Start Command = `npm start`
- [ ] NODE_ENV = `production`
- [ ] PORT = `10000` (or let Render set it)
- [ ] MONGODB_URI = Your MongoDB Atlas connection string
- [ ] JWT_SECRET = Some secret string
- [ ] Service status = "Live"
- [ ] Deployment completed successfully

---

## Still Not Working?

1. **Check Logs** → Look for specific error message
2. **Verify Root Directory** = `backend` (most common issue!)
3. **Check Environment Variables** → All required ones are set
4. **Try Manual Deploy** → Deploy latest commit
5. **Wait 30-60 seconds** → Service might be waking up

---

## Quick Test

After fixing, test:
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Restaurant POS Server is running",
  "timestamp": "2025-11-04T...",
  "environment": "production",
  "version": "1.0.0"
}
```

✅ **Success!** Render is working!

---

## Next Steps

1. ✅ Render backend working
2. ✅ Update Vercel environment variables
3. ✅ Redeploy Vercel frontend
4. ✅ Test login from Vercel app
5. 🎉 **Everything working!**

