const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'public', 'admin', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

let changedFiles = 0;

for (const file of files) {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace href="#tab_X" with href="javascript:void(0);" data-target="#tab_X"
    content = content.replace(/href="#(tab_[a-zA-Z0-9_]+)"\s+data-toggle="tab"/g, 'href="javascript:void(0);" data-target="#$1" data-toggle="tab"');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changedFiles++;
        console.log(`Updated tabs in ${file}`);
    }
}

console.log(`Updated ${changedFiles} files with tab fixes.`);
