const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function fix() {
  const db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    INSERT INTO tbl_settings (
      id, logo, favicon, footer_about, footer_copyright, contact_address, contact_email, contact_phone, contact_map_iframe, receive_email, receive_email_subject, receive_email_thank_you_message, forget_password_message, total_recent_post_footer, total_popular_post_footer, total_recent_post_sidebar, total_popular_post_sidebar, total_featured_product_home, total_latest_product_home, total_popular_product_home, meta_title_home, meta_keyword_home, meta_description_home, banner_login, banner_registration, banner_forget_password, banner_reset_password, banner_search, banner_cart, banner_checkout, banner_product_category, banner_blog, cta_title, cta_content, cta_read_more_text, cta_read_more_url, cta_photo, featured_product_title, featured_product_subtitle, latest_product_title, latest_product_subtitle, popular_product_title, popular_product_subtitle, testimonial_title, testimonial_subtitle, testimonial_photo, blog_title, blog_subtitle, newsletter_text, paypal_email, stripe_public_key, stripe_secret_key, bank_detail, before_head, after_body, before_body, home_service_on_off, home_welcome_on_off, home_featured_product_on_off, home_latest_product_on_off, home_popular_product_on_off, home_testimonial_on_off, home_blog_on_off, newsletter_on_off, ads_above_welcome_on_off, ads_above_featured_product_on_off, ads_above_latest_product_on_off, ads_above_popular_product_on_off, ads_above_testimonial_on_off, ads_category_sidebar_on_off, contact_fax
    ) VALUES (
      1, 'logo.png', 'favicon.png', 'Footer about text', 'Copyright 2024', '123 Main St', 'support@ecommerce.com', '1234567890', '', 'support@ecommerce.com', 'Contact', 'Thanks', 'Forget password', 4, 4, 5, 5, 5, 6, 8, 'Home', 'keyword', 'description', 'banner_login.jpg', 'banner_registration.jpg', 'banner_forget_password.jpg', 'banner_reset_password.jpg', 'banner_search.jpg', 'banner_cart.jpg', 'banner_checkout.jpg', 'banner_product_category.jpg', 'banner_blog.jpg', 'CTA Title', 'CTA Content', 'Read More', '#', 'cta.jpg', 'Featured', 'Subtitle', 'Latest', 'Subtitle', 'Popular', 'Subtitle', 'Testimonials', 'Subtitle', 'testimonial.jpg', 'Blog', 'Subtitle', 'Newsletter', 'paypal@test.com', 'pk_test', 'sk_test', 'Bank details', '', '', '', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ''
    );
  `);
  console.log('Fixed tbl_settings!');
}

fix().catch(console.error);
