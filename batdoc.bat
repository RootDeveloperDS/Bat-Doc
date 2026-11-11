@echo off
setlocal enabledelayedexpansion
title BATDOC - Battery Intelligence Diagnostic
color 0B

echo ==============================================================
echo                 BATDOC - Battery Diagnostic                 
echo         100%% Grounded Windows Battery Intelligence           
echo ==============================================================
echo.
echo [1/3] Interrogating laptop battery hardware via Windows powercfg...

:: 1. Generate native Windows report in temporary directory
set "RAW_FILE=%TEMP%\batdoc_raw.html"
powercfg /batteryreport /output "%RAW_FILE%" >nul 2>&1

if not exist "%RAW_FILE%" (
    echo [ERROR] Could not generate battery report. 
    echo Please make sure your system has an active battery or laptop power subsystem.
    pause
    exit /b 1
)

echo [2/3] Processing 100%% truth-grounded diagnostic insights...

:: Determine template path (checks local directory first, then cached temp)
set "TEMPLATE=%~dp0batdoc-standalone.html"
if not exist "%TEMPLATE%" (
    set "TEMPLATE=%~dp0index.html"
)
if not exist "%TEMPLATE%" (
    set "TEMPLATE=%TEMP%\batdoc-standalone.html"
    if not exist "!TEMPLATE!" (
        echo [INFO] Standalone template not found locally. Fetching latest template...
        powershell -NoProfile -Command ^
            "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
            "$url = 'https://raw.githubusercontent.com/RootDeveloperDS/Bat-Doc/master/batdoc-standalone.html';" ^
            "try { (New-Object System.Net.WebClient).DownloadFile($url, '%TEMP%\batdoc-standalone.html') } catch { exit 1 }"
        if errorlevel 1 (
            echo [ERROR] Could not find or download batdoc-standalone.html.
            echo Please make sure batdoc-standalone.html is in the same folder as batdoc.bat.
            pause
            exit /b 1
        )
    )
)

:: Dynamically determine real desktop folder (OneDrive-aware)
for /f "usebackq delims=" %%D in (`powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`) do set "REAL_DESKTOP=%%D"
if not defined REAL_DESKTOP set "REAL_DESKTOP=%USERPROFILE%\Desktop"

set "OUTPUT_FILE=%REAL_DESKTOP%\BatDoc-Report.html"

:: 2. Safely inject raw report as Base64 payload into standalone template
set "BATDOC_RAW=%RAW_FILE%"
set "BATDOC_TEMPLATE=%TEMPLATE%"
set "BATDOC_OUTPUT=%OUTPUT_FILE%"

powershell -NoProfile -Command ^
    "$rawBytes = [System.IO.File]::ReadAllBytes($env:BATDOC_RAW);" ^
    "$b64 = [Convert]::ToBase64String($rawBytes);" ^
    "$tmpl = Get-Content -LiteralPath $env:BATDOC_TEMPLATE -Raw -Encoding UTF8;" ^
    "$final = $tmpl.Replace('__RAW_REPORT_BASE64_PAYLOAD__', $b64);" ^
    "[System.IO.File]::WriteAllText($env:BATDOC_OUTPUT, $final, [System.Text.Encoding]::UTF8);"

:: If user's profile desktop is different from OneDrive desktop, also save a copy there
if exist "%USERPROFILE%\Desktop" (
    if not "%REAL_DESKTOP%"=="%USERPROFILE%\Desktop" (
        copy /y "%OUTPUT_FILE%" "%USERPROFILE%\Desktop\BatDoc-Report.html" >nul 2>&1
    )
)

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
