const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function run() {
  const db = await open({
    filename: 'database.sqlite',
    driver: sqlite3.Database
  });

  // Update top categories
  await db.run("UPDATE tbl_top_category SET tcat_name = 'Organic Fertilizers', show_on_menu = 1 WHERE tcat_id = 1");
  await db.run("UPDATE tbl_top_category SET tcat_name = 'Organic Pesticides', show_on_menu = 1 WHERE tcat_id = 2");
  
  // Delete other top categories
  await db.run("DELETE FROM tbl_top_category WHERE tcat_id > 2");

  // Clean mid and end categories
  await db.run("DELETE FROM tbl_mid_category");
  await db.run("DELETE FROM tbl_end_category");

  // Insert Mid Categories for Fertilizers (tcat=1)
  await db.run("INSERT INTO tbl_mid_category (mcat_id, mcat_name, tcat_id) VALUES (1, 'Dry Fertilizers', 1)");
  await db.run("INSERT INTO tbl_mid_category (mcat_id, mcat_name, tcat_id) VALUES (2, 'Liquid Fertilizers', 1)");

  // Insert Mid Categories for Pesticides (tcat=2)
  await db.run("INSERT INTO tbl_mid_category (mcat_id, mcat_name, tcat_id) VALUES (3, 'Insecticides', 2)");
  await db.run("INSERT INTO tbl_mid_category (mcat_id, mcat_name, tcat_id) VALUES (4, 'Fungicides', 2)");

  // Insert End Categories
  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (1, 'Compost & Manure', 1)");
  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (2, 'Bone Meal', 1)");
  
  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (3, 'Kelp Extract', 2)");
  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (4, 'Fish Emulsion', 2)");

  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (5, 'Neem Oil', 3)");
  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (6, 'Insecticidal Soap', 3)");

  await db.run("INSERT INTO tbl_end_category (ecat_id, ecat_name, mcat_id) VALUES (7, 'Copper Fungicide', 4)");

  // Re-assign existing products so they don't break
  await db.run("UPDATE tbl_product SET ecat_id = 1 WHERE ecat_id NOT IN (1,2,3,4,5,6,7)");

  console.log('Categories cleaned up successfully!');
}

run().catch(console.error);
