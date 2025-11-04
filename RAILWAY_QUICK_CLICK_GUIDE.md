# Railway - Quick Click Guide (What to Click Where)

## Current Screen: Architecture View

You see:
- Service card: "restaurant-pos" with "No deploys"

---

## Action 1: Click the Service Card

**Click** on the "restaurant-pos" card (the box with GitHub icon)

**What happens**: Opens service configuration page

---

## Action 2: Find Root Directory

After clicking, you'll see tabs at the top:
- **Deployments** | **Settings** | **Variables** | **Logs**

**Click** on **"Settings"** tab

**Scroll down** until you see:
```
Root Directory
[empty field or shows "."]
```

**Type**: `backend`

**Click** "Save" or press Enter

---

## Action 3: Add Environment Variables

**Click** on **"Variables"** tab

You'll see a list (probably empty or has some defaults)

**Click** "New Variable" or "+ Add Variable" button

**Add each variable**:

1. **Name**: `MONGODB_URI`
   **Value**: `mongodb+srv://kudamalasurareddy_db_user:hFTMidztnsdQ9aOr@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority`
   Click "Add"

2. **Name**: `NODE_ENV`
   **Value**: `production`
   Click "Add"

3. **Name**: `JWT_SECRET`
   **Value**: `restaurant-pos-secret-2024`
   Click "Add"

4. **Name**: `CORS_ORIGIN`
   **Value**: `https://your-vercel-app.vercel.app`
   (Replace with your actual Vercel URL)
   Click "Add"

---

## Action 4: Deploy

**Go to** "Deployments" tab

**Click** "Deploy" or "Redeploy" button (if available)

**OR** Railway will auto-deploy when you save settings

**Wait** 2-3 minutes for deployment

---

## Action 5: Get Your URL

**Go to** "Settings" tab again

**Scroll to** "Domains" section

**Click** "Generate Domain" (if not already there)

**Copy** the URL shown (e.g., `https://restaurant-pos-production.up.railway.app`)

---

## Visual Guide

```
Railway Dashboard
├── [Click] restaurant-pos service card
    ├── [Click] Settings tab
    │   └── [Type] backend in Root Directory
    │   └── [Click] Save
    │
    ├── [Click] Variables tab
    │   └── [Click] New Variable
    │   └── [Add] MONGODB_URI
    │   └── [Add] NODE_ENV
    │   └── [Add] JWT_SECRET
    │   └── [Add] CORS_ORIGIN
    │
    └── [Click] Deployments tab
        └── [Wait] for deployment
        └── [Copy] URL from Settings → Domains
```

---

## If You Can't Find Something

### Can't find Root Directory?
- Make sure you clicked on the service card first
- Look for "Settings" tab
- Scroll down in Settings
- It might be under "Build & Deploy" section

### Can't find Variables?
- Click on the service card
- Look for "Variables" tab at the top
- Should be next to "Settings" and "Deployments"

### No Deploy button?
- Railway auto-deploys when you save settings
- Check "Deployments" tab to see if it's deploying
- If not, try clicking "Redeploy" or wait a moment

---

## What Success Looks Like

✅ Root Directory: `backend`
✅ Variables: All 4+ variables added
✅ Deployment: Shows "Deployed" or "Running"
✅ URL: Shows in Settings → Domains
✅ Health Check: `https://your-url.railway.app/api/health` works

---

## Quick Test

After deployment, open this URL in browser:
```
https://your-railway-url.railway.app/api/health
```

Should show: `{"status":"OK",...}`

If it works, you're done with Railway! 🎉

