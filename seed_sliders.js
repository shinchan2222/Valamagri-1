const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const brainDir = 'C:\\Users\\Naveen\\.gemini\\antigravity\\brain\\5a251a29-975f-43f8-916a-30f07feb2d06';
const uploadsDir = path.join(__dirname, 'public', 'assets', 'uploads');

const slides = [
  {
    file: 'soil_seedling_1781597803794.png',
    heading: '100% Certified Organic Fertilizers',
    content: 'Enrich your soil structure and boost crop yields naturally. Explore our premium worm castings, liquid kelp, and mycorrhizal fungi.',
    button_text: 'Shop Fertilizers',
    button_url: '/?tcat=1',
    position: 'Left'
  },
  {
    file: 'farm_mist_1781597816577.png',
    heading: 'Natural & Safe Pest Management',
    content: 'Keep insects, mildews, and weeds away without toxic chemicals. Discover cold-pressed Neem Oil, insecticidal soap, and organic herbicides.',
    button_text: 'Shop Pesticides',
    button_url: '/?tcat=2',
    position: 'Center'
  },
  {
    file: 'fertilizer_sack_1781597828892.png',
    heading: 'Better Soil. Better Planet.',
    content: 'OMRI listed amendments designed to restore soil microbial biology. Build root systems that resist drought, disease, and heat naturally.',
    button_text: 'Browse Solutions',
    button_url: '/',
    position: 'Right'
  }
];

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  
  // Clear old sliders
  await db.run('DELETE FROM tbl_slider');
  
  for (const slide of slides) {
    const srcPath = path.join(brainDir, slide.file);
    const destName = `organic_slider_${Date.now()}_${Math.floor(Math.random()*1000)}.png`;
    const destPath = path.join(uploadsDir, destName);
    
    // Copy image
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    } else {
      console.warn('Source file missing:', srcPath);
    }
    
    // Insert into DB
    await db.run(`INSERT INTO tbl_slider (photo, heading, content, button_text, button_url, position) VALUES (?, ?, ?, ?, ?, ?)`, 
      [destName, slide.heading, slide.content, slide.button_text, slide.button_url, slide.position]
    );
  }
  
  console.log('Sliders updated with organic agricultural themes!');
}

run().catch(console.error);
