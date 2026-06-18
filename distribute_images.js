const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const images = [
  'soil_seedling_1781597803794.png',
  'farm_mist_1781597816577.png',
  'fertilizer_sack_1781597828892.png'
];

async function updateImages() {
  const db = await open({
    filename: 'database.sqlite',
    driver: sqlite3.Database
  });

  const products = await db.all('SELECT p_id FROM tbl_product');
  
  for (let i = 0; i < products.length; i++) {
    const img = images[i % images.length];
    await db.run('UPDATE tbl_product SET p_featured_photo = ? WHERE p_id = ?', [img, products[i].p_id]);
  }
  
  console.log('Successfully distributed 3 organic farming images across all products!');
}

updateImages().catch(console.error);
