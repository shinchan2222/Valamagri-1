const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.get("SELECT * FROM tbl_customer WHERE cust_email = 'admin@mail.com'", (err, row) => {
    if (err) console.error(err);
    else console.log(row);
});
