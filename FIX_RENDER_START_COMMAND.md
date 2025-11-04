# Fix Render Start Command Error

## Problem
```
==> Running 'npm install npm start'
==> No open ports detected, continuing to scan...
==> Application exited early
```

Render is running `npm install npm start` as a single command, which is wrong!

---

## The Fix

### Step 1: Go to Render Settings

1. **Go to**: https://dashboard.render.com
2. **Click**: `restaurant-pos-backend` service
3. **Click**: "Settings" tab

### Step 2: Fix Start Command

Scroll to "Build & Deploy" section:

#### Current (WRONG):
```
Start Command: npm install npm start
```

#### Change to (CORRECT):
```
Start Command: npm start
```

**Important**: 
- Remove `npm install` from Start Command
- Only keep `npm start`
- Build Command should be `npm install` (separate field)
- Start Command should be `npm start` (separate field)

### Step 3: Verify Both Commands

**Build Command** (runs during build):
```
npm install
```

**Start Command** (runs when service starts):
```
npm start
```

### Step 4: Verify Environment Variables

Make sure you have `PORT` set (Render will auto-set this, but verify):

1. Go to "Environment" tab
2. Check if `PORT` exists (Render auto-sets to 10000)
3. If not, add:
   - **Key**: `PORT`
   - **Value**: `10000` (or leave blank - Render will auto-set)

### Step 5: Save and Redeploy

1. **Click**: "Save Changes"
2. **Go to**: "Manual Deploy" tab
3. **Click**: "Deploy latest commit"
4. **Wait**: 3-5 minutes

---

## Correct Settings Summary

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
Environment Variables:
  - PORT: 10000 (or auto-set by Render)
  - MONGODB_URI: (your Atlas connection string)
  - JWT_SECRET: (your secret)
  - JWT_EXPIRE: 7d
  - CORS_ORIGIN: (your Vercel URL)
  - FRONTEND_URL: (your Vercel URL)
  - NODE_ENV: production
```

---

## What Should Happen After Fix

### Build Phase:
```
==> Running build command 'npm install'...
==> Installing dependencies...
==> Build successful 🎉
```

### Start Phase:
```
==> Running 'npm start'
==> Server listening on port 10000...
==> MongoDB Connected...
✅ Live
```

---

## Why This Happened

Render has **two separate fields**:
1. **Build Command**: Runs during build (should be `npm install`)
2. **Start Command**: Runs when service starts (should be `npm start`)

If you put both in Start Command, Render runs them as one command: `npm install npm start` ❌

---

## Quick Checklist

- [ ] Build Command = `npm install` (only)
- [ ] Start Command = `npm start` (only)
- [ ] Root Directory = `backend`
- [ ] PORT environment variable set (or auto-set by Render)
- [ ] All other environment variables set
- [ ] Saved changes
- [ ] Redeployed

---

**Fix the Start Command and redeploy!** 🚀

