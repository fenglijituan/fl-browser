const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const js = scriptMatch[1];

// Mock localStorage properly
const mockLS = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

try {
  new Function('localStorage', 'require', js)(mockLS, require);
  console.log('✅ JS语法完全正确！');
} catch(e) {
  console.log('❌ ERROR:', e.message);
  // Try to find line
  const lines = js.split('\n');
  try {
    let test = '';
    for (let i = 0; i < lines.length; i++) {
      test += lines[i] + '\n';
      new Function('localStorage', test)(mockLS);
    }
    console.log('All lines parse OK');
  } catch(e2) {
    console.log('Error at:', e2.message);
  }
}
