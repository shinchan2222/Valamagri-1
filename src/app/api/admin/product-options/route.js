import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/admin/product-options
// Returns sizes, colors lists AND optionally a specific product's details
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  try {
    // Fetch all sizes
    const sizes = await query('SELECT * FROM tbl_size ORDER BY size_id ASC');
    // Fetch all colors
    const colors = await query('SELECT * FROM tbl_color ORDER BY color_id ASC');

    if (productId) {
      // Fetch specific product with all its data
      const products = await query('SELECT * FROM tbl_product WHERE p_id = ?', [productId]);
      if (!products || products.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const product = products[0];

      // Fetch assigned sizes
      const productSizes = await query('SELECT size_id FROM tbl_product_size WHERE p_id = ?', [productId]);
      // Fetch assigned colors
      const productColors = await query('SELECT color_id FROM tbl_product_color WHERE p_id = ?', [productId]);
      // Fetch extra photos
      const productPhotos = await query('SELECT * FROM tbl_product_photo WHERE p_id = ?', [productId]);

      return NextResponse.json({
        sizes,
        colors,
        product: {
          ...product,
          assigned_sizes: productSizes.map(r => r.size_id),
          assigned_colors: productColors.map(r => r.color_id),
          other_photos: productPhotos
        }
      });
    }

    return NextResponse.json({ sizes, colors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
