const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../admin');
const destDir = path.join(__dirname, '../public/admin/views');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

for (const file of files) {
    if (file.endsWith('.php') && file !== 'header.php' && file !== 'footer.php' && file !== 'login.php' && file !== 'logout.php') {
        let content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
        
        // Remove require_once('header.php') and footer.php
        content = content.replace(/<\?php\s*require_once\('header\.php'\);\s*\?>/g, '');
        content = content.replace(/<\?php\s*require_once\('footer\.php'\);\s*\?>/g, '');
        
        // Remove all PHP blocks <?php ... ?>
        // Because PHP blocks can span multiple lines, we use [\s\S]*?
        content = content.replace(/<\?php[\s\S]*?\?>/g, '');
        
        // Remove short echo tags <?= ... ?> if any
        content = content.replace(/<\?=[\s\S]*?\?>/g, '');

        // Fix image paths
        content = content.replace(/\.\.\/assets\/uploads\//g, '/assets/uploads/');

        // Save as .html
        const destFile = file.replace('.php', '.html');
        fs.writeFileSync(path.join(destDir, destFile), content.trim());
        console.log(`Converted ${file} to ${destFile}`);
    }
}
