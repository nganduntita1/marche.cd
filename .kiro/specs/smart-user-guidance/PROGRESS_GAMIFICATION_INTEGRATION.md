# Progress Tracking & Gamification - Integration Guide

## Quick Start

### 1. Add Celebration Provider to App Layout

Add the `AchievementCelebrationProvider` to your app's root layout to enable automatic celebration modals:

```tsx
// app/_layout.tsx
import { GuidanceProvider } from '../contexts/GuidanceContext';
import { AchievementCelebrationProvider } from '../components/guidance';

export default function RootLayout() {
  return (
    <GuidanceProvider>
      <AchievementCelebrationProvider>
        {/* Your app content */}
        <Stack />
      </AchievementCelebrationProvider>
    </GuidanceProvider>
  );
}
```

### 2. Trigger Achievements on User Actions

Add achievement triggers throughout your app:

#### On Registration Complete
```tsx
// app/auth/register.tsx or complete-profile.tsx
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone } = useGuidance();

// After successful registration
await checkAndTriggerMilestone('registration');
```

#### On First Listing View
```tsx
// app/listing/[id].tsx
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone } = useGuidance();

useEffect(() => {
  // On component mount (first view)
  checkAndTriggerMilestone('listing_view');
}, []);
```

#### On First Message Sent
```tsx
// app/chat/[id].tsx
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone, markActionCompleted } = useGuidance();

const handleSendMessage = async () => {
  // Send message logic...
  
  // Track message sent
  await markActionCompleted(`message_sent_${Date.now()}`);
  await checkAndTriggerMilestone('message');
};
```

#### On First Favorite Saved
```tsx
// app/listing/[id].tsx or wherever favorites are added
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone } = useGuidance();

const handleAddFavorite = async () => {
  // Add to favorites logic...
  
  await checkAndTriggerMilestone('favorite');
};
```

#### On First Listing Posted
```tsx
// app/(tabs)/post.tsx
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone, markActionCompleted } = useGuidance();

const handlePublishListing = async () => {
  // Publish listing logic...
  
  // Track listing posted
  await markActionCompleted(`listing_posted_${Date.now()}`);
  await checkAndTriggerMilestone('listing_post');
};
```

#### On Search/Filter Usage
```tsx
// app/(tabs)/index.tsx
import { useGuidance } from '../contexts/GuidanceContext';

const { checkAndTriggerMilestone } = useGuidance();

const handleSearch = async () => {
  // Search logic...
  
  await checkAndTriggerMilestone('search');
};

const handleFilterApply = async () => {
  // Filter logic...
  
  await checkAndTriggerMilestone('filter');
};
```

### 3. Display Progress in Profile

Show onboarding progress in the user's profile:

```tsx
// app/(tabs)/profile.tsx
import { useGuidance } from '../contexts/GuidanceContext';
import { ProgressIndicator } from '../components/guidance/ProgressIndicator';

export default function ProfileScreen() {
  const { getOnboardingProgress, getOnboardingCompletionPercentage } = useGuidance();
  
  const steps = getOnboardingProgress();
  const percentage = getOnboardingCompletionPercentage();
  
  return (
    <ScrollView>
      {/* Profile header */}
      
      {/* Progress Section */}
      {percentage < 100 && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>
            Complétez votre profil ({percentage}%)
          </Text>
          <ProgressIndicator steps={steps} compact={true} />
        </View>
      )}
      
      {/* Rest of profile */}
    </ScrollView>
  );
}
```

### 4. Add Achievements Link to Settings

Add a link to the achievements screen in your settings:

```tsx
// app/settings.tsx
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  
  return (
    <ScrollView>
      {/* Other settings */}
      
      <TouchableOpacity 
        style={styles.settingItem}
        onPress={() => router.push('/achievements')}
      >
        <Text style={styles.settingIcon}>🏆</Text>
        <Text style={styles.settingLabel}>Mes Succès</Text>
        <Text style={styles.settingArrow}>→</Text>
      </TouchableOpacity>
      
      {/* More settings */}
    </ScrollView>
  );
}
```

### 5. Show Achievement Count in Profile

Display achievement count as a badge:

```tsx
// app/(tabs)/profile.tsx
import { useGuidance } from '../contexts/GuidanceContext';

export default function ProfileScreen() {
  const { getAchievements } = useGuidance();
  
  const achievements = getAchievements();
  const completedCount = achievements.filter(a => a.completed).length;
  
  return (
    <View>
      {/* Profile info */}
      
      <TouchableOpacity 
        style={styles.achievementBadge}
        onPress={() => router.push('/achievements')}
      >
        <Text style={styles.achievementIcon}>🏆</Text>
        <Text style={styles.achievementCount}>{completedCount}</Text>
        <Text style={styles.achievementLabel}>Succès</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Complete Integration Checklist

- [ ] Add `AchievementCelebrationProvider` to app layout
- [ ] Trigger achievement on registration complete
- [ ] Trigger achievement on first listing view
- [ ] Trigger achievement on first message sent
- [ ] Trigger achievement on first favorite saved
- [ ] Trigger achievement on first listing posted
- [ ] Trigger achievement on search usage
- [ ] Trigger achievement on filter usage
- [ ] Trigger achievement on first rating received
- [ ] Display progress indicator in profile
- [ ] Add achievements link to settings
- [ ] Show achievement count badge in profile
- [ ] Test all achievement triggers
- [ ] Test celebration animations
- [ ] Test achievements screen filters

## Testing Achievements

### Manual Testing

1. **Create New Account**
   - Should unlock "Welcome Aboard" achievement
   - Celebration modal should appear

2. **Complete Profile**
   - Should unlock "Profile Master" achievement
   - Progress indicator should show 100%

3. **View First Listing**
   - Should unlock "Window Shopping" achievement

4. **Send First Message**
   - Should unlock "Breaking the Ice" achievement

5. **Save First Favorite**
   - Should unlock "Wishlist Started" achievement

6. **Post First Listing**
   - Should unlock "First Sale" achievement
   - Should show celebration with reward

7. **Use Search and Filters**
   - Should unlock "Search Master" achievement

8. **Send 10 Messages**
   - Should unlock "Social Butterfly" achievement
   - Progress bar should fill gradually

9. **Post 5 Listings**
   - Should unlock "Power Seller" achievement
   - Progress bar should fill gradually

10. **Complete All Required Onboarding Steps**
    - Should unlock "Marché.cd Expert" achievement
    - Should show special celebration

### Automated Testing (Future)

```tsx
// Example test
describe('Achievement System', () => {
  it('should unlock welcome achievement on registration', async () => {
    const { result } = renderHook(() => useGuidance());
    
    await act(async () => {
      await result.current.checkAndTriggerMilestone('registration');
    });
    
    const achievements = result.current.getAchievements();
    const welcomeAchievement = achievements.find(a => a.id === 'welcome_aboard');
    
    expect(welcomeAchievement?.completed).toBe(true);
  });
});
```

## Troubleshooting

### Celebrations Not Showing

1. Check that `AchievementCelebrationProvider` is added to app layout
2. Verify `GuidanceProvider` is wrapping the app
3. Check console for errors
4. Ensure `checkAndTriggerMilestone()` is being called

### Achievements Not Unlocking

1. Verify the correct milestone type is being passed
2. Check that state features are being updated correctly
3. Use `markActionCompleted()` for progressive achievements
4. Check AsyncStorage for state persistence

### Progress Not Updating

1. Ensure state is being saved after updates
2. Check that feature flags are being set correctly
3. Verify `getOnboardingProgress()` is being called
4. Check for state migration issues

## Performance Tips

1. **Batch Achievement Checks**
   ```tsx
   // Instead of multiple calls
   await checkAndTriggerMilestone('action1');
   await checkAndTriggerMilestone('action2');
   
   // Do this
   await checkAndTriggerMilestone('combined_action');
   ```

2. **Debounce Frequent Actions**
   ```tsx
   const debouncedCheck = useMemo(
     () => debounce(() => checkAndTriggerMilestone('search'), 1000),
     []
   );
   ```

3. **Memoize Achievement Lists**
   ```tsx
   const achievements = useMemo(
     () => getAchievements(),
     [state.completedAchievements]
   );
   ```

## Customization

### Add New Achievement

1. Add to `ACHIEVEMENTS` in `services/achievementService.ts`
2. Add detection logic in `checkMilestones()`
3. Add trigger points in app
4. Test thoroughly

### Modify Celebration Animation

Edit `components/guidance/CelebrationModal.tsx`:
- Adjust confetti count
- Change animation duration
- Modify colors
- Add sound effects

### Customize Progress Indicator

Edit `components/guidance/ProgressIndicator.tsx`:
- Change colors
- Modify step indicators
- Add custom icons
- Adjust spacing

## Next Steps

After integration:

1. Monitor achievement unlock rates
2. Gather user feedback on celebrations
3. Add more achievements based on usage patterns
4. Consider adding rewards/benefits
5. Implement achievement sharing
6. Add push notifications for achievements

## Support

For issues or questions:
- Check the main documentation: `PROGRESS_GAMIFICATION_COMPLETE.md`
- Review component READMEs
- Check TypeScript types in `types/guidance.ts`
- Test with the achievements screen: `/achievements`
