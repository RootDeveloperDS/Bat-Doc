# Standalone Bundle Generator for BATDOC
# Delegates to tools/build-standalone.js to ensure zero backtick escaping issues

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $PSScriptRoot "build-standalone.js"

if (Get-Command node -ErrorAction SilentlyContinue) {
    node "$scriptPath"
} else {
    Write-Host "[BATDOC] Node.js not detected in PATH. Using native PowerShell bundler..."
    # If node is not available, we use single quotes to avoid backtick consumption
    & "$PSScriptRoot\build-standalone.ps1"
}
