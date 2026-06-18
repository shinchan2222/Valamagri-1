const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'public', 'admin', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

let changedFiles = 0;

for (const file of files) {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace <a href="something.php"> with <a href="#something">
    // Exclude links with queries like ?id= since they are usually dynamic table contents we overwrite anyway,
    // or if we must, we can replace them too.
    const originalContent = content;
    
    content = content.replace(/href="([a-zA-Z0-9-]+)\.php"/g, 'href="#$1"');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changedFiles++;
        console.log(`Updated links in ${file}`);
    }
}

console.log(`Updated ${changedFiles} files.`);
