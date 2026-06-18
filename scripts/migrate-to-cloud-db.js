const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const DB_FILE = path.join(__dirname, '../database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;

const tablesToMigrate = [
  'tbl_color',
  'tbl_country',
  'tbl_customer',
  'tbl_customer_message',
  'tbl_end_category',
  'tbl_faq',
  'tbl_language',
  'tbl_mid_category',
  'tbl_order',
  'tbl_page',
  'tbl_payment',
  'tbl_photo',
  'tbl_post',
  'tbl_product',
  'tbl_product_color',
  'tbl_product_photo',
  'tbl_product_size',
  'tbl_rating',
  'tbl_service',
  'tbl_settings',
  'tbl_shipping_cost',
  'tbl_shipping_cost_all',
  'tbl_size',
  'tbl_slider',
  'tbl_social',
  'tbl_subscriber',
  'tbl_top_category',
  'tbl_user',
  'tbl_video',
  'tbl_customer_address',
  'tbl_wishlist',
  'tbl_wallet',
  'tbl_saved_cards',
  'tbl_review'
];

async function runMigration() {
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in your .env.local file!');
    console.log('Please add DATABASE_URL=mysql://user:password@host:port/dbname to your .env.local file first.');
    process.exit(1);
  }

  console.log('Connecting to Local SQLite Database...');
  const sqliteDb = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  console.log('Connecting to Cloud MySQL Database...');
  const mysqlConn = await mysql.createConnection(DATABASE_URL);
  
  console.log('\n--- STARTING DATA MIGRATION ---');

  for (const table of tablesToMigrate) {
    try {
      console.log(`\nMigrating table [${table}]...`);
      
      // 1. Fetch data from SQLite
      const rows = await sqliteDb.all(`SELECT * FROM \`${table}\``);
      if (rows.length === 0) {
        console.log(`  -> Table is empty, skipping data insertion.`);
        continue;
      }

      console.log(`  -> Found ${rows.length} rows in SQLite.`);

      // 2. Clear target table in MySQL to avoid primary key collisions
      console.log(`  -> Clearing existing data in cloud table [${table}]...`);
      await mysqlConn.execute(`DELETE FROM \`${table}\``);

      // 3. Insert into MySQL
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;

      let successCount = 0;
      for (const row of rows) {
        const values = columns.map(col => {
          const val = row[col];
          // Handle SQLite boolean/integer mapping
          if (typeof val === 'boolean') return val ? 1 : 0;
          return val;
        });

        try {
          await mysqlConn.execute(insertSql, values);
          successCount++;
        } catch (insertErr) {
          console.warn(`  [!] Warning inserting row: ${insertErr.message}`);
        }
      }

      console.log(`  -> Successfully migrated ${successCount}/${rows.length} rows.`);

    } catch (tableErr) {
      console.error(`ERROR migrating table [${table}]: ${tableErr.message}`);
    }
  }

  console.log('\n--- MIGRATION COMPLETE ---');
  
  await sqliteDb.close();
  await mysqlConn.end();
}

runMigration().catch(console.error);
