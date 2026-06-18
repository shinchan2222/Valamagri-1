const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const tamilNaduDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

async function run() {
  const db = await open({
    filename: 'database.sqlite',
    driver: sqlite3.Database
  });

  // Clear existing countries and shipping costs to avoid orphaned data
  await db.run('DELETE FROM tbl_country');
  await db.run('DELETE FROM tbl_shipping_cost');

  // Insert Tamil Nadu Districts
  let id = 1;
  for (const dist of tamilNaduDistricts) {
    await db.run('INSERT INTO tbl_country (country_id, country_name) VALUES (?, ?)', [id, dist]);
    // Also initialize a default shipping cost of 0 for each district so it appears in the Shipping Cost page
    await db.run('INSERT INTO tbl_shipping_cost (shipping_cost_id, country_id, amount) VALUES (?, ?, ?)', [id, id, '50.00']);
    id++;
  }

  console.log(`Successfully inserted ${tamilNaduDistricts.length} Tamil Nadu districts!`);
}

run().catch(console.error);
