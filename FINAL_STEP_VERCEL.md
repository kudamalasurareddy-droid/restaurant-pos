# Final Step: Connect Vercel to Your Backend

## ✅ Backend is Working!

Your backend is successfully deployed and running!

## Step 1: Choose Your Backend URL

You have **2 backend URLs** - choose the one that works:

**Option 1 - Railway:**
```
https://restaurant-pos-production-ed16.up.railway.app
```

**Option 2 - Render:**
```
https://restaurant-pos-backend-bc61.onrender.com
```

**Test both** to see which one responds:
- Railway: https://restaurant-pos-production-ed16.up.railway.app/api/health
- Render: https://restaurant-pos-backend-bc61.onrender.com/api/health

**Use the one that works!** (Both should work, but choose one)

---

## Step 2: Update Vercel Environment Variables

1. **Go to**: https://vercel.com/dashboard
2. **Select** your project
3. **Go to**: Settings → Environment Variables
4. **Add/Update** these variables:

### If using Railway:
```env
REACT_APP_API_URL=https://restaurant-pos-production-ed16.up.railway.app/api
REACT_APP_SOCKET_URL=https://restaurant-pos-production-ed16.up.railway.app
REACT_APP_RESTAURANT_ID=default
```

### If using Render:
```env
REACT_APP_API_URL=https://restaurant-pos-backend-bc61.onrender.com/api
REACT_APP_SOCKET_URL=https://restaurant-pos-backend-bc61.onrender.com
REACT_APP_RESTAURANT_ID=default
```

5. **Click "Save"** for each variable
6. **Make sure** they're set for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## Step 3: Redeploy Vercel

1. **Go to**: Deployments tab
2. **Click** "..." (three dots) on latest deployment
3. **Click** "Redeploy"
4. **Wait** 2-3 minutes for deployment

---

## Step 4: Test Everything

1. **Open** your Vercel app: `https://your-app.vercel.app`
2. **Open** browser DevTools (F12)
3. **Go to** Network tab
4. **Try to login**
5. **Check** Network requests:
   - Should go to your Railway/Render URL
   - Should NOT go to `localhost:5000`
   - Should return `200 OK` status

---

## ✅ Success Checklist

- [ ] Backend deployed and running
- [ ] Database connected (MongoDB Atlas)
- [ ] Backend URL tested and working
- [ ] Vercel environment variables updated
- [ ] Vercel frontend redeployed
- [ ] Login works from Vercel app

---

## 🎉 You're Done!

Your complete setup:
- ✅ **Frontend**: Vercel (https://your-app.vercel.app)
- ✅ **Backend**: Railway/Render (https://your-backend-url)
- ✅ **Database**: MongoDB Atlas (mongodb+srv://...)

**Everything should be working now!** 🚀

---

## Quick Test URLs

**Backend Health:**
- Railway: https://restaurant-pos-production-ed16.up.railway.app/api/health
- Render: https://restaurant-pos-backend-bc61.onrender.com/api/health

**Frontend:**
- Your Vercel URL (check Vercel dashboard)

---

## If Login Still Doesn't Work

1. **Check** Vercel environment variables are correct
2. **Verify** backend URL is accessible
3. **Check** CORS_ORIGIN in backend includes your Vercel URL
4. **Redeploy** Vercel after changing env vars
5. **Clear** browser cache and try again

---

## Next Steps

1. Update Vercel env vars (Step 2)
2. Redeploy Vercel (Step 3)
3. Test login (Step 4)
4. 🎉 **Done!**

