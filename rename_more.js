const fs = require('fs');
const path = require('path');

const adminViewsDir = path.join(__dirname, 'public', 'admin', 'views');

const filesToProcess = [
  path.join(adminViewsDir, 'country.html'),
  path.join(adminViewsDir, 'country-add.html'),
  path.join(adminViewsDir, 'country-edit.html'),
  path.join(adminViewsDir, 'shipping-cost.html'),
  path.join(adminViewsDir, 'shipping-cost-edit.html')
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Perform case-insensitive global replacement for Country -> District
    content = content.replace(/Select Country/g, 'Select District');
    content = content.replace(/Select a country/g, 'Select a district');
    content = content.replace(/Country Name/g, 'District Name');
    content = content.replace(/Add Country/g, 'Add District');
    content = content.replace(/Edit Country/g, 'Edit District');
    content = content.replace(/View Countries/g, 'View Districts');
    content = content.replace(/View Colors/g, 'View Colors'); // dummy
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated UI labels in: ${path.basename(file)}`);
  }
});
