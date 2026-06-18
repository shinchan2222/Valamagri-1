import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await query('SELECT * FROM tbl_social');
    // Transform into an object keyed by social name for easy hydration
    const result = {};
    for (const row of data) {
      const key = row.social_name.toLowerCase().replace(' ', '');
      result[key] = row.social_url;
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    
    // The keys map exactly to the social_name if we format it correctly.
    // However, the database stores "Google Plus" but input is "googleplus".
    const mappings = {
      facebook: 'Facebook',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      googleplus: 'Google Plus',
      pinterest: 'Pinterest',
      youtube: 'YouTube',
      instagram: 'Instagram',
      tumblr: 'Tumblr',
      flickr: 'Flickr',
      reddit: 'Reddit',
      snapchat: 'Snapchat',
      whatsapp: 'WhatsApp',
      quora: 'Quora',
      stumbleupon: 'StumbleUpon',
      delicious: 'Delicious',
      digg: 'Digg'
    };

    for (const [key, value] of formData.entries()) {
      if (mappings[key]) {
        await query('UPDATE tbl_social SET social_url = ? WHERE social_name = ?', [value, mappings[key]]);
      }
    }

    return NextResponse.json({ success: true, message: 'Social media URLs updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
