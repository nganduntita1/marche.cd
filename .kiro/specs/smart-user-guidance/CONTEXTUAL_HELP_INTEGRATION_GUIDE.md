# Contextual Help System - Integration Guide

## 🎯 Quick Integration Checklist

Use this checklist to integrate the contextual help system into your screens:

### For Each Major Screen:

- [ ] Add HelpButton component
- [ ] Add ContextualHelp modal
- [ ] Add InactivityDetector (optional but recommended)
- [ ] Replace error alerts with ErrorWithSolution
- [ ] Test the complete flow

## 📱 Screen-by-Screen Integration

### 1. Home Screen (`app/(tabs)/index.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, InactivityDetector } from '@/components/guidance';

export default function HomeScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      {/* Add these at the end, before closing SafeAreaView */}
      <HelpButton
        screenName="home"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="home"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <InactivityDetector
        screenName="home"
        onHelpRequested={() => setShowHelp(true)}
        enabled={true}
      />
    </SafeAreaView>
  );
}
```

### 2. Listing Detail Screen (`app/listing/[id].tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, InactivityDetector, ErrorWithSolution } from '@/components/guidance';

export default function ListingDetailScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState<{type: string; message: string} | null>(null);

  const handleContactSeller = async () => {
    try {
      // Your logic here
    } catch (err: any) {
      setError({ type: 'network', message: err.message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="listing"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="listing"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <InactivityDetector
        screenName="listing"
        inactivityThreshold={30000}
        onHelpRequested={() => setShowHelp(true)}
        enabled={true}
      />

      <ErrorWithSolution
        visible={!!error}
        errorType={error?.type || 'server'}
        errorMessage={error?.message || ''}
        onClose={() => setError(null)}
        onRetry={handleContactSeller}
      />
    </SafeAreaView>
  );
}
```

### 3. Chat Screen (`app/chat/[id].tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, InactivityDetector } from '@/components/guidance';

export default function ChatScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="chat"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="chat"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Disable inactivity detection while typing */}
      <InactivityDetector
        screenName="chat"
        onHelpRequested={() => setShowHelp(true)}
        enabled={!isTyping}
      />
    </SafeAreaView>
  );
}
```

### 4. Post/Create Listing Screen (`app/(tabs)/post.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, ErrorWithSolution } from '@/components/guidance';

export default function PostScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState<{type: string; message: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePublish = async () => {
    try {
      setIsUploading(true);
      // Your publish logic
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_CREDITS') {
        setError({ type: 'credits', message: err.message });
      } else if (err.code === 'VALIDATION_ERROR') {
        setError({ type: 'validation', message: err.message });
      } else {
        setError({ type: 'server', message: err.message });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="post"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="post"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <ErrorWithSolution
        visible={!!error}
        errorType={error?.type || 'server'}
        errorMessage={error?.message || ''}
        onClose={() => setError(null)}
        onRetry={error?.type === 'credits' ? undefined : handlePublish}
      />
    </SafeAreaView>
  );
}
```

### 5. Profile Screen (`app/(tabs)/profile.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, InactivityDetector } from '@/components/guidance';

export default function ProfileScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="profile"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="profile"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <InactivityDetector
        screenName="profile"
        onHelpRequested={() => setShowHelp(true)}
        enabled={true}
      />
    </SafeAreaView>
  );
}
```

### 6. Favorites Screen (`app/favorites.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp } from '@/components/guidance';

export default function FavoritesScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="favorites"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="favorites"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </SafeAreaView>
  );
}
```

### 7. Notifications Screen (`app/notifications.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp } from '@/components/guidance';

export default function NotificationsScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="notifications"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="notifications"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </SafeAreaView>
  );
}
```

### 8. Seller Dashboard (`app/seller-dashboard.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp, InactivityDetector } from '@/components/guidance';

export default function SellerDashboardScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="seller-dashboard"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="seller-dashboard"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <InactivityDetector
        screenName="seller-dashboard"
        onHelpRequested={() => setShowHelp(true)}
        enabled={true}
      />
    </SafeAreaView>
  );
}
```

### 9. Settings Screen (`app/settings.tsx`)

```tsx
import { useState } from 'react';
import { HelpButton, ContextualHelp } from '@/components/guidance';

export default function SettingsScreen() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your existing content */}
      
      <HelpButton
        screenName="settings"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="settings"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </SafeAreaView>
  );
}
```

## 🔧 Error Handling Patterns

### Network Errors
```tsx
try {
  await fetchData();
} catch (err: any) {
  if (err.message.includes('network') || err.code === 'NETWORK_ERROR') {
    setError({ type: 'network', message: err.message });
  }
}
```

### Upload Errors
```tsx
try {
  await uploadImage(file);
} catch (err: any) {
  if (err.code === 'FILE_TOO_LARGE' || err.code === 'INVALID_FORMAT') {
    setError({ type: 'upload', message: err.message });
  }
}
```

### Authentication Errors
```tsx
try {
  await login(credentials);
} catch (err: any) {
  if (err.code === 'INVALID_CREDENTIALS' || err.code === 'AUTH_FAILED') {
    setError({ type: 'auth', message: err.message });
  }
}
```

### Validation Errors
```tsx
try {
  await submitForm(data);
} catch (err: any) {
  if (err.code === 'VALIDATION_ERROR') {
    setError({ type: 'validation', message: err.message });
  }
}
```

### Credit Errors
```tsx
try {
  await publishListing(listing);
} catch (err: any) {
  if (err.code === 'INSUFFICIENT_CREDITS') {
    setError({ type: 'credits', message: err.message });
  }
}
```

### Permission Errors
```tsx
try {
  await requestCameraPermission();
} catch (err: any) {
  if (err.code === 'PERMISSION_DENIED') {
    setError({ type: 'permission', message: err.message });
  }
}
```

## 🎨 Styling Tips

### Help Button Position
The help button is positioned absolutely at bottom-right. Make sure your screen has enough padding:

```tsx
<View style={{ flex: 1, paddingBottom: 100 }}>
  {/* Content */}
</View>

<HelpButton ... />
```

### Avoiding Overlaps
If you have other floating buttons, adjust the help button position:

```tsx
// In your screen styles
const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 100, // Space for help button
  },
});
```

### Modal Backdrop
The contextual help and error modals have semi-transparent backdrops. They work well with any screen background.

## 🧪 Testing Checklist

For each screen you integrate:

- [ ] Help button appears in bottom-right corner
- [ ] Help button opens contextual help modal
- [ ] Contextual help shows correct content for screen
- [ ] Inactivity detector triggers after 30 seconds
- [ ] Inactivity prompt opens help when "Get Help" is clicked
- [ ] Inactivity prompt dismisses when "No, thanks" is clicked
- [ ] Error modal shows with correct error type
- [ ] Error solutions are relevant and helpful
- [ ] Retry button works (if applicable)
- [ ] All text is in correct language (FR/EN)
- [ ] Components work with screen reader
- [ ] Animations are smooth

## 📊 Priority Order

Integrate in this order for maximum impact:

1. **High Priority** (Most used screens):
   - Home screen
   - Listing detail screen
   - Chat screen
   - Post/Create listing screen

2. **Medium Priority**:
   - Profile screen
   - Seller dashboard
   - Favorites screen

3. **Low Priority**:
   - Notifications screen
   - Settings screen

## 🚨 Common Issues

### Help button not visible
- Check z-index of other components
- Ensure SafeAreaView is used
- Verify component is rendered after content

### Inactivity detector not working
- Check that `enabled` prop is true
- Verify guidance level is not 'off'
- Ensure component is mounted

### Wrong language displayed
- Check GuidanceContext is set up
- Verify language in guidance state
- Ensure i18n is configured

## 📞 Support

If you encounter issues:
1. Check the README: `components/guidance/ContextualHelpSystem.README.md`
2. Review examples: `components/guidance/ContextualHelpSystem.example.tsx`
3. Check diagnostics: Run `getDiagnostics` on your files
4. Contact the development team

## ✅ Completion Criteria

A screen is fully integrated when:
- ✅ Help button is visible and functional
- ✅ Contextual help shows relevant content
- ✅ Inactivity detection works (if enabled)
- ✅ Errors show helpful solutions
- ✅ All components respect guidance settings
- ✅ Everything works in both languages
- ✅ Accessibility is maintained

