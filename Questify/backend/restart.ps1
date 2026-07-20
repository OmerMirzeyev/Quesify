# restart.ps1 — Kills any running backend instance, then starts fresh.
Write-Host "Stopping existing backend process..." -ForegroundColor Yellow
Get-Process -Name "backend" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 800
Write-Host "Starting backend..." -ForegroundColor Cyan
dotnet run
