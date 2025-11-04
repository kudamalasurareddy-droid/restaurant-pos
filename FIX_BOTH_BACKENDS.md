# Fix Both Railway and Render Backends

## Current Status

❌ **Railway**: "Application not found" (404) - Root Directory not set
❌ **Render**: "Bad Gateway" - Service sleeping or stopped

---

## Solution: Fix Railway (Recommended)

Railway is better - no sleeping, faster. Let's fix it:

### Step 1: Set Root Directory in Railway

1. **Go to**: https://railway.app
2. **Click** "restaurant-pos" service
3. **Click** "Settings" tab
4. **Scroll down** or look for **"Root Directory"**
   - It might be under "Build" or "Deploy" section
5. **Set** Root Directory to: `backend`
6. **Click** "Save"
7. **Wait** for auto-redeploy (2-3 minutes)

### Step 2: Check Railway Deployment

1. **Go to** "Deployments" tab
2. **Check** if latest deployment is "Active"
3. **Click** on deployment to see logs
4. **Look for**: "Server is running" message

### Step 3: Verify Railway URL

After redeploy, test:
```
https://restaurant-pos-production-ed16.up.railway.app/api/health
```

Should return: `{"status":"OK",...}`

---

## Alternative: Fix Render

### Step 1: Check Render Dashboard

1. **Go to**: https://dashboard.render.com
2. **Click** on `restaurant-pos-backend` service
3. **Check status**:
   - If "Sleeping" → Click "Manual Deploy"
   - If "Stopped" → Click "Restart"
   - If "Building" → Wait for completion

### Step 2: Verify Render Settings

1. **Settings** tab
2. **Check**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables are set

### Step 3: Wake Up Render

1. **Click** "Manual Deploy" → "Deploy latest commit"
2. **Wait** 2-3 minutes
3. **Test**: https://restaurant-pos-backend-bc61.onrender.com/api/health

**Note**: Render free tier sleeps after 15 min - first request takes 30-60 seconds to wake up.

---

## Quick Fix Priority

### Priority 1: Fix Railway (Best Option)

1. Railway → Settings → Root Directory = `backend`
2. Save → Wait for redeploy
3. Test Railway URL
4. Use Railway for Vercel

### Priority 2: Fix Render (If Railway Fails)

1. Render Dashboard → Check service status
2. Manual Deploy or Restart
3. Wait for wake-up (30-60 seconds)
4. Test Render URL

---

## After Backend is Working

### Update Vercel Environment Variables

**If Railway works:**
```env
REACT_APP_API_URL=https://restaurant-pos-production-ed16.up.railway.app/api
REACT_APP_SOCKET_URL=https://restaurant-pos-production-ed16.up.railway.app
```

**If Render works:**
```env
REACT_APP_API_URL=https://restaurant-pos-backend-bc61.onrender.com/api
REACT_APP_SOCKET_URL=https://restaurant-pos-backend-bc61.onrender.com
```

Then redeploy Vercel.

---

## Why Railway Shows 404

**Root Directory is not set!**

Railway is looking in the root folder (has frontend and backend), but needs to look in `backend` folder.

**Fix**: Settings → Root Directory → `backend` → Save

---

## Why Render Shows Bad Gateway

**Service is sleeping or stopped**

Render free tier:
- Sleeps after 15 minutes of inactivity
- Takes 30-60 seconds to wake up
- First request after sleep is slow

**Fix**: 
- Wait 30-60 seconds and try again
- OR click "Manual Deploy" in Render dashboard

---

## Recommendation

**Use Railway** because:
- ✅ No sleeping (always available)
- ✅ Faster response
- ✅ Better for production
- ✅ Already configured

**Fix Railway first** - it's the better option!

---

## Action Steps

1. ✅ Go to Railway → Settings
2. ✅ Set Root Directory = `backend`
3. ✅ Save and wait for redeploy
4. ✅ Test Railway URL
5. ✅ Update Vercel with Railway URL
6. ✅ Redeploy Vercel
7. ✅ Test login

---

## Test URLs

**Railway** (after fixing):
```
https://restaurant-pos-production-ed16.up.railway.app/api/health
```

**Render** (might be slow):
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

**Use whichever works!** Railway is recommended.

