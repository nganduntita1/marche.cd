# APK Download Ready! 🎉

## ✅ Landing Page Updated

Your Android APK now uses a permanent GitHub release link that stays the same for every new version.

### Download URL
```
https://github.com/nganduntita1/marche.cd/releases/download/android-latest/marche-cd.apk
```

### Location
**File:** `app/landing.tsx`  
**Function:** `handleDownloadAPK()`

```typescript
const handleDownloadAPK = () => {
   const apkUrl = 'https://github.com/nganduntita1/marche.cd/releases/download/android-latest/marche-cd.apk';
  Linking.openURL(apkUrl);
};
```

## How It Works

### On the Landing Page (`/landing`)

1. **User clicks "Télécharger pour Android"**
2. **Browser opens the download URL**
3. **APK file downloads automatically**
4. **User can install on their Android device**

### Button Location

The download button is in the hero section:
```
┌─────────────────────────────────┐
│        Marché.cd [Vérifié]      │
│   Achetez et vendez tout,       │
│   partout au Congo              │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 🤖 Télécharger pour      │  │
│  │    Android               │  │ ← This button
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 🍎 Bientôt disponible    │  │
│  │    iOS                   │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## Testing the Download

### Test on Web
1. Start dev server: `npm run dev`
2. Open: `http://localhost:8081/landing`
3. Click "Télécharger pour Android"
4. Should open the GitHub release download URL

### Test on Mobile
1. Open the landing page on your phone
2. Click the Android download button
3. APK should start downloading
4. Install and test!

## APK Details

### File Information
- **Hosted by:** Expo EAS
- **Format:** APK (Android Package)
- **Direct Install:** Yes
- **Requires:** Android 5.0+ (API 21+)

### Installation Steps for Users

1. **Download the APK**
   - Click the download button on landing page
   - Or visit the URL directly

2. **Enable Unknown Sources**
   - Settings → Security
   - Enable "Install unknown apps" for your browser

3. **Install**
   - Open the downloaded APK file
   - Tap "Install"
   - Wait for installation to complete

4. **Open App**
   - Find "Marché.cd" in your app drawer
   - Open and enjoy!

## Sharing the Link

### Direct APK Link
```
https://expo.dev/artifacts/eas/3rDWMU1yWyXnjiL4YaFwxH.apk
```

### Landing Page
```
https://marchecd.tech/landing
```

### Share via:
- WhatsApp
- Facebook
- Email
- SMS
- QR Code

## QR Code for Download

You can generate a QR code for easy sharing:

**URL to encode:**
```
https://expo.dev/artifacts/eas/3rDWMU1yWyXnjiL4YaFwxH.apk
```

**Tools:**
- https://qr-code-generator.com
- https://www.qr-code-generator.com
- Or use any QR code generator

## Important Notes

### ⚠️ Expo Artifact Links

**Note:** Expo artifact links are temporary and expire after some time.

**For Production:**
1. Download the APK from Expo
2. Host it permanently on:
   - GitHub Releases
   - Your own server
   - Cloud storage (S3, Google Cloud, etc.)
   - Vercel/Netlify public folder

### Permanent Hosting Options

#### Option 1: GitHub Releases
```bash
# Download APK from Expo
eas build:download --platform android --profile production

# Create GitHub release
gh release create v1.0.0 marche-cd.apk

# Get permanent URL
# https://github.com/username/repo/releases/download/v1.0.0/marche-cd.apk
```

#### Option 2: Vercel Public Folder
```bash
# Create public folder
mkdir -p public/downloads

# Copy APK
cp marche-cd.apk public/downloads/

# Deploy
vercel --prod

# URL: https://your-domain.vercel.app/downloads/marche-cd.apk
```

#### Option 3: Cloud Storage
- AWS S3 with public access
- Google Cloud Storage
- Cloudflare R2
- DigitalOcean Spaces

## Updating the APK

When you build a new version:

1. **Build new APK**
   ```bash
   eas build --platform android --profile production
   ```

2. **Get new download URL**
   - Check your email from Expo
   - Or visit https://expo.dev

3. **Update landing page**
   ```typescript
   const apkUrl = 'NEW_URL_HERE';
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Current Status

✅ **APK Built** - Successfully created  
✅ **Download Link** - Added to landing page  
✅ **Button Working** - Opens download URL  
✅ **Ready to Share** - Can distribute to users  

## Next Steps

### Immediate
- [x] APK link added to landing page
- [ ] Test download on Android device
- [ ] Share with beta testers

### Soon
- [ ] Host APK permanently (GitHub/Vercel)
- [ ] Update link in landing page
- [ ] Create QR code for easy sharing
- [ ] Add to website/social media

### Future
- [ ] Submit to Google Play Store
- [ ] Build iOS version
- [ ] Set up automatic updates

## Support

### If Users Have Issues

**Can't Download:**
- Check internet connection
- Try different browser
- Use direct link

**Can't Install:**
- Enable "Unknown sources"
- Check Android version (need 5.0+)
- Clear download cache

**App Won't Open:**
- Restart device
- Reinstall app
- Check for updates

## Congratulations! 🎉

Your Android app is now available for download from your landing page!

Users can visit `/landing` and click the Android button to download and install Marché.cd on their devices.
