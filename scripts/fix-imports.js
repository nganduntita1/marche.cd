#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/post.tsx',
  'app/(tabs)/messages.tsx',
  'app/(tabs)/_layout.tsx',
  'app/index.tsx',
  'app/favorites.tsx',
  'app/help-center.tsx',
  'app/edit-profile.tsx',
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

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if import is in wrong place (inside another import)
    const wrongPattern = /import \{[\s\n]*import Colors from '@\/constants\/Colors';/;
    
    if (wrongPattern.test(content)) {
      // Remove the wrongly placed import
      content = content.replace(/[\s\n]*import Colors from '@\/constants\/Colors';[\s\n]*/, '\n');
      
      // Find the end of all imports and add it there
      const lines = content.split('\n');
      let lastImportIndex = -1;
      let inMultilineImport = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('import ')) {
          lastImportIndex = i;
          if (line.includes('{') && !line.includes('}')) {
            inMultilineImport = true;
          }
        } else if (inMultilineImport && line.includes('}')) {
          lastImportIndex = i;
          inMultilineImport = false;
        } else if (inMultilineImport) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
        content = lines.join('\n');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
      }
    } else if (!content.includes(importStatement) && content.includes('Colors.primary')) {
      // Import doesn't exist but should
      const lines = content.split('\n');
      let lastImportIndex = -1;
      let inMultilineImport = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('import ')) {
          lastImportIndex = i;
          if (line.includes('{') && !line.includes('}')) {
            inMultilineImport = true;
          }
        } else if (inMultilineImport && line.includes('}')) {
          lastImportIndex = i;
          inMultilineImport = false;
        } else if (inMultilineImport) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
        content = lines.join('\n');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Added import to: ${filePath}`);
      }
    } else {
      console.log(`✓ OK: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ Done!');
