import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

// ─── Env-based fallback admin credentials ──────────────────────────────────
// Set these in .env.local so the admin can log in even when DB is offline.
const FALLBACK_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@mail.com';
const FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || 'Password@123';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const dbOnline = await isDbAvailable();

    // ── FALLBACK: DB is offline — check env-based admin credentials ──────────
    if (!dbOnline) {
      if (
        email.trim().toLowerCase() === FALLBACK_EMAIL.toLowerCase() &&
        password === FALLBACK_PASSWORD
      ) {
        return NextResponse.json({
          cust_id:     0,
          cust_name:   'Administrator',
          cust_email:  FALLBACK_EMAIL,
          cust_phone:  '',
          cust_status: 1,
          role:        'Super Admin',
          offline_mode: true,
        });
      }
      return NextResponse.json(
        { error: 'Database is currently offline. Only the default admin account can log in.' },
        { status: 503 }
      );
    }

    // ── ONLINE: check tbl_user (Admin) only ─────────────────────────────────
    const adminUsers = await query('SELECT * FROM tbl_user WHERE email = ?', [email]);
    if (adminUsers.length > 0) {
      const adminUser = adminUsers[0];

      let isPasswordCorrect = false;
      if (
        adminUser.password.startsWith('$2a$') ||
        adminUser.password.startsWith('$2b$') ||
        adminUser.password.startsWith('$2y$')
      ) {
        let hash = adminUser.password;
        if (hash.startsWith('$2y$')) hash = '$2a$' + hash.substring(4);
        isPasswordCorrect = await bcrypt.compare(password, hash);
      } else if (adminUser.password === md5(password)) {
        // Upgrade plain MD5 to bcrypt on first login
        isPasswordCorrect = true;
        const newHash = await bcrypt.hash(password, 10);
        await query('UPDATE tbl_user SET password = ? WHERE id = ?', [newHash, adminUser.id]);
      }

      if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      if (adminUser.status !== 'Active') {
        return NextResponse.json({ error: 'Your account is inactive.' }, { status: 403 });
      }

      return NextResponse.json({
        cust_id:     adminUser.id,
        cust_name:   adminUser.full_name,
        cust_email:  adminUser.email,
        cust_phone:  adminUser.phone,
        cust_status: 1,
        role:        adminUser.role,
      });
    }

    // Not an admin
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
