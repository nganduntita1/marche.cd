# TestFlight Setup Guide - Complete Walkthrough

## Prerequisites ✅

You mentioned you have:
- ✅ Free tier Apple Developer account
- ✅ Physical iPhone for testing
- ✅ Mac with Xcode

## Overview

We'll use **EAS (Expo Application Services)** to build and submit to TestFlight. It's the easiest way and handles all the complexity for you.

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to EAS

```bash
eas login
```

If you don't have an Expo account:
```bash
eas register
```

## Step 3: Configure EAS Build

Create the EAS configuration:

```bash
eas build:configure
```

This creates an `eas.json` file. Let me create the optimal configuration for you:

### Create `eas.json` in your project root:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "will-be-generated",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

## Step 4: Update app.json

Make sure your `app.json` has the correct bundle identifier:

```json
{
  "expo": {
    "name": "Marché.cd",
    "slug": "marche-cd",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.marche.cd",
      "buildNumber": "1"
    }
  }
}
```

## Step 5: Build for TestFlight

Now let's build! This will take about 15-20 minutes the first time.

```bash
# Build for iOS production
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code to their servers
2. They build your app in the cloud
3. You'll get a link to download the `.ipa` file
4. The build will be ready for TestFlight

**During the build, you'll be asked:**

### Question 1: "Generate a new Apple Distribution Certificate?"
**Answer:** `Yes` (if you don't have one)

### Question 2: "Generate a new Apple Provisioning Profile?"
**Answer:** `Yes`

### Question 3: "What would you like your iOS bundle identifier to be?"
**Answer:** `com.marche.cd` (or keep the default)

### Question 4: "Log in to your Apple account"
**You'll need:**
- Your Apple ID email
- Your Apple ID password
- Two-factor authentication code

## Step 6: Wait for Build

The build will take 15-20 minutes. You'll see:

```
✔ Build completed!
https://expo.dev/accounts/[your-account]/projects/marche-cd/builds/[build-id]
```

## Step 7: Submit to TestFlight

Once the build is complete:

```bash
eas submit --platform ios --latest
```

**You'll be asked:**
- Apple ID email
- App-specific password (we'll create this)

### Create App-Specific Password:

1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to "Security" section
4. Under "App-Specific Passwords", click "Generate Password"
5. Name it "EAS CLI"
6. Copy the password (you'll use this for EAS submit)

## Step 8: Wait for Processing

After submission:
1. Apple processes your app (5-10 minutes)
2. You'll get an email when it's ready
3. Open TestFlight app on your iPhone
4. Your app will appear!

## Step 9: Test on TestFlight

1. Open TestFlight app on your iPhone
2. Find "Marché.cd"
3. Tap "Install"
4. Open the app
5. Test notifications! 🎉

## Common Issues & Solutions

### Issue 1: "You don't have permission to register a bundle identifier"

**Solution:** Your free Apple Developer account has limitations. You need to:
1. Go to https://developer.apple.com
2. Enroll in the Apple Developer Program ($99/year)
3. Or use a different bundle identifier that's not taken

**Free Tier Workaround:**
Use a unique bundle identifier:
```
com.yourname.marchecd
```

### Issue 2: "Build failed - Missing credentials"

**Solution:**
```bash
# Clear credentials and start fresh
eas credentials
# Select iOS → Production → Remove all → Start build again
```

### Issue 3: "App-specific password invalid"

**Solution:**
- Make sure you copied the entire password
- Generate a new one if needed
- Don't use your regular Apple ID password

### Issue 4: "Build takes too long"

**Solution:**
- This is normal for first build (15-20 min)
- Subsequent builds are faster (5-10 min)
- You can close terminal and check status at expo.dev

## Alternative: Faster Testing with Development Build

If you want to test notifications NOW without waiting for TestFlight:

```bash
# Build a development build (faster, installs directly)
eas build --profile development --platform ios

# After build completes, install on your device
# Download the .ipa from the build page
# Or use: eas build:run --profile development --platform ios
```

This installs directly on your iPhone without TestFlight!

## Cost Breakdown

### Free Option:
- ✅ EAS Build: Free (limited builds per month)
- ✅ TestFlight: Free
- ❌ Apple Developer Program: $99/year (required for App Store)

### For Testing Only:
- Use development builds (free, unlimited)
- Skip TestFlight for now
- Upgrade to paid when ready for App Store

## Quick Commands Reference

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest

# Build development version (faster)
eas build --profile development --platform ios

# Check build status
eas build:list

# View credentials
eas credentials
```

## Recommended Approach for You

Since you want to test notifications and have a free account:

### Option A: Development Build (Fastest - 10 min)
```bash
eas build --profile development --platform ios
# Install directly on your iPhone
# Test notifications immediately
```

### Option B: TestFlight (Slower - 30 min, but more "production-like")
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
# Wait for Apple processing
# Install via TestFlight
```

## My Recommendation

**Start with Option A (Development Build):**
1. Faster to test (10 minutes vs 30+ minutes)
2. No Apple Developer Program needed yet
3. Installs directly on your device
4. Perfect for testing notifications
5. Can rebuild quickly if you find issues

**Then do Option B (TestFlight) when:**
- You're ready for beta testing with others
- You want to test the "real" App Store experience
- You're preparing for App Store submission

## Next Steps

1. **Test the notification button first** (in Expo Go)
2. If it works → Great! Notifications are working
3. If not → We'll debug before building
4. Once working → Build with EAS
5. Install and test on your device

Let me know:
- Did the test button work in Expo Go?
- Do you want to do a development build or go straight to TestFlight?
- Do you have the $99 Apple Developer Program or just the free account?

I'll guide you through whichever option you choose! 🚀
