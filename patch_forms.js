const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'public', 'admin', 'views');

const tableMap = {
  'size': 'tbl_size',
  'color': 'tbl_color',
  'country': 'tbl_country',
  'shipping-cost': 'tbl_shipping_cost',
  'top-category': 'tbl_top_category',
  'mid-category': 'tbl_mid_category',
  'end-category': 'tbl_end_category',
  'slider': 'tbl_slider',
  'service': 'tbl_service',
  'faq': 'tbl_faq',
  'page': 'tbl_page',
  'social-media': 'tbl_social',
  'subscriber': 'tbl_subscriber',
  'product': 'tbl_product',
  'customer': 'tbl_customer',
  'settings': 'tbl_settings'
};

function processFile(file) {
  const filepath = path.join(viewsDir, file);
  if (!fs.statSync(filepath).isFile() || !file.endsWith('.html')) return;

  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  // Determine base entity from filename (e.g. size-add.html -> size)
  let entity = file.replace('.html', '').replace('-add', '').replace('-edit', '');
  // Special cases if any
  if (entity === 'shipping-cost-edit') entity = 'shipping-cost'; // just in case
  
  const tableName = tableMap[entity];

  if (!tableName) return;

  // Replace <form action="..." method="post"> with <form class="form-horizontal admin-form" data-table="tbl_XYZ">
  // We use regex to match <form ... >
  content = content.replace(/<form\b[^>]*>/g, (match) => {
    // If it already has admin-form, skip
    if (match.includes('admin-form')) return match;

    // Preserve enctype if it exists
    const hasEnctype = match.includes('enctype');
    const enctypeAttr = hasEnctype ? ' enctype="multipart/form-data"' : '';

    return `<form class="form-horizontal admin-form" data-table="${tableName}"${enctypeAttr}>`;
  });

  // Replace submit buttons to prevent default if needed, or just let global listener catch it.
  // The global listener will do `e.preventDefault()`, so regular submit buttons are fine.

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content);
    console.log(`Patched forms in ${file} -> mapped to ${tableName}`);
  }
}

fs.readdirSync(viewsDir).forEach(processFile);
console.log('Done patching forms!');
