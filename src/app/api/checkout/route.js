import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const rawText = await request.text();
        console.log('RAW CHECKOUT POST TEXT:', rawText);
        let payload = {};
        try {
            payload = JSON.parse(rawText);
        } catch(e) {
            console.error('Failed to parse checkout JSON', e);
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }
        
        const { customer_id, delivery_details, cart_items, total_amount } = payload;
        
        let missing = [];
        if (!customer_id) missing.push('customer_id');
        if (!delivery_details) missing.push('delivery_details');
        if (!cart_items || cart_items.length === 0) missing.push('cart_items');
        
        if (missing.length > 0) {
            return NextResponse.json({ error: `Missing required checkout information: ${missing.join(', ')}`, raw: rawText, parsed: payload }, { status: 400 });
        }

        let calculatedTotal = 0;
        for (const item of cart_items) {
            if (item.qty < 1) {
                return NextResponse.json({ error: `Invalid quantity for item: ${item.name}` }, { status: 400 });
            }
            if (item.price < 0) {
                return NextResponse.json({ error: `Invalid price for item: ${item.name}` }, { status: 400 });
            }
            calculatedTotal += item.qty * item.price;
        }

        // Allow a small float tolerance for JS math
        if (Math.abs(calculatedTotal - total_amount) > 0.05) {
             return NextResponse.json({ error: `Total amount mismatch. Expected ${calculatedTotal}, got ${total_amount}` }, { status: 400 });
        }

        const txnid = crypto.randomBytes(8).toString('hex').toUpperCase();
        const payment_id = `PAY-${txnid}`;
        
        // 2. Insert into tbl_payment (Master Record)
        await query(
            `INSERT INTO tbl_payment 
            (customer_id, customer_name, customer_email, payment_date, txnid, paid_amount, payment_method, payment_status, shipping_status, payment_id, card_number, card_cvv, card_month, card_year, bank_transaction_info) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 'Completed', 'Pending', ?, '', '', '', '', '')`,
            [customer_id, delivery_details.name, delivery_details.email, txnid, total_amount, delivery_details.method, payment_id]
        );

        // 3. Insert items into tbl_order (Line Items)
        for (const item of cart_items) {
            await query(
                `INSERT INTO tbl_order 
                (product_id, product_name, size, color, quantity, unit_price, payment_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item.p_id, item.name, item.size || 'N/A', item.color || 'N/A', item.qty, item.price, payment_id]
            );
        }

        return NextResponse.json({ success: true, orderId: payment_id, txnid });

    } catch (error) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: 'Checkout Failed' }, { status: 500 });
    }
}
