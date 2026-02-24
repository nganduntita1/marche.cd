# Contextual Help System

A comprehensive help system that provides context-specific assistance, inactivity detection, error handling with solutions, and a searchable help center.

## Features

### 1. **Context-Specific Help** (`ContextualHelp`)
- Provides tailored help content for each screen
- Includes tips, common issues, and solutions
- Supports English and French
- Smooth slide-up animation
- Links to full help center

### 2. **Inactivity Detection** (`InactivityDetector`)
- Automatically detects when users are inactive
- Configurable threshold (default: 30 seconds)
- Shows friendly prompt offering assistance
- Respects guidance level settings
- Auto-resets on user interaction

### 3. **Error Handling** (`ErrorWithSolution`)
- Displays errors with actionable solutions
- Provides step-by-step troubleshooting
- Includes retry functionality
- Supports multiple error types
- Bilingual support (EN/FR)

### 4. **Enhanced Help Center**
- Searchable FAQ database
- Categorized questions
- Expandable answers
- Real-time search filtering
- Support contact integration

## Components

### ContextualHelp

Modal component that displays context-specific help content.

```tsx
import { ContextualHelp } from '@/components/guidance';

<ContextualHelp
  screenName="home"
  visible={showHelp}
  onClose={() => setShowHelp(false)}
/>
```

**Props:**
- `screenName` (string): Name of the current screen
- `visible` (boolean): Whether the modal is visible
- `onClose` (function): Callback when modal is closed

**Available Screens:**
- `home` - Home screen help
- `listing` - Listing details help
- `chat` - Messaging help
- `post` - Create listing help
- `profile` - Profile management help
- `favorites` - Favorites help
- `notifications` - Notifications help
- `seller-dashboard` - Seller dashboard help
- `settings` - Settings help

### InactivityDetector

Component that detects user inactivity and offers help.

```tsx
import { InactivityDetector } from '@/components/guidance';

<InactivityDetector
  screenName="home"
  inactivityThreshold={30000}
  onHelpRequested={() => setShowHelp(true)}
  enabled={true}
/>
```

**Props:**
- `screenName` (string): Name of the current screen
- `inactivityThreshold` (number): Time in ms before showing prompt (default: 30000)
- `onHelpRequested` (function): Callback when user requests help
- `enabled` (boolean): Whether detection is active (default: true)

**Behavior:**
- Starts timer on mount
- Resets on any user interaction
- Shows prompt after threshold
- Respects guidance level settings
- Dismissible by user

### ErrorWithSolution

Modal component that displays errors with solutions.

```tsx
import { ErrorWithSolution } from '@/components/guidance';

<ErrorWithSolution
  visible={showError}
  errorType="network"
  errorMessage="Connection failed"
  onClose={() => setShowError(false)}
  onRetry={handleRetry}
  language="fr"
/>
```

**Props:**
- `visible` (boolean): Whether the modal is visible
- `errorType` (string): Type of error (see below)
- `errorMessage` (string): Custom error message
- `onClose` (function): Callback when modal is closed
- `onRetry` (function, optional): Callback for retry action
- `language` ('en' | 'fr'): Display language (default: 'fr')

**Error Types:**
- `network` - Connection issues
- `upload` - File upload problems
- `auth` - Authentication failures
- `validation` - Form validation errors
- `credits` - Insufficient credits
- `permission` - Missing device permissions
- `server` - Server-side errors
- `notfound` - Resource not found

### Enhanced Help Center

The help center screen now includes:
- **Search functionality** - Real-time filtering of FAQs
- **Categorization** - Questions grouped by topic
- **Expandable answers** - Tap to expand/collapse
- **Bilingual support** - English and French
- **Support contact** - Easy access to support

## Integration Guide

### Step 1: Add Help Button

Add a floating help button to your screen:

```tsx
import { HelpButton } from '@/components/guidance';

const [showHelp, setShowHelp] = useState(false);

<HelpButton
  screenName="your-screen"
  onPress={() => setShowHelp(true)}
  visible={true}
/>
```

### Step 2: Add Contextual Help

Add the contextual help modal:

```tsx
import { ContextualHelp } from '@/components/guidance';

<ContextualHelp
  screenName="home"
  visible={showHelp}
  onClose={() => setShowHelp(false)}
/>
```

### Step 3: Add Inactivity Detection

Add inactivity detection:

```tsx
import { InactivityDetector } from '@/components/guidance';

<InactivityDetector
  screenName="your-screen"
  inactivityThreshold={30000}
  onHelpRequested={() => setShowHelp(true)}
  enabled={!loading}
/>
```

### Step 4: Add Error Handling

Replace error alerts with solution-based errors:

```tsx
import { ErrorWithSolution } from '@/components/guidance';

const [error, setError] = useState<{type: string; message: string} | null>(null);

try {
  await someOperation();
} catch (err: any) {
  setError({ type: 'network', message: err.message });
}

<ErrorWithSolution
  visible={!!error}
  errorType={error?.type || 'server'}
  errorMessage={error?.message || ''}
  onClose={() => setError(null)}
  onRetry={handleRetry}
/>
```

## Complete Example

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HelpButton,
  ContextualHelp,
  InactivityDetector,
  ErrorWithSolution,
} from '@/components/guidance';

export default function MyScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  const handleAction = async () => {
    try {
      await performAction();
    } catch (err) {
      setError({ type: 'network', message: err.message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text>My Screen Content</Text>
        <TouchableOpacity onPress={handleAction}>
          <Text>Perform Action</Text>
        </TouchableOpacity>
      </View>

      {/* Help System */}
      <HelpButton
        screenName="my-screen"
        onPress={() => setShowHelp(true)}
      />

      <ContextualHelp
        screenName="home"
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <InactivityDetector
        screenName="my-screen"
        onHelpRequested={() => setShowHelp(true)}
        enabled={true}
      />

      <ErrorWithSolution
        visible={!!error}
        errorType={error?.type || 'server'}
        errorMessage={error?.message || ''}
        onClose={() => setError(null)}
        onRetry={handleAction}
      />
    </SafeAreaView>
  );
}
```

## Best Practices

### 1. Help Button Placement
- Always place at bottom-right corner
- Don't overlap with other floating buttons
- Hide during modals or full-screen overlays
- Maintain consistent positioning across screens

### 2. Inactivity Detection
- Disable during loading states
- Disable when user is actively typing
- Adjust threshold based on screen complexity
- Don't show on screens with auto-refresh

### 3. Error Handling
- Always provide retry option when possible
- Use specific error types for better solutions
- Include custom messages for context
- Log errors for debugging

### 4. Contextual Help
- Keep content concise and actionable
- Update help content when screen changes
- Link to full help center for details
- Test help content with real users

### 5. Performance
- Disable inactivity detection during heavy operations
- Use React.memo for optimization
- Lazy load help content
- Minimize re-renders

## Accessibility

All components are fully accessible:
- ✅ Screen reader compatible
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ High contrast mode support
- ✅ Focus management
- ✅ Reduced motion support

## Localization

All components support English and French:
- Automatic language detection from GuidanceContext
- Fallback to French if language not detected
- Consistent translations across components
- Easy to add new languages

## Testing

### Unit Tests
```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { ContextualHelp } from './ContextualHelp';

test('shows help content', () => {
  const { getByText } = render(
    <ContextualHelp
      screenName="home"
      visible={true}
      onClose={() => {}}
    />
  );
  expect(getByText('Home Screen Help')).toBeTruthy();
});
```

### Integration Tests
```tsx
test('inactivity detector shows prompt', async () => {
  jest.useFakeTimers();
  const onHelp = jest.fn();
  
  render(
    <InactivityDetector
      screenName="test"
      inactivityThreshold={1000}
      onHelpRequested={onHelp}
    />
  );
  
  jest.advanceTimersByTime(1000);
  expect(onHelp).toHaveBeenCalled();
});
```

## Troubleshooting

### Help button not showing
- Check that `visible` prop is true
- Verify z-index is not being overridden
- Ensure component is rendered after content

### Inactivity detector not working
- Verify `enabled` prop is true
- Check guidance level is not 'off'
- Ensure threshold is reasonable (>= 5000ms)

### Error solutions not displaying
- Verify error type is valid
- Check that `visible` prop is true
- Ensure language is set correctly

### Help content not in correct language
- Check GuidanceContext is properly set up
- Verify language setting in guidance state
- Ensure i18n is configured correctly

## Future Enhancements

- [ ] Video tutorials integration
- [ ] Interactive walkthroughs
- [ ] AI-powered help suggestions
- [ ] Analytics tracking
- [ ] A/B testing support
- [ ] Custom help content per user segment
- [ ] Offline help content caching
- [ ] Voice-guided help

## Requirements Validation

This implementation satisfies the following requirements:

✅ **13.1** - Help icon on all major screens (HelpButton)
✅ **13.2** - Context-specific help content (ContextualHelp)
✅ **13.3** - Error messages with solutions (ErrorWithSolution)
✅ **13.4** - Inactivity detection (InactivityDetector)
✅ **13.5** - Help center with FAQ and search (Enhanced help-center.tsx)

## Support

For questions or issues:
- Check the example file: `ContextualHelpSystem.example.tsx`
- Review the integration guide above
- Contact the development team

