import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

async function handleFileUpload(file) {
  if (!file || typeof file === 'string') return null;
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength === 0) return null;
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || '.jpg';
  const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
  const filepath = path.join(process.cwd(), 'public', 'assets', 'uploads', filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract base product fields
    const p_name = formData.get('p_name') || '';
    const p_old_price = formData.get('p_old_price') || '0';
    const p_current_price = formData.get('p_current_price') || '0';
    const p_qty = formData.get('p_qty') || '0';
    const p_description = formData.get('p_description') || '';
    const p_short_description = formData.get('p_short_description') || '';
    const p_feature = formData.get('p_feature') || '';
    const p_condition = formData.get('p_condition') || '';
    const p_return_policy = formData.get('p_return_policy') || '';
    const p_is_featured = formData.get('p_is_featured') || '0';
    const p_is_active = formData.get('p_is_active') || '0';
    const ecat_id = formData.get('ecat_id') || '0';
    
    let p_featured_photo = '';
    const photoFile = formData.get('p_featured_photo');
    if (photoFile && typeof photoFile === 'object') {
      p_featured_photo = await handleFileUpload(photoFile) || '';
    }

    const sql = `INSERT INTO tbl_product (
      p_name, p_old_price, p_current_price, p_qty, p_featured_photo,
      p_description, p_short_description, p_feature, p_condition, p_return_policy,
      p_total_view, p_is_featured, p_is_active, ecat_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`;
    
    const values = [
      p_name, p_old_price, p_current_price, p_qty, p_featured_photo,
      p_description, p_short_description, p_feature, p_condition, p_return_policy,
      p_is_featured, p_is_active, ecat_id
    ];

    const result = await query(sql, values);
    const p_id = result.insertId;

    // Handle sizes
    const sizes = formData.getAll('size[]');
    for (const size_id of sizes) {
      if (size_id) {
        await query(`INSERT INTO tbl_product_size (size_id, p_id) VALUES (?, ?)`, [size_id, p_id]);
      }
    }

    // Handle colors
    const colors = formData.getAll('color[]');
    for (const color_id of colors) {
      if (color_id) {
        await query(`INSERT INTO tbl_product_color (color_id, p_id) VALUES (?, ?)`, [color_id, p_id]);
      }
    }

    return NextResponse.json({ success: true, message: 'Product added successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    const formData = await request.formData();
    
    const p_name = formData.get('p_name');
    const p_old_price = formData.get('p_old_price');
    const p_current_price = formData.get('p_current_price');
    const p_qty = formData.get('p_qty');
    const p_description = formData.get('p_description');
    const p_short_description = formData.get('p_short_description');
    const p_feature = formData.get('p_feature');
    const p_condition = formData.get('p_condition');
    const p_return_policy = formData.get('p_return_policy');
    const p_is_featured = formData.get('p_is_featured');
    const p_is_active = formData.get('p_is_active');
    const ecat_id = formData.get('ecat_id');

    let updateFields = [];
    let values = [];

    if (p_name !== null) { updateFields.push('p_name = ?'); values.push(p_name); }
    if (p_old_price !== null) { updateFields.push('p_old_price = ?'); values.push(p_old_price); }
    if (p_current_price !== null) { updateFields.push('p_current_price = ?'); values.push(p_current_price); }
    if (p_qty !== null) { updateFields.push('p_qty = ?'); values.push(p_qty); }
    if (p_description !== null) { updateFields.push('p_description = ?'); values.push(p_description); }
    if (p_short_description !== null) { updateFields.push('p_short_description = ?'); values.push(p_short_description); }
    if (p_feature !== null) { updateFields.push('p_feature = ?'); values.push(p_feature); }
    if (p_condition !== null) { updateFields.push('p_condition = ?'); values.push(p_condition); }
    if (p_return_policy !== null) { updateFields.push('p_return_policy = ?'); values.push(p_return_policy); }
    if (p_is_featured !== null) { updateFields.push('p_is_featured = ?'); values.push(p_is_featured); }
    if (p_is_active !== null) { updateFields.push('p_is_active = ?'); values.push(p_is_active); }
    if (ecat_id !== null) { updateFields.push('ecat_id = ?'); values.push(ecat_id); }

    const photoFile = formData.get('p_featured_photo');
    if (photoFile && typeof photoFile === 'object') {
      const filename = await handleFileUpload(photoFile);
      if (filename) {
        updateFields.push('p_featured_photo = ?');
        values.push(filename);
      }
    }

    if (updateFields.length > 0) {
      values.push(id);
      const sql = `UPDATE tbl_product SET ${updateFields.join(', ')} WHERE p_id = ?`;
      await query(sql, values);
    }

    // Handle sizes if provided
    if (formData.has('size[]')) {
        await query(`DELETE FROM tbl_product_size WHERE p_id = ?`, [id]);
        const sizes = formData.getAll('size[]');
        for (const size_id of sizes) {
        if (size_id) {
            await query(`INSERT INTO tbl_product_size (size_id, p_id) VALUES (?, ?)`, [size_id, id]);
        }
        }
    }

    // Handle colors if provided
    if (formData.has('color[]')) {
        await query(`DELETE FROM tbl_product_color WHERE p_id = ?`, [id]);
        const colors = formData.getAll('color[]');
        for (const color_id of colors) {
        if (color_id) {
            await query(`INSERT INTO tbl_product_color (color_id, p_id) VALUES (?, ?)`, [color_id, id]);
        }
        }
    }

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
