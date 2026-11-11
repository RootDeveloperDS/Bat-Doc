# Compiles src/launcher.cs into batdoc.exe using native Windows csc.exe
$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$sourceFile = Join-Path $workspace "src\launcher.cs"
$iconFile = Join-Path $workspace "assets\icon.ico"
$outputFile = Join-Path $workspace "batdoc.exe"

$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    $csc = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

Write-Host "[BATDOC] Compiling native Windows executable: batdoc.exe..."

$compileArgs = @(
    "/nologo",
    "/target:winexe",
    "/optimize+",
    "/platform:anycpu",
    "/r:System.Windows.Forms.dll,System.Drawing.dll",
    "/win32icon:$iconFile",
    "/out:$outputFile",
    "$sourceFile"
)

& $csc $compileArgs

if (Test-Path $outputFile) {
    $size = (Get-Item $outputFile).Length
    Write-Host "[BATDOC] SUCCESS: Compiled batdoc.exe ($size bytes) with custom icon!" -ForegroundColor Green
} else {
    Write-Host "[BATDOC] Compilation failed!" -ForegroundColor Red
    exit 1
}
