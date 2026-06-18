const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const sourceDir = 'T:\\\\croppro';
const targetDir = path.join(__dirname, 'public', 'assets', 'uploads');

async function run() {
  try {
    if (!fs.existsSync(sourceDir)) {
      console.log('Source directory T:\\\\croppro not found!');
      return;
    }

    const files = fs.readdirSync(sourceDir);
    const validFiles = files.filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

    if (validFiles.length === 0) {
      console.log('No images found in T:\\\\croppro!');
      return;
    }

    const assignedImages = [];

    // Copy and rename images to something URL-friendly
    validFiles.forEach((file, index) => {
      const ext = path.extname(file);
      const newName = `croppro_${index + 1}${ext}`;
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, newName);

      fs.copyFileSync(sourcePath, targetPath);
      assignedImages.push(newName);
    });

    console.log(`Copied ${assignedImages.length} images to uploads folder.`);

    // Update the database to use these new images
    const db = await open({
      filename: 'database.sqlite',
      driver: sqlite3.Database
    });

    const products = await db.all('SELECT p_id FROM tbl_product ORDER BY p_id ASC');
    
    let count = 0;
    for (let i = 0; i < products.length; i++) {
      const img = assignedImages[i % assignedImages.length];
      await db.run('UPDATE tbl_product SET p_featured_photo = ? WHERE p_id = ?', [img, products[i].p_id]);
      count++;
    }

    console.log(`Successfully assigned Croppro images across ${count} products!`);

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
