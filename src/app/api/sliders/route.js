import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sliders = await query('SELECT * FROM tbl_slider');
    return NextResponse.json(sliders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
