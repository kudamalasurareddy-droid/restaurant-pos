# Fix Render Build Error

## Problem
```
npm error Missing script: "build"
```

Render is trying to run `npm run build` but the backend doesn't have a build script (which is normal for Node.js backends).

---

## Solution: Fix Render Settings

### Step 1: Go to Render Service Settings

1. **Go to**: https://dashboard.render.com
2. **Click** on `restaurant-pos-backend` service
3. **Click** "Settings" tab (top right)

### Step 2: Fix Build & Start Commands

Scroll down to "Build & Deploy" section:

#### Build Command:
**Change from**: `npm install; npm run build`  
**Change to**: `npm install`

**Note**: Render requires a build command, so use `npm install` (not blank)

#### Start Command:
**Should be**: `npm start`

**Verify** it's exactly: `npm start`

### Step 3: Save and Redeploy

1. **Click** "Save Changes" (bottom)
2. **Go to** "Manual Deploy" tab
3. **Click** "Deploy latest commit"
4. **Wait** 3-5 minutes for deployment

---

## Correct Settings Summary

```
Root Directory: backend
Environment: Node
Build Command: npm install  (or leave blank)
Start Command: npm start
```

---

## After Fix

Your deployment should:
1. ✅ Install dependencies (`npm install`)
2. ✅ Start server (`npm start`)
3. ✅ Connect to MongoDB Atlas
4. ✅ Service becomes live

---

## Test After Deployment

Once deployment succeeds:
```
https://restaurant-pos-backend-bc61.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Restaurant POS Server is running"
}
```

---

## Quick Fix Checklist

- [ ] Go to Render → restaurant-pos-backend → Settings
- [ ] Change Build Command to `npm install` (or blank)
- [ ] Verify Start Command is `npm start`
- [ ] Save changes
- [ ] Manual Deploy → Deploy latest commit
- [ ] Wait 3-5 minutes
- [ ] Test `/api/health` endpoint

---

That's it! The build error will be fixed! 🎉

