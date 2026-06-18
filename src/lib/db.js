import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import mysql from 'mysql2/promise';

let dbInstance = null;
let isMysql = false;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    isMysql = true;
    dbInstance = mysql.createPool(dbUrl);
    return dbInstance;
  }

  isMysql = false;
  dbInstance = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
  return dbInstance;
}

export async function isDbAvailable() {
  try {
    const db = await getDb();
    if (isMysql) {
      const connection = await db.getConnection();
      await connection.ping();
      connection.release();
    } else {
      await db.get('SELECT 1');
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function query(sql, params) {
  const db = await getDb();
  
  if (isMysql) {
    // MySQL executing queries
    const [results] = await db.execute(sql, params);
    return results;
  } else {
    // SQLite executing queries
    if (params && Array.isArray(params)) {
      params = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    }
    
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      return await db.all(sql, params);
    } else {
      const result = await db.run(sql, params);
      
      // Abstract the result to match mysql2 API
      result.insertId = result.lastID;
      result.affectedRows = result.changes;
      return result;
    }
  }
}

