const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const c = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='tbl_customer'");
  const p = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='tbl_payment'");
  console.log(c[0]?.sql);
  console.log(p[0]?.sql);
}

run();
