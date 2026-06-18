import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await query('SELECT * FROM tbl_settings WHERE id = 1');
    if (settings.length === 0) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    return NextResponse.json(settings[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // We update all settings in tbl_settings with id = 1
    const allowedFields = [
      'logo',
      'favicon',
      'footer_about',
      'footer_copyright',
      'contact_address',
      'contact_email',
      'contact_phone',
      'contact_fax',
      'contact_map_iframe',
      'receive_email',
      'receive_email_subject',
      'receive_email_thank_you_message',
      'forget_password_message',
      'total_recent_post_footer',
      'total_popular_post_footer',
      'total_recent_post_sidebar',
      'total_popular_post_sidebar',
      'total_featured_product_home',
      'total_latest_product_home',
      'total_popular_product_home',
      'meta_title_home',
      'meta_keyword_home',
      'meta_description_home',
      'banner_login',
      'banner_registration',
      'banner_forget_password',
      'banner_reset_password',
      'banner_search',
      'banner_cart',
      'banner_checkout',
      'banner_product_category',
      'banner_blog',
      'cta_title',
      'cta_content',
      'cta_read_more_text',
      'cta_read_more_url',
      'cta_photo',
      'featured_product_title',
      'featured_product_subtitle',
      'latest_product_title',
      'latest_product_subtitle',
      'popular_product_title',
      'popular_product_subtitle',
      'testimonial_title',
      'testimonial_subtitle',
      'testimonial_photo',
      'blog_title',
      'blog_subtitle',
      'newsletter_text',
      'paypal_email',
      'stripe_public_key',
      'stripe_secret_key',
      'bank_detail',
      'before_head',
      'after_body',
      'before_body',
      'home_service_on_off',
      'home_welcome_on_off',
      'home_featured_product_on_off',
      'home_latest_product_on_off',
      'home_popular_product_on_off',
      'home_testimonial_on_off',
      'home_blog_on_off',
      'newsletter_on_off',
      'ads_above_welcome_on_off',
      'ads_above_featured_product_on_off',
      'ads_above_latest_product_on_off',
      'ads_above_popular_product_on_off',
      'ads_above_testimonial_on_off',
      'ads_category_sidebar_on_off'
    ];

    const updates = [];
    const values = [];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(1); // For the WHERE id = 1 clause

    const sql = `UPDATE tbl_settings SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
