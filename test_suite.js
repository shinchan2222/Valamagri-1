const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const BASE_URL = 'http://localhost:3000';

const routesToTest = [
  '/',
  '/?tcat=1',
  '/about',
  '/faq',
  '/dashboard',
  '/login',
  '/register',
  '/admin/index.html',
  '/api/categories',
  '/api/sliders'
];

async function testRoute(route) {
  return new Promise((resolve) => {
    http.get(BASE_URL + route, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: data.length
        });
      });
    }).on('error', (err) => {
      resolve({
        route,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE SITE TEST ---');
  let hasErrors = false;
  const issues = [];

  // 1. Test Routes
  console.log('\\n[1] Testing Routes & Pages...');
  for (const route of routesToTest) {
    const result = await testRoute(route);
    const statusStr = result.ok ? 'PASS' : 'FAIL';
    console.log(`[${statusStr}] ${route} (Status: ${result.status})`);
    if (!result.ok) {
      hasErrors = true;
      issues.push(`Route ${route} failed with status ${result.status}`);
    }
  }

  // 2. Database Integrity Check
  console.log('\\n[2] Testing Database Integrity...');
  try {
    const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
    
    const tables = ['tbl_top_category', 'tbl_product', 'tbl_slider', 'tbl_page', 'tbl_faq', 'tbl_customer'];
    for (const table of tables) {
      try {
        const row = await db.get(`SELECT count(*) as count FROM ${table}`);
        console.log(`[PASS] ${table} exists (${row.count} rows)`);
      } catch (err) {
        console.log(`[FAIL] ${table} query failed: ${err.message}`);
        hasErrors = true;
        issues.push(`Database table ${table} error: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`[FAIL] Database connection failed: ${err.message}`);
    hasErrors = true;
    issues.push(`DB Connection Error: ${err.message}`);
  }

  // 3. Summary
  console.log('\\n--- TEST SUMMARY ---');
  if (hasErrors) {
    console.log(`Tests finished with ${issues.length} issues found:`);
    issues.forEach((iss, i) => console.log(`  ${i+1}. ${iss}`));
  } else {
    console.log('All tests passed! No immediate structural issues found.');
  }
}

runTests();
