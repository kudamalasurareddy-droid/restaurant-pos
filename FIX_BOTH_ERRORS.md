# Fix Both Errors: Trust Proxy + MongoDB Auth

## Current Issues

1. ❌ **Rate Limit Error**: "X-Forwarded-For header but trust proxy is false"
2. ❌ **MongoDB Auth**: "bad auth : authentication failed"

---

## Issue 1: Trust Proxy (FIXED in Code)

**Error:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Status:** ✅ **FIXED** - Added `app.set('trust proxy', true);` to server.js

**Next Step:** Push code to GitHub, Render will auto-deploy

---

## Issue 2: MongoDB Authentication (FIX in Render)

**Error:**
```
Database connection error: bad auth : authentication failed
```

**Status:** ❌ **NEEDS FIX** - Password in Render environment variable is wrong

### Solution: Update MongoDB Password in Render

#### Step 1: Reset MongoDB Atlas Password

1. **Go to**: https://cloud.mongodb.com
2. **Click** "Database Access"
3. **Find** user: `kudamalasurareddy_db_user`
4. **Click** "Edit" → "Edit Password"
5. **Set** new simple password: `RestaurantPOS2024` (or any simple password)
6. **Click** "Update User"
7. **Copy** the new password

#### Step 2: Get New Connection String

1. **Click** "Connect" on your cluster
2. **Choose** "Connect your application"
3. **Copy** the connection string
4. **Replace** `<password>` with your NEW password
5. **Replace** `<dbname>` with `restaurant_pos_db`

**Example:**
```
mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
```

#### Step 3: Update Render Environment Variable

1. **Go to**: https://dashboard.render.com
2. **Click** your service: `restaurant-pos-backend`
3. **Click** "Environment" tab
4. **Find** `MONGODB_URI`
5. **Click** "Edit"
6. **Paste** the new connection string (with NEW password)
7. **Click** "Save Changes"

#### Step 4: Redeploy Render

1. **Click** "Manual Deploy" → "Deploy latest commit"
2. **Wait** 2-3 minutes
3. **Check** logs for:
   - ✅ "MongoDB Connected"
   - ✅ No "bad auth" error

---

## After Both Fixes

**Test:**
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Restaurant POS API Server",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

✅ **Success!**

---

## Checklist

- [x] Trust proxy fix added to code
- [ ] Push code to GitHub
- [ ] Reset MongoDB Atlas password
- [ ] Update Render `MONGODB_URI` with new password
- [ ] Redeploy Render
- [ ] Test health endpoint
- [ ] Update Vercel environment variables
- [ ] Redeploy Vercel

---

## Next Steps

1. ✅ **Trust proxy**: Fixed in code (push to GitHub)
2. ⏭️ **MongoDB password**: Reset and update in Render
3. ⏭️ **Test**: Health endpoint should work
4. ⏭️ **Vercel**: Update environment variables and redeploy

🎉 **After both fixes, everything should work!**

