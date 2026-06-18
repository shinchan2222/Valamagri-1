import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction
} from 'firebase/firestore';

// Map SQLite table names to Firestore collection names
const tableCollectionMap = {
  'tbl_color': 'colors',
  'tbl_country': 'countries',
  'tbl_customer': 'customers',
  'tbl_customer_message': 'customer_messages',
  'tbl_end_category': 'end_categories',
  'tbl_faq': 'faqs',
  'tbl_language': 'languages',
  'tbl_mid_category': 'mid_categories',
  'tbl_order': 'orders',
  'tbl_page': 'pages',
  'tbl_payment': 'payments',
  'tbl_photo': 'photos',
  'tbl_post': 'posts',
  'tbl_product': 'products',
  'tbl_product_color': 'product_colors',
  'tbl_product_photo': 'product_photos',
  'tbl_product_size': 'product_sizes',
  'tbl_rating': 'ratings',
  'tbl_service': 'services',
  'tbl_settings': 'settings',
  'tbl_shipping_cost': 'shipping_costs',
  'tbl_shipping_cost_all': 'shipping_costs_all',
  'tbl_size': 'sizes',
  'tbl_slider': 'sliders',
  'tbl_social': 'social',
  'tbl_subscriber': 'subscribers',
  'tbl_top_category': 'top_categories',
  'tbl_user': 'users',
  'tbl_video': 'videos',
  'tbl_customer_address': 'customer_addresses',
  'tbl_wishlist': 'wishlist',
  'tbl_wallet': 'wallet',
  'tbl_saved_cards': 'saved_cards',
  'tbl_review': 'reviews'
};

// Map SQLite table names to their Primary Key column name
const pkMap = {
  'tbl_color': 'color_id',
  'tbl_country': 'country_id',
  'tbl_customer': 'cust_id',
  'tbl_customer_message': 'customer_message_id',
  'tbl_end_category': 'ecat_id',
  'tbl_faq': 'faq_id',
  'tbl_language': 'lang_id',
  'tbl_mid_category': 'mcat_id',
  'tbl_order': 'id',
  'tbl_page': 'id',
  'tbl_payment': 'id',
  'tbl_photo': 'id',
  'tbl_post': 'post_id',
  'tbl_product': 'p_id',
  'tbl_product_color': 'id',
  'tbl_product_photo': 'id',
  'tbl_product_size': 'id',
  'tbl_rating': 'rt_id',
  'tbl_service': 'id',
  'tbl_settings': 'id',
  'tbl_shipping_cost': 'shipping_cost_id',
  'tbl_shipping_cost_all': 'shipping_cost_id',
  'tbl_size': 'size_id',
  'tbl_slider': 'id',
  'tbl_social': 'social_id',
  'tbl_subscriber': 'subs_id',
  'tbl_top_category': 'tcat_id',
  'tbl_user': 'id',
  'tbl_video': 'id',
  'tbl_customer_address': 'id',
  'tbl_wishlist': 'id',
  'tbl_wallet': 'id',
  'tbl_saved_cards': 'id',
  'tbl_review': 'id'
};

// Emulated auto-increment using a counter document in Firestore
async function getNextId(tableName) {
  const collectionName = tableCollectionMap[tableName] || tableName;
  const counterRef = doc(db, 'metadata', 'counters');
  let nextId = 1;
  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { [collectionName]: 1 });
        nextId = 1;
      } else {
        const current = counterDoc.data()[collectionName] || 0;
        nextId = current + 1;
        transaction.update(counterRef, { [collectionName]: nextId });
      }
    });
  } catch (e) {
    console.error(`Error in getNextId for ${tableName}:`, e);
    // Fallback: use timestamp as counter if transactions fail
    nextId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
  }
  return nextId;
}

export async function getDb() {
  return db;
}

export async function isDbAvailable() {
  return true;
}

async function resolveJoins(tableName, rows) {
  if (rows.length === 0) return rows;

  try {
    if (tableName === 'tbl_rating') {
      const custSnap = await getDocs(collection(db, 'customers'));
      const custMap = {};
      custSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.cust_id || Number(d.id) || d.id;
        custMap[String(id)] = data.cust_name || 'Anonymous';
      });
      for (const r of rows) {
        r.cust_name = custMap[String(r.cust_id)] || 'Anonymous';
      }
    }

    if (tableName === 'tbl_customer') {
      const countrySnap = await getDocs(collection(db, 'countries'));
      const countryMap = {};
      countrySnap.docs.forEach(d => {
        const data = d.data();
        const id = data.country_id || Number(d.id) || d.id;
        countryMap[String(id)] = data.country_name || '';
      });
      for (const c of rows) {
        c.country_name = countryMap[String(c.cust_country)] || '';
      }
    }

    if (tableName === 'tbl_shipping_cost') {
      const countrySnap = await getDocs(collection(db, 'countries'));
      const countryMap = {};
      countrySnap.docs.forEach(d => {
        const data = d.data();
        const id = data.country_id || Number(d.id) || d.id;
        countryMap[String(id)] = data.country_name || '';
      });
      for (const s of rows) {
        s.country_name = countryMap[String(s.country_id)] || '';
      }
    }

    if (tableName === 'tbl_mid_category') {
      const topSnap = await getDocs(collection(db, 'top_categories'));
      const topMap = {};
      topSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.tcat_id || Number(d.id) || d.id;
        topMap[String(id)] = data.tcat_name || '';
      });
      for (const m of rows) {
        m.tcat_name = topMap[String(m.tcat_id)] || '';
      }
    }

    if (tableName === 'tbl_end_category') {
      const [midSnap, topSnap] = await Promise.all([
        getDocs(collection(db, 'mid_categories')),
        getDocs(collection(db, 'top_categories'))
      ]);
      const midMap = {};
      midSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.mcat_id || Number(d.id) || d.id;
        midMap[String(id)] = data;
      });
      const topMap = {};
      topSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.tcat_id || Number(d.id) || d.id;
        topMap[String(id)] = data.tcat_name || '';
      });
      for (const e of rows) {
        const midCat = midMap[String(e.mcat_id)];
        if (midCat) {
          e.mcat_name = midCat.mcat_name || '';
          e.tcat_name = topMap[String(midCat.tcat_id)] || '';
        } else {
          e.mcat_name = '';
          e.tcat_name = '';
        }
      }
    }

    if (tableName === 'tbl_product') {
      const [endSnap, midSnap, topSnap] = await Promise.all([
        getDocs(collection(db, 'end_categories')),
        getDocs(collection(db, 'mid_categories')),
        getDocs(collection(db, 'top_categories'))
      ]);
      const endMap = {};
      endSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.ecat_id || Number(d.id) || d.id;
        endMap[String(id)] = data;
      });
      const midMap = {};
      midSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.mcat_id || Number(d.id) || d.id;
        midMap[String(id)] = data;
      });
      const topMap = {};
      topSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.tcat_id || Number(d.id) || d.id;
        topMap[String(id)] = data.tcat_name || '';
      });
      for (const p of rows) {
        const endCat = endMap[String(p.ecat_id)];
        if (endCat) {
          p.ecat_name = endCat.ecat_name || '';
          p.mcat_id = endCat.mcat_id || '';
          const midCat = midMap[String(endCat.mcat_id)];
          if (midCat) {
            p.mcat_name = midCat.mcat_name || '';
            p.tcat_id = midCat.tcat_id || '';
            p.tcat_name = topMap[String(midCat.tcat_id)] || '';
          } else {
            p.mcat_name = '';
            p.tcat_id = '';
            p.tcat_name = '';
          }
        } else {
          p.ecat_name = '';
          p.mcat_id = '';
          p.mcat_name = '';
          p.tcat_id = '';
          p.tcat_name = '';
        }
      }
    }

    if (tableName === 'tbl_payment') {
      const custSnap = await getDocs(collection(db, 'customers'));
      const custMap = {};
      custSnap.docs.forEach(d => {
        const data = d.data();
        const id = data.cust_id || Number(d.id) || d.id;
        custMap[String(id)] = data;
      });
      for (const p of rows) {
        const cust = custMap[String(p.customer_id)];
        if (cust) {
          p.customer_address = cust.cust_s_address || '';
          p.customer_city = cust.cust_s_city || '';
          p.customer_state = cust.cust_s_state || '';
          p.customer_zip = cust.cust_s_zip || '';
          p.customer_phone = cust.cust_phone || '';
        } else {
          p.customer_address = '';
          p.customer_city = '';
          p.customer_state = '';
          p.customer_zip = '';
          p.customer_phone = '';
        }
      }
    }
  } catch (e) {
    console.error(`Error resolving joins for table ${tableName}:`, e);
  }

  return rows;
}

export async function query(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  const getTable = (sqlStr) => {
    const upperStr = sqlStr.toUpperCase();
    let match = null;
    if (upperStr.startsWith('SELECT')) {
      match = sqlStr.match(/from\s+[`"']?(\w+)[`"']?/i);
    } else if (upperStr.startsWith('INSERT')) {
      match = sqlStr.match(/insert\s+into\s+[`"']?(\w+)[`"']?/i);
    } else if (upperStr.startsWith('UPDATE')) {
      match = sqlStr.match(/update\s+[`"']?(\w+)[`"']?/i);
    } else if (upperStr.startsWith('DELETE')) {
      match = sqlStr.match(/delete\s+from\s+[`"']?(\w+)[`"']?/i);
    }
    
    if (match && tableCollectionMap[match[1]]) {
      return match[1];
    }
    
    // Fallback: search substring
    for (const tbl of Object.keys(tableCollectionMap)) {
      if (sqlStr.includes(tbl)) return tbl;
    }
    return null;
  };

  const tableName = getTable(cleanSql);
  if (!tableName) {
    console.warn('Unknown SQL statement parsed:', sql);
    return [];
  }

  const collectionName = tableCollectionMap[tableName];
  const pk = pkMap[tableName] || 'id';

  // ───────────────────────────────────────────────────────────────────────────
  // 1. SELECT Query Handler
  // ───────────────────────────────────────────────────────────────────────────
  if (upperSql.startsWith('SELECT')) {
    // Fetch all documents from Firestore
    const snap = await getDocs(collection(db, collectionName));
    let rows = snap.docs.map(d => {
      const data = d.data();
      data[pk] = data[pk] || Number(d.id) || d.id;
      return data;
    });

    // Resolve JOINs in memory first so that joined fields can be filtered/queried
    rows = await resolveJoins(tableName, rows);

    // Parse and apply WHERE filters in memory
    if (upperSql.includes(' WHERE ')) {
      const whereClause = cleanSql.split(/ where /i)[1].split(/ order by | limit /i)[0];
      const conditions = whereClause.split(/\s+and\s+/i);
      
      // Pre-parse conditions to map them correctly to the positional parameters array
      let paramIndex = 0;
      const parsedConditions = [];

      for (const cond of conditions) {
        let trimmedCond = cond.trim();
        let isOr = false;
        let subParts = [trimmedCond];

        if (trimmedCond.startsWith('(') && trimmedCond.endsWith(')')) {
          trimmedCond = trimmedCond.slice(1, -1).trim();
        }

        if (trimmedCond.toUpperCase().includes(' OR ')) {
          isOr = true;
          subParts = trimmedCond.split(/\s+or\s+/i);
        }

        const resolvedParts = [];
        for (const part of subParts) {
          const match = part.match(/`?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)`?\s*(=|LIKE)\s*(.*)/i);
          if (match) {
            const field = match[1];
            const operator = match[2];
            let rawValue = match[3].trim();
            let val;
            if (rawValue === '?') {
              val = params[paramIndex++];
            } else {
              val = rawValue.replace(/^['"]|['"]$/g, '');
            }
            resolvedParts.push({ field, operator, value: val });
          }
        }

        parsedConditions.push({ isOr, parts: resolvedParts });
      }

      // Filter rows
      for (const cond of parsedConditions) {
        rows = rows.filter(row => {
          const checkPart = (part) => {
            const rowVal = row[part.field];
            const compareVal = (!isNaN(part.value) && part.value !== '' && part.value !== null) ? Number(part.value) : part.value;
            
            if (part.operator === '=') {
              return String(rowVal) === String(compareVal);
            } else if (part.operator.toUpperCase() === 'LIKE') {
              const cleanLike = String(compareVal).replace(/%/g, '').toLowerCase();
              return String(rowVal).toLowerCase().includes(cleanLike);
            }
            return true;
          };

          if (cond.isOr) {
            return cond.parts.some(checkPart);
          } else {
            return cond.parts.every(checkPart);
          }
        });
      }
    }

    // Parse and apply ORDER BY in memory
    if (upperSql.includes(' ORDER BY ')) {
      const orderClause = cleanSql.split(/ order by /i)[1].split(/ limit /i)[0].trim();
      const parts = orderClause.split(' ');
      const field = parts[0].replace(/`/g, '');
      const dir = (parts[1] || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;

      rows.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    // Parse and apply LIMIT in memory
    if (upperSql.includes(' LIMIT ')) {
      const limitVal = parseInt(cleanSql.split(/ limit /i)[1].trim());
      if (!isNaN(limitVal)) {
        rows = rows.slice(0, limitVal);
      }
    }

    // Check for SUM/COUNT aggregates
    if (upperSql.includes('COUNT(*)')) {
      return [{ count: rows.length }];
    }
    if (upperSql.includes('SUM(')) {
      const sum = rows.reduce((acc, row) => acc + parseFloat(row.paid_amount || 0), 0);
      return [{ total: sum }];
    }

    return rows;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. INSERT Query Handler
  // ───────────────────────────────────────────────────────────────────────────
  if (upperSql.startsWith('INSERT')) {
    const fieldsPart = cleanSql.match(/\(([^)]+)\)/)[1];
    const fields = fieldsPart.split(',').map(f => f.trim().replace(/`/g, ''));
    
    const rowData = {};
    fields.forEach((field, index) => {
      rowData[field] = params[index];
    });

    const newId = await getNextId(tableName);
    rowData[pk] = newId;

    await setDoc(doc(db, collectionName, String(newId)), rowData);

    return { insertId: newId, affectedRows: 1 };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. UPDATE Query Handler
  // ───────────────────────────────────────────────────────────────────────────
  if (upperSql.startsWith('UPDATE')) {
    const setPart = cleanSql.split(/ set /i)[1].split(/ where /i)[0];
    const setClauses = setPart.split(',').map(s => s.trim());
    
    const updateData = {};
    let paramIndex = 0;

    for (const clause of setClauses) {
      const parts = clause.split('=');
      if (parts.length < 2) continue;
      const field = parts[0].trim().replace(/`/g, '');
      const valuePart = parts[1].trim();

      if (valuePart === '?') {
        updateData[field] = params[paramIndex++];
      } else if (valuePart.toUpperCase() === 'CURRENT_TIMESTAMP') {
        updateData[field] = new Date().toISOString().slice(0, 19).replace('T', ' ');
      } else {
        updateData[field] = valuePart.replace(/^['"]|['"]$/g, '');
      }
    }

    const whereMatch = cleanSql.match(/where\s+`?(\w+)`?\s*=\s*(.*)/i);
    let idParam;
    if (whereMatch) {
      const valPart = whereMatch[2].trim();
      if (valPart === '?') {
        idParam = params[paramIndex];
      } else {
        idParam = valPart.replace(/^['"]|['"]$/g, '');
      }
    } else {
      idParam = params[params.length - 1];
    }

    const docRef = doc(db, collectionName, String(idParam));
    await updateDoc(docRef, updateData);

    return { affectedRows: 1 };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. DELETE Query Handler
  // ───────────────────────────────────────────────────────────────────────────
  if (upperSql.startsWith('DELETE')) {
    const idParam = params[0];
    const docRef = doc(db, collectionName, String(idParam));
    await deleteDoc(docRef);

    return { affectedRows: 1 };
  }

  return [];
}


