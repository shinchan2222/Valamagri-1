const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const organicProducts = [
  { name: 'Neem Oil Extract (500ml)', desc: 'Pure cold-pressed neem oil for organic pest control. Effective against aphids, mites, and whiteflies.' },
  { name: 'Panchagavya Organic Fertilizer (1L)', desc: 'Traditional organic growth promoter made from cow products. Enhances plant immunity and yield.' },
  { name: 'Jeevamrutham Liquid (5L)', desc: 'Microbial culture that enriches soil and stimulates plant growth natively.' },
  { name: 'Vermicompost Premium Grade (5kg)', desc: 'Nutrient-rich organic compost made by earthworms. Improves soil structure and aeration.' },
  { name: 'Seaweed Extract Fertilizer (1L)', desc: 'Natural plant growth regulator extracted from marine plants. Boosts flowering and fruiting.' },
  { name: 'Trichoderma Viride Bio Fungicide (1kg)', desc: 'Eco-friendly bio-fungicide that protects roots from soil-borne pathogens.' },
  { name: 'Pseudomonas Fluorescens (1kg)', desc: 'Beneficial bacteria that controls plant diseases and promotes growth.' },
  { name: 'Cow Dung Manure (10kg)', desc: 'Fully decomposed organic cow manure. Essential base fertilizer for all crops.' },
  { name: 'Wood Ash Fertilizer (2kg)', desc: 'Natural source of potassium and calcium. Helps balance acidic soils.' },
  { name: 'Bone Meal Organic Fertilizer (1kg)', desc: 'Excellent source of slow-release phosphorus for strong root development.' },
  { name: 'Blood Meal Nitrogen Booster (1kg)', desc: 'High-nitrogen organic fertilizer for rapid leafy green growth.' },
  { name: 'Karanja Oil Bio-Pesticide (500ml)', desc: 'Natural pest repellent extracted from Karanj seeds. Safe for beneficial insects.' },
  { name: 'Bio-NPK Liquid Fertilizer (1L)', desc: 'Consortium of nitrogen-fixing, phosphorus, and potassium mobilizing bacteria.' },
  { name: 'Humic Acid Granules (1kg)', desc: 'Improves soil fertility and nutrient uptake. Excellent for potting mixes.' },
  { name: 'Epsom Salt for Plants (1kg)', desc: 'Magnesium sulfate to prevent yellowing of leaves and boost chlorophyll production.' },
  { name: 'Fish Amino Acid (500ml)', desc: 'Rich source of organic nitrogen and amino acids for foliar spray.' },
  { name: 'Agnihastra Organic Pest Repellent (1L)', desc: 'Potent organic pesticide made from chili, garlic, and neem. Controls severe infestations.' },
  { name: 'Dasagavya Growth Promoter (1L)', desc: 'Advanced organic preparation of 10 elements for total crop protection and growth.' },
  { name: 'Rhizobium Biofertilizer (500g)', desc: 'Nitrogen-fixing bacteria specific for leguminous plants.' },
  { name: 'Azotobacter Soil Conditioner (1kg)', desc: 'Free-living nitrogen-fixing bacteria suitable for all non-legume crops.' }
];

async function updateProducts() {
  try {
    const db = await open({
      filename: 'database.sqlite',
      driver: sqlite3.Database
    });

    const products = await db.all('SELECT p_id FROM tbl_product ORDER BY p_id ASC');
    
    if (products.length === 0) {
      console.log('No products found in the database.');
      return;
    }

    let count = 0;
    for (let i = 0; i < products.length; i++) {
      // If we have more products than our list, wrap around
      const organicProduct = organicProducts[i % organicProducts.length];
      
      const shortDesc = `<p>${organicProduct.desc}</p>`;
      const fullDesc = `<p><strong>${organicProduct.name}</strong> is a premium quality agricultural product.</p><p>${organicProduct.desc}</p><p>Suitable for organic farming, home gardens, and large-scale agriculture.</p>`;
      
      await db.run(
        'UPDATE tbl_product SET p_name = ?, p_short_description = ?, p_description = ?, p_featured_photo = ? WHERE p_id = ?',
        [organicProduct.name, shortDesc, fullDesc, 'soil_seedling_1781597803794.png', products[i].p_id]
      );
      count++;
    }

    console.log(`Successfully updated ${count} products with organic pesticide/fertilizer names!`);
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

updateProducts();
