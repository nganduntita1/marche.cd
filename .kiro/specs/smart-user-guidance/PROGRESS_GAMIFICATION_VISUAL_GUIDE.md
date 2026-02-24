# Progress Tracking & Gamification - Visual Guide

## Component Previews

### 1. Progress Indicator

#### Full Mode
```
┌─────────────────────────────────────────────┐
│  ████████████████░░░░░░░░░░░░░░░░░░░  67%  │
│                                             │
│  ● ─── Create Account                      │
│  ● ─── Complete Profile                    │
│  ● ─── Browse Listings                     │
│  ○ ─── Send a Message (Optionnel)          │
│  ○ ─── Post Your First Item (Optionnel)    │
│  ○ ─── Save a Favorite (Optionnel)         │
└─────────────────────────────────────────────┘
```

#### Compact Mode
```
┌─────────────────────────────────────────────┐
│  ████████████████░░░░░░░░░░░░░░░░░░░  3/6   │
└─────────────────────────────────────────────┘
```

### 2. Achievement Card

#### Completed Achievement
```
┌─────────────────────────────────────────────┐
│  🎉 ✓  Welcome Aboard! 🎉                   │
│        Created your account                  │
│                                             │
│        🎁 Increased trust with buyers       │
│                                             │
│        Complété le 30/11/2024               │
│                                    [Démarrage]│
└─────────────────────────────────────────────┘
```

#### In Progress Achievement
```
┌─────────────────────────────────────────────┐
│  🦋     Social Butterfly                    │
│        Exchange 10 messages                  │
│                                             │
│        ████████░░░░░░░░░░░░░░░░░░░░  7/10   │
│                                    [Social]  │
└─────────────────────────────────────────────┘
```

#### Locked Achievement
```
┌─────────────────────────────────────────────┐
│  ⭐     5-Star Seller ⭐                     │
│        Received your first 5-star rating     │
│                                             │
│        🎁 Boost in listing visibility       │
│                                    [Jalon]   │
└─────────────────────────────────────────────┘
```

### 3. Celebration Modal

```
┌─────────────────────────────────────────────┐
│                                             │
│              ✨                             │
│                🎉                           │
│              ✨                             │
│                                             │
│         Succès débloqué !                   │
│                                             │
│         Welcome Aboard! 🎉                  │
│                                             │
│    Created your account and joined          │
│           Marché.cd                         │
│                                             │
│    ┌───────────────────────────────┐       │
│    │ 🎁 Increased trust with       │       │
│    │    buyers and sellers         │       │
│    └───────────────────────────────┘       │
│                                             │
│         ┌─────────────┐                    │
│         │  Génial !   │                    │
│         └─────────────┘                    │
│                                             │
└─────────────────────────────────────────────┘

[Confetti particles falling and rotating]
```

### 4. Achievements Screen

```
┌─────────────────────────────────────────────┐
│  ←        Succès                            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │    5      │     6      │    67%     │   │
│  │ Débloqués │  Restants  │ Progression│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Progression de l'intégration               │
│  ┌─────────────────────────────────────┐   │
│  │  ████████████████░░░░░░░░░░░░  67%  │   │
│  │  ● Create Account                   │   │
│  │  ● Complete Profile                 │   │
│  │  ● Browse Listings                  │   │
│  │  ○ Send a Message (Optionnel)       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Filtres                                    │
│  ┌─────┐ ┌─────────┐ ┌─────────┐          │
│  │Tous │ │Complétés│ │En cours │          │
│  └─────┘ └─────────┘ └─────────┘          │
│                                             │
│  [Tous][Démarrage][Acheteur][Vendeur]...   │
│                                             │
│  Succès (5)                                 │
│  ┌─────────────────────────────────────┐   │
│  │ 🎉 ✓ Welcome Aboard! 🎉            │   │
│  │      Created your account           │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ✨ ✓ Profile Master                │   │
│  │      Completed your profile         │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 👀   Window Shopping                │   │
│  │      Viewed your first listing      │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## User Flow Diagrams

### Achievement Unlock Flow

```
User Action
    ↓
markActionCompleted()
    ↓
checkAndTriggerMilestone()
    ↓
AchievementService.checkMilestones()
    ↓
New Achievement Detected?
    ↓ Yes
markAchievementCompleted()
    ↓
State Updated & Saved
    ↓
useAchievementCelebration Hook
    ↓
Celebration Added to Queue
    ↓
CelebrationModal Displayed
    ↓
User Clicks "Génial!"
    ↓
Modal Closes
    ↓
Next Celebration (if any)
```

### Onboarding Progress Flow

```
User Completes Action
    ↓
Feature Flag Updated
    ↓
getOnboardingProgress()
    ↓
Calculate Completion %
    ↓
Update Progress Indicator
    ↓
100% Complete?
    ↓ Yes
Trigger "Marché.cd Expert"
    ↓
Show Special Celebration
```

## Color Coding

### Achievement Categories

```
🟢 Onboarding   - #10B981 (Green)
🔵 Buyer        - #3B82F6 (Blue)
🟠 Seller       - #F59E0B (Orange)
🟣 Social       - #8B5CF6 (Purple)
🔴 Milestone    - #EF4444 (Red)
```

### Status Indicators

```
✓ Completed     - Primary Color
○ Pending       - Gray
● In Progress   - Primary Color (filled)
```

### Progress Bars

```
Filled:   Primary Color (#007AFF)
Empty:    Gray 200 (#E5E7EB)
```

## Animation Sequences

### Celebration Modal

```
Timeline (3 seconds):

0.0s: Modal appears
      - Background fades in (0 → 0.9 opacity)
      - Card scales in (0 → 1)
      - Card translates up (50 → 0)

0.1s: Confetti starts
      - 20 particles spawn
      - Each particle:
        * Falls down (0 → screen height)
        * Moves horizontally (random)
        * Rotates (0 → 720°)
        * Fades out (1 → 0)

3.0s: Confetti completes
      - Particles off screen
      - Modal remains visible

User clicks "Génial!":
      - Modal fades out
      - Background fades out
      - Next celebration (if any)
```

### Progress Indicator

```
When step completes:

0.0s: Circle border changes color
      - Gray → Primary (instant)

0.1s: Checkmark appears
      - Scale in animation
      - Number → Checkmark

0.2s: Connector line fills
      - Gray → Primary (animated)

0.3s: Progress bar updates
      - Width increases (animated)
      - Percentage updates
```

## Screen Layouts

### Profile with Progress

```
┌─────────────────────────────────────────────┐
│  Profile                                    │
├─────────────────────────────────────────────┤
│                                             │
│         ┌─────────┐                        │
│         │  Photo  │                        │
│         └─────────┘                        │
│                                             │
│         John Doe                            │
│         Kinshasa, DRC                       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Complétez votre profil (67%)        │   │
│  │ ████████████████░░░░░░░░░░░░  3/6   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🏆 5 Succès                         │   │
│  │ Voir tous →                         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  My Listings                                │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Settings with Achievements Link

```
┌─────────────────────────────────────────────┐
│  Settings                                   │
├─────────────────────────────────────────────┤
│                                             │
│  Account                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 👤  Edit Profile              →    │   │
│  │ 🔔  Notifications             →    │   │
│  │ 🔒  Privacy                   →    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Progress                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 🏆  Mes Succès                →    │   │
│  │ 📊  Statistiques              →    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  App                                        │
│  ┌─────────────────────────────────────┐   │
│  │ 🌐  Language                  →    │   │
│  │ ❓  Help Center               →    │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Responsive Behavior

### Mobile (< 768px)

- Full-width components
- Single column layout
- Compact progress indicator in profile
- Scrollable achievement list
- Bottom sheet for filters

### Tablet (≥ 768px)

- Max width containers
- Two-column achievement grid
- Expanded progress indicator
- Side-by-side filters
- Modal dialogs

### Landscape

- Horizontal progress indicator
- Grid layout for achievements
- Wider celebration modal
- More visible confetti

## Accessibility Features

### Screen Reader Support

```
Progress Indicator:
"Progression de l'intégration, 67 pourcent complété, 
3 étapes sur 6 terminées"

Achievement Card:
"Succès Welcome Aboard, complété, 
Created your account and joined Marché.cd,
Récompense: Increased trust with buyers and sellers"

Celebration Modal:
"Nouveau succès débloqué, Welcome Aboard,
Created your account and joined Marché.cd"
```

### Touch Targets

```
Minimum Size: 44x44 points

✓ Buttons: 48x48
✓ Achievement Cards: Full width, 80+ height
✓ Filter Buttons: 44+ height
✓ Progress Steps: 32x32 (acceptable for non-interactive)
```

### Color Contrast

```
Text on White:     4.5:1 minimum ✓
Primary on White:  4.5:1 minimum ✓
Gray on White:     3:1 minimum ✓
White on Primary:  7:1 (excellent) ✓
```

## State Transitions

### Achievement States

```
Locked → In Progress → Completed

Locked:
- Gray icon
- Gray text
- No progress bar
- "Locked" badge

In Progress:
- Color icon
- Normal text
- Progress bar visible
- Progress count (e.g., 7/10)

Completed:
- Color icon
- Bold text
- Checkmark badge
- Completion date
- Reward display
```

### Onboarding States

```
Not Started → In Progress → Completed

Not Started (0%):
- All steps gray
- "Get Started" prompt

In Progress (1-99%):
- Some steps completed
- Current step highlighted
- Progress bar partially filled

Completed (100%):
- All steps completed
- Green checkmarks
- "Expert" achievement unlocked
- Congratulations message
```

## Integration Examples

### Trigger Achievement

```tsx
// After user posts first listing
const handlePublish = async () => {
  // ... publish logic ...
  
  // Track action
  await markActionCompleted('listing_posted_1');
  
  // Check for achievements
  const hasNew = await checkAndTriggerMilestone('listing_post');
  
  if (hasNew) {
    // Celebration will show automatically
    console.log('Achievement unlocked!');
  }
};
```

### Display Progress

```tsx
// In profile screen
const ProfileScreen = () => {
  const { getOnboardingProgress, getOnboardingCompletionPercentage } = useGuidance();
  
  const steps = getOnboardingProgress();
  const percentage = getOnboardingCompletionPercentage();
  
  return (
    <View>
      {percentage < 100 && (
        <View>
          <Text>Complete your profile ({percentage}%)</Text>
          <ProgressIndicator steps={steps} compact />
        </View>
      )}
    </View>
  );
};
```

### Show Achievement Badge

```tsx
// In profile header
const ProfileHeader = () => {
  const { getAchievements } = useGuidance();
  const router = useRouter();
  
  const achievements = getAchievements();
  const completed = achievements.filter(a => a.completed).length;
  
  return (
    <TouchableOpacity onPress={() => router.push('/achievements')}>
      <Text>🏆 {completed} Succès</Text>
    </TouchableOpacity>
  );
};
```

## Best Practices

### When to Trigger Achievements

✅ **Do:**
- After successful action completion
- When state is persisted
- On first occurrence of action
- When threshold is reached

❌ **Don't:**
- Before action completes
- On every occurrence
- Without state persistence
- In error handlers

### Performance Tips

✅ **Do:**
- Use native driver for animations
- Memoize achievement lists
- Batch state updates
- Limit confetti particles

❌ **Don't:**
- Animate on main thread
- Recalculate on every render
- Update state multiple times
- Create too many particles

### User Experience

✅ **Do:**
- Show celebrations immediately
- Queue multiple achievements
- Allow dismissal
- Provide clear progress

❌ **Don't:**
- Block user actions
- Show same celebration twice
- Force user to wait
- Hide progress information

## Conclusion

This visual guide provides a comprehensive overview of how the Progress Tracking and Gamification System looks and behaves. Use it as a reference when implementing, testing, or explaining the system to others.

For implementation details, see:
- `PROGRESS_GAMIFICATION_COMPLETE.md` - Full documentation
- `PROGRESS_GAMIFICATION_INTEGRATION.md` - Integration guide
- `TASK_18_SUMMARY.md` - Implementation summary
