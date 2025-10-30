# Trading Nexus Dashboard Startup Script
Write-Host "🚀 Starting Trading Nexus Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Change to the correct directory
Set-Location "E:\busby\Pinescript\trading-dashboard"
Write-Host "📁 Changed to dashboard directory" -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  Node modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🔧 Starting React development server..." -ForegroundColor Green
Write-Host "📍 Dashboard will be available at: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""

# Start the development server
npm start
