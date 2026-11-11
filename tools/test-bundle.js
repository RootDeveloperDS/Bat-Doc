const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const formatters = fs.readFileSync(path.join(root, 'src', 'formatters.js'), 'utf8');
const icons = fs.readFileSync(path.join(root, 'src', 'icons.js'), 'utf8');
const parser = fs.readFileSync(path.join(root, 'src', 'parser.js'), 'utf8');
const charts = fs.readFileSync(path.join(root, 'src', 'charts.js'), 'utf8');
const analytics = fs.readFileSync(path.join(root, 'src', 'analytics.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf8');

let code = [formatters, icons, parser, charts, analytics, ui].join('\n\n');

code = code.replace(/export\s+function\s+/g, 'function ')
           .replace(/export\s+const\s+/g, 'const ')
           .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?/g, '');

try {
  const sandbox = {};
  const fn = new Function('window', 'document', 'DOMParser', code + '\n' + `
    return {
      parseBatteryReport,
      analyzeBatteryReport,
      renderDashboard
    };
  `);

  console.log('PASS: All code compiles cleanly!');
} catch (err) {
  console.error('COMPILE ERROR:', err);
  process.exit(1);
}
