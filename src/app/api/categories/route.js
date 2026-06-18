import { query, isDbAvailable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // Graceful offline response
  if (!(await isDbAvailable())) {
    return NextResponse.json([]);
  }

  try {
    const topCats = await query('SELECT * FROM tbl_top_category WHERE show_on_menu = 1');
    const midCats = await query('SELECT * FROM tbl_mid_category');
    const endCats = await query('SELECT * FROM tbl_end_category');

    const categories = topCats.map(top => {
      const mids = midCats
        .filter(mid => mid.tcat_id === top.tcat_id)
        .map(mid => {
          const ends = endCats.filter(end => end.mcat_id === mid.mcat_id);
          return {
            mcat_id: mid.mcat_id,
            mcat_name: mid.mcat_name,
            end_categories: ends.map(e => ({ ecat_id: e.ecat_id, ecat_name: e.ecat_name }))
          };
        });
      return {
        tcat_id: top.tcat_id,
        tcat_name: top.tcat_name,
        mid_categories: mids
      };
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
