# Validates the Winget manifest files against Microsoft's official schema
$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $workspace "batdoc.exe"
$manifestDir = Join-Path $workspace "winget\manifests\r\RootDeveloperDS\BatDoc\1.3.0"
$installerYaml = Join-Path $manifestDir "RootDeveloperDS.BatDoc.installer.yaml"

if (Test-Path $exePath) {
    $hash = (Get-FileHash -Path $exePath -Algorithm SHA256).Hash
    Write-Host "[WINGET] Current batdoc.exe SHA256: $hash" -ForegroundColor Cyan
    
    # Update hash in installer.yaml if different
    $content = Get-Content $installerYaml -Raw -Encoding UTF8
    $updated = $content -replace 'InstallerSha256: [A-Fa-f0-9]{64}', "InstallerSha256: $hash"
    [System.IO.File]::WriteAllText($installerYaml, $updated, [System.Text.Encoding]::UTF8)
}

Write-Host "[WINGET] Running Microsoft winget validate..." -ForegroundColor Yellow
winget validate --manifest "$manifestDir"
