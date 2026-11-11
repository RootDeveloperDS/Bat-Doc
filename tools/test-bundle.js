const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const standalonePath = path.join(root, 'batdoc-standalone.html');

if (!fs.existsSync(standalonePath)) {
  console.error('ERROR: batdoc-standalone.html does not exist.');
  process.exit(1);
}

const html = fs.readFileSync(standalonePath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

if (!scriptMatch) {
  console.error('ERROR: No inline script found in batdoc-standalone.html.');
  process.exit(1);
}

try {
  new Function(scriptMatch[1]);
  console.log('PASS: batdoc-standalone.html compiles with 0 syntax errors!');
} catch (err) {
  console.error('FAIL: Syntax error in batdoc-standalone.html:', err);
  process.exit(1);
}
