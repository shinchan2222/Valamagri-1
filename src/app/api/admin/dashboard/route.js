import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [products] = await query('SELECT count(*) as count FROM tbl_product');
    const [topCat] = await query('SELECT count(*) as count FROM tbl_top_category');
    const [midCat] = await query('SELECT count(*) as count FROM tbl_mid_category');
    const [endCat] = await query('SELECT count(*) as count FROM tbl_end_category');
    const [customers] = await query("SELECT count(*) as count FROM tbl_customer WHERE cust_status='1'");
    const [subscribers] = await query("SELECT count(*) as count FROM tbl_subscriber WHERE subs_active='1'");
    const [shipping] = await query("SELECT count(*) as count FROM tbl_shipping_cost");
    
    // Legacy orders are in tbl_payment
    const [ordersCompleted] = await query("SELECT count(*) as count FROM tbl_payment WHERE payment_status='Completed'");
    const [shippingCompleted] = await query("SELECT count(*) as count FROM tbl_payment WHERE shipping_status='Completed'");
    const [ordersPending] = await query("SELECT count(*) as count FROM tbl_payment WHERE payment_status='Pending'");
    const [shippingPending] = await query("SELECT count(*) as count FROM tbl_payment WHERE payment_status='Completed' AND shipping_status='Pending'");

    return NextResponse.json({
      success: true,
      stats: {
        products: products.count,
        topCat: topCat.count,
        midCat: midCat.count,
        endCat: endCat.count,
        customers: customers.count,
        subscribers: subscribers.count,
        shipping: shipping.count,
        ordersCompleted: ordersCompleted.count,
        shippingCompleted: shippingCompleted.count,
        ordersPending: ordersPending.count,
        shippingPending: shippingPending.count
      }
    });

  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
