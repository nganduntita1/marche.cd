# Landing Page Setup Guide

## Overview
A professional landing page has been created at `app/index.tsx` for Marché.cd. This page serves as the entry point for new users and provides:

- Hero section with app branding
- Android APK download button
- iOS "Coming Soon" placeholder
- Link to web version login
- Feature highlights
- How it works section
- Call-to-action section
- Footer with legal links

## Configuration

### 1. Update APK Download URL

Open `app/index.tsx` and update line 19 with your actual APK download URL:

```typescript
const handleDownloadAPK = () => {
  // Replace with your actual APK download URL
  const apkUrl = 'https://your-domain.com/downloads/marche-cd.apk';
  Linking.openURL(apkUrl);
};
```

### 2. Hosting Your APK

You have several options for hosting your APK:

#### Option A: Vercel (Recommended for this project)
1. Create a `public` folder in your project root
2. Place your APK file: `public/downloads/marche-cd.apk`
3. Update the URL to: `https://your-domain.vercel.app/downloads/marche-cd.apk`

#### Option B: GitHub Releases
1. Go to your GitHub repository
2. Create a new release
3. Upload your APK as a release asset
4. Use the direct download URL from the release

#### Option C: Cloud Storage
- Use AWS S3, Google Cloud Storage, or similar
- Make the file publicly accessible
- Use the public URL

### 3. When iOS is Ready

When your iOS app is ready on TestFlight or App Store:

1. Open `app/index.tsx`
2. Find the "Coming Soon" button section (around line 70)
3. Replace it with an active button similar to the Android one:

```typescript
<TouchableOpacity
  style={styles.downloadButton}
  onPress={handleDownloadIOS}
  activeOpacity={0.8}
>
  <Smartphone size={24} color={Colors.primary} />
  <View style={styles.downloadButtonText}>
    <Text style={styles.downloadButtonLabel}>Download for</Text>
    <Text style={styles.downloadButtonTitle}>iOS</Text>
  </View>
</TouchableOpacity>
```

4. Add the handler function:

```typescript
const handleDownloadIOS = () => {
  const iosUrl = 'https://apps.apple.com/app/your-app-id';
  Linking.openURL(iosUrl);
};
```

## Features

### Responsive Design
- Works on mobile, tablet, and web
- Adapts layout based on screen size
- Uses your app's color scheme and typography

### Navigation
- **Download Android**: Opens APK download link
- **Use Web Version**: Routes to `/auth/login` for web users
- **Footer Links**: Links to Privacy, Terms, and Help Center

### Customization

All styling uses your existing design system:
- Colors from `constants/Colors.ts`
- Typography from `constants/Typography.ts`
- Consistent with the rest of your app

## Testing

### Test on Web
```bash
npm run dev
```
Visit `http://localhost:8081` in your browser

### Test on Mobile
The landing page will be the first screen users see when they open the app.

## Deployment

### For Web (Vercel)
```bash
npm run build:web
```

The landing page will be deployed as your home page.

### For Mobile
The landing page is included in your app bundle and will show on first launch.

## Next Steps

1. Build your Android APK:
   ```bash
   eas build --platform android --profile production
   ```

2. Download the APK from EAS

3. Upload it to your hosting solution

4. Update the `apkUrl` in `app/index.tsx`

5. Deploy your web version to Vercel

6. Share your landing page URL!

## Notes

- The landing page uses the same authentication flow as the rest of your app
- Users can choose to download the app or use the web version
- All links and navigation are fully functional
- The design matches your app's branding (green gradient, Montserrat/Roboto fonts)
