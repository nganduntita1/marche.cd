# Push Notifications Setup Guide

## Overview
This app now supports real-time push notifications for new messages, both when the app is in the foreground and background.

## Features Implemented

### 1. **Local Notifications (In-App)**
- Shows banner notifications when app is open
- Displays sender name and message preview
- Tapping notification navigates to the chat

### 2. **Push Notifications (Background)**
- Receives notifications even when app is closed
- Uses Expo Push Notification service
- Requires physical device (doesn't work on simulator)

### 3. **Real-time Integration**
- Listens to Supabase broadcast events
- Automatically shows notifications for new messages
- Updates badge count with unread messages

## Setup Instructions

### Step 1: Database Migration
Run the migration to add push_token column:

```bash
# Apply the migration
supabase db push
```

Or manually run:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token) WHERE push_token IS NOT NULL;
```

### Step 2: Choose Your Testing Method

**Option A: Quick Testing with Expo Go (In-App Notifications Only)**
```bash
# Start the dev server
npx expo start

# Scan QR code with Expo Go app
# In-app notifications will work
# Background notifications may not work reliably
```

**Option B: Full Testing with Development Build (All Notifications)**
```bash
# Build and install on your device
npx expo run:ios
# or
npx expo run:android

# This creates a standalone app
# All notifications work perfectly
```

**Note**: Push notifications **only work on physical devices**, not simulators.

### Step 3: Grant Permissions
When you first open the app after logging in:
1. You'll be prompted to allow notifications
2. Tap "Allow" to enable push notifications
3. The app will register your device and save the push token

## How It Works

### Architecture

```
User A sends message
    ↓
Supabase broadcasts event
    ↓
User B's app receives broadcast
    ↓
NotificationContext shows local notification
    ↓
User taps notification → Opens chat
```

### Files Created/Modified

1. **services/notificationService.ts**
   - Handles notification registration
   - Manages push tokens
   - Shows local notifications

2. **contexts/NotificationContext.tsx**
   - Provides notification state to app
   - Sets up real-time listeners
   - Handles notification taps

3. **app/_layout.tsx**
   - Wraps app with NotificationProvider

4. **app.json**
   - Added notification configuration
   - Added expo-notifications plugin

5. **supabase/migrations/20240117000000_add_push_tokens.sql**
   - Adds push_token column to users table

## Testing Notifications

### Important: Expo Go vs Development Build

**Expo Go (Quick Testing)**
- ✅ In-app notifications (banners) work
- ✅ Notification sounds and badges work
- ❌ Background push notifications are unreliable
- ✅ Good for UI/UX testing

**Development Build (Full Testing)**
- ✅ All notifications work perfectly
- ✅ Background notifications work
- ✅ Matches production behavior
- ✅ Required for final testing

### Test 1: In-App Notifications (Foreground) - Works in Expo Go
1. Open the app on Device A (Expo Go or dev build)
2. Send a message from Device B
3. Device A should show a banner notification at the top
4. **This works in Expo Go!**

### Test 2: Background Notifications - Requires Dev Build
1. Open the app on Device A, then minimize it
2. Send a message from Device B
3. Device A should receive a system notification
4. Tap the notification to open the chat
5. **This requires a development build, not Expo Go**

### Test 3: Badge Count
1. Receive multiple messages while app is closed
2. App icon should show badge with unread count
3. Opening the app clears the badge

## Notification Behavior

### When App is Open (Foreground)
- Shows banner at top of screen
- Plays sound
- Updates badge count
- Auto-dismisses after a few seconds

### When App is Closed (Background)
- Shows system notification
- Plays sound
- Updates badge count
- Tapping opens the specific chat

### Notification Content
- **Title**: "Nouveau message de [Sender Name]"
- **Body**: Message preview (first 100 characters)
- **Data**: Contains conversation_id for navigation

## Advanced: Push Notifications to Other Devices

For sending push notifications to users on other devices (not just local notifications), you need to implement a backend service.

### Option 1: Supabase Edge Function

Create a Supabase Edge Function to send push notifications:

```typescript
// supabase/functions/send-push-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { pushToken, title, body, data } = await req.json();

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Option 2: Database Trigger

Create a PostgreSQL trigger that calls the Edge Function when a new message is inserted:

```sql
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to send push notification
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-push-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'recipientId', NEW.recipient_id,
      'senderId', NEW.sender_id,
      'message', NEW.content
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();
```

## Troubleshooting

### Notifications Not Showing
1. **Check permissions**: Settings → App → Notifications → Enabled
2. **Physical device**: Simulators don't support push notifications
3. **Check logs**: Look for `[NOTIFICATIONS]` prefix in console
4. **Token saved**: Verify push_token is in database

### Notifications Not Navigating
1. Check notification data includes `conversationId`
2. Verify router is properly configured
3. Check console for navigation errors

### Badge Count Wrong
1. Clear app data and reinstall
2. Check unread count calculation in MessagesContext
3. Manually call `notificationService.setBadgeCount(0)`

## Production Considerations

### 1. **Notification Permissions**
- Request permissions at appropriate time (not immediately on app open)
- Explain why notifications are useful
- Provide settings to disable notifications

### 2. **Notification Content**
- Don't include sensitive information in notification body
- Keep messages short and clear
- Use appropriate icons and colors

### 3. **Performance**
- Batch notifications if many arrive at once
- Implement notification grouping
- Clear old notifications periodically

### 4. **Privacy**
- Allow users to opt-out of notifications
- Don't send notifications for muted conversations
- Respect "Do Not Disturb" settings

## Next Steps

1. **Test thoroughly** on physical devices
2. **Implement backend** for cross-device push notifications
3. **Add notification settings** in user profile
4. **Implement notification grouping** for multiple messages
5. **Add sound customization** options
6. **Track notification analytics** (open rate, etc.)

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
