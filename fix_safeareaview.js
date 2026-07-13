const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  content = content.replace(
    /style=\{\{\s*backgroundColor:\s*isDark\s*\?\s*colors\.background\.dark\s*:\s*colors\.background\.light,?\s*\}\}/g,
    'style={{ flex: 1, backgroundColor: isDark ? colors.background.dark : colors.background.light }}'
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
    modifiedCount++;
  }
});
console.log('Total fixed:', modifiedCount);
