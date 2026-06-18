const fs = require('fs');
const path = require('path');

const adminViewsDir = path.join(__dirname, 'public', 'admin', 'views');
const adminIndex = path.join(__dirname, 'public', 'admin', 'index.html');
const appJs = path.join(__dirname, 'public', 'admin', 'app.js');
const dashboardPage = path.join(__dirname, 'src', 'app', 'dashboard', 'page.js');

const filesToProcess = [
  adminIndex,
  appJs,
  dashboardPage,
  path.join(adminViewsDir, 'country.html'),
  path.join(adminViewsDir, 'country-add.html'),
  path.join(adminViewsDir, 'country-edit.html'),
  path.join(adminViewsDir, 'shipping-cost.html'),
  path.join(adminViewsDir, 'shipping-cost-add.html'),
  path.join(adminViewsDir, 'shipping-cost-edit.html'),
  path.join(adminViewsDir, 'customer.html')
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace labels
    content = content.replace(/>Country Name</g, '>District Name<');
    content = content.replace(/>Select Country</g, '>Select District<');
    content = content.replace(/>Country</g, '>District<');
    content = content.replace(/<th>Country<\/th>/g, '<th>District</th>');
    content = content.replace(/CountryName/g, 'DistrictName');
    content = content.replace(/>Add Country</g, '>Add District<');
    content = content.replace(/>Edit Country</g, '>Edit District<');
    content = content.replace(/>View Countries</g, '>View Districts<');
    content = content.replace(/<strong>Country:<\/strong>/g, '<strong>District:</strong>');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated UI labels in: ${path.basename(file)}`);
  }
});
