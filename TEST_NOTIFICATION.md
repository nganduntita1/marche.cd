# Test In-App Notifications in Expo Go

## Quick Test

To verify if in-app notifications are working in Expo Go, let's do a simple test:

### Step 1: Add Test Button (Temporary)

Add this code to your `app/(tabs)/messages.tsx` file, right after the header (around line 550):

```typescript
{/* TEMPORARY TEST BUTTON - Remove after testing */}
{user && (
  <TouchableOpacity
    style={{
      backgroundColor: '#ef4444',
      padding: 16,
      margin: 16,
      borderRadius: 12,
      alignItems: 'center',
    }}
    onPress={async () => {
      const { notificationService } = await import('@/services/notificationService');
      await notificationService.showLocalNotification(
        'Test Notification',
        'This is a test message to verify notifications work!',
        { type: 'new_message' }
      );
    }}
  >
    <Text style={{ color: '#fff', fontWeight: '600' }}>
      🔔 Test Notification (Tap Me!)
    </Text>
  </TouchableOpacity>
)}
```

### Step 2: Test It

1. Open the app in Expo Go on your **physical iPhone**
2. Go to the Messages tab
3. Tap the red "Test Notification" button
4. You should see a banner notification at the top!

### What Should Happen

✅ **If it works:**
- Banner appears at top of screen
- Shows "Test Notification"
- Shows "This is a test message..."
- Plays a sound
- Auto-dismisses after a few seconds

❌ **If it doesn't work:**
- Check console for errors
- Make sure you're on a physical device (not simulator)
- Check if you granted notification permissions

### Step 3: Check Permissions

If the test button doesn't show a notification, check permissions:

```typescript
// Add this to see permission status
import * as Notifications from 'expo-notifications';

// In your component
useEffect(() => {
  Notifications.getPermissionsAsync().then(({ status }) => {
    console.log('[TEST] Notification permission status:', status);
  });
}, []);
```

### Step 4: Request Permissions

If permissions are not granted, request them:

```typescript
// Add this button too
<TouchableOpacity
  style={{
    backgroundColor: '#9bbd1f',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  }}
  onPress={async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    alert(`Permission status: ${status}`);
  }}
>
  <Text style={{ color: '#fff', fontWeight: '600' }}>
    Request Notification Permission
  </Text>
</TouchableOpacity>
```

## Common Issues

### Issue 1: "Must use physical device"
**Solution:** You're on a simulator. Use a real iPhone.

### Issue 2: No banner appears
**Possible causes:**
1. Permissions not granted
2. Notifications disabled in iOS Settings
3. Do Not Disturb is on
4. Banner style is set to "None" in iOS Settings

**Check iOS Settings:**
- Settings → Expo Go → Notifications → Allow Notifications (ON)
- Settings → Expo Go → Notifications → Banner Style → Temporary or Persistent

### Issue 3: Error in console
**Check for:**
- `[NOTIFICATIONS] Error...` messages
- Permission denied errors
- Module not found errors

## Expected Console Output

When the app loads, you should see:

```
[NOTIFICATIONS] Setting up realtime notifications
[NOTIFICATIONS] Expo Push Token: ExponentPushToken[xxxxx]
```

Or if on simulator:
```
[NOTIFICATIONS] Must use physical device for Push Notifications
```

## Real Message Test

Once the test button works, try the real scenario:

1. Open app on Device A (keep it open)
2. Send a message from Device B
3. Device A should show notification banner

## Remove Test Code

After testing, remove the test buttons from your code!

## Still Not Working?

If in-app notifications still don't work after these tests, let me know:
1. What device are you using? (iPhone model)
2. What do you see in the console?
3. Did the test button work?
4. What's the permission status?

This will help me debug the specific issue!
