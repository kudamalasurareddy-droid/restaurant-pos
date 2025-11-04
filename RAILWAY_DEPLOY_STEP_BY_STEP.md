# Railway Deployment - Step by Step Guide

## You're on Railway - Here's What to Do Next

You're on the **Architecture** view. The service "restaurant-pos" shows "No deploys". Let's fix this!

---

## Step 1: Click on the "restaurant-pos" Service Card

1. **Click** on the "restaurant-pos" card (the one with GitHub icon)
2. This will open the service settings

---

## Step 2: Configure the Service

After clicking the service, you'll see service settings. Do this:

### 2.1 Set Root Directory (IMPORTANT!)

1. **Scroll down** or look for **"Settings"** tab
2. Find **"Root Directory"** field
3. **Type**: `backend`
4. **Click "Save"** or press Enter

**Why?** Your project has both frontend and backend folders. Railway needs to know to use the `backend` folder.

---

## Step 3: Add Environment Variables

1. **Click** on **"Variables"** tab (next to Settings)
2. **Click** "New Variable" or "+" button
3. **Add these variables one by one**:

#### Variable 1:
- **Name**: `NODE_ENV`
- **Value**: `production`
- Click "Add"

#### Variable 2:
- **Name**: `PORT`
- **Value**: `5000`
- Click "Add"

#### Variable 3:
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://kudamalasurareddy_db_user:hFTMidztnsdQ9aOr@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority`
- Click "Add"

#### Variable 4:
- **Name**: `JWT_SECRET`
- **Value**: `restaurant-pos-secret-key-2024-change-this-in-production`
- Click "Add"

#### Variable 5:
- **Name**: `JWT_EXPIRE`
- **Value**: `7d`
- Click "Add"

#### Variable 6:
- **Name**: `CORS_ORIGIN`
- **Value**: `https://your-vercel-app.vercel.app`
  - **Replace** `your-vercel-app` with your actual Vercel URL
  - Example: `https://restaurant-pos-abc123.vercel.app`
- Click "Add"

#### Variable 7:
- **Name**: `FRONTEND_URL`
- **Value**: `https://your-vercel-app.vercel.app`
  - **Same as CORS_ORIGIN** - your Vercel URL
- Click "Add"

---

## Step 4: Trigger Deployment

1. **Go back** to the **"Deployments"** tab or main view
2. Railway should **automatically start deploying** after you save the settings
3. **If not**, click **"Deploy"** or **"Redeploy"** button

---

## Step 5: Wait for Deployment

1. **Watch the deployment logs** - it will show:
   - Installing dependencies
   - Building
   - Starting server
2. **Wait 2-3 minutes** for deployment to complete
3. **Look for**: "Deployment successful" or green checkmark

---

## Step 6: Get Your Backend URL

1. After deployment completes, **click** on the service again
2. **Go to "Settings"** tab
3. **Scroll down** to **"Domains"** section
4. **Click "Generate Domain"** (if not already generated)
5. **Copy the URL** - it will look like:
   - `https://restaurant-pos-production.up.railway.app`
   - OR
   - `https://restaurant-pos-production.railway.app`

**This is your backend URL!** Save it!

---

## Step 7: Test Your Backend

1. **Open a new browser tab**
2. **Go to**: `https://your-railway-url.railway.app/api/health`
   - Replace with your actual Railway URL
3. **Should see**: `{"status":"OK","message":"Restaurant POS Server is running",...}`

✅ **If you see this, backend is working!**

---

## Step 8: Update Vercel (Final Step)

1. **Go to**: https://vercel.com/dashboard
2. **Select** your project
3. **Settings** → **Environment Variables**
4. **Add/Update**:

```
REACT_APP_API_URL=https://your-railway-url.railway.app/api
REACT_APP_SOCKET_URL=https://your-railway-url.railway.app
REACT_APP_RESTAURANT_ID=default
```

5. **Replace** `your-railway-url.railway.app` with your actual Railway URL
6. **Click "Save"**
7. **Go to "Deployments"**
8. **Click "Redeploy"** on latest deployment

---

## Troubleshooting

### "No deploys for this service"
- Make sure Root Directory is set to `backend`
- Check that environment variables are saved
- Try clicking "Redeploy" or "Deploy" button

### Deployment fails
- Check the **Logs** tab for errors
- Verify MONGODB_URI is correct
- Make sure all environment variables are set

### Can't find Root Directory setting
- Click on the service card
- Look for "Settings" tab
- Scroll down to find "Root Directory"

### Backend URL not working
- Check Network Access in MongoDB Atlas (should allow 0.0.0.0/0)
- Verify MONGODB_URI in Railway variables
- Check Railway logs for connection errors

---

## Quick Checklist

- [ ] Clicked on "restaurant-pos" service
- [ ] Set Root Directory to `backend`
- [ ] Added all 7 environment variables
- [ ] Deployment started/completed
- [ ] Got Railway backend URL
- [ ] Tested `/api/health` endpoint
- [ ] Updated Vercel environment variables
- [ ] Redeployed Vercel frontend

---

## What You Should See

### During Deployment:
```
Building...
Installing dependencies...
Starting server...
Deployment successful!
```

### After Deployment:
- Green checkmark ✅
- Service shows "Running" or "Deployed"
- URL generated in Settings → Domains

---

## Need Help?

If stuck at any step:
1. Check Railway **Logs** tab for errors
2. Verify all environment variables are correct
3. Make sure Root Directory is `backend` (not `frontend`)
4. Check MongoDB Atlas Network Access is open

---

## Next Steps After Deployment

1. ✅ Backend deployed on Railway
2. ✅ Got Railway URL
3. ✅ Updated Vercel env vars
4. ✅ Redeployed Vercel
5. 🎉 **Everything should work now!**

Test your Vercel app - login should work! 🚀

