import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const tcat = searchParams.get('tcat');
  const mcat = searchParams.get('mcat');
  const ecat = searchParams.get('ecat');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  // Graceful offline response
  if (!(await isDbAvailable())) {
    if (id) return NextResponse.json({ error: 'Database offline' }, { status: 503 });
    return NextResponse.json([]);
  }

  try {
    if (id) {
      const products = await query('SELECT * FROM tbl_product WHERE p_id = ? AND p_is_active = 1', [id]);
      if (products.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const product = products[0];

      const photos = await query('SELECT * FROM tbl_product_photo WHERE p_id = ?', [id]);
      product.photos = photos.map(p => p.photo);

      const ratings = await query('SELECT r.*, c.cust_name FROM tbl_rating r JOIN tbl_customer c ON r.cust_id = c.cust_id WHERE r.p_id = ?', [id]);
      product.ratings = ratings;
      product.avg_rating = ratings.length > 0
        ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
        : 0;

      return NextResponse.json(product);
    }

    let sql = `SELECT p.*, e.ecat_name, m.mcat_name, t.tcat_name
               FROM tbl_product p
               JOIN tbl_end_category e ON p.ecat_id = e.ecat_id
               JOIN tbl_mid_category m ON e.mcat_id = m.mcat_id
               JOIN tbl_top_category t ON m.tcat_id = t.tcat_id
               WHERE p.p_is_active = 1`;
    const params = [];

    if (tcat)    { sql += ' AND t.tcat_id = ?'; params.push(tcat); }
    if (mcat)    { sql += ' AND m.mcat_id = ?'; params.push(mcat); }
    if (ecat)    { sql += ' AND p.ecat_id = ?'; params.push(ecat); }
    if (featured === '1') { sql += ' AND p.p_is_featured = 1'; }
    if (search) {
      sql += ' AND (p.p_name LIKE ? OR p.p_description LIKE ? OR p.p_short_description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    sql += ' ORDER BY p.p_id DESC';

    const products = await query(sql, params);

    for (let p of products) {
      const ratings = await query('SELECT rating FROM tbl_rating WHERE p_id = ?', [p.p_id]);
      p.avg_rating = ratings.length > 0
        ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
        : 0;
    }

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
