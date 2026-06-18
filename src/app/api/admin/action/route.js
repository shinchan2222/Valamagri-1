import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const task = searchParams.get('task');

  try {
    if (action === 'customer-change-status') {
      const customer = await query('SELECT cust_status FROM tbl_customer WHERE cust_id = ?', [id]);
      if (customer.length) {
        const newStatus = customer[0].cust_status === 1 ? 0 : 1;
        await query('UPDATE tbl_customer SET cust_status = ? WHERE cust_id = ?', [newStatus, id]);
        return NextResponse.json({ success: true });
      }
    } else if (action === 'order-change-status') {
      await query('UPDATE tbl_payment SET payment_status = ? WHERE id = ?', [task, id]);
      return NextResponse.json({ success: true });
    } else if (action === 'shipping-change-status') {
      await query('UPDATE tbl_payment SET shipping_status = ? WHERE id = ?', [task, id]);
      return NextResponse.json({ success: true });
    } else if (action === 'subscriber-remove') {
      await query('DELETE FROM tbl_subscriber WHERE subs_active = 0');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
