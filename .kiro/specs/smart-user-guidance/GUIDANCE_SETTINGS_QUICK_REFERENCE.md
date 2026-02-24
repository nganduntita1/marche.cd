# Guidance Settings - Quick Reference

## For Users

### Accessing Guidance Settings
Settings → Guidance Settings (in Preferences section)

### Guidance Levels

| Level | Description | What's Shown |
|-------|-------------|--------------|
| **Full Guidance** | Complete help experience | All tutorials, tips, suggestions, and prompts |
| **Minimal Tips** | Essential help only | Safety warnings and error explanations |
| **Off** | No proactive guidance | Help icons remain accessible |

### Tutorial Management
- **Replay Tutorials**: Review any tutorial again
- **Reset All**: Clear all guidance progress and start fresh

### Accessibility
- Automatic screen reader detection
- Toggle animations on/off
- All elements screen-reader compatible

### Privacy
- Analytics opt-in (anonymous usage data)
- Clear explanation of data collection

## For Developers

### Using Guidance Level in Components

```typescript
import { useGuidance } from '@/contexts/GuidanceContext';

function MyComponent() {
  const { state, shouldShowTooltip } = useGuidance();
  
  // Check current level
  const level = state?.settings.guidanceLevel;
  
  // Check if tooltip should show (respects level)
  if (shouldShowTooltip('my_tooltip_id')) {
    // Show tooltip
  }
}
```

### Marking Content as Critical

For minimal level to show your guidance:

```typescript
// For tooltips - include 'safety', 'error', or 'warning' in ID
const tooltipId = 'safety_meeting_reminder';

// For prompts - pass isCritical in context
shouldShowPrompt('my_prompt', { isCritical: true });
```

### Respecting Animation Preference

```typescript
const { state } = useGuidance();
const shouldAnimate = state?.settings.showAnimations ?? true;

// Use in animations
<Animated.View
  style={{
    opacity: shouldAnimate ? fadeAnim : 1,
  }}
>
```

### Changing Settings Programmatically

```typescript
const { setGuidanceLevel, setShowAnimations } = useGuidance();

// Change guidance level
await setGuidanceLevel('minimal');

// Toggle animations
await setShowAnimations(false);
```

### Resetting Guidance

```typescript
const { resetGuidance } = useGuidance();

// Reset all guidance
await resetGuidance();

// Reset specific tour
await resetGuidance('home_tour');
```

## Translation Keys

### French (fr.json)
```json
{
  "guidance": {
    "settings_title": "Paramètres de guidage",
    "level_full": "Guidage complet",
    "level_minimal": "Conseils minimaux",
    "level_off": "Désactivé",
    // ... more keys
  }
}
```

### English (en.json)
```json
{
  "guidance": {
    "settings_title": "Guidance Settings",
    "level_full": "Full Guidance",
    "level_minimal": "Minimal Tips",
    "level_off": "Off",
    // ... more keys
  }
}
```

## Available Tours for Replay

1. `landing_tour` - Landing Page
2. `auth_tour` - Authentication
3. `home_tour` - Home Screen
4. `listing_detail_tour` - Listing Details
5. `messaging_tour` - Messaging
6. `posting_tour` - Post Listing
7. `profile_tour` - Profile
8. `search_tour` - Search & Filters
9. `seller_dashboard_tour` - Seller Dashboard

## Analytics Opt-in

Stored separately from guidance state:
```typescript
const ANALYTICS_OPT_IN_KEY = '@marche_cd:guidance_analytics_opt_in';
```

Check opt-in status:
```typescript
const value = await AsyncStorage.getItem(ANALYTICS_OPT_IN_KEY);
const optedIn = value === 'true';
```

## Accessibility Best Practices

### Always Include
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Clear description"
  accessibilityHint="What happens when pressed"
  accessibilityRole="button"
>
```

### For Toggles
```typescript
<Switch
  accessible={true}
  accessibilityLabel="Feature name"
  accessibilityRole="switch"
  accessibilityState={{ checked: value }}
/>
```

## Common Use Cases

### 1. Show Tooltip Only in Full Mode
```typescript
if (state?.settings.guidanceLevel === 'full' && shouldShowTooltip('my_tip')) {
  // Show tooltip
}
```

### 2. Show Critical Warning in All Modes
```typescript
if (shouldShowTooltip('safety_warning_contact_info')) {
  // This will show even in minimal mode
}
```

### 3. Respect Animation Preference
```typescript
const duration = state?.settings.showAnimations ? 300 : 0;
Animated.timing(fadeAnim, { duration }).start();
```

### 4. Check if User Has Completed Onboarding
```typescript
const hasCompletedOnboarding = state?.milestones.onboardingCompletedDate !== null;
```

## Testing Checklist

- [ ] Test all three guidance levels
- [ ] Verify filtering works correctly
- [ ] Test tutorial replay
- [ ] Test reset all
- [ ] Test analytics opt-in/opt-out
- [ ] Test animation toggle
- [ ] Test with screen reader
- [ ] Test language switching
- [ ] Verify settings persist across restarts

## Support

For issues or questions:
1. Check the complete documentation: `GUIDANCE_SETTINGS_COMPLETE.md`
2. Review the design document: `design.md`
3. Check requirements: `requirements.md`
