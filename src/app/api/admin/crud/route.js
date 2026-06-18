import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Primary key mapping for dynamic tables
const tableMeta = {
  'tbl_size': 'size_id',
  'tbl_color': 'color_id',
  'tbl_country': 'country_id',
  'tbl_shipping_cost': 'shipping_cost_id',
  'tbl_top_category': 'tcat_id',
  'tbl_mid_category': 'mcat_id',
  'tbl_end_category': 'ecat_id',
  'tbl_slider': 'id',
  'tbl_service': 'id',
  'tbl_faq': 'faq_id',
  'tbl_page': 'id',
  'tbl_social': 'social_id',
  'tbl_subscriber': 'subs_id',
  'tbl_product': 'p_id',
  'tbl_customer': 'cust_id',
  'tbl_payment': 'id',
  'tbl_settings': 'id'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table || !tableMeta[table]) {
    return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 });
  }

  const pk = tableMeta[table];

  try {
    if (id) {
      const results = await query(`SELECT * FROM ${table} WHERE ${pk} = ?`, [id]);
      if (results.length === 0) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      return NextResponse.json(results[0]);
    } else {
      const results = await query(`SELECT * FROM ${table}`);
      return NextResponse.json(results);
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handleFileUpload(file) {
  if (!file || typeof file === 'string') return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || '.jpg';
  const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
  const filepath = path.join(process.cwd(), 'public', 'assets', 'uploads', filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  if (!table || !tableMeta[table]) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });

  try {
    const formData = await request.formData();
    let fields = [];
    let values = [];
    let placeholders = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value.name) {
        // It's a file
        const filename = await handleFileUpload(value);
        if (filename) {
          fields.push(key);
          values.push(filename);
          placeholders.push('?');
        }
      } else {
        if (['id', 'current_photo', 'form1', '_csrf', 'form_about', 'form_faq', 'form_contact'].includes(key)) continue;
        if (table === 'tbl_end_category' && key === 'tcat_id') continue;

        fields.push(key);
        values.push(value);
        placeholders.push('?');
      }
    }

    if (fields.length === 0) return NextResponse.json({ error: 'No data provided' }, { status: 400 });

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = await query(sql, values);

    return NextResponse.json({ success: true, message: 'Record added successfully', insertId: result.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table || !tableMeta[table]) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  if (!id) return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });

  const pk = tableMeta[table];

  try {
    const formData = await request.formData();
    let setClauses = [];
    let values = [];

    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'object' && value.name) {
        // It's a file
        const filename = await handleFileUpload(value);
        if (filename) {
          setClauses.push(`${key} = ?`);
          values.push(filename);
        }
      } else {
        if (['id', 'current_photo', 'form1', '_csrf', 'form_about', 'form_faq', 'form_contact'].includes(key)) continue;
        if (table === 'tbl_end_category' && key === 'tcat_id') continue;
        
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return NextResponse.json({ success: true, message: 'No changes made' });

    values.push(id);
    const sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${pk} = ?`;
    await query(sql, values);

    return NextResponse.json({ success: true, message: 'Record updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table || !tableMeta[table]) return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  if (!id) return NextResponse.json({ error: 'Missing ID for deletion' }, { status: 400 });

  const pk = tableMeta[table];

  try {
    await query(`DELETE FROM ${table} WHERE ${pk} = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
