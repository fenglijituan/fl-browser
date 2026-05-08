const fs=require('fs');
const html=fs.readFileSync('d:\\网站HTML\\FL Browser\\index.html','utf8');
const lines=html.split('\n');
console.log('Total lines:',lines.length);
console.log('Last 3 lines:',lines.slice(-3));
console.log('Contains </html>:',html.includes('</html>'));
console.log('Contains <script>:',html.includes('<script>'));
console.log('Contains </script>:',html.includes('</script>'));
console.log('Contains init():',html.includes('init()'));
console.log('Contains navigate():',html.includes('function navigate('));
console.log('Contains switchTab():',html.includes('function switchTab('));
console.log('Contains handleClick():',html.includes('function handleClick('));
console.log('Contains newtabHTML():',html.includes('function newtabHTML('));
console.log('Contains getTopSites():',html.includes('function getTopSites('));
console.log('Contains showSuggestions():',html.includes('function showSuggestions('));
console.log('Contains addToHistory():',html.includes('function addToHistory('));

// Check for common syntax errors
const sm=html.match(/<script>([\s\S]*?)<\/script>/);
if(sm){
try{new Function(sm[1]);console.log('JS syntax: OK')}
catch(e){console.log('JS ERROR:',e.message);
  const lnum=e.lineNumber||0;
  if(lnum){console.log('Around line:',lnum);console.log('Content:',lines[lnum-1]?lines[lnum-1].slice(0,120):'')}
}
}else{console.log('No script found!')}
