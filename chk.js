const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const sm = html.match(/<script>([\s\S]*?)<\/script>/);
const js = sm[1].trim();

// Write JS to temp file and check
fs.writeFileSync('_temp_check.js', js);

const { execSync } = require('child_process');
try {
  execSync('node --check _temp_check.js', { stdio: 'pipe' });
  console.log('SYNTAX OK');
  fs.unlinkSync('_temp_check.js');
} catch (e) {
  console.log('SYNTAX ERROR:', e.stderr.toString());
  // Parse error info
  const errStr = e.stderr.toString();
  const lineMatch = errStr.match(/:(\d+)/);
  if (lineMatch) {
    const errLine = parseInt(lineMatch[1]);
    const lines = js.split('\n');
    console.log('Error at JS line', errLine);
    if (errLine > 0 && errLine <= lines.length) {
      console.log('Content:', JSON.stringify(lines[errLine - 1]));
      if (errLine > 1) console.log('Prev:', JSON.stringify(lines[errLine - 2].slice(-100)));
    }
  }
}
