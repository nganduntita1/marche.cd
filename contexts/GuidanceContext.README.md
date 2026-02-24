# Guidance Context - Core Infrastructure

This document describes the core guidance infrastructure that has been set up for the Smart User Guidance System.

## Overview

The guidance system provides contextual help and onboarding throughout the Marché CD app. It consists of:

1. **Type Definitions** (`types/guidance.ts`) - TypeScript interfaces for all guidance-related data
2. **Storage Service** (`services/guidanceStorage.ts`) - Persistent storage using AsyncStorage
3. **Context Provider** (`contexts/GuidanceContext.tsx`) - React Context for state management

## Architecture

```
GuidanceProvider (React Context)
    ↓
GuidanceStorageService (AsyncStorage)
    ↓
AsyncStorage (Device Storage)
```

## Usage

### 1. Add GuidanceProvider to your app

In `app/_layout.tsx`, wrap your app with the GuidanceProvider:

```tsx
import { GuidanceProvider } from '@/contexts/GuidanceContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <MessagesProvider>
                <GuidanceProvider>  {/* Add this */}
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Your screens */}
                  </Stack>
                </GuidanceProvider>
              </MessagesProvider>
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
```

### 2. Use the guidance context in your components

```tsx
import { useGuidance } from '@/contexts/GuidanceContext';

function MyScreen() {
  const guidance = useGuidance();
  
  useEffect(() => {
    // Track screen view
    guidance.incrementScreenView('MyScreen');
    
    // Check if we should show a tour
    if (guidance.shouldShowTour('my_screen_tour')) {
      // Show tour...
    }
  }, []);
  
  const handleTourComplete = async () => {
    await guidance.markTourCompleted('my_screen_tour');
  };
  
  return (
    <View>
      {/* Your screen content */}
    </View>
  );
}
```

## API Reference

### State Management Methods

- `markTourCompleted(tourId: string)` - Mark a guided tour as completed
- `markTooltipDismissed(tooltipId: string)` - Mark a tooltip as dismissed
- `markActionCompleted(actionId: string)` - Mark a user action as completed
- `incrementScreenView(screenName: string)` - Increment the view count for a screen

### Query Methods

- `shouldShowTour(tourId: string)` - Check if a tour should be displayed
- `shouldShowTooltip(tooltipId: string)` - Check if a tooltip should be displayed
- `shouldShowPrompt(promptId: string, context?)` - Check if a prompt should be displayed

### Content Methods (Placeholders)

- `getTooltipContent(tooltipId: string)` - Get tooltip content (to be implemented)
- `getMessageTemplates(context: string)` - Get message templates (to be implemented)
- `getQuickActions(screenName: string, context?)` - Get quick actions (to be implemented)

### Settings Methods

- `setGuidanceLevel(level: 'full' | 'minimal' | 'off')` - Set guidance level
- `resetGuidance(tourId?: string)` - Reset all guidance or a specific tour

## State Schema

The guidance state includes:

- **Progress Tracking**: Completed tours, dismissed tooltips, viewed screens, completed actions
- **Milestones**: Registration date, first listing view, first message, etc.
- **Feature Flags**: Has seen landing page, completed auth, posted first listing, etc.
- **Settings**: Guidance level, language, show animations
- **Session Info**: Session count, last active date, app version

## Storage

All state is persisted to AsyncStorage under the key `@marche_cd:guidance_state`.

The storage service handles:
- Loading and saving state
- Partial updates
- Batch updates (atomic operations)
- State migration between versions
- Error recovery with fallback to default state

## Next Steps

The following components will be built on top of this infrastructure:

1. **GuidanceContentService** - Manage guidance content and localization
2. **TriggerEvaluationEngine** - Determine when to show guidance
3. **UI Components** - Tooltip, Tour, Prompt, etc.
4. **Screen-specific Guidance** - Landing, Auth, Home, Listing, etc.

## Requirements Satisfied

This implementation satisfies the following requirements:

- **15.1**: Store completed tours and dismissed tooltips in AsyncStorage
- **15.2**: Load guidance state and only show new/relevant tips
- **18.4**: Batch writes to AsyncStorage to minimize I/O operations
