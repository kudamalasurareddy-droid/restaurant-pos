# Deploy Backend to Render (Free Alternative)

## Why Render?
Railway free tier only allows databases. Render allows **free web service deployments** forever!

---

## Step-by-Step: Deploy to Render

### Step 1: Create Render Account (2 minutes)

1. **Go to**: https://render.com
2. **Click** "Get Started for Free"
3. **Sign up** with GitHub (fastest)
4. **Verify** your email (if needed)

---

### Step 2: Create Web Service (3 minutes)

1. **Click** "New +" button (top right)
2. **Select** "Web Service"
3. **Connect Repository**:
   - Click "Connect account" (if not connected)
   - Select: `kudamalasurareddy-droid/restaurant-pos`
   - Click "Connect"

---

### Step 3: Configure Service (2 minutes)

Fill in these settings:

1. **Name**: `restaurant-pos-backend`
2. **Region**: Choose closest (e.g., `Oregon (US West)` or `Singapore`)
3. **Branch**: `main`
4. **Root Directory**: `backend` ⭐ **IMPORTANT!**
5. **Runtime**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`

**Click** "Advanced" and verify:
- **Auto-Deploy**: `Yes` (deploy on every push to main)

---

### Step 4: Add Environment Variables (2 minutes)

**Before clicking "Create Web Service"**, scroll down to "Environment Variables"

**Click** "Add Environment Variable" and add:

#### Variable 1:
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Add**

#### Variable 2:
- **Key**: `PORT`
- **Value**: `10000` (Render's default, but your code uses `process.env.PORT` so any works)
- **Add**

#### Variable 3:
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://kudamalasurareddy_db_user:hFTMidztnsdQ9aOr@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority`
- **Add**

#### Variable 4:
- **Key**: `JWT_SECRET`
- **Value**: `restaurant-pos-secret-key-2024`
- **Add**

#### Variable 5:
- **Key**: `JWT_EXPIRE`
- **Value**: `7d`
- **Add**

#### Variable 6:
- **Key**: `CORS_ORIGIN`
- **Value**: `https://your-vercel-app.vercel.app`
  - **Replace** with your actual Vercel URL
- **Add**

#### Variable 7:
- **Key**: `FRONTEND_URL`
- **Value**: `https://your-vercel-app.vercel.app`
  - **Same as CORS_ORIGIN**
- **Add**

---

### Step 5: Create and Deploy (5-7 minutes)

1. **Click** "Create Web Service" (bottom)
2. **Wait** for deployment (5-7 minutes for first time)
3. **Watch** the logs:
   - Installing dependencies...
   - Building...
   - Starting...
   - ✅ "Your service is live"

---

### Step 6: Get Your Backend URL

After deployment completes:

1. **Look at top** of Render dashboard
2. **Your URL** will be: `https://restaurant-pos-backend.onrender.com`
   - Or similar (Render assigns automatically)
3. **Copy** this URL

---

### Step 7: Test Your Backend

Open in browser:
```
https://restaurant-pos-backend.onrender.com/api/health
```

**Should return**:
```json
{
  "status": "OK",
  "message": "Restaurant POS Server is running",
  ...
}
```

✅ **If this works, backend is deployed!**

---

### Step 8: Update Vercel (Final Step)

1. **Go to**: https://vercel.com/dashboard
2. **Select** your project
3. **Settings** → **Environment Variables**
4. **Update** these:

```env
REACT_APP_API_URL=https://restaurant-pos-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://restaurant-pos-backend.onrender.com
REACT_APP_RESTAURANT_ID=default
```

5. **Replace** `restaurant-pos-backend.onrender.com` with your actual Render URL
6. **Save**
7. **Go to** "Deployments"
8. **Click** "Redeploy" on latest deployment

---

## Render Free Tier Notes

### ⚠️ Important: Service Sleeps

- Render free tier services **sleep after 15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** (cold start)
- After that, it's fast
- This is normal for free tier

### ✅ Solutions for Sleep Issue

1. **Use a service** like UptimeRobot to ping your service every 10 minutes (keeps it awake)
2. **Or upgrade** to paid plan ($7/month - no sleep)
3. **Or accept** the cold start (first request is slow, rest are fast)

---

## Quick Checklist

- [ ] Created Render account
- [ ] Created Web Service
- [ ] Set Root Directory to `backend`
- [ ] Added all 7 environment variables
- [ ] Deployment completed
- [ ] Got Render URL
- [ ] Tested `/api/health` endpoint
- [ ] Updated Vercel environment variables
- [ ] Redeployed Vercel

---

## Troubleshooting

### Build Fails
- Check Root Directory is `backend`
- Check Build Command is `npm install`
- Check Start Command is `npm start`
- Check logs for errors

### Service Won't Start
- Check environment variables are correct
- Check MongoDB Atlas Network Access (0.0.0.0/0)
- Check logs for MongoDB connection errors

### 404 Error
- Check Root Directory is `backend`
- Wait for deployment to complete
- Check service is "Live" (green status)

---

## Summary

**Railway**: ❌ Limited plan - databases only
**Render**: ✅ Free tier - full deployments

**Time**: ~15 minutes total
**Cost**: Free forever

**Next**: Deploy to Render → Update Vercel → Done! 🎉

