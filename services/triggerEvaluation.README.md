# Trigger Evaluation Engine

The `TriggerEvaluationEngine` is a service that evaluates trigger conditions to determine when guidance should be shown to users. It supports multiple trigger types and provides a flexible, rule-based system for contextual guidance.

## Features

- **First Visit Detection**: Show guidance the first time a user visits a screen
- **Nth Visit Detection**: Show guidance on a specific visit number
- **Time-Based Triggers**: Show guidance after a certain duration
- **Action-Based Triggers**: Show guidance based on user actions or counts
- **State-Based Triggers**: Show guidance based on user state or feature flags

## Usage

### Through GuidanceContext

The recommended way to use the trigger evaluation engine is through the `GuidanceContext`:

```typescript
import { useGuidance } from '../contexts/GuidanceContext';

function MyComponent() {
  const { evaluateTrigger, state } = useGuidance();
  
  const condition = {
    type: 'first_visit',
    params: { screenName: 'home' }
  };
  
  const shouldShow = evaluateTrigger(condition);
  
  return shouldShow ? <Tooltip /> : null;
}
```

### Direct Usage

You can also use the engine directly:

```typescript
import { TriggerEvaluationEngine } from '../services/triggerEvaluation';

const shouldShow = TriggerEvaluationEngine.shouldTrigger(
  condition,
  guidanceState,
  context
);
```

## Trigger Types

### 1. First Visit

Shows guidance the first time a user visits a screen.

```typescript
const condition = {
  type: 'first_visit',
  params: {
    screenName: 'home' // Required: name of the screen
  }
};
```

**Example**: Show a welcome tour when user first opens the home screen.

### 2. Nth Visit

Shows guidance on a specific visit number.

```typescript
const condition = {
  type: 'nth_visit',
  params: {
    screenName: 'listing_detail', // Required: name of the screen
    visitCount: 3 // Required: exact visit count to match
  }
};
```

**Example**: Show advanced tips on the 3rd visit to listing details.

### 3. Time-Based

Shows guidance after a certain duration has passed.

```typescript
const condition = {
  type: 'time_based',
  params: {
    duration: 10000, // Required: duration in milliseconds
    event: 'screen_enter' // Required: 'screen_enter', 'last_interaction', or 'last_active'
  }
};

// Context must include timing information
const context = {
  screenEnterTime: Date.now() - 11000, // User entered screen 11 seconds ago
  lastInteractionTime: Date.now() - 5000 // Last interaction 5 seconds ago
};
```

**Example**: Show a prompt after 10 seconds of inactivity on the home screen.

**Events**:
- `screen_enter`: Time since user entered the current screen
- `last_interaction`: Time since user's last interaction
- `last_active`: Time since user was last active in the app

### 4. Action-Based

Shows guidance based on user actions or counts.

```typescript
const condition = {
  type: 'action_based',
  params: {
    action: 'message_count', // Required: action type
    threshold: 5, // Required: threshold value
    operator: 'gte' // Optional: 'eq', 'gt', 'gte', 'lt', 'lte' (default: 'gte')
  }
};

// Context must include the action value
const context = {
  messageCount: 6 // Current message count
};
```

**Example**: Show a prompt when conversation reaches 5 messages.

**Built-in Actions**:
- `message_count`: Number of messages in a conversation
- `photo_count`: Number of photos uploaded
- `completed_actions`: Total completed actions
- `profile_completeness`: Profile completion percentage

**Operators**:
- `eq`: Equal to
- `gt`: Greater than
- `gte`: Greater than or equal to (default)
- `lt`: Less than
- `lte`: Less than or equal to

### 5. State-Based

Shows guidance based on user state or feature flags.

```typescript
// Check feature flag
const condition1 = {
  type: 'state_based',
  params: {
    feature: 'hasCompletedAuth', // Feature flag name
    value: true // Expected value (default: true)
  }
};

// Check milestone
const condition2 = {
  type: 'state_based',
  params: {
    milestone: 'firstListingPostedDate', // Milestone name
    exists: true // Whether milestone should exist (default: true)
  }
};

// Check completed action
const condition3 = {
  type: 'state_based',
  params: {
    actionCompleted: 'viewed_first_listing' // Action ID
  }
};

// Check completed tour
const condition4 = {
  type: 'state_based',
  params: {
    tourCompleted: 'home_tour' // Tour ID
  }
};
```

**Example**: Show advanced features only after user completes authentication.

## Helper Methods

The engine also provides convenient helper methods:

```typescript
// Check if first visit
const isFirst = TriggerEvaluationEngine.isFirstVisit('home', state);

// Check if user has been inactive
const isInactive = TriggerEvaluationEngine.hasBeenInactive(
  10000, // 10 seconds
  state,
  { lastInteractionTime: Date.now() - 11000 }
);

// Check if action completed
const hasCompleted = TriggerEvaluationEngine.hasCompletedAction(
  'first_listing_view',
  state
);

// Check state requirement
const meetsRequirement = TriggerEvaluationEngine.meetsStateRequirement(
  { feature: 'hasCompletedAuth', value: true },
  state
);
```

## Real-World Examples

### Example 1: Home Screen Inactivity Prompt

Show a prompt after 10 seconds of no interaction on the home screen.

```typescript
function HomeScreen() {
  const { evaluateTrigger } = useGuidance();
  const [screenEnterTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      const shouldShow = evaluateTrigger(
        {
          type: 'time_based',
          params: {
            duration: 10000, // 10 seconds
            event: 'last_interaction'
          }
        },
        { screenEnterTime, lastInteractionTime }
      );
      
      if (shouldShow) {
        // Show prompt: "Tap any item to see more details"
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastInteractionTime]);
  
  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
  };
  
  return <View onTouchStart={handleInteraction}>...</View>;
}
```

### Example 2: Listing Detail Quick Actions

Show quick actions after 5 seconds without user action.

```typescript
function ListingDetail() {
  const { evaluateTrigger } = useGuidance();
  const [screenEnterTime] = useState(Date.now());
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const shouldShow = evaluateTrigger(
        {
          type: 'time_based',
          params: {
            duration: 5000, // 5 seconds
            event: 'screen_enter'
          }
        },
        { screenEnterTime }
      );
      
      setShowQuickActions(shouldShow);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View>
      {/* Listing content */}
      {showQuickActions && <QuickActionsPrompt />}
    </View>
  );
}
```

### Example 3: Conversation Milestone Prompt

Show a prompt when conversation reaches 5 messages.

```typescript
function ChatScreen({ messages }) {
  const { evaluateTrigger } = useGuidance();
  
  const shouldShowPrompt = evaluateTrigger(
    {
      type: 'action_based',
      params: {
        action: 'message_count',
        threshold: 5,
        operator: 'eq' // Exactly 5 messages
      }
    },
    { messageCount: messages.length }
  );
  
  return (
    <View>
      {/* Chat messages */}
      {shouldShowPrompt && (
        <ContextualPrompt message="Consider agreeing on a meeting place" />
      )}
    </View>
  );
}
```

### Example 4: Photo Upload Prompt

Show a prompt when user has uploaded fewer than 3 photos.

```typescript
function CreateListing({ photos }) {
  const { evaluateTrigger } = useGuidance();
  
  const shouldShowPrompt = evaluateTrigger(
    {
      type: 'action_based',
      params: {
        action: 'photo_count',
        threshold: 3,
        operator: 'lt' // Less than 3
      }
    },
    { photoCount: photos.length }
  );
  
  return (
    <View>
      {/* Photo upload UI */}
      {shouldShowPrompt && (
        <Tooltip message="Add more photos to attract buyers" />
      )}
    </View>
  );
}
```

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 3.4**: Time-based trigger for 10 seconds of inactivity on home screen
- **Requirement 4.3**: Time-based trigger for 5 seconds without action on listing detail
- **Requirement 5.4**: Action-based trigger for conversation reaching 5 messages

## Testing

The trigger evaluation engine is designed to be deterministic and testable. See the property-based tests for comprehensive validation of trigger logic.
