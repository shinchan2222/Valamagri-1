import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  try {
    if (view === 'customer_detail') {
      const cust_id = searchParams.get('id');
      if (!cust_id) return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });
      
      const customerRes = await query(`SELECT t1.*, t2.country_name FROM tbl_customer t1 LEFT JOIN tbl_country t2 ON t1.cust_country = t2.country_id WHERE t1.cust_id = ?`, [cust_id]);
      if (customerRes.length === 0) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
      
      const customer = customerRes[0];
      const orders = await query(`SELECT * FROM tbl_payment WHERE customer_id = ? ORDER BY id DESC`, [cust_id]);
      
      return NextResponse.json({ success: true, data: { customer, orders } });
    }

    if (view === 'product_detail') {
      const p_id = searchParams.get('id');
      if (!p_id) return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 });
      
      const productRes = await query(`SELECT p.*, e.mcat_id, m.tcat_id FROM tbl_product p JOIN tbl_end_category e ON p.ecat_id = e.ecat_id JOIN tbl_mid_category m ON e.mcat_id = m.mcat_id WHERE p.p_id = ?`, [p_id]);
      if (productRes.length === 0) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      
      const product = productRes[0];
      const sizes = await query(`SELECT size_id FROM tbl_product_size WHERE p_id = ?`, [p_id]);
      const colors = await query(`SELECT color_id FROM tbl_product_color WHERE p_id = ?`, [p_id]);
      const photos = await query(`SELECT photo FROM tbl_product_photo WHERE p_id = ?`, [p_id]);
      
      product.size_ids = sizes.map(s => s.size_id);
      product.color_ids = colors.map(c => c.color_id);
      product.photos = photos.map(p => p.photo);
      
      return NextResponse.json({ success: true, data: product });
    }

    let sql = '';
    let params = [];

    switch (view) {
      case 'order':
        sql = `SELECT p.*, c.cust_s_address as customer_address, c.cust_s_city as customer_city, c.cust_s_state as customer_state, c.cust_s_zip as customer_zip, c.cust_phone as customer_phone FROM tbl_payment p LEFT JOIN tbl_customer c ON p.customer_id = c.cust_id ORDER BY p.id DESC`;
        break;
      case 'top-category':
        sql = `SELECT * FROM tbl_top_category ORDER BY tcat_id DESC`;
        break;
      case 'mid-category':
        sql = `SELECT m.*, t.tcat_name FROM tbl_mid_category m JOIN tbl_top_category t ON m.tcat_id = t.tcat_id ORDER BY m.mcat_id DESC`;
        break;
      case 'end-category':
        sql = `SELECT e.*, m.mcat_name, t.tcat_name FROM tbl_end_category e JOIN tbl_mid_category m ON e.mcat_id = m.mcat_id JOIN tbl_top_category t ON m.tcat_id = t.tcat_id ORDER BY e.ecat_id DESC`;
        break;
      case 'size':
        sql = `SELECT * FROM tbl_size ORDER BY size_id DESC`;
        break;
      case 'color':
        sql = `SELECT * FROM tbl_color ORDER BY color_id DESC`;
        break;
      case 'country':
        sql = `SELECT * FROM tbl_country ORDER BY country_id DESC`;
        break;
      case 'shipping-cost':
        sql = `SELECT s.*, c.country_name FROM tbl_shipping_cost s JOIN tbl_country c ON s.country_id = c.country_id ORDER BY s.shipping_cost_id DESC`;
        break;
      case 'slider':
        sql = `SELECT * FROM tbl_slider ORDER BY id DESC`;
        break;
      case 'service':
        sql = `SELECT * FROM tbl_service ORDER BY id DESC`;
        break;
      case 'faq':
        sql = `SELECT * FROM tbl_faq ORDER BY faq_id DESC`;
        break;
      case 'page':
        sql = `SELECT * FROM tbl_page WHERE id=1`;
        break;
      case 'social-media':
        sql = `SELECT * FROM tbl_social`;
        break;
      case 'customer':
        sql = `SELECT t1.*, t2.country_name FROM tbl_customer t1 LEFT JOIN tbl_country t2 ON t1.cust_country = t2.country_id ORDER BY t1.cust_id DESC`;
        break;
      case 'subscriber':
        sql = `SELECT * FROM tbl_subscriber`;
        break;
      case 'settings':
        sql = `SELECT * FROM tbl_settings WHERE id=1`;
        break;
      default:
        return NextResponse.json({ success: false, error: 'Unknown view' }, { status: 400 });
    }

    const rows = await query(sql, params);

    // If order view, fetch products for each payment
    if (view === 'order') {
      for (let i = 0; i < rows.length; i++) {
        const products = await query(`SELECT * FROM tbl_order WHERE payment_id=?`, [rows[i].payment_id]);
        rows[i].products = products;
      }
    }

    return NextResponse.json({ success: true, data: rows });

  } catch (err) {
    console.error(`Error fetching data for ${view}:`, err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
