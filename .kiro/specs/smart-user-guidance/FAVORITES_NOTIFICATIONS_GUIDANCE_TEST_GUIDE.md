# Favorites and Notifications Guidance - Test Guide

## Overview
This guide helps you test the favorites and notifications guidance features implemented for Task 14.

## Requirements Covered
- **9.1**: Favorites screen explanation
- **9.2**: Empty state guidance
- **9.3**: Sold items notification
- **9.4**: Price drop highlighting
- **10.1**: First notification explanation
- **10.2**: Notification types tour
- **10.3**: Unread notification reminder
- **10.4**: Notification settings guidance

## Test Scenarios

### 1. Favorites Screen - Empty State (Requirement 9.2)

**Steps:**
1. Open the app and navigate to the Favorites screen (from profile or direct navigation)
2. Ensure you have no saved favorites

**Expected Behavior:**
- Empty state UI should display with a Package icon
- Text: "Aucun favori" (No Favorites)
- Description explaining how to add favorites
- "Parcourir les annonces" (Browse Listings) button
- On first visit, guidance modal should appear explaining the favorites feature
- Modal should have a heart icon and explain how to save items

**Validation:**
- [ ] Empty state displays correctly
- [ ] Guidance modal appears on first visit
- [ ] Modal can be dismissed
- [ ] Guidance doesn't show again after dismissal

### 2. Favorites Screen - Sold Items Notification (Requirement 9.3)

**Steps:**
1. Add several items to your favorites
2. Have the seller mark one or more items as "sold"
3. Return to the Favorites screen

**Expected Behavior:**
- Sold items should display with "sold" status
- Guidance modal should appear notifying about sold items
- Modal should suggest removing sold items
- Package icon with yellow/orange background

**Validation:**
- [ ] Sold items are visually distinguished
- [ ] Guidance modal appears when sold items exist
- [ ] Modal provides helpful suggestion
- [ ] Can be dismissed and won't show repeatedly

### 3. Favorites Screen - Price Drop Alert (Requirement 9.4)

**Steps:**
1. Add items to favorites
2. Have sellers reduce prices on some items
3. Return to Favorites screen

**Expected Behavior:**
- Price drop guidance modal should appear
- Celebratory message with 💰 icon
- Green background for positive news
- "View Items" action button

**Validation:**
- [ ] Price drop detection works
- [ ] Modal appears with correct styling
- [ ] Message is encouraging and positive
- [ ] Can navigate to view discounted items

### 4. Favorites Screen - General Explanation (Requirement 9.1)

**Steps:**
1. Navigate to Favorites screen
2. Observe the overall guidance

**Expected Behavior:**
- First-time visitors see explanation of favorites feature
- Guidance explains benefits (easy access, price notifications)
- Heart icon displayed
- Available in both French and English

**Validation:**
- [ ] Explanation is clear and helpful
- [ ] Appears at appropriate time
- [ ] Doesn't interfere with browsing
- [ ] Multilingual support works

### 5. Notifications Screen - First Notification (Requirement 10.1)

**Steps:**
1. Receive your first notification (message, rating request, etc.)
2. Navigate to Notifications screen

**Expected Behavior:**
- Welcome guidance modal appears
- Bell icon (🔔) displayed
- Explains purpose of notifications
- Congratulatory tone for first notification

**Validation:**
- [ ] Modal appears on first notification
- [ ] Message is welcoming and informative
- [ ] Only shows once
- [ ] Doesn't block notification interaction

### 6. Notifications Screen - Types Tour (Requirement 10.2)

**Steps:**
1. Open Notifications screen for the first time
2. Wait for tour to start (1 second delay)

**Expected Behavior:**
- Multi-step tour explaining notification types
- Step 1: Welcome message
- Step 2: Message notifications explanation
- Step 3: Rating requests explanation (⭐)
- Step 4: Transaction updates explanation
- Progress dots showing current step
- "Next" and "Skip" buttons
- Can navigate through all steps

**Validation:**
- [ ] Tour starts automatically on first visit
- [ ] All 4 steps display correctly
- [ ] Progress indicators work
- [ ] Can skip tour
- [ ] Can complete tour
- [ ] Tour doesn't repeat after completion

### 7. Notifications Screen - Unread Reminder (Requirement 10.3)

**Steps:**
1. Receive notifications
2. Leave them unread for 48+ hours
3. Return to Notifications screen

**Expected Behavior:**
- Reminder modal appears
- Yellow/orange warning styling
- Clock icon (⏰)
- Encourages checking unread notifications
- "View Now" action button

**Validation:**
- [ ] Reminder only shows after 48 hours
- [ ] Correctly identifies unread notifications
- [ ] Styling is attention-grabbing but not alarming
- [ ] Can be dismissed
- [ ] Doesn't show if all notifications are read

### 8. Notification Settings Guidance (Requirement 10.4)

**Steps:**
1. Navigate to Settings screen
2. Look for notification settings section

**Expected Behavior:**
- Tooltip or guidance explaining notification customization
- Gear icon (⚙️)
- Explains how to customize notification preferences
- Points to Settings screen

**Validation:**
- [ ] Guidance is contextually relevant
- [ ] Explains customization options
- [ ] Doesn't overwhelm user
- [ ] Available in both languages

## Language Testing

### French Language
Test all scenarios with app language set to French:
- [ ] All modals display French text
- [ ] Translations are natural and accurate
- [ ] Icons and styling remain consistent
- [ ] Action buttons have French labels

### English Language
Test all scenarios with app language set to English:
- [ ] All modals display English text
- [ ] Messages are clear and friendly
- [ ] Consistent with app tone

## Edge Cases

### Multiple Guidance Triggers
**Scenario:** User has empty favorites AND sold items
- [ ] Only one guidance modal shows at a time
- [ ] Priority is handled correctly
- [ ] User isn't overwhelmed

### Rapid Navigation
**Scenario:** User quickly navigates between screens
- [ ] Guidance doesn't stack or overlap
- [ ] Modals dismiss properly
- [ ] No memory leaks or performance issues

### Guidance Disabled
**Scenario:** User has set guidance level to "minimal" or "off"
- [ ] Appropriate guidance is suppressed
- [ ] Critical safety information still shows
- [ ] User preference is respected

## Integration Points

### With GuidanceContext
- [ ] `incrementScreenView` called correctly
- [ ] `shouldShowTooltip` checked before showing guidance
- [ ] `markTooltipDismissed` called on dismissal
- [ ] `markTourCompleted` called when tour finishes
- [ ] State persists across app sessions

### With Existing Screens
- [ ] Favorites screen functionality not impaired
- [ ] Notifications screen works normally
- [ ] Guidance enhances rather than blocks UX
- [ ] No visual glitches or layout issues

## Performance Checks

- [ ] Modals render within 100ms
- [ ] No lag when opening Favorites/Notifications
- [ ] Smooth animations
- [ ] Efficient state updates
- [ ] No unnecessary re-renders

## Accessibility

- [ ] Modals are screen-reader friendly
- [ ] Touch targets are adequate (44x44pt minimum)
- [ ] Color contrast meets standards
- [ ] Text is readable at various sizes
- [ ] Can be dismissed with back button

## Success Criteria

All test scenarios pass with:
- ✅ Correct guidance appears at right time
- ✅ Messages are helpful and clear
- ✅ User can dismiss and continue
- ✅ Guidance doesn't repeat unnecessarily
- ✅ Both languages work correctly
- ✅ Performance is smooth
- ✅ No crashes or errors

## Known Limitations

1. **Price Drop Detection**: Currently simulated. Full implementation would require:
   - Tracking historical prices in database
   - Background job to check for price changes
   - Push notifications for price drops

2. **Notification Age Calculation**: Relies on client-side time calculation. Could be enhanced with server-side tracking.

3. **Sold Items Detection**: Works but could be optimized with database queries that filter sold items.

## Future Enhancements

1. Add push notifications for price drops
2. Implement smart notification grouping
3. Add notification preferences in Settings
4. Create notification history/archive
5. Add notification sound/vibration customization

