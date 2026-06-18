import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      name, old_price, current_price, qty,
      description, short_description, feature,
      condition, return_policy,
      is_featured, is_active,
      ecat_id, featured_photo,
      sizes, colors
    } = data;

    if (!name || !current_price || !qty || !ecat_id) {
      return NextResponse.json({ error: 'Name, current price, quantity, and category are required' }, { status: 400 });
    }

    const photo = featured_photo || 'product-featured-1.jpg';

    const result = await query(
      `INSERT INTO tbl_product (
        p_name, p_old_price, p_current_price, p_qty, p_featured_photo,
        p_description, p_short_description, p_feature, p_condition, p_return_policy,
        p_total_view, p_is_featured, p_is_active, ecat_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        name,
        old_price || '',
        current_price,
        qty,
        photo,
        description || '',
        short_description || '',
        feature || '',
        condition || '',
        return_policy || '',
        is_featured != null ? parseInt(is_featured) : 0,
        is_active != null ? parseInt(is_active) : 1,
        ecat_id
      ]
    );

    const newId = result.insertId;

    // Insert sizes
    if (sizes && sizes.length > 0) {
      for (const sizeId of sizes) {
        await query('INSERT INTO tbl_product_size (size_id, p_id) VALUES (?, ?)', [sizeId, newId]);
      }
    }

    // Insert colors
    if (colors && colors.length > 0) {
      for (const colorId of colors) {
        await query('INSERT INTO tbl_product_color (color_id, p_id) VALUES (?, ?)', [colorId, newId]);
      }
    }

    return NextResponse.json({ success: true, p_id: newId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const {
      id, name, old_price, current_price, qty,
      description, short_description, feature,
      condition, return_policy,
      is_featured, is_active,
      ecat_id, featured_photo,
      sizes, colors
    } = data;

    if (!id || !name || !current_price || !qty || !ecat_id) {
      return NextResponse.json({ error: 'Product ID, name, current price, quantity, and category are required' }, { status: 400 });
    }

    const updates = [
      'p_name = ?',
      'p_old_price = ?',
      'p_current_price = ?',
      'p_qty = ?',
      'p_description = ?',
      'p_short_description = ?',
      'p_feature = ?',
      'p_condition = ?',
      'p_return_policy = ?',
      'p_is_featured = ?',
      'p_is_active = ?',
      'ecat_id = ?'
    ];
    const params = [
      name,
      old_price || '',
      current_price,
      qty,
      description || '',
      short_description || '',
      feature || '',
      condition || '',
      return_policy || '',
      is_featured != null ? parseInt(is_featured) : 0,
      is_active != null ? parseInt(is_active) : 1,
      ecat_id
    ];

    if (featured_photo) {
      updates.push('p_featured_photo = ?');
      params.push(featured_photo);
    }

    params.push(id);

    await query(
      `UPDATE tbl_product SET ${updates.join(', ')} WHERE p_id = ?`,
      params
    );

    // Replace sizes
    await query('DELETE FROM tbl_product_size WHERE p_id = ?', [id]);
    if (sizes && sizes.length > 0) {
      for (const sizeId of sizes) {
        await query('INSERT INTO tbl_product_size (size_id, p_id) VALUES (?, ?)', [sizeId, id]);
      }
    }

    // Replace colors
    await query('DELETE FROM tbl_product_color WHERE p_id = ?', [id]);
    if (colors && colors.length > 0) {
      for (const colorId of colors) {
        await query('INSERT INTO tbl_product_color (color_id, p_id) VALUES (?, ?)', [colorId, id]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    // Soft delete by deactivating
    await query('DELETE FROM tbl_product_size WHERE p_id = ?', [id]);
    await query('DELETE FROM tbl_product_color WHERE p_id = ?', [id]);
    await query('DELETE FROM tbl_product WHERE p_id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
