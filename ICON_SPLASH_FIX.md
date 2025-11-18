# Icon and Splash Screen Fix 🎨

## Issues Fixed

1. ✅ Added splash screen configuration
2. ✅ Updated adaptive icon with proper background color
3. ✅ Set icon to not be cut off

## What Changed in app.json

### Added Splash Screen
```json
"splash": {
  "image": "./assets/images/icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#00b86b"
}
```

### Updated Android Adaptive Icon
```json
"adaptiveIcon": {
  "foregroundImage": "./assets/images/icon.png",
  "backgroundColor": "#00b86b",
  "monochromeImage": "./assets/images/icon.png"
}
```

## Icon Requirements

### For Best Results, Your Icon Should:

**Size:** 1024x1024 pixels (minimum)  
**Format:** PNG with transparency  
**Safe Area:** Keep important content in the center 80% of the image  
**Padding:** Add 20% padding around your logo to prevent cutting

### Current Issue

If your icon is being cut off, it's because Android's adaptive icons use only the center portion. Here's how to fix it:

## Option 1: Add Padding to Your Icon (Recommended)

1. Open your icon in an image editor (Photoshop, Figma, etc.)
2. Make sure the canvas is 1024x1024
3. Scale your logo down to about 70-80% of the canvas
4. Center it
5. Save as `icon.png`
6. Replace `assets/images/icon.png`

## Option 2: Use a Tool to Generate Icons

### Using Expo's Icon Generator:

```bash
# Install the tool
npm install -g @expo/image-utils

# Generate properly sized icons
npx @expo/image-utils generate-icons --foreground ./assets/images/logo.png --background "#00b86b"
```

## Option 3: Manual Fix with ImageMagick

If you have ImageMagick installed:

```bash
# Add padding to your icon
convert assets/images/icon.png -gravity center -background transparent -extent 1024x1024 assets/images/icon-padded.png

# Then use the padded version
```

## Quick Fix: Use Your Logo

Since you have `logo.png`, let's use that with proper sizing:

1. **Copy your logo:**
   ```bash
   cp assets/images/logo.png assets/images/icon-new.png
   ```

2. **Update app.json to use it:**
   ```json
   "icon": "./assets/images/icon-new.png"
   ```

3. **Rebuild:**
   ```bash
   eas build --platform android --profile production
   ```

## Splash Screen Colors

The splash screen now uses:
- **Background:** Green (#00b86b) - your brand color
- **Image:** Your icon, centered
- **Resize Mode:** contain (won't cut off)

## After Fixing the Icon

### 1. Replace the icon file
```bash
# Backup old icon
mv assets/images/icon.png assets/images/icon-old.png

# Add your new properly-sized icon
# (with padding) as icon.png
```

### 2. Clear EAS cache and rebuild
```bash
eas build --platform android --profile production --clear-cache
```

### 3. Test the new APK
- Install on device/emulator
- Check app icon in launcher
- Check splash screen on startup

## Icon Checklist

Before rebuilding, make sure:

- [ ] Icon is 1024x1024 pixels
- [ ] Icon has transparent background
- [ ] Logo is centered with 20% padding
- [ ] Logo is clearly visible
- [ ] No text is cut off
- [ ] Looks good on both light and dark backgrounds

## Expected Result

After rebuilding with the fixed icon:

✅ **App Icon:** Your logo centered, not cut off  
✅ **Splash Screen:** Your logo on green background (not Expo logo)  
✅ **Adaptive Icon:** Works on all Android versions  
✅ **Consistent:** Same icon everywhere

## Common Mistakes to Avoid

❌ **Icon too large** - Gets cut off on Android  
❌ **No padding** - Logo touches edges  
❌ **Wrong size** - Blurry or pixelated  
❌ **No transparency** - White box around logo  

✅ **Proper padding** - Logo has breathing room  
✅ **Correct size** - Sharp and clear  
✅ **Transparent** - Looks good everywhere  

## Testing

After rebuilding, test on:

1. **Home Screen** - Icon looks good
2. **App Drawer** - Icon not cut off
3. **Startup** - Your splash screen (not Expo)
4. **Recent Apps** - Icon visible

## Need Help Creating the Icon?

### Online Tools:

1. **Figma** (free)
   - Create 1024x1024 canvas
   - Add your logo at 70% size
   - Center it
   - Export as PNG

2. **Canva** (free)
   - Use "App Icon" template
   - Upload your logo
   - Resize to fit with padding
   - Download

3. **App Icon Generator**
   - https://www.appicon.co
   - Upload your logo
   - It adds proper padding
   - Download the result

## Quick Command Summary

```bash
# 1. Fix your icon (add padding, make it 1024x1024)

# 2. Replace the file
cp /path/to/new-icon.png assets/images/icon.png

# 3. Rebuild
eas build --platform android --profile production --clear-cache

# 4. Download and test
eas build:download --platform android --profile production
```

## Result

Your app will now have:
- ✅ Proper icon that's not cut off
- ✅ Your splash screen (not Expo's)
- ✅ Consistent branding throughout
- ✅ Professional appearance

The key is making sure your icon has enough padding so Android's adaptive icon system doesn't cut it off!
