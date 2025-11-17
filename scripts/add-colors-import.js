#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/(tabs)/_layout.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/post.tsx',
  'app/(tabs)/messages.tsx',
  'app/settings.tsx',
  'app/favorites.tsx',
  'app/help-center.tsx',
  'app/edit-profile.tsx',
  'app/index.tsx',
  'app/listing/[id].tsx',
  'app/user/[id].tsx',
  'app/edit-listing/[id].tsx',
  'app/chat/index.tsx',
  'app/chat/[id].tsx',
  'components/ListingCard.tsx',
  'components/CreditCard.tsx',
  'components/Popup.tsx',
  'services/notificationService.ts',
];

const importStatement = "import Colors from '@/constants/Colors';";

filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if import already exists
    if (content.includes(importStatement)) {
      console.log(`✓ Already has import: ${filePath}`);
      return;
    }
    
    // Check if file uses Colors.primary
    if (!content.includes('Colors.primary')) {
      console.log(`⊘ Doesn't use Colors: ${filePath}`);
      return;
    }
    
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      } else if (lastImportIndex !== -1 && lines[i].trim() !== '') {
        break;
      }
    }
    
    if (lastImportIndex !== -1) {
      // Insert after the last import
      lines.splice(lastImportIndex + 1, 0, importStatement);
      content = lines.join('\n');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Added import to: ${filePath}`);
    } else {
      console.log(`⚠️  Could not find import section: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ Done!');
