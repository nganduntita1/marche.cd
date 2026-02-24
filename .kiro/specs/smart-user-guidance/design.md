# Design Document: Smart User Guidance System

## Overview

The Smart User Guidance System is a comprehensive, rule-based onboarding and contextual help feature that guides users through every aspect of the Marché CD marketplace application. Unlike AI-powered assistants that require expensive API calls, this system uses intelligent state management, contextual triggers, and pre-defined content to provide personalized guidance at zero marginal cost per user.

The system is designed specifically for users with lower technical literacy, providing step-by-step walkthroughs, visual cues, message templates, and contextual prompts throughout the entire user journey—from landing page discovery through successful transactions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Screens: Landing, Auth, Home, Listing, Chat, Post, etc.)  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  GuidanceContext (Provider)                  │
│  - User guidance state management                            │
│  - Trigger evaluation engine                                 │
│  - Content delivery orchestration                            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Guidance   │ │   Guidance   │ │   Guidance   │
│   Storage    │ │   Content    │ │  Components  │
│   Service    │ │   Service    │ │   Library    │
└──────────────┘ └──────────────┘ └──────────────┘
     │                  │                  │
     ↓                  ↓                  ↓
AsyncStorage      i18n Locales      UI Components
(Persistence)     (Translations)    (Tooltips, Tours)
```

### Context Integration

The Guidance System integrates with existing app contexts:

```typescript
<AuthProvider>
  <LocationProvider>
    <NotificationProvider>
      <MessagesProvider>
        <GuidanceProvider>  ← New Context
          <App />
        </GuidanceProvider>
      </MessagesProvider>
    </NotificationProvider>
  </LocationProvider>
</AuthProvider>
```

## Components and Interfaces

### 1. GuidanceContext

The central state management system for all guidance functionality.

```typescript
interface GuidanceState {
  // User progress tracking
  completedTours: string[];
  dismissedTooltips: string[];
  viewedScreens: Record<string, number>; // screen: view count
  completedActions: string[];
  
  // Feature-specific state
  hasSeenLandingPage: boolean;
  hasCompletedAuth: boolean;
  hasViewedFirstListing: boolean;
  hasPostedFirstListing: boolean;
  hasSentFirstMessage: boolean;
  profileCompleteness: number; // 0-100
  
  // Settings
  guidanceLevel: 'full' | 'minimal' | 'off';
  language: 'en' | 'fr';
  
  // Session tracking
  sessionCount: number;
  lastActiveDate: string;
  appVersion: string;
}

interface GuidanceContextType {
  state: GuidanceState;
  
  // State management
  markTourCompleted: (tourId: string) => Promise<void>;
  markTooltipDismissed: (tooltipId: string) => Promise<void>;
  markActionCompleted: (actionId: string) => Promise<void>;
  incrementScreenView: (screenName: string) => Promise<void>;
  
  // Guidance queries
  shouldShowTour: (tourId: string) => boolean;
  shouldShowTooltip: (tooltipId: string) => boolean;
  shouldShowPrompt: (promptId: string, context?: any) => boolean;
  
  // Content retrieval
  getTooltipContent: (tooltipId: string) => TooltipContent | null;
  getMessageTemplates: (context: string) => MessageTemplate[];
  getQuickActions: (screenName: string, context?: any) => QuickAction[];
  
  // Settings
  setGuidanceLevel: (level: 'full' | 'minimal' | 'off') => Promise<void>;
  resetGuidance: (tourId?: string) => Promise<void>;
}
```

### 2. GuidanceStorageService

Handles persistence of guidance state to AsyncStorage.

```typescript
interface GuidanceStorageService {
  // Load/Save operations
  loadState: () => Promise<GuidanceState>;
  saveState: (state: GuidanceState) => Promise<void>;
  updatePartialState: (updates: Partial<GuidanceState>) => Promise<void>;
  
  // Batch operations for performance
  batchUpdate: (updates: Array<Partial<GuidanceState>>) => Promise<void>;
  
  // Migration support
  migrateState: (oldVersion: string, newVersion: string) => Promise<void>;
  
  // Reset operations
  clearState: () => Promise<void>;
  resetTour: (tourId: string) => Promise<void>;
}
```

### 3. GuidanceContentService

Manages guidance content and localization.

```typescript
interface TooltipContent {
  id: string;
  title: string;
  message: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  actionLabel?: string;
  dismissLabel?: string;
}

interface TourStep {
  id: string;
  targetElement?: string; // ref name or screen area
  title: string;
  message: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightArea?: { x: number; y: number; width: number; height: number };
  showOverlay: boolean;
  nextLabel: string;
  skipLabel?: string;
}

interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  triggerCondition: TriggerCondition;
}

interface MessageTemplate {
  id: string;
  category: 'inquiry' | 'negotiation' | 'meeting' | 'thanks';
  text: string;
  variables?: string[]; // e.g., ['item_name', 'price']
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  priority: number;
}

interface GuidanceContentService {
  // Content retrieval
  getTooltip: (id: string, language: string) => TooltipContent;
  getTour: (id: string, language: string) => Tour;
  getMessageTemplates: (context: string, language: string) => MessageTemplate[];
  getQuickActions: (screen: string, context: any, language: string) => QuickAction[];
  
  // Dynamic content generation
  generateContextualPrompt: (screen: string, userState: GuidanceState) => string | null;
  getSafetyTip: (context: 'chat' | 'meeting' | 'payment', language: string) => string;
}
```

### 4. TriggerEvaluationEngine

Determines when to show guidance based on user state and context.

```typescript
interface TriggerCondition {
  type: 'first_visit' | 'nth_visit' | 'time_based' | 'action_based' | 'state_based';
  params: Record<string, any>;
}

interface TriggerEvaluationEngine {
  // Evaluation methods
  shouldTrigger: (condition: TriggerCondition, state: GuidanceState, context?: any) => boolean;
  
  // Specific trigger checks
  isFirstVisit: (screenName: string, state: GuidanceState) => boolean;
  hasBeenInactive: (duration: number, state: GuidanceState) => boolean;
  hasCompletedAction: (actionId: string, state: GuidanceState) => boolean;
  meetsStateRequirement: (requirement: any, state: GuidanceState) => boolean;
}
```

### 5. UI Components Library

Reusable components for displaying guidance.

```typescript
// Tooltip Component
interface TooltipProps {
  content: TooltipContent;
  targetRef?: React.RefObject<any>;
  visible: boolean;
  onDismiss: () => void;
  onAction?: () => void;
}

// Guided Tour Component
interface GuidedTourProps {
  tour: Tour;
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// Contextual Prompt Component
interface ContextualPromptProps {
  message: string;
  actions: Array<{ label: string; onPress: () => void }>;
  visible: boolean;
  onDismiss: () => void;
  icon?: string;
}

// Message Template Picker
interface MessageTemplatePickerProps {
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  visible: boolean;
  onDismiss: () => void;
}

// Progress Indicator
interface ProgressIndicatorProps {
  steps: Array<{ id: string; label: string; completed: boolean }>;
  currentStep: number;
}

// Quick Action Card
interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
}

// Help Button (floating action button)
interface HelpButtonProps {
  screenName: string;
  onPress: () => void;
}
```

## Data Models

### GuidanceState Schema

```typescript
interface GuidanceState {
  // Version for migration support
  version: string;
  
  // User identification (for analytics, not auth)
  installId: string;
  
  // Progress tracking
  completedTours: string[]; // ['landing_tour', 'auth_tour', 'home_tour']
  dismissedTooltips: string[]; // ['search_tooltip', 'filter_tooltip']
  viewedScreens: {
    [screenName: string]: number; // view count
  };
  completedActions: string[]; // ['first_listing_view', 'first_message_sent']
  
  // Milestones
  milestones: {
    registrationDate: string | null;
    firstListingViewDate: string | null;
    firstMessageSentDate: string | null;
    firstListingPostedDate: string | null;
    firstSaleDate: string | null;
  };
  
  // Feature-specific flags
  features: {
    hasSeenLandingPage: boolean;
    hasCompletedAuth: boolean;
    hasCompletedProfile: boolean;
    hasViewedFirstListing: boolean;
    hasPostedFirstListing: boolean;
    hasSentFirstMessage: boolean;
    hasUsedSearch: boolean;
    hasUsedFilters: boolean;
    hasSavedFavorite: boolean;
    hasReceivedRating: boolean;
  };
  
  // Profile completeness
  profileCompleteness: number; // 0-100
  
  // Settings
  settings: {
    guidanceLevel: 'full' | 'minimal' | 'off';
    language: 'en' | 'fr';
    showAnimations: boolean;
  };
  
  // Session tracking
  sessionCount: number;
  lastActiveDate: string;
  appVersion: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### Content Definition Schema

```typescript
interface GuidanceContent {
  tooltips: {
    [id: string]: {
      en: TooltipContent;
      fr: TooltipContent;
    };
  };
  
  tours: {
    [id: string]: {
      en: Tour;
      fr: Tour;
    };
  };
  
  messageTemplates: {
    [context: string]: {
      en: MessageTemplate[];
      fr: MessageTemplate[];
    };
  };
  
  quickActions: {
    [screen: string]: {
      en: QuickAction[];
      fr: QuickAction[];
    };
  };
  
  safetyTips: {
    [context: string]: {
      en: string[];
      fr: string[];
    };
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: State Persistence Consistency
*For any* guidance state update, saving then loading the state should return an equivalent state object.
**Validates: Requirements 15.1, 15.2**

### Property 2: Tour Completion Idempotence
*For any* completed tour, marking it as completed multiple times should result in the same state as marking it once.
**Validates: Requirements 15.1**

### Property 3: Tooltip Dismissal Prevents Re-display
*For any* dismissed tooltip, the system should not show that tooltip again unless explicitly reset.
**Validates: Requirements 15.2**

### Property 4: Guidance Level Filtering
*For any* guidance level setting, only guidance items matching that level's criteria should be displayed.
**Validates: Requirements 17.1, 17.2, 17.3**

### Property 5: Language Consistency
*For any* language change, all visible guidance content should update to the new language within one render cycle.
**Validates: Requirements 16.3**

### Property 6: First Visit Detection Accuracy
*For any* screen, the first visit detection should return true exactly once per screen unless state is reset.
**Validates: Requirements 3.1, 4.1, 5.1**

### Property 7: Profile Completeness Calculation
*For any* user profile state, the completeness percentage should be between 0 and 100 and accurately reflect the proportion of completed fields.
**Validates: Requirements 7.1, 7.2**

### Property 8: Message Template Variable Substitution
*For any* message template with variables, substituting all variables should produce a string containing no placeholder markers.
**Validates: Requirements 5.2, 5.3**

### Property 9: Trigger Condition Evaluation Determinism
*For any* trigger condition and guidance state, evaluating the condition multiple times with the same inputs should return the same result.
**Validates: Requirements 3.4, 4.3, 5.4**

### Property 10: AsyncStorage Batch Update Atomicity
*For any* batch of state updates, either all updates should be persisted or none should be persisted (no partial updates).
**Validates: Requirements 18.4**

### Property 11: Tour Step Sequence Integrity
*For any* guided tour, the steps should be displayed in the defined order and all steps should be shown before completion.
**Validates: Requirements 2.1, 3.2**

### Property 12: Contextual Prompt Relevance
*For any* screen and user state, generated contextual prompts should be relevant to the current screen and not repeat recently dismissed prompts.
**Validates: Requirements 13.3, 15.2**

### Property 13: Safety Tip Trigger Accuracy
*For any* chat message containing contact information (phone, address), a safety reminder should be triggered.
**Validates: Requirements 12.1, 12.2**

### Property 14: Performance Constraint Compliance
*For any* tooltip or overlay render operation, the operation should complete within 100 milliseconds on standard devices.
**Validates: Requirements 18.1**

### Property 15: State Migration Preservation
*For any* state migration from version N to version N+1, all user progress data should be preserved and accessible in the new format.
**Validates: Requirements 15.4**

## Error Handling

### Error Categories

1. **Storage Errors**
   - AsyncStorage read/write failures
   - Quota exceeded errors
   - Corrupted state data

2. **Content Errors**
   - Missing translation keys
   - Invalid content references
   - Malformed content structure

3. **Rendering Errors**
   - Component mount failures
   - Animation errors
   - Layout calculation failures

4. **State Errors**
   - Invalid state transitions
   - Concurrent modification conflicts
   - State corruption

### Error Handling Strategies

```typescript
interface ErrorHandler {
  // Storage error recovery
  handleStorageError: (error: Error) => {
    // Attempt to recover from backup
    // Fall back to default state if recovery fails
    // Log error for analytics
    // Continue app operation gracefully
  };
  
  // Content error recovery
  handleContentError: (contentId: string, error: Error) => {
    // Fall back to English if translation missing
    // Use default content if specific content unavailable
    // Log missing content for future addition
    // Don't block user flow
  };
  
  // Rendering error recovery
  handleRenderError: (componentName: string, error: Error) => {
    // Catch errors in error boundary
    // Hide problematic guidance component
    // Log error for debugging
    // Allow app to continue functioning
  };
  
  // State error recovery
  handleStateError: (operation: string, error: Error) => {
    // Validate state before operations
    // Use transactions for critical updates
    // Implement retry logic with exponential backoff
    // Provide user feedback only for critical failures
  };
}
```

### Graceful Degradation

The system is designed to degrade gracefully:

1. **Full Functionality** (Normal operation)
   - All tours, tooltips, and prompts work
   - Animations and transitions smooth
   - State persists correctly

2. **Reduced Functionality** (Minor errors)
   - Some animations disabled
   - Fallback to default content
   - Reduced prompt frequency

3. **Minimal Functionality** (Major errors)
   - Only critical safety warnings shown
   - No tours or tooltips
   - Help button still accessible

4. **Disabled** (Critical errors)
   - Guidance system completely disabled
   - App functions normally without guidance
   - Error logged for investigation

## Testing Strategy

### Unit Testing

Unit tests will verify individual components and functions:

1. **State Management Tests**
   - Test state updates and persistence
   - Verify state loading and migration
   - Test concurrent update handling

2. **Content Service Tests**
   - Test content retrieval for all languages
   - Verify template variable substitution
   - Test missing content fallbacks

3. **Trigger Engine Tests**
   - Test all trigger condition types
   - Verify trigger evaluation logic
   - Test edge cases and boundary conditions

4. **Component Tests**
   - Test tooltip rendering and positioning
   - Verify tour step navigation
   - Test prompt display and dismissal

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript/TypeScript property testing library):

- Each property-based test will run a minimum of 100 iterations
- Tests will generate random guidance states, content, and user interactions
- Each test will be tagged with the format: `**Feature: smart-user-guidance, Property {number}: {property_text}**`

### Integration Testing

Integration tests will verify the system works correctly with the rest of the app:

1. **Context Integration**
   - Test GuidanceProvider with other contexts
   - Verify state synchronization
   - Test cross-context interactions

2. **Screen Integration**
   - Test guidance on each major screen
   - Verify navigation doesn't break guidance
   - Test guidance across screen transitions

3. **User Flow Testing**
   - Test complete onboarding flow
   - Verify guidance appears at correct times
   - Test guidance dismissal and completion

### Performance Testing

Performance tests will ensure the system meets requirements:

1. **Render Performance**
   - Measure tooltip render time (target: <100ms)
   - Measure tour overlay render time
   - Test animation frame rates (target: 60fps)

2. **Storage Performance**
   - Measure state load time (target: <50ms)
   - Measure state save time
   - Test batch update performance

3. **Memory Usage**
   - Monitor memory consumption
   - Test for memory leaks
   - Verify cleanup on unmount

### Testing Framework Configuration

```typescript
// Jest configuration for unit tests
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)',
  ],
  collectCoverageFrom: [
    'contexts/GuidanceContext.tsx',
    'services/guidanceStorage.ts',
    'services/guidanceContent.ts',
    'components/guidance/**/*.tsx',
  ],
};

// fast-check configuration for property tests
import fc from 'fast-check';

// Configure to run 100 iterations minimum
const fcConfig = { numRuns: 100 };
```

## Implementation Notes

### Phase 1: Core Infrastructure
- Implement GuidanceContext and state management
- Create GuidanceStorageService with AsyncStorage
- Build basic UI components (Tooltip, Tour)
- Add i18n support for guidance content

### Phase 2: Landing & Auth Guidance
- Implement landing page guidance
- Add authentication flow guidance
- Create profile completion guidance
- Test onboarding flow end-to-end

### Phase 3: Main App Guidance
- Add home screen guidance
- Implement listing detail guidance
- Create messaging guidance with templates
- Add posting guidance

### Phase 4: Advanced Features
- Implement contextual prompts
- Add progress tracking and milestones
- Create quick actions system
- Add safety tip triggers

### Phase 5: Polish & Optimization
- Optimize performance
- Add analytics tracking
- Implement A/B testing support
- Create admin dashboard for content management

### Technology Stack

- **State Management**: React Context API
- **Persistence**: AsyncStorage
- **Localization**: i18n (existing system)
- **UI Components**: React Native
- **Animations**: React Native Animated API
- **Testing**: Jest + fast-check
- **Type Safety**: TypeScript

### Performance Considerations

1. **Lazy Loading**: Load guidance content on-demand
2. **Memoization**: Cache computed values and content
3. **Debouncing**: Debounce state updates to reduce writes
4. **Batching**: Batch AsyncStorage operations
5. **Virtualization**: Use FlatList for long content lists
6. **Code Splitting**: Separate guidance code from main bundle where possible

### Accessibility

1. **Screen Reader Support**: All guidance content accessible via screen readers
2. **High Contrast**: Ensure tooltips and overlays have sufficient contrast
3. **Touch Targets**: Minimum 44x44pt touch targets for all interactive elements
4. **Focus Management**: Proper focus handling during tours
5. **Reduced Motion**: Respect system reduced motion preferences

### Security & Privacy

1. **No PII Storage**: Guidance state contains no personally identifiable information
2. **Local Only**: All guidance state stored locally, never sent to servers
3. **Analytics Opt-in**: User consent required for guidance analytics
4. **Data Minimization**: Store only necessary state information
5. **Secure Storage**: Use encrypted storage for sensitive guidance data if needed
