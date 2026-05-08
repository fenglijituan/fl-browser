const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const js = scriptMatch[1];

console.log('Total lines:', js.split('\n').length);

const mockLS = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

let testCode = '';
let lineNum = 0;
const lines = js.split('\n');

for (let i = 0; i < lines.length; i++) {
  lineNum = i + 1;
  testCode += lines[i] + '\n';
  
  try {
    new Function('localStorage', 'require', testCode)(mockLS, require);
  } catch(e) {
    console.log('❌ ERROR at line', lineNum);
    console.log('Line content:', lines[i]);
    console.log('Error:', e.message);
    console.log('\n--- Context (5 lines before) ---');
    for (let j = Math.max(0, i-5); j < i; j++) {
      console.log((j+1) + ': ' + lines[j]);
    }
    process.exit(1);
  }
}

console.log('✅ All lines parse OK!');