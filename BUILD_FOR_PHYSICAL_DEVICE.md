# Build for Physical Device - Complete Guide

## ✅ Notifications Re-Enabled!

I've re-enabled full notification support for physical device builds. The test button is back!

## Option 1: Local Build (Free - No Paid Account Needed)

This builds the app on your Mac and installs directly on your iPhone.

### Requirements:
- Mac with Xcode installed
- iPhone connected via USB cable
- Free Apple Developer account

### Steps:

1. **Connect iPhone to Mac**
   - Use USB cable
   - Unlock iPhone
   - Tap "Trust This Computer" if prompted

2. **Run the build command**
   ```bash
   npx expo run:ios --device
   ```

3. **Wait for build** (5-10 minutes first time)
   - Xcode will compile the app
   - App will install on your iPhone
   - App will launch automatically

4. **Grant notification permissions**
   - When prompted, tap "Allow"
   - Go to Messages tab
   - Tap "TEST NOTIFICATION BANNER" button
   - You should see a banner! 🎉

### Troubleshooting Local Build:

**Error: "No devices found"**
```bash
# List connected devices
xcrun xctrace list devices

# Make sure your iPhone appears in the list
```

**Error: "Signing requires a development team"**
1. Open the project in Xcode:
   ```bash
   open ios/marchecd.xcworkspace
   ```
2. Select your project in the left sidebar
3. Go to "Signing & Capabilities"
4. Select your Apple ID team
5. Try building again

**Error: "Could not launch app"**
1. On iPhone: Settings → General → VPN & Device Management
2. Trust the developer certificate
3. Try launching the app again

## Option 2: EAS Build (Requires Paid Account - $99/year)

This builds in the cloud and gives you more options.

### Requirements:
- Paid Apple Developer Program ($99/year)
- EAS CLI installed

### Steps:

1. **Upgrade to paid Apple Developer account**
   - Go to https://developer.apple.com/programs/enroll/
   - Pay $99/year
   - Wait 24-48 hours for approval

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Login to EAS**
   ```bash
   eas login
   ```

4. **Build for development**
   ```bash
   eas build --profile development --platform ios
   ```

5. **Wait for build** (10-15 minutes)
   - Build happens in the cloud
   - You'll get a download link

6. **Install on iPhone**
   - Open the link on your iPhone
   - Tap "Install"
   - Trust the developer in Settings
   - Launch the app

7. **Test notifications**
   - Grant permissions when prompted
   - Tap "TEST NOTIFICATION BANNER" button
   - You should see a banner! 🎉

## What's Included

### Notifications:
- ✅ In-app notifications (banners when app is open)
- ✅ Background notifications (when app is closed)
- ✅ Sound and badge updates
- ✅ Tapping opens the chat
- ✅ Real-time message notifications

### Test Button:
- Green button on Messages tab
- Tap to test notification banner
- Verifies notifications are working
- Remove before production release

## Testing Notifications

### Test 1: Banner Test
1. Open app on your iPhone
2. Go to Messages tab
3. Tap "TEST NOTIFICATION BANNER"
4. You should see a banner at the top! ✅

### Test 2: Real Message Test
1. Keep app open on Device A
2. Send message from Device B
3. Device A should show notification banner ✅

### Test 3: Background Test
1. Close app on Device A
2. Send message from Device B
3. Device A should show system notification ✅
4. Tap notification → Opens chat ✅

## Comparison: Local vs EAS Build

| Feature | Local Build | EAS Build |
|---------|------------|-----------|
| Cost | Free | $99/year |
| Build time | 5-10 min | 10-15 min |
| Build location | Your Mac | Cloud |
| Requires Xcode | Yes | No |
| Requires USB | Yes | No |
| TestFlight | No | Yes |
| App Store | No | Yes |
| Notifications | ✅ Yes | ✅ Yes |

## My Recommendation

**Start with Local Build:**
1. Free and fast
2. Test notifications immediately
3. No paid account needed
4. Perfect for development

**Upgrade to EAS when:**
1. Ready for beta testing
2. Want to use TestFlight
3. Preparing for App Store
4. Need to share with others

## Quick Commands

### Local Build:
```bash
# Connect iPhone via USB, then:
npx expo run:ios --device
```

### EAS Build:
```bash
# After upgrading to paid account:
npm install -g eas-cli
eas login
eas build --profile development --platform ios
```

## Next Steps

1. **Choose your build method** (Local or EAS)
2. **Run the build command**
3. **Install on your iPhone**
4. **Test the notification button**
5. **Test real messages**
6. **Enjoy working notifications!** 🎉

Ready to build? Let me know which method you want to use and I'll guide you through it!
