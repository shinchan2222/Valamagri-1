const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'public', 'admin', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

let changedFiles = 0;

for (const file of files) {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace href="#" with href="javascript:void(0);"
    content = content.replace(/href="#"/g, 'href="javascript:void(0);"');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changedFiles++;
        console.log(`Updated href="#" in ${file}`);
    }
}

console.log(`Updated ${changedFiles} files with href="#" fixes.`);
