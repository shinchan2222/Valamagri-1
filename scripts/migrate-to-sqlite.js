const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const SQL_FILE = path.join(__dirname, '../../DATABASE FILE/ecommerceweb.sql');
const DB_FILE = path.join(__dirname, '../database.sqlite');

async function migrate() {
  console.log('Reading MySQL dump...');
  const sql = fs.readFileSync(SQL_FILE, 'utf8');

  // Split the dump perfectly by the table separator used by phpMyAdmin
  const blocks = sql.split(/-- -{20,}/);

  const tables = {};
  const inserts = [];
  const primaryKeys = {};
  const autoIncrements = {};

  console.log('Parsing constraints and schemas...');
  for (let block of blocks) {
    if (!block.trim()) continue;

    // Remove comments and set statements from this block
    let cleanBlock = block
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^SET .*;$/gm, '')
      .replace(/^START TRANSACTION;$/gm, '')
      .trim();

    if (!cleanBlock) continue;

    // 1. Extract constraints
    const pkMatches = [...cleanBlock.matchAll(/ALTER TABLE `([^`]+)`\s+ADD PRIMARY KEY \(`([^`]+)`\)/gi)];
    for (const m of pkMatches) primaryKeys[m[1]] = m[2];

    const aiMatches = [...cleanBlock.matchAll(/ALTER TABLE `([^`]+)`\s+MODIFY `([^`]+)` .*? AUTO_INCREMENT/gi)];
    for (const m of aiMatches) autoIncrements[m[1]] = m[2];

    // 2. Extract CREATE TABLE
    let match = cleanBlock.match(/CREATE TABLE `([^`]+)` \(([\s\S]+?)\) ENGINE/i);
    if (!match) match = cleanBlock.match(/CREATE TABLE `([^`]+)` \(([\s\S]+?)\)(?:;|$)/i);
    if (match) tables[match[1]] = match[2].trim();

    // 3. Extract INSERT INTO safely without regex to avoid truncation on HTML
    const parts = cleanBlock.split(/INSERT INTO/i);
    // The first part is CREATE TABLE stuff. Subsequent parts are inserts.
    for (let i = 1; i < parts.length; i++) {
      let insertStr = 'INSERT INTO' + parts[i];
      // remove trailing whitespace and ensure it has a semicolon
      insertStr = insertStr.trim();
      if (!insertStr.endsWith(';')) insertStr += ';';
      inserts.push(insertStr);
    }
  }
  console.log('Parsed tables:', Object.keys(tables));

  // Generate SQLite Schema
  const sqliteSchema = [];
  for (const [tableName, columns] of Object.entries(tables)) {
    let cols = columns.split(',\n').map(c => c.trim());
    
    const pkCol = primaryKeys[tableName];
    const aiCol = autoIncrements[tableName];

    cols = cols.map(col => {
      // Find the column name
      const m = col.match(/^`([^`]+)`(.*)$/);
      if (!m) return col;
      
      const colName = m[1];
      let def = m[2];

      if (colName === aiCol || colName === pkCol) {
        // SQLite requires INTEGER PRIMARY KEY AUTOINCREMENT
        def = def.replace(/int\(\d+\)/i, 'INTEGER');
        if (colName === pkCol) {
          def += ' PRIMARY KEY';
        }
        if (colName === aiCol) {
          def += ' AUTOINCREMENT';
        }
      } else {
        // Just clean up mysql types if needed, sqlite accepts most
        def = def.replace(/int\(\d+\)/i, 'INTEGER');
      }

      return `\`${colName}\`${def}`;
    });

    sqliteSchema.push(`CREATE TABLE \`${tableName}\` (\n  ${cols.join(',\n  ')}\n);`);
  }

  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }

  console.log('Creating database.sqlite...');
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  // Execute Schema
  for (const tableSql of sqliteSchema) {
    try {
      await db.exec(tableSql);
    } catch(e) {
      console.error('Failed to create table:', tableSql, '\nError:', e.message);
    }
  }

  console.log(`Inserting data (${inserts.length} batches)...`);
  await db.exec('PRAGMA synchronous = OFF; PRAGMA journal_mode = MEMORY;');
  await db.exec('BEGIN TRANSACTION;');
  for (let insert of inserts) {
    try {
      // Fix MySQL escaping: \' becomes '' in SQLite
      insert = insert.replace(/\\'/g, "''");
      // Remove any trailing semi-colons from the string to be safe, db.exec expects valid sql
      if (!insert.endsWith(';')) insert += ';';
      
      await db.exec(insert);
    } catch(e) {
      console.warn('Failed insert:', insert.substring(0, 100), e.message);
    }
  }
  await db.exec('COMMIT;');

  console.log('Migration complete!');
  await db.close();
}

migrate().catch(console.error);
