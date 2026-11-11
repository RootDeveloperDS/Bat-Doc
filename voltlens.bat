@echo off
setlocal enabledelayedexpansion
title VoltLens - Battery Intelligence Diagnostic
color 0B

echo ==============================================================
echo                 VoltLens - Battery Diagnostic                 
echo         100%% Grounded Windows Battery Intelligence           
echo ==============================================================
echo.
echo [1/3] Interrogating laptop battery hardware via Windows powercfg...

:: 1. Generate native Windows report in temporary directory
set "RAW_FILE=%TEMP%\voltlens_raw.html"
powercfg /batteryreport /output "%RAW_FILE%" >nul 2>&1

if not exist "%RAW_FILE%" (
    echo [ERROR] Could not generate battery report. 
    echo Please make sure your system has an active battery or laptop power subsystem.
    pause
    exit /b 1
)

echo [2/3] Processing 100%% truth-grounded diagnostic insights...

:: Determine template path
set "TEMPLATE=%~dp0voltlens-standalone.html"
if not exist "%TEMPLATE%" (
    set "TEMPLATE=%~dp0index.html"
)

set "OUTPUT_FILE=%USERPROFILE%\Desktop\VoltLens-Battery-Report.html"

:: 2. Inject raw report as clean Base64 to prevent HTML corruption
powershell -NoProfile -Command ^
    "$rawBytes = [System.IO.File]::ReadAllBytes('%RAW_FILE%');" ^
    "$b64 = [Convert]::ToBase64String($rawBytes);" ^
    "$tmpl = Get-Content -LiteralPath '%TEMPLATE%' -Raw -Encoding UTF8;" ^
    "$final = $tmpl.Replace('__RAW_REPORT_BASE64_PAYLOAD__', $b64);" ^
    "[System.IO.File]::WriteAllText('%OUTPUT_FILE%', $final, [System.Text.Encoding]::UTF8);"

if not exist "%OUTPUT_FILE%" (
    echo [ERROR] Failed to assemble the report file.
    pause
    exit /b 1
)

echo [3/3] Opening your report in default browser...
echo.
echo [SUCCESS] Report saved to your Desktop:
echo "%OUTPUT_FILE%"
echo.

:: 3. Automatically launch in default browser
start "" "%OUTPUT_FILE%"

:: Cleanup temp raw file
del "%RAW_FILE%" >nul 2>&1

exit /b 0
