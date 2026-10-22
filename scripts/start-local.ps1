# Start Wanderly API (5000) + client (3000) in two PowerShell windows.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Clearing dev ports..."
& "$PSScriptRoot/stop-dev-ports.ps1"

$serverPath = Join-Path $root "server"
$clientPath = Join-Path $root "client"

if (-not (Test-Path (Join-Path $serverPath ".env"))) {
  Copy-Item (Join-Path $serverPath ".env.example") (Join-Path $serverPath ".env")
  Write-Host "Created server/.env from .env.example"
}
if (-not (Test-Path (Join-Path $clientPath ".env.local"))) {
  Copy-Item (Join-Path $clientPath ".env.example") (Join-Path $clientPath ".env.local")
  Write-Host "Created client/.env.local from .env.example"
}

Write-Host "Starting API on http://localhost:5000 ..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$serverPath'; npm run dev"
)

Start-Sleep -Seconds 4

Write-Host "Starting site on http://localhost:3000 ..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$clientPath'; npm run dev"
)

Write-Host ""
Write-Host "Wanderly local dev"
Write-Host "  Website:  http://localhost:3000"
Write-Host "  API:      http://localhost:5000/api/health"
Write-Host "  User:     maya.rahman@email.com / Travel@123"
Write-Host "  Admin:    admin@wanderly.com / Admin@123"
Write-Host ""
Write-Host "To stop: close both PowerShell windows, or run: npm run stop (from project root)"
