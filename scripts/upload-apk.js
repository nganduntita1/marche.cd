const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadAPK() {
  const apkPath = path.join(__dirname, '..', 'marche-cd.apk');
  
  if (!fs.existsSync(apkPath)) {
    console.error('❌ APK file not found at:', apkPath);
    console.log('Please place marche-cd.apk in the project root directory');
    process.exit(1);
  }

  console.log('📦 Reading APK file...');
  const fileBuffer = fs.readFileSync(apkPath);
  
  console.log('☁️  Uploading to Supabase Storage...');
  const { data, error } = await supabase.storage
    .from('app-downloads')
    .upload('marche-cd.apk', fileBuffer, {
      contentType: 'application/vnd.android.package-archive',
      upsert: true // This will replace if it already exists
    });

  if (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('app-downloads')
    .getPublicUrl('marche-cd.apk');

  console.log('\n✅ Upload successful!');
  console.log('\n📱 Public download URL:');
  console.log(urlData.publicUrl);
  console.log('\nUse this URL in your landing page and anywhere else you need the download link.');
}

uploadAPK();
