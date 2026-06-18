const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  
  // Insert new quantities
  const quantities = ['500ml', '1litre', '100grams', '1kg'];
  for (const q of quantities) {
    await db.run("INSERT INTO tbl_size (size_name) VALUES (?)", [q]);
  }
  
  const sizes = await db.all("SELECT * FROM tbl_size");
  console.log('tbl_size:', sizes);
}

run();
