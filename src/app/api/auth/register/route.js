import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, phone, country, address, city, state, zip, password } = data;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Name, email, phone, and password are required' }, { status: 400 });
    }

    const existing = await query('SELECT * FROM tbl_customer WHERE cust_email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString('hex');
    const hash = await bcrypt.hash(password, 10);
    const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const timestamp = Math.floor(Date.now() / 1000);

    const result = await query(
      `INSERT INTO tbl_customer (
        cust_name, cust_cname, cust_email, cust_phone, cust_country,
        cust_address, cust_city, cust_state, cust_zip,
        cust_b_name, cust_b_cname, cust_b_phone, cust_b_country, cust_b_address, cust_b_city, cust_b_state, cust_b_zip,
        cust_s_name, cust_s_cname, cust_s_phone, cust_s_country, cust_s_address, cust_s_city, cust_s_state, cust_s_zip,
        cust_password, cust_token, cust_datetime, cust_timestamp, cust_status
      ) VALUES (?, '', ?, ?, ?, ?, ?, ?, ?, '', '', '', 0, '', '', '', '', '', '', '', 0, '', '', '', '', ?, ?, ?, ?, 1)`,
      [
        name,
        email,
        phone,
        country || 0,
        address || '',
        city || '',
        state || '',
        zip || '',
        hash,
        token,
        datetime,
        timestamp
      ]
    );

    const newUsers = await query('SELECT * FROM tbl_customer WHERE cust_id = ?', [result.insertId]);
    const { cust_password, cust_token, ...userData } = newUsers[0];

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
