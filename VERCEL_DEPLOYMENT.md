# Vercel Deployment Guide

This guide will help you deploy the Restaurant POS System frontend to Vercel.

## Prerequisites

- GitHub repository: `kudamalasurareddy-droid/restaurant-pos`
- Vercel account (free tier is sufficient)

## Deployment Steps

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Choose `kudamalasurareddy-droid/restaurant-pos`
5. Click "Import"

### 2. Configure Build Settings

Vercel should automatically detect the configuration, but verify these settings:

- **Framework Preset**: Other (or leave blank)
- **Root Directory**: `.` (root of the repository)
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

### 3. Environment Variables (Optional)

If your backend API is deployed separately, add these environment variables in Vercel:

- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com/api`)
- `REACT_APP_SOCKET_URL`: Your WebSocket server URL (e.g., `https://your-backend.herokuapp.com`)
- `REACT_APP_RESTAURANT_ID`: Your restaurant ID (default: `default`)

**Note**: If these are not set, the app will default to `http://localhost:5000`, which will only work in development.

To add environment variables:
1. In Vercel project settings, go to "Environment Variables"
2. Add each variable with its value
3. Select the environment (Production, Preview, Development)
4. Redeploy

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Build Configuration

The project uses:
- **Root**: Monorepo structure with `frontend/` folder
- **Build**: Runs `npm run build` which executes `npm --prefix frontend run build`
- **Output**: React build outputs to `frontend/build/`

## Troubleshooting

### Build Fails with ESLint Errors

All ESLint errors have been fixed. If you encounter new ones:
- Ensure you've pulled the latest code from GitHub
- Check that all dependencies are installed: `npm install` in root and `npm install` in frontend

### Build Succeeds but App Doesn't Load

- Check that `vercel.json` is in the root directory
- Verify the output directory is `frontend/build`
- Check browser console for errors
- Ensure environment variables are set correctly

### API Connection Issues

- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on your backend
- Ensure backend is running and accessible

## Current Status

✅ All ESLint errors resolved
✅ Build configuration verified
✅ Vercel configuration file created
✅ Ready for deployment

## Next Steps After Deployment

1. Test the deployed application
2. Configure custom domain (optional)
3. Set up environment variables for production
4. Connect your backend API

