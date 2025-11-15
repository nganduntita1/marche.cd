# Debug: In-App Notifications Not Working in Expo Go

## You're Right - They Should Work!

In-app notifications (banners when app is open) **should work** in Expo Go on a physical iPhone. Let's figure out why they're not working.

## Quick Checklist

### ✅ Requirements
- [ ] Using **physical iPhone** (not simulator)
- [ ] App is open (in foreground)
- [ ] Notification permissions granted
- [ ] iOS Settings allow notifications for Expo Go

### ❌ Won't Work If
- Using iOS Simulator
- App is closed/minimized
- Notifications disabled in iOS Settings
- Do Not Disturb is enabled

## Step-by-Step Debugging

### Step 1: Check Your Device
**Question:** Are you testing on a real iPhone or the iOS Simulator?

- **Real iPhone** → Continue to Step 2
- **iOS Simulator** → This is the problem! Notifications don't work on simulators

### Step 2: Check Console Logs
Open your terminal where `npx expo start` is running. Look for these messages:

**Good Signs:**
```
[NOTIFICATIONS] Setting up realtime notifications
[NOTIFICATIONS] Expo Push Token: ExponentPushToken[...]
```

**Bad Signs:**
```
[NOTIFICATIONS] Must use physical device for Push Notifications
[NOTIFICATIONS] Error registering for push notifications
```

**What do you see?**

### Step 3: Check Permissions
Run this test in your app:

```typescript
import * as Notifications from 'expo-notifications';

// Add this somewhere in your app (temporarily)
useEffect(() => {
  async function checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('📱 Notification Permission:', status);
    alert(`Notification Permission: ${status}`);
  }
  checkPermissions();
}, []);
```

**Expected Results:**
- `granted` → Good! Permissions are OK
- `denied` → Need to enable in iOS Settings
- `undetermined` → Need to request permissions

### Step 4: Request Permissions
If permissions are not granted, request them:

```typescript
const { status } = await Notifications.requestPermissionsAsync();
console.log('Permission status:', status);
```

### Step 5: Test with Manual Notification
Add this test button to verify the notification system works:

```typescript
import { notificationService } from '@/services/notificationService';

// Add this button somewhere visible
<TouchableOpacity
  onPress={async () => {
    console.log('🔔 Testing notification...');
    await notificationService.showLocalNotification(
      'Test Title',
      'Test Message - If you see this, notifications work!',
      { type: 'new_message' }
    );
  }}
  style={{ backgroundColor: '#ef4444', padding: 20, margin: 20 }}
>
  <Text style={{ color: '#fff' }}>TEST NOTIFICATION</Text>
</TouchableOpacity>
```

**Tap the button. What happens?**

### Step 6: Check iOS Settings
Go to your iPhone:
1. Settings → Expo Go
2. Notifications
3. Make sure:
   - ✅ Allow Notifications is ON
   - ✅ Banner Style is "Temporary" or "Persistent" (not "None")
   - ✅ Sounds is ON
   - ✅ Badges is ON

## Common Problems & Solutions

### Problem 1: "Must use physical device"
**Cause:** You're on iOS Simulator
**Solution:** Use a real iPhone

### Problem 2: No banner appears
**Possible Causes:**
1. **Permissions not granted**
   - Solution: Request permissions with `requestPermissionsAsync()`
   
2. **Notifications disabled in Settings**
   - Solution: Enable in Settings → Expo Go → Notifications
   
3. **Do Not Disturb is on**
   - Solution: Disable Do Not Disturb
   
4. **Banner style is "None"**
   - Solution: Change to "Temporary" or "Persistent" in Settings

### Problem 3: Error in console
**Check for specific errors:**
- Module not found → Run `npm install`
- Permission denied → Grant permissions
- Invalid token → Restart app

### Problem 4: Notification shows but no sound
**Solution:** 
- Check iOS Settings → Expo Go → Notifications → Sounds (ON)
- Check device is not in silent mode
- Check volume is up

## What SHOULD Happen

When everything is working correctly:

1. **App loads:**
   ```
   [NOTIFICATIONS] Setting up realtime notifications
   ```

2. **New message arrives:**
   ```
   [NOTIFICATIONS] New message broadcast received
   [NOTIFICATIONS] Notification received in foreground
   ```

3. **You see:**
   - Banner at top of screen
   - Sender name
   - Message preview
   - Notification sound plays
   - Banner auto-dismisses after 3-5 seconds

## Test Scenario

### Setup:
1. Device A: Your iPhone with Expo Go (app open)
2. Device B: Another device or web browser

### Test:
1. Log in on both devices
2. On Device B, send a message to Device A
3. On Device A (with app open), you should see:
   - Banner notification at top
   - "Nouveau message de [Name]"
   - Message preview

### If it doesn't work:
- Check console on Device A for errors
- Verify Device A has notifications enabled
- Try the manual test button first

## Still Not Working?

If you've tried all the above and it still doesn't work, I need to know:

1. **Device:** What iPhone model are you using?
2. **iOS Version:** What iOS version?
3. **Console Output:** What do you see in the terminal?
4. **Permission Status:** What does `getPermissionsAsync()` return?
5. **Test Button:** Does the manual test button work?
6. **Settings:** Are notifications enabled for Expo Go in iOS Settings?

With this information, I can help you debug the specific issue!

## Quick Summary

**In-App Notifications in Expo Go:**
- ✅ Should work on physical iPhone
- ✅ Banner appears when app is open
- ✅ Sound plays
- ❌ Don't work on simulator
- ❌ Don't work when app is closed (need dev build for that)

The code is correct - we just need to figure out what's preventing the notifications from showing on your device!
