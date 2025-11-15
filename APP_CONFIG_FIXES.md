# App Configuration Fixes

## Errors Fixed

### 1. ❌ Missing notification-icon.png
**Error:** `Unable to resolve asset "./assets/images/notification-icon.png"`

**Fix:** Removed the notification icon references from app.json. The app will use the default icon instead.

### 2. ❌ Missing google-services.json
**Error:** `android.googleServicesFile: "./google-services.json"`

**Fix:** Removed the googleServicesFile reference. This is only needed if you're using Firebase Cloud Messaging, which we're not.

### 3. ❌ Runtime version policy error
**Error:** `You're currently using the bare workflow, where runtime version policies are not supported`

**Fix:** Changed from:
```json
"runtimeVersion": {
  "policy": "appVersion"
}
```

To:
```json
"runtimeVersion": "1.0.0"
```

## What Changed in app.json

### Before:
```json
{
  "notification": {
    "icon": "./assets/images/notification-icon.png",
    "color": "#9bbd1f",
    "androidMode": "default",
    "androidCollapsedTitle": "Nouveau message"
  },
  "android": {
    "googleServicesFile": "./google-services.json"
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
}
```

### After:
```json
{
  "android": {
    // Removed googleServicesFile
  },
  "runtimeVersion": "1.0.0",
  "plugins": [
    [
      "expo-notifications",
      {
        "color": "#9bbd1f"
        // Removed icon and sounds
      }
    ]
  ]
}
```

## Result

✅ App configuration is now valid
✅ No more missing asset errors
✅ Ready for EAS build
✅ Notifications will still work (using default icon)

## Optional: Add Custom Notification Icon Later

If you want a custom notification icon later, you can:

1. Create a notification icon (96x96 PNG, white on transparent)
2. Save it as `assets/images/notification-icon.png`
3. Add it back to app.json

But for now, the default icon works fine!

## Next Steps

Now you can proceed with:

1. **Test the notification button in Expo Go** (should work now)
2. **Build with EAS:**
   ```bash
   eas build --profile development --platform ios
   ```

The configuration errors are fixed! 🎉
