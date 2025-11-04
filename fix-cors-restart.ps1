#!/usr/bin/env pwsh

Write-Host "🔧 Restaurant POS - CORS Fix & Server Restart" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Navigate to backend
Write-Host "📁 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Dell\Desktop\New folder\New folder\backend"

# Kill any existing Node processes on port 5000
Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Yellow
$backendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($backendProcess) {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Stopped existing backend processes" -ForegroundColor Green
}

# Start backend
Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'C:\Users\Dell\Desktop\New folder\New folder\backend'; npm start" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

# Navigate to frontend
Write-Host "📁 Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Dell\Desktop\New folder\New folder\frontend"

# Kill any existing React processes on port 3000
Write-Host "🛑 Stopping existing frontend processes..." -ForegroundColor Yellow
$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($frontendProcess) {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Stopped existing frontend processes" -ForegroundColor Green
}

# Start frontend
Write-Host "🚀 Starting frontend server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'C:\Users\Dell\Desktop\New folder\New folder\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✅ CORS Fix Applied & Servers Restarted!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Changes Made:" -ForegroundColor Cyan
Write-Host "   • Added PATCH method to CORS configuration" -ForegroundColor White
Write-Host "   • Added proper preflight OPTIONS handling" -ForegroundColor White
Write-Host "   • Enhanced CORS headers (X-Requested-With, Accept, Origin)" -ForegroundColor White
Write-Host "   • Fixed API payload (removed extra fields)" -ForegroundColor White
Write-Host "   • Added comprehensive error logging" -ForegroundColor White
Write-Host "   • Created frontend .env file with correct API URL" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your servers should be running on:" -ForegroundColor Cyan
Write-Host "   • Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test the Kitchen Display:" -ForegroundColor Cyan
Write-Host "   1. Open browser to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Login with your credentials" -ForegroundColor White
Write-Host "   3. Navigate to Kitchen Display (/kitchen)" -ForegroundColor White
Write-Host "   4. Try clicking 'Ready' on an order item" -ForegroundColor White
Write-Host "   5. Check browser console for detailed error logs" -ForegroundColor White
Write-Host ""
Write-Host "🔍 If CORS error persists:" -ForegroundColor Yellow
Write-Host "   • Check browser console for detailed error logs" -ForegroundColor White
Write-Host "   • Verify both servers are running on correct ports" -ForegroundColor White
Write-Host "   • Try hard refresh (Ctrl+F5) to clear browser cache" -ForegroundColor White
Write-Host "   • Check if authentication token is valid" -ForegroundColor White

# Return to original directory
Set-Location "C:\Users\Dell\Desktop\New folder\New folder"