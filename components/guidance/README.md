# Guidance UI Components

This directory contains the base UI components for the Smart User Guidance System.

## Components

### 1. Tooltip
A positioned tooltip that appears near UI elements to explain their purpose.

**Features:**
- Smart positioning (top, bottom, left, right)
- Arrow indicator pointing to target element
- Smooth fade and scale animations
- Optional action button
- Automatic boundary detection

**Usage:**
```tsx
import { Tooltip } from './components/guidance';
import { useGuidance } from './contexts/GuidanceContext';

const MyComponent = () => {
  const { getTooltipContent, shouldShowTooltip, markTooltipDismissed } = useGuidance();
  const targetRef = useRef<View>(null);
  
  const tooltipContent = getTooltipContent('search_tooltip');
  const visible = shouldShowTooltip('search_tooltip');
  
  return (
    <>
      <View ref={targetRef}>
        <TextInput placeholder="Search..." />
      </View>
      
      {tooltipContent && (
        <Tooltip
          content={tooltipContent}
          targetRef={targetRef}
          visible={visible}
          onDismiss={() => markTooltipDismissed('search_tooltip')}
          onAction={() => {
            // Optional action
          }}
        />
      )}
    </>
  );
};
```

### 2. GuidedTour
An interactive walkthrough that highlights UI elements in sequence.

**Features:**
- Multi-step tour with progress indicator
- Overlay with optional highlight areas
- Step navigation (next, previous, skip)
- Smooth transitions between steps
- Configurable positioning (top, bottom, center)

**Usage:**
```tsx
import { GuidedTour } from './components/guidance';
import { useGuidance } from './contexts/GuidanceContext';

const MyScreen = () => {
  const { shouldShowTour, markTourCompleted } = useGuidance();
  const visible = shouldShowTour('home_tour');
  
  const tour = {
    id: 'home_tour',
    name: 'Home Screen Tour',
    steps: [
      {
        id: 'step1',
        title: 'Welcome!',
        message: 'Let me show you around...',
        placement: 'center',
        showOverlay: true,
        nextLabel: 'Next',
        skipLabel: 'Skip Tour',
      },
      // More steps...
    ],
    triggerCondition: { type: 'first_visit', params: {} },
  };
  
  return (
    <>
      {/* Your screen content */}
      
      <GuidedTour
        tour={tour}
        visible={visible}
        onComplete={() => markTourCompleted('home_tour')}
        onSkip={() => markTourCompleted('home_tour')}
      />
    </>
  );
};
```

### 3. ContextualPrompt
A timely suggestion that appears based on user actions or inactions.

**Features:**
- Slides in from top with smooth animation
- Icon support for visual context
- Multiple action buttons
- Primary/secondary button styling
- Dismissible

**Usage:**
```tsx
import { ContextualPrompt } from './components/guidance';

const MyComponent = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  
  return (
    <ContextualPrompt
      message="You haven't added any photos yet. Add at least 3 photos to attract buyers!"
      icon="camera-outline"
      visible={showPrompt}
      onDismiss={() => setShowPrompt(false)}
      actions={[
        {
          label: 'Add Photos',
          primary: true,
          onPress: () => {
            // Navigate to photo picker
          },
        },
        {
          label: 'Later',
          onPress: () => {
            // Dismiss
          },
        },
      ]}
    />
  );
};
```

### 4. HelpButton
A floating action button that provides access to contextual help.

**Features:**
- Floating action button (FAB) design
- Pulse animation to draw attention
- Smooth scale in/out animations
- Accessibility support
- Screen-specific help context

**Usage:**
```tsx
import { HelpButton } from './components/guidance';

const MyScreen = () => {
  const handleHelpPress = () => {
    // Show help modal or navigate to help screen
    navigation.navigate('HelpCenter', { screen: 'home' });
  };
  
  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      <HelpButton
        screenName="home"
        onPress={handleHelpPress}
        visible={true}
      />
    </View>
  );
};
```

## Animation Details

All components use React Native's Animated API for smooth, performant animations:

- **Tooltip**: Fade + scale animations (200ms)
- **GuidedTour**: Fade + scale with step transitions (300ms)
- **ContextualPrompt**: Slide from top + fade (200ms)
- **HelpButton**: Scale in + pulse loop (1000ms cycle)

## Styling

Components use the centralized design system:
- **Colors**: From `constants/Colors.ts`
- **Typography**: From `constants/Typography.ts`
- **Shadows**: Platform-specific (iOS shadowColor, Android elevation)

## Accessibility

All components include:
- Proper accessibility labels and hints
- Screen reader support
- Sufficient touch target sizes (44x44pt minimum)
- High contrast text and backgrounds

## Requirements Validation

These components satisfy the following requirements:
- **Requirement 1.2**: Landing page guidance with tooltips
- **Requirement 2.1**: Authentication guided tour
- **Requirement 3.2**: Home screen tour with highlights
- **Requirement 13.1**: Contextual help system with help button

## Next Steps

To integrate these components into the app:
1. Import components where needed
2. Use `useGuidance()` hook to access guidance state
3. Define content in `services/guidanceContent.ts`
4. Configure triggers in `services/triggerEvaluation.ts`
