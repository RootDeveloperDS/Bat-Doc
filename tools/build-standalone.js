const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'index.html');
const outputPath = path.join(root, 'batdoc-standalone.html');

console.log('[BATDOC] Building zero-dependency standalone package with Node.js...');

const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
const formatters = fs.readFileSync(path.join(root, 'src', 'formatters.js'), 'utf8');
const icons = fs.readFileSync(path.join(root, 'src', 'icons.js'), 'utf8');
const parser = fs.readFileSync(path.join(root, 'src', 'parser.js'), 'utf8');
const charts = fs.readFileSync(path.join(root, 'src', 'charts.js'), 'utf8');
const analytics = fs.readFileSync(path.join(root, 'src', 'analytics.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf8');

function cleanModule(code) {
  return code
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?/g, '');
}

const combinedJs = [
  '// --- FORMATTERS ---',
  cleanModule(formatters),
  '// --- ICONS ---',
  cleanModule(icons),
  '// --- PARSER ---',
  cleanModule(parser),
  '// --- CHARTS ---',
  cleanModule(charts),
  '// --- ANALYTICS ---',
  cleanModule(analytics),
  '// --- UI ---',
  cleanModule(ui)
].join('\n\n');

let html = fs.readFileSync(templatePath, 'utf8');

// Remove external stylesheet link
html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']src\/styles\.css["']\s*\/?>/i, '');

// Replace embedded style with complete CSS
html = html.replace(/<style>[\s\S]*?<\/style>/i, `<style>\n${css}\n</style>`);

// Replace module imports with inlined JS and change script type
html = html.replace('<script type="module">', '<script>\n' + combinedJs + '\n');
html = html.replace(/import\s*\{\s*parseBatteryReport\s*\}\s*from\s*['"][^'"]+['"];?/, '');
html = html.replace(/import\s*\{\s*analyzeBatteryReport\s*\}\s*from\s*['"][^'"]+['"];?/, '');
html = html.replace(/import\s*\{\s*renderDashboard\s*\}\s*from\s*['"][^'"]+['"];?/, '');

fs.writeFileSync(outputPath, html, 'utf8');

// Validate script syntax
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    console.log('[BATDOC] SUCCESS: Standalone template generated and verified with 0 syntax errors!');
  } catch (err) {
    console.error('[BATDOC] FATAL SYNTAX ERROR in generated standalone:', err);
    process.exit(1);
  }
} else {
  console.error('[BATDOC] FATAL: No <script> tag found in generated bundle!');
  process.exit(1);
}
