# Fix Render Environment Variables

## ❌ Problem Found

Your `MONGODB_URI` has **quotes around it** - this will cause authentication to fail!

**Current (WRONG):**
```
MONGODB_URI="mongodb+srv://..."
```

**Should be (CORRECT):**
```
MONGODB_URI=mongodb+srv://...
```

**Environment variables should NOT have quotes unless the quotes are part of the value itself!**

---

## ✅ Corrected Environment Variables

### Update in Render:

1. **Go to**: https://dashboard.render.com
2. **Click** service: `restaurant-pos-backend`
3. **Click** "Environment" tab
4. **Update each variable:**

---

### Variable 1: MONGODB_URI (FIX THIS!)

**Current (WRONG):**
```
MONGODB_URI="mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority"
```

**Correct (NO QUOTES):**
```
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
```

**Action**: Remove the quotes `"` from the beginning and end!

---

### Variable 2: CORS_ORIGIN (UPDATE THIS!)

**Current:**
```
CORS_ORIGIN=https://restaurant-pos-git-main-kudamalasurareddy-droids-projects.vercel.app
```

**You have TWO Vercel URLs:**
- `https://restaurant-pos-git-main-kudamalasurareddy-droids-projects.vercel.app`
- `https://restaurant-pos-vert.vercel.app`

**Update to include BOTH (separated by comma):**
```
CORS_ORIGIN=https://restaurant-pos-git-main-kudamalasurareddy-droids-projects.vercel.app,https://restaurant-pos-vert.vercel.app
```

**OR** if you only want to use one, use the production URL:
```
CORS_ORIGIN=https://restaurant-pos-vert.vercel.app
```

---

### Variable 3: FRONTEND_URL (OPTIONAL)

**Current:**
```
FRONTEND_URL=https://restaurant-pos-vert.vercel.app/
```

**Note**: Remove trailing slash:
```
FRONTEND_URL=https://restaurant-pos-vert.vercel.app
```

---

### Variable 4: JWT_SECRET (CORRECT)

**Current:**
```
JWT_SECRET=restaurant-pos-secret-2024
```

**This is correct!** ✅ No changes needed.

---

## Complete Environment Variables List

**Set these in Render:**

```
CORS_ORIGIN=https://restaurant-pos-git-main-kudamalasurareddy-droids-projects.vercel.app,https://restaurant-pos-vert.vercel.app
FRONTEND_URL=https://restaurant-pos-vert.vercel.app
JWT_SECRET=restaurant-pos-secret-2024
MONGODB_URI=mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority
NODE_ENV=production
PORT=10000
```

**IMPORTANT:**
- ✅ NO quotes around `MONGODB_URI`
- ✅ NO trailing slashes in URLs
- ✅ Multiple CORS origins separated by commas (no spaces)

---

## Step-by-Step Fix

### Step 1: Fix MONGODB_URI

1. **Render** → Environment → `MONGODB_URI`
2. **Click** Edit
3. **Delete** the quotes `"` at the beginning and end
4. **Should be**: `mongodb+srv://...` (no quotes)
5. **Click** Save

### Step 2: Update CORS_ORIGIN

1. **Render** → Environment → `CORS_ORIGIN`
2. **Click** Edit
3. **Update** to include both Vercel URLs (separated by comma):
   ```
   https://restaurant-pos-git-main-kudamalasurareddy-droids-projects.vercel.app,https://restaurant-pos-vert.vercel.app
   ```
4. **Click** Save

### Step 3: Fix FRONTEND_URL (Optional)

1. **Render** → Environment → `FRONTEND_URL`
2. **Click** Edit
3. **Remove** trailing slash `/`
4. **Should be**: `https://restaurant-pos-vert.vercel.app` (no trailing slash)
5. **Click** Save

---

## After Fixing

1. **Wait** for Render to redeploy (2-3 minutes)
2. **Check** logs:
   - ✅ Should see: "MongoDB Connected"
   - ✅ Should NOT see: "bad auth" errors
3. **Test** in browser:
   - ✅ No CORS errors
   - ✅ Login works
   - ✅ API requests succeed

---

## Why Quotes Break MongoDB Connection

**With quotes:**
```
MONGODB_URI="mongodb+srv://user:pass@cluster..."
```

**MongoDB receives:**
```
"mongodb+srv://user:pass@cluster..."
```
(With quotes as part of the string - authentication fails!)

**Without quotes:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster...
```

**MongoDB receives:**
```
mongodb+srv://user:pass@cluster...
```
(Correct connection string - authentication works!)

---

## Summary

**Main Issue**: Quotes around `MONGODB_URI` - **remove them!**

**Other Updates**:
- Add both Vercel URLs to `CORS_ORIGIN`
- Remove trailing slash from `FRONTEND_URL`

**After fixing**, MongoDB authentication should work! 🎉

