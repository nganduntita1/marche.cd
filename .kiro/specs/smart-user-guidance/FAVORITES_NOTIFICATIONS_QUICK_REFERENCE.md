# Favorites & Notifications Guidance - Quick Reference

## For Developers

### Using FavoritesGuidance Component

```typescript
import { FavoritesGuidance } from '@/components/guidance';
import { useGuidance } from '@/contexts/GuidanceContext';

// In your component
const { shouldShowTooltip, incrementScreenView } = useGuidance();
const [showGuidance, setShowGuidance] = useState(false);

// Track screen view
useEffect(() => {
  incrementScreenView('favorites');
}, []);

// Check if should show guidance
useEffect(() => {
  if (isEmpty && shouldShowTooltip('favorites_empty_state')) {
    setShowGuidance(true);
  }
}, [isEmpty]);

// Render
<FavoritesGuidance
  visible={showGuidance}
  isEmpty={true}
  hasSoldItems={false}
  hasPriceDrops={false}
  onDismiss={() => setShowGuidance(false)}
/>
```

### Using NotificationsGuidance Component

```typescript
import { NotificationsGuidance } from '@/components/guidance';
import { useGuidance } from '@/contexts/GuidanceContext';

// In your component
const { shouldShowTooltip, shouldShowTour } = useGuidance();
const [showFirstNotif, setShowFirstNotif] = useState(false);
const [showTour, setShowTour] = useState(false);

// Check conditions
useEffect(() => {
  if (shouldShowTooltip('notifications_first')) {
    setShowFirstNotif(true);
  }
  if (shouldShowTour('notifications_types_tour')) {
    setShowTour(true);
  }
}, [notifications]);

// Render
<NotificationsGuidance
  visible={showFirstNotif}
  isFirstNotification={true}
  onDismiss={() => setShowFirstNotif(false)}
/>

<NotificationsGuidance
  visible={showTour}
  showTypesTour={true}
  onDismiss={() => setShowTour(false)}
/>
```

## Component Props

### FavoritesGuidance Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| visible | boolean | Yes | Controls modal visibility |
| isEmpty | boolean | Yes | Whether favorites list is empty |
| hasSoldItems | boolean | No | Whether there are sold items |
| hasPriceDrops | boolean | No | Whether there are price drops |
| onDismiss | () => void | Yes | Callback when dismissed |

### NotificationsGuidance Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| visible | boolean | Yes | Controls modal visibility |
| isFirstNotification | boolean | No | Show first notification welcome |
| hasUnreadNotifications | boolean | No | Show unread reminder |
| showTypesTour | boolean | No | Show notification types tour |
| onDismiss | () => void | Yes | Callback when dismissed |

## Tooltip IDs

### Favorites
- `favorites_explanation` - General explanation
- `favorites_empty_state` - Empty state guidance
- `favorites_sold_items` - Sold items notification
- `favorites_price_drop` - Price drop alert

### Notifications
- `notifications_first` - First notification welcome
- `notifications_types` - Types overview
- `notifications_unread_reminder` - Unread reminder
- `notifications_settings` - Settings guidance

## Tour IDs

- `notifications_types_tour` - 4-step notification types tour

## GuidanceContext Methods

```typescript
// Check if tooltip should show
shouldShowTooltip(tooltipId: string): boolean

// Check if tour should show
shouldShowTour(tourId: string): boolean

// Mark tooltip as dismissed
markTooltipDismissed(tooltipId: string): Promise<void>

// Mark tour as completed
markTourCompleted(tourId: string): Promise<void>

// Track screen view
incrementScreenView(screenName: string): Promise<void>
```

## Common Patterns

### Empty State Detection
```typescript
const isEmpty = favorites.length === 0;
if (isEmpty && shouldShowTooltip('favorites_empty_state')) {
  setShowEmptyGuidance(true);
}
```

### Sold Items Detection
```typescript
const soldItems = favorites.filter(item => item.status === 'sold');
if (soldItems.length > 0 && shouldShowTooltip('favorites_sold_items')) {
  setShowSoldItemsGuidance(true);
}
```

### Unread Notification Detection
```typescript
const unreadNotifications = notifications.filter(n => !n.read);
if (unreadNotifications.length > 0) {
  const oldestUnread = unreadNotifications[unreadNotifications.length - 1];
  const notificationAge = Date.now() - new Date(oldestUnread.created_at).getTime();
  const fortyEightHours = 48 * 60 * 60 * 1000;
  
  if (notificationAge > fortyEightHours && shouldShowTooltip('notifications_unread_reminder')) {
    setShowUnreadReminder(true);
  }
}
```

### Tour with Delay
```typescript
useEffect(() => {
  if (shouldShowTour('notifications_types_tour')) {
    // Add small delay for better UX
    setTimeout(() => {
      setShowTypesTour(true);
    }, 1000);
  }
}, []);
```

## Styling Guidelines

### Modal Overlay
- Background: `rgba(0, 0, 0, 0.5)`
- Centered on screen
- Padding: 20px

### Card
- Background: White
- Border radius: 20px
- Padding: 24px
- Max width: 400px
- Shadow for depth

### Icon Container
- Size: 96x96px
- Border radius: 48px (circular)
- Background colors:
  - Default: `#f0fdf4` (light green)
  - Warning: `#fef3c7` (light yellow)
  - Info: `#f0f9ff` (light blue)

### Buttons
- Primary: Green background
- Secondary: White with border
- Border radius: 12px
- Padding: 14px vertical, 32px horizontal

## Testing Checklist

- [ ] Guidance appears on first visit
- [ ] Guidance can be dismissed
- [ ] Guidance doesn't repeat after dismissal
- [ ] Both languages work correctly
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Smooth animations
- [ ] Accessible to screen readers

## Troubleshooting

### Guidance Not Showing
1. Check if tooltip/tour ID is correct
2. Verify `shouldShowTooltip` returns true
3. Check if already dismissed in state
4. Ensure `visible` prop is true

### Guidance Repeating
1. Verify `markTooltipDismissed` is called
2. Check AsyncStorage persistence
3. Ensure correct tooltip ID used

### Language Not Switching
1. Check GuidanceContext language setting
2. Verify content exists for both languages
3. Ensure component re-renders on language change

## Performance Tips

1. Use `useCallback` for dismiss handlers
2. Memoize expensive computations
3. Avoid showing multiple modals simultaneously
4. Add small delays between guidance triggers
5. Clean up state on unmount

## Best Practices

1. **One guidance at a time**: Don't overwhelm users
2. **Contextual timing**: Show guidance when relevant
3. **Clear dismissal**: Always provide easy way to close
4. **Respect preferences**: Honor guidance level settings
5. **Test both languages**: Ensure translations work
6. **Track analytics**: Monitor guidance effectiveness

