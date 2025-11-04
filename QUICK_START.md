# Quick Start Guide - Backend Server

## Problem
You're seeing: `POST http://localhost:5000/api/auth/login net::ERR_CONNECTION_REFUSED`

This means the backend server is **not running**.

## Solution: Start the Backend Server

### Option 1: Using the Batch File (Easiest - Windows)
1. Double-click `start-backend.bat` in the project root
2. Wait for the server to start
3. You should see: `🚀 Restaurant POS Server is running!`

### Option 2: Using Command Line

**From project root:**
```bash
npm run server
```

**OR from backend directory:**
```bash
cd backend
npm run dev
```

### Option 3: Run Both Frontend and Backend Together
```bash
npm run dev
```

## Verify Backend is Running

1. Open browser: http://localhost:5000/api/health
2. You should see JSON response with status "OK"

## Required: MongoDB Connection

The backend needs MongoDB to work. Make sure:

1. **Local MongoDB** is running, OR
2. **MongoDB Atlas** connection string is in `backend/.env`

Check `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant_pos_db
```

Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-pos
```

## Common Issues

### 1. MongoDB Not Connected
- Error: `Database connection error`
- Fix: Start MongoDB or check MONGODB_URI in `.env`

### 2. Port 5000 Already in Use
- Error: `EADDRINUSE: address already in use`
- Fix: Change PORT in `.env` or stop the other process

### 3. Missing .env File
- Error: `MONGODB_URI is not defined`
- Fix: Create `backend/.env` from `backend/.env.example`

## Current Status Check

Run this to check if backend is running:
```bash
curl http://localhost:5000/api/health
```

Or open in browser: http://localhost:5000/api/health

