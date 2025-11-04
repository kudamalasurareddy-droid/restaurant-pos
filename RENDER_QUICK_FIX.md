# 🚀 Quick Fix: Render Bad Gateway

## Problem
Render shows "Bad Gateway" error.

## Solution (3 Steps)

### Step 1: Set Root Directory ✅

1. Go to: https://dashboard.render.com
2. Click your service: `restaurant-pos-backend`
3. Click **"Settings"** tab
4. Find **"Root Directory"**
5. Set to: `backend` (exactly this, nothing else)
6. Click **"Save Changes"**

**This is the #1 fix!** Most errors are because Root Directory is not set.

---

### Step 2: Verify Start Command ✅

1. Same Settings page
2. Find **"Start Command"**
3. Should be: `npm start`
4. If empty, set it to: `npm start`
5. Click **"Save Changes"**

---

### Step 3: Manual Deploy ✅

1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**
4. Wait 2-3 minutes
5. Check status = "Live" (green)

---

## Test After Deploy

Wait 30-60 seconds, then test:
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

Should return:
```json
{"status":"OK","message":"Restaurant POS Server is running",...}
```

✅ **Success!**

---

## If Still Not Working

1. **Check Logs** tab → Look for error messages
2. **Verify** Root Directory = `backend` (most common issue!)
3. **Check** Environment Variables are set (MONGODB_URI, JWT_SECRET, etc.)
4. **Wait** 30-60 seconds (service might be waking up)

---

## After Render Works

Update Vercel:
1. Vercel → Settings → Environment Variables
2. Set:
   ```
   REACT_APP_API_URL=https://restaurant-pos-backend-bc61.onrender.com/api
   REACT_APP_SOCKET_URL=https://restaurant-pos-backend-bc61.onrender.com
   ```
3. Redeploy Vercel

🎉 **Done!**

