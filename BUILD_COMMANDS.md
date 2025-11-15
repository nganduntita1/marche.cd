# Quick Build Commands

## ✅ Configuration Fixed!

All app.json errors are now resolved. You're ready to build!

## Step 1: Test Notification Button First

1. Reload your Expo Go app (shake device → Reload)
2. Go to Messages tab
3. Tap the red "TEST NOTIFICATION" button
4. You should see a banner! 🎉

## Step 2: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 3: Login to EAS

```bash
eas login
```

If you don't have an account:
```bash
# Create account
eas register

# Then login
eas login
```

## Step 4: Build for Your iPhone

### Option A: Development Build (Fastest - Recommended)
**Best for:** Quick testing, no Apple Developer Program needed

```bash
# Build
eas build --profile development --platform ios

# Wait 10-15 minutes
# You'll get a download link

# Install on your iPhone:
# 1. Open the link on your iPhone
# 2. Tap "Install"
# 3. Trust the developer in Settings
```

### Option B: TestFlight Build (Slower)
**Best for:** Beta testing, requires Apple Developer Program ($99/year)

```bash
# Build
eas build --profile production --platform ios

# Wait 15-20 minutes

# Submit to TestFlight
eas submit --platform ios --latest

# Wait 5-10 minutes for Apple processing

# Install via TestFlight app
```

## What You'll Be Asked During Build

### Question 1: "Generate a new Apple Distribution Certificate?"
**Answer:** `Y` (Yes)

### Question 2: "Generate a new Apple Provisioning Profile?"
**Answer:** `Y` (Yes)

### Question 3: "What would you like your iOS bundle identifier to be?"
**Answer:** Press Enter (keep `com.marche.cd`)

### Question 4: "Log in to your Apple account"
**Enter:**
- Your Apple ID email
- Your Apple ID password
- Two-factor authentication code (from your iPhone)

## After Build Completes

### For Development Build:
1. You'll get a link like: `https://expo.dev/accounts/.../builds/...`
2. Open this link on your iPhone
3. Tap "Install"
4. Go to Settings → General → VPN & Device Management
5. Trust the developer certificate
6. Open the app!

### For TestFlight Build:
1. Open TestFlight app on your iPhone
2. Find "Marché.cd"
3. Tap "Install"
4. Open the app!

## Troubleshooting

### "You don't have permission to register a bundle identifier"
**Solution:** You need the paid Apple Developer Program ($99/year)

**Workaround:** Use a different bundle identifier:
```bash
# Edit app.json, change:
"bundleIdentifier": "com.yourname.marchecd"
```

### "Build failed"
**Check:**
```bash
# View build logs
eas build:list

# Click on the failed build to see logs
```

### "Can't install on iPhone"
**For Development Build:**
1. Settings → General → VPN & Device Management
2. Trust the developer
3. Try installing again

## My Recommendation

**Start with Development Build:**
```bash
eas build --profile development --platform ios
```

**Why?**
- ✅ Faster (10-15 min vs 30+ min)
- ✅ No Apple Developer Program needed
- ✅ Installs directly on your device
- ✅ Perfect for testing notifications
- ✅ Can rebuild quickly

**Then do TestFlight later when:**
- You're ready for beta testing
- You want to share with others
- You're preparing for App Store

## Quick Reference

```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Build development
eas build --profile development --platform ios

# Build production
eas build --profile production --platform ios

# Submit to TestFlight
eas submit --platform ios --latest

# Check build status
eas build:list

# View credentials
eas credentials
```

## Ready to Build?

1. ✅ Test notification button works in Expo Go
2. ✅ Install EAS CLI
3. ✅ Login to EAS
4. ✅ Run build command
5. ✅ Wait for build
6. ✅ Install on iPhone
7. ✅ Test notifications! 🎉

Let me know when you're ready to start the build! 🚀
