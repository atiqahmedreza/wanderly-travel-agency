# Frees Wanderly dev ports (Windows). Safe to run before npm run dev.
param(
  [int[]]$Ports = @(5000, 3000, 3001)
)

function Stop-PortProcess {
  param([int]$Port)
  $matches = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
  foreach ($line in $matches) {
    $parts = ($line.ToString().Trim() -split '\s+')
    $processId = $parts[-1]
    if ($processId -match '^\d+$') {
      $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
      if ($proc -and $proc.ProcessName -eq 'node') {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped node (PID $processId) on port $Port"
      }
    }
  }
}

foreach ($p in $Ports) {
  Stop-PortProcess -Port $p
}

Write-Host "Ports cleared: $($Ports -join ', ')"
