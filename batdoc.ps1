# BATDOC 1-Line PowerShell Diagnostic Launcher
# Interrogates Windows power telemetry, bundles into BatDoc-Report.html, and opens browser.

$ErrorActionPreference = "Stop"

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "                BATDOC - Battery Diagnostic                   " -ForegroundColor Cyan
Write-Host "        100% Grounded Windows Battery Intelligence            " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/3] Interrogating laptop battery hardware via powercfg..." -ForegroundColor Yellow

$tempRaw = Join-Path $env:TEMP "batdoc_raw.html"
powercfg /batteryreport /output "$tempRaw" | Out-Null

if (-not (Test-Path $tempRaw)) {
    Write-Host "[ERROR] Could not generate battery report. Ensure your system has an active battery." -ForegroundColor Red
    return
}

Write-Host "[2/3] Processing 100% truth-grounded diagnostic insights..." -ForegroundColor Yellow

$templatePath = Join-Path $PSScriptRoot "batdoc-standalone.html"
if (-not (Test-Path $templatePath)) {
    $templatePath = Join-Path $env:TEMP "batdoc-standalone.html"
    if (-not (Test-Path $templatePath)) {
        Write-Host "[INFO] Fetching standalone diagnostic template..." -ForegroundColor Gray
        $uri = "https://raw.githubusercontent.com/RootDeveloperDS/Bat-Doc/master/batdoc-standalone.html"
        Invoke-WebRequest -Uri $uri -OutFile $templatePath -UseBasicParsing
    }
}

$rawBytes = [System.IO.File]::ReadAllBytes($tempRaw)
$b64 = [Convert]::ToBase64String($rawBytes)
$templateContent = Get-Content -LiteralPath $templatePath -Raw -Encoding UTF8
$final = $templateContent.Replace('__RAW_REPORT_BASE64_PAYLOAD__', $b64)

$realDesktop = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop)
if (-not $realDesktop) {
    $realDesktop = Join-Path $env:USERPROFILE "Desktop"
}

$desktopOutput = Join-Path $realDesktop "BatDoc-Report.html"
[System.IO.File]::WriteAllText($desktopOutput, $final, [System.Text.Encoding]::UTF8)

# If profile desktop is distinct from OneDrive desktop, mirror the output
$altDesktop = Join-Path $env:USERPROFILE "Desktop"
if ((Test-Path $altDesktop) -and ($realDesktop -ne $altDesktop)) {
    Copy-Item -Path $desktopOutput -Destination (Join-Path $altDesktop "BatDoc-Report.html") -Force -ErrorAction SilentlyContinue
}

Remove-Item -Path $tempRaw -Force -ErrorAction SilentlyContinue

Write-Host "[3/3] Opening report in default browser..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[SUCCESS] Report saved to your Desktop: $desktopOutput" -ForegroundColor Green
Write-Host ""

Start-Process -FilePath $desktopOutput
