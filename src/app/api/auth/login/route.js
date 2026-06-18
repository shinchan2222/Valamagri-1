import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const dbOnline = await isDbAvailable();

    if (!dbOnline) {
       return NextResponse.json(
        { error: 'Database is currently offline. User login is disabled.' },
        { status: 503 }
      );
    }

    // Main web login only checks tbl_customer

    // ── ONLINE: fall through to tbl_customer ─────────────────────────────────
    const users = await query('SELECT * FROM tbl_customer WHERE cust_email = ?', [email]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    let isPasswordCorrect = false;
    if (
      user.cust_password.startsWith('$2a$') ||
      user.cust_password.startsWith('$2b$') ||
      user.cust_password.startsWith('$2y$')
    ) {
      let hash = user.cust_password;
      if (hash.startsWith('$2y$')) hash = '$2a$' + hash.substring(4);
      isPasswordCorrect = await bcrypt.compare(password, hash);
    } else if (user.cust_password === md5(password)) {
      // Upgrade plain MD5 to bcrypt on first login
      isPasswordCorrect = true;
      const newHash = await bcrypt.hash(password, 10);
      await query('UPDATE tbl_customer SET cust_password = ? WHERE cust_id = ?', [newHash, user.cust_id]);
    }

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    if (user.cust_status === 0) {
      return NextResponse.json({ error: 'Your account is inactive.' }, { status: 403 });
    }

    // Record last login and IP address
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.socket?.remoteAddress || '127.0.0.1';
    await query('UPDATE tbl_customer SET last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE cust_id = ?', [ip, user.cust_id]);

    const { cust_password, cust_token, ...userData } = user;
    return NextResponse.json(userData);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
