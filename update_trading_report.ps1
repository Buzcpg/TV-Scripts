#!/usr/bin/env pwsh

Write-Host "🚀 Updating Trading Performance Report..." -ForegroundColor Cyan
Write-Host ""

try {
    python trading_performance_analyzer.py
    Write-Host ""
    Write-Host "✅ Report update complete!" -ForegroundColor Green
    Write-Host "📋 Check trading_performance_report.xlsx for the latest analysis" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue..."

