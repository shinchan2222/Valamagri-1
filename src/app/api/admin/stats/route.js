import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // Graceful offline response
  if (!(await isDbAvailable())) {
    return NextResponse.json({
      products: 0,
      customers: 0,
      orders: 0,
      sales: 0,
      latest_payments: [],
      offline: true
    });
  }

  try {
    const productsCount  = await query('SELECT COUNT(*) as count FROM tbl_product');
    const customersCount = await query('SELECT COUNT(*) as count FROM tbl_customer');
    const ordersCount    = await query('SELECT COUNT(*) as count FROM tbl_payment');
    const salesSum       = await query('SELECT SUM(paid_amount) as total FROM tbl_payment WHERE payment_status = "Completed"');
    const latestPayments = await query('SELECT * FROM tbl_payment ORDER BY id DESC LIMIT 5');

    return NextResponse.json({
      products:        productsCount[0].count,
      customers:       customersCount[0].count,
      orders:          ordersCount[0].count,
      sales:           salesSum[0].total || 0,
      latest_payments: latestPayments
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
