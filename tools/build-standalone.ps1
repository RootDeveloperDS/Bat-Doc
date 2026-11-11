# VoltLens Standalone Bundle Generator
# Merges modular src/*.js and src/styles.css into a single zero-dependency standalone HTML template

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$templateFile = Join-Path $workspace "index.html"
$standaloneOutput = Join-Path $workspace "voltlens-standalone.html"

Write-Host "[VoltLens] Building zero-dependency standalone template..."

$cssContent = Get-Content (Join-Path $workspace "src\styles.css") -Raw
$parserCode = Get-Content (Join-Path $workspace "src\parser.js") -Raw
$analyticsCode = Get-Content (Join-Path $workspace "src\analytics.js") -Raw
$chartsCode = Get-Content (Join-Path $workspace "src\charts.js") -Raw
$uiCode = Get-Content (Join-Path $workspace "src\ui.js") -Raw

# Remove export and import statements for pure inline script execution
$parserClean = $parserCode -replace 'export function', 'function'
$analyticsClean = $analyticsCode -replace 'export function', 'function'
$chartsClean = $chartsCode -replace 'export function', 'function'
$uiClean = $uiCode -replace 'export function', 'function' -replace 'import \{.*?\} from \x27\./charts\.js\x27;', ''

$combinedJs = @"
// --- PARSER ---
$parserClean

// --- CHARTS ---
$chartsClean

// --- ANALYTICS ---
$analyticsClean

// --- UI ---
$uiClean
"@

$htmlContent = Get-Content $templateFile -Raw

# Replace embedded style with src/styles.css
$styleRegex = '<style>[\s\S]*?</style>'
$htmlContent = $htmlContent -replace $styleRegex, "<style>`n$cssContent`n</style>"

# Replace the module script block with inline script
$moduleRegex = '<script type="module">[\s\S]*?</script>'
$inlineScriptBlock = @"
<script>
$combinedJs

window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.style.display = 'block';
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    }
  });
};

window.decodeBase64Utf8 = function(b64) {
  const binaryString = atob(b64.trim());
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
};

window.loadReportHTML = function(htmlText) {
  try {
    const data = parseBatteryReport(htmlText);
    const analysis = analyzeBatteryReport(data);
    const dashboardHtml = renderDashboard(data, analysis);

    document.getElementById('dropzone-view').style.display = 'none';
    const dash = document.getElementById('dashboard-view');
    dash.innerHTML = dashboardHtml;
    dash.style.display = 'block';
  } catch (err) {
    alert('Error parsing battery report: ' + err.message);
  }
};

window.loadSampleReport = async function() {
  try {
    const resp = await fetch('sample/battery-report.html');
    if (resp.ok) {
      const text = await resp.text();
      window.loadReportHTML(text);
    } else {
      alert('Sample file not found. Please drag and drop your own battery-report.html.');
    }
  } catch (e) {
    alert('Could not fetch sample. Please drop your battery-report.html file.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const b64Script = document.getElementById('embedded-report-base64');
  if (b64Script && b64Script.textContent.trim().length > 100 && !b64Script.textContent.includes('PAYLOAD')) {
    try {
      const rawHtml = window.decodeBase64Utf8(b64Script.textContent);
      window.loadReportHTML(rawHtml);
    } catch (e) {
      console.error('Failed to decode embedded report data', e);
    }
  }
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => window.loadReportHTML(event.target.result);
    reader.readAsText(file);
  }
});

const dropzone = document.getElementById('dropzone-view');
['dragenter', 'dragover'].forEach(name => {
  dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.add('drag-active'); });
});
['dragleave', 'drop'].forEach(name => {
  dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.remove('drag-active'); });
});
dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => window.loadReportHTML(event.target.result);
    reader.readAsText(file);
  }
});

document.getElementById('btn-demo').addEventListener('click', window.loadSampleReport);
</script>
"@

$finalStandalone = $htmlContent -replace $moduleRegex, $inlineScriptBlock
Set-Content -Path $standaloneOutput -Value $finalStandalone -Encoding UTF8

Write-Host "[VoltLens] Standalone bundle successfully built: $standaloneOutput"
