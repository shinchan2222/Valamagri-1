import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customer_id = searchParams.get('customer_id');

  if (!customer_id) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const orders = await query(`SELECT * FROM tbl_payment WHERE customer_id = ? ORDER BY id DESC`, [customer_id]);
    
    // Fetch products for each order
    for (let i = 0; i < orders.length; i++) {
      const products = await query(`SELECT * FROM tbl_order WHERE payment_id = ?`, [orders[i].payment_id]);
      orders[i].products = products;
    }

    return NextResponse.json({ data: orders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
