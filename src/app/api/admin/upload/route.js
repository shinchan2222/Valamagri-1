import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Sanitize the filename to keep safe alphanumeric characters, dots, and hyphens
    const originalName = file.name || 'upload.png';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Resolve upload directories
    const nextUploadDir = path.resolve('public/assets/uploads');
    const legacyUploadDir = path.resolve('../assets/uploads');
    
    // Ensure both directories exist
    if (!fs.existsSync(nextUploadDir)) {
      fs.mkdirSync(nextUploadDir, { recursive: true });
    }
    if (!fs.existsSync(legacyUploadDir)) {
      fs.mkdirSync(legacyUploadDir, { recursive: true });
    }
    
    const nextFilePath = path.join(nextUploadDir, sanitizedName);
    const legacyFilePath = path.join(legacyUploadDir, sanitizedName);
    
    fs.writeFileSync(nextFilePath, buffer);
    fs.writeFileSync(legacyFilePath, buffer);
    
    return NextResponse.json({ success: true, filename: sanitizedName });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
