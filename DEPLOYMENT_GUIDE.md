# 🚀 Deployment Guide - Web & Android

## Overview

This guide covers deploying your marketplace app to:
1. **Vercel** (Web version)
2. **Android APK** (Mobile app)

---

## Part 1: Deploy to Vercel (Web)

### Prerequisites
- Vercel account (free at vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket

### Step 1: Prepare for Deployment

1. **Ensure all changes are committed:**
```bash
git add .
git commit -m "Add reviews and ratings system"
git push origin main
```

2. **Check app.json for web config:**
Your `app.json` should have web configuration (already set up).

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
npx vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time) or **Y** (updating)
- Project name? `marche-cd` (or your preferred name)
- Directory? `./` (press Enter)
- Override settings? **N**

4. **Deploy to Production:**
```bash
npx vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. **Import your Git repository**
4. Configure:
   - Framework Preset: **Other**
   - Build Command: `npx expo export -p web`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Add Environment Variables:**
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click **"Deploy"**

### Step 3: Verify Deployment

1. **Check the deployment URL** (e.g., `https://marche-cd.vercel.app`)
2. **Test key features:**
   - Login/Register
   - Browse listings
   - Create listing
   - Mark as sold
   - Notifications
   - Ratings

### Troubleshooting Vercel

**Issue: Build fails**
```bash
# Check build locally first
npx expo export -p web
```

**Issue: Environment variables not working**
- Make sure they start with `EXPO_PUBLIC_`
- Redeploy after adding variables

**Issue: 404 on routes**
- Vercel should auto-detect Expo
- If not, add `vercel.json`:
```json
{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist",
  "devCommand": "npx expo start --web",
  "cleanUrls": true,
  "trailingSlash": false
}
```

---

## Part 2: Build Android APK

### Prerequisites
- EAS CLI installed
- Expo account
- Android build configured

### Step 1: Install EAS CLI (if not installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build (if not done)

Your `eas.json` should already be configured. Verify it has:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Step 4: Build Android APK

**For Preview/Testing:**
```bash
eas build --platform android --profile preview
```

**For Production:**
```bash
eas build --platform android --profile production
```

### Step 5: Monitor Build

1. **Build will start on EAS servers**
2. **Check progress:**
   - In terminal (shows link)
   - Or at: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

3. **Build takes ~10-20 minutes**

### Step 6: Download APK

Once build completes:

1. **Download link appears in terminal**
2. **Or download from Expo dashboard:**
   - Go to https://expo.dev
   - Navigate to your project
   - Click "Builds"
   - Download the APK

### Step 7: Install APK

**On Physical Device:**
1. Transfer APK to phone (USB, email, cloud)
2. Enable "Install from Unknown Sources" in Settings
3. Tap APK file to install
4. Open app and test

**Using ADB:**
```bash
adb install path/to/your-app.apk
```

### Step 8: Test the APK

Test all features:
- [ ] Login/Register
- [ ] Browse listings
- [ ] Create listing with images
- [ ] Chat/Messages
- [ ] Mark as sold
- [ ] Notifications (bell icon)
- [ ] Submit ratings
- [ ] View profiles with ratings
- [ ] Location features
- [ ] Search and filters

---

## Part 3: Update Existing Deployments

### Update Vercel

**Automatic (if connected to Git):**
```bash
git add .
git commit -m "Update with new features"
git push origin main
```
Vercel auto-deploys on push to main branch.

**Manual:**
```bash
npx vercel --prod
```

### Update Android APK

1. **Increment version in app.json:**
```json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 2
    }
  }
}
```

2. **Build new APK:**
```bash
eas build --platform android --profile production
```

3. **Download and distribute new APK**

---

## Part 4: Environment Variables

### Required Variables

Both Vercel and EAS need these:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Set in Vercel

1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable
4. Redeploy

### Set in EAS

Add to `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

Or use `.env` file (not recommended for production).

---

## Part 5: Pre-Deployment Checklist

### Before Deploying:

- [ ] **Run database migration** (reviews system)
  ```sql
  -- Run in Supabase SQL Editor
  supabase/migrations/20240121000001_reviews_ratings_system_safe.sql
  ```

- [ ] **Test locally:**
  ```bash
  # Web
  npx expo start --web
  
  # Android
  npx expo start --android
  ```

- [ ] **Check environment variables** are set

- [ ] **Commit all changes:**
  ```bash
  git status
  git add .
  git commit -m "Ready for deployment"
  git push
  ```

- [ ] **Update version numbers** in `app.json`

- [ ] **Test critical flows:**
  - Authentication
  - Create listing
  - Mark as sold
  - Notifications
  - Ratings

---

## Part 6: Post-Deployment

### After Deploying:

1. **Test on production:**
   - Web: Visit Vercel URL
   - Android: Install APK on device

2. **Monitor for errors:**
   - Check Vercel logs
   - Check Supabase logs
   - Test user flows

3. **Share with users:**
   - Web: Share Vercel URL
   - Android: Distribute APK (email, cloud, etc.)

4. **Collect feedback:**
   - Test with real users
   - Monitor for issues
   - Iterate and improve

---

## Quick Commands Reference

### Vercel
```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# Check deployment status
npx vercel ls
```

### EAS Build
```bash
# Build Android APK (preview)
eas build --platform android --profile preview

# Build Android APK (production)
eas build --platform android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

### Git
```bash
# Commit and push
git add .
git commit -m "Your message"
git push origin main

# Check status
git status
```

---

## Troubleshooting

### Vercel Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Test build locally: `npx expo export -p web`
- Verify environment variables

**App doesn't load:**
- Check browser console for errors
- Verify Supabase connection
- Check environment variables

### Android APK Issues

**Build fails:**
- Check EAS build logs
- Verify `eas.json` configuration
- Check `app.json` for errors

**APK won't install:**
- Enable "Unknown Sources" on device
- Check APK isn't corrupted
- Try different transfer method

**App crashes:**
- Check device logs: `adb logcat`
- Verify environment variables
- Test on different device

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (Vercel)
2. **Publish to Google Play Store** (Android)
3. **Set up analytics** (track usage)
4. **Monitor performance** (Vercel Analytics)
5. **Collect user feedback**
6. **Plan next features**

---

## Support

If you encounter issues:

1. **Check logs:**
   - Vercel: Dashboard → Deployments → Logs
   - EAS: Dashboard → Builds → View logs

2. **Common fixes:**
   - Clear cache and rebuild
   - Verify environment variables
   - Check Supabase connection
   - Update dependencies

3. **Resources:**
   - Vercel Docs: https://vercel.com/docs
   - EAS Docs: https://docs.expo.dev/build/introduction/
   - Expo Forums: https://forums.expo.dev/

---

## Summary

**To deploy:**

1. **Web (Vercel):**
   ```bash
   npx vercel --prod
   ```

2. **Android (APK):**
   ```bash
   eas build --platform android --profile production
   ```

3. **Test everything**
4. **Share with users**
5. **Monitor and iterate**

Your marketplace is ready to go live! 🚀
