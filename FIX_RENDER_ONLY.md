# Fix Render Backend - Complete Guide

## Your Render Backend URL
`https://restaurant-pos-backend-bc61.onrender.com`

## Problem: Bad Gateway

This usually means:
1. Service is sleeping (free tier sleeps after 15 min)
2. Root Directory not set correctly
3. Service crashed or stopped
4. Wrong start command

---

## Step 1: Check Render Dashboard

1. **Go to**: https://dashboard.render.com
2. **Login** to your account
3. **Find** your service: `restaurant-pos-backend` or similar
4. **Click** on it

---

## Step 2: Check Service Status

Look at the top of the service page:

- **"Live"** = Working (might be slow to wake up)
- **"Sleeping"** = Needs to wake up (30-60 seconds)
- **"Stopped"** = Needs restart
- **"Building"** = Still deploying

---

## Step 3: Fix Root Directory (IMPORTANT!)

1. **Click** "Settings" tab
2. **Scroll down** to "Build & Deploy" section
3. **Find** "Root Directory"
4. **Set** to: `backend`
5. **Click** "Save Changes"

---

## Step 4: Verify Start Command

1. **In Settings** → "Build & Deploy"
2. **Check** "Start Command":
   - Should be: `npm start`
   - OR: `node src/server.js`
3. **If wrong**, change it to: `npm start`
4. **Save Changes**

---

## Step 5: Verify Environment Variables

1. **Click** "Environment" tab
2. **Check** these variables exist:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:hFTMidztnsdQ9aOr@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
JWT_SECRET=restaurant-pos-secret-2024
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

3. **If missing**, add them
4. **Save Changes**

---

## Step 6: Restart/Deploy Service

### Option A: Manual Deploy (Recommended)

1. **Click** "Manual Deploy" button (top right)
2. **Select** "Deploy latest commit"
3. **Wait** 2-3 minutes for deployment
4. **Check** logs for "Server is running"

### Option B: Restart Service

1. **Click** "Restart" button (if available)
2. **Wait** 1-2 minutes
3. **Check** service status

---

## Step 7: Check Logs

1. **Click** "Logs" tab
2. **Look for**:
   - ✅ "Server is running"
   - ✅ "MongoDB Connected"
   - ❌ Error messages (connection errors, crashes)

### Common Errors to Look For:

**MongoDB Connection Error:**
- Check MONGODB_URI is correct
- Check MongoDB Atlas Network Access

**Port Already in Use:**
- Render uses port from environment or default
- Make sure PORT is set correctly

**Cannot find module:**
- Root Directory might be wrong
- Dependencies not installed

---

## Step 8: Wait for Service to Wake Up

**Important**: Render free tier sleeps after 15 minutes of inactivity.

**First request after sleep:**
- Takes 30-60 seconds to wake up
- Shows "Bad Gateway" initially
- Wait 30-60 seconds and try again

**Test after waiting:**
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

---

## Step 9: Verify It's Working

After deployment completes:

1. **Test Health Endpoint:**
   ```
   https://restaurant-pos-backend-bc61.onrender.com/api/health
   ```

2. **Should return:**
   ```json
   {
     "status": "OK",
     "message": "Restaurant POS Server is running",
     "timestamp": "...",
     "environment": "production"
   }
   ```

---

## Step 10: Update Vercel

Once Render is working:

1. **Go to**: Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. **Add/Update**:

```env
REACT_APP_API_URL=https://restaurant-pos-backend-bc61.onrender.com/api
REACT_APP_SOCKET_URL=https://restaurant-pos-backend-bc61.onrender.com
REACT_APP_RESTAURANT_ID=default
```

4. **Redeploy** Vercel frontend

---

## Render Configuration Checklist

- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install` (or leave empty)
- [ ] Start Command: `npm start`
- [ ] Environment Variables: All set
- [ ] Service Status: "Live"
- [ ] Health endpoint works: `/api/health`

---

## Troubleshooting Render Issues

### Bad Gateway Still Shows

1. **Wait** 30-60 seconds (service might be waking up)
2. **Check** logs for errors
3. **Verify** Root Directory = `backend`
4. **Check** Start Command = `npm start`
5. **Restart** service manually

### Service Keeps Crashing

1. **Check** logs for error messages
2. **Verify** MONGODB_URI is correct
3. **Check** all environment variables are set
4. **Verify** Root Directory is `backend`

### Slow Response Times

- **Normal** for free tier after sleep
- First request: 30-60 seconds
- Subsequent requests: Faster
- **Solution**: Upgrade to paid plan for no sleep

---

## Quick Fix Steps

1. ✅ Go to Render Dashboard
2. ✅ Click your service
3. ✅ Settings → Root Directory = `backend`
4. ✅ Settings → Start Command = `npm start`
5. ✅ Environment → Verify all variables
6. ✅ Manual Deploy → Deploy latest commit
7. ✅ Wait 2-3 minutes
8. ✅ Test: `/api/health`
9. ✅ Update Vercel env vars
10. ✅ Redeploy Vercel

---

## After Render is Working

1. ✅ Backend: Render (working)
2. ✅ Database: MongoDB Atlas (connected)
3. ✅ Frontend: Vercel (needs env vars update)
4. ✅ Update Vercel → Redeploy
5. 🎉 **Everything working!**

---

## Important Notes

**Render Free Tier Limitations:**
- Services sleep after 15 min inactivity
- 30-60 second wake-up time
- First request is slow
- Consider upgrading for production use

**For Production:**
- Upgrade Render to paid plan ($7/month)
- OR use Railway (better free tier)
- OR deploy backend to your own server

---

## Next Steps

1. Fix Render (follow steps above)
2. Test backend URL
3. Update Vercel environment variables
4. Redeploy Vercel
5. Test login from Vercel app

🎉 **Done!**

