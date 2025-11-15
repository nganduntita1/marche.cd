# Web Notification Error - Fixed

## The Error You Saw

```
[NOTIFICATIONS] Error registering for push notifications: CodedError: 
You must provide `notification.vapidPublicKey` in `app.json` to use push notifications on web.
```

## What Happened

The notification system tried to register for push notifications on the web platform, but web push notifications require additional configuration (VAPID keys) that we don't need since this is a mobile-first app.

## The Fix

I've updated the code to **skip notifications entirely on web**:

### 1. Updated `services/notificationService.ts`
Added a check to skip registration on web:
```typescript
// Skip notifications on web platform
if (Platform.OS === 'web') {
  console.log('[NOTIFICATIONS] Push notifications not supported on web');
  return null;
}
```

### 2. Updated `contexts/NotificationContext.tsx`
Added a check to skip real-time notification setup on web:
```typescript
// Skip notifications on web
if (Platform.OS === 'web') {
  console.log('[NOTIFICATIONS] Skipping notification setup on web');
  return;
}
```

## Result

Now when you run the app on web (for testing), you'll see:
- ✅ No errors
- ✅ App works normally
- ℹ️ Console message: "Push notifications not supported on web"
- ℹ️ Console message: "Skipping notification setup on web"

## Platform Support

| Platform | Notifications Supported |
|----------|------------------------|
| iOS | ✅ Yes (physical device) |
| Android | ✅ Yes (physical device) |
| Web | ❌ No (not needed) |
| iOS Simulator | ❌ No (limitation) |
| Android Emulator | ❌ No (limitation) |

## Testing

### On Web (for development)
```bash
npx expo start
# Press 'w' for web
# No notification errors ✅
# App works normally ✅
```

### On Mobile (for notifications)
```bash
# iOS
npx expo start
# Scan QR with Expo Go or device

# Android
npx expo start
# Scan QR with Expo Go or device
```

## Why Web Doesn't Need Notifications

1. **Mobile-First App**: Marche.cd is designed for mobile users
2. **Web is for Testing**: Web version is mainly for development/testing
3. **Different Technology**: Web push uses different APIs (Service Workers, VAPID)
4. **Not Worth the Complexity**: Setting up web push requires:
   - Generating VAPID keys
   - Configuring service workers
   - Different notification APIs
   - Additional backend setup

## If You Want Web Notifications Later

If you decide to add web push notifications in the future:

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add to `app.json`:
   ```json
   {
     "expo": {
       "notification": {
         "vapidPublicKey": "YOUR_PUBLIC_KEY_HERE"
       }
     }
   }
   ```

3. Update the notification service to handle web differently

But for now, **mobile notifications are all you need**!

## Summary

✅ **Fixed**: No more errors on web
✅ **Mobile**: Notifications still work perfectly on iOS/Android
✅ **Simple**: No unnecessary web push configuration
✅ **Clean**: Proper platform detection and graceful degradation

The error is now resolved and won't appear when testing on web!
