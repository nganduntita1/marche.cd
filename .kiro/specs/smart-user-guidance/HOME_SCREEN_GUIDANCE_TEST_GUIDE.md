# Home Screen Guidance - Testing Guide

## Prerequisites
- App running on device or simulator
- Access to AsyncStorage clearing (for first-time user testing)

## Test Scenarios

### Test 1: First-Time User Experience
**Objective**: Verify complete guidance flow for new users

**Steps**:
1. Clear AsyncStorage (or use fresh install)
2. Navigate to home screen
3. Observe welcome tour appears automatically
4. Complete all 4 tour steps:
   - Step 1: Welcome message
   - Step 2: Search bar explanation
   - Step 3: Location filter explanation
   - Step 4: Browse listings instruction
5. After tour completion, observe search tooltip appears
6. Dismiss search tooltip
7. Observe location tooltip appears
8. Dismiss location tooltip

**Expected Results**:
- ✅ Tour appears within 500ms of screen load
- ✅ Each step displays correct content
- ✅ Progress bar shows correct progress (25%, 50%, 75%, 100%)
- ✅ "Next" button advances to next step
- ✅ "Skip" button closes tour immediately
- ✅ Search tooltip appears 500ms after tour completion
- ✅ Location tooltip appears 500ms after search tooltip dismissed
- ✅ All tooltips positioned correctly near target elements

### Test 2: Tour Skip Functionality
**Objective**: Verify users can skip the tour

**Steps**:
1. Clear AsyncStorage
2. Navigate to home screen
3. When tour appears, tap "Skip" button
4. Verify tour closes immediately
5. Check that search tooltip appears

**Expected Results**:
- ✅ Tour closes on skip
- ✅ Tour marked as completed (won't show again)
- ✅ Search tooltip still appears after skip

### Test 3: Inactivity Detection
**Objective**: Verify inactivity prompt appears after 10 seconds

**Steps**:
1. Navigate to home screen (with tour already completed)
2. Do not interact with any elements
3. Wait 10 seconds
4. Observe inactivity prompt appears

**Expected Results**:
- ✅ Prompt appears after exactly 10 seconds
- ✅ Prompt suggests tapping items to see details
- ✅ Prompt has "Got it" button
- ✅ Prompt can be dismissed

### Test 4: Interaction Tracking
**Objective**: Verify inactivity timer is cleared on interaction

**Steps**:
1. Navigate to home screen
2. Wait 5 seconds (halfway to inactivity)
3. Tap search bar
4. Wait another 10 seconds
5. Verify inactivity prompt does NOT appear

**Expected Results**:
- ✅ Timer resets on search interaction
- ✅ No prompt appears after interaction
- ✅ hasInteracted flag set to true

**Repeat with different interactions**:
- Tap filter button
- Tap location selector
- Tap category chip
- Tap listing card
- Scroll the list

### Test 5: Returning User Experience
**Objective**: Verify guidance doesn't repeat for returning users

**Steps**:
1. Complete tour and dismiss all tooltips
2. Navigate away from home screen
3. Return to home screen
4. Observe no tour or tooltips appear

**Expected Results**:
- ✅ No tour shown
- ✅ No tooltips shown
- ✅ User can browse normally
- ✅ Inactivity prompt still works (if not dismissed before)

### Test 6: Multilingual Support
**Objective**: Verify guidance works in both languages

**Steps for English**:
1. Set app language to English
2. Clear AsyncStorage
3. Navigate to home screen
4. Verify all tour steps in English
5. Verify tooltips in English

**Steps for French**:
1. Set app language to French
2. Clear AsyncStorage
3. Navigate to home screen
4. Verify all tour steps in French
5. Verify tooltips in French

**Expected Results**:
- ✅ Tour content matches selected language
- ✅ Tooltip content matches selected language
- ✅ Button labels match selected language
- ✅ Inactivity prompt matches selected language

### Test 7: Tooltip Positioning
**Objective**: Verify tooltips position correctly

**Steps**:
1. Complete tour
2. Observe search tooltip positioning
3. Observe location tooltip positioning
4. Test on different screen sizes if possible

**Expected Results**:
- ✅ Search tooltip appears below search bar
- ✅ Location tooltip appears below location selector
- ✅ Tooltips don't overflow screen edges
- ✅ Arrow points to correct target element

### Test 8: Guidance Settings Integration
**Objective**: Verify guidance respects user settings

**Steps**:
1. Set guidance level to "off" in settings
2. Clear AsyncStorage
3. Navigate to home screen
4. Verify no guidance appears

**Expected Results**:
- ✅ No tour shown when guidance is off
- ✅ No tooltips shown when guidance is off
- ✅ No inactivity prompt when guidance is off

### Test 9: State Persistence
**Objective**: Verify guidance state persists across sessions

**Steps**:
1. Complete tour
2. Dismiss search tooltip
3. Close app completely
4. Reopen app
5. Navigate to home screen
6. Verify tour doesn't show again
7. Verify search tooltip doesn't show again
8. Verify location tooltip still shows (not dismissed yet)

**Expected Results**:
- ✅ Completed tour stays completed
- ✅ Dismissed tooltips stay dismissed
- ✅ Undismissed tooltips still appear
- ✅ State loaded from AsyncStorage correctly

### Test 10: Performance
**Objective**: Verify guidance doesn't impact performance

**Steps**:
1. Navigate to home screen with guidance
2. Observe animation smoothness
3. Check for any lag or stuttering
4. Monitor memory usage

**Expected Results**:
- ✅ Tour animations smooth (60fps)
- ✅ Tooltip animations smooth
- ✅ No noticeable lag when showing guidance
- ✅ No memory leaks

## Edge Cases to Test

### Edge Case 1: Rapid Navigation
**Steps**:
1. Start tour
2. Immediately navigate away
3. Return to home screen

**Expected**: Tour state handled gracefully, no crashes

### Edge Case 2: Multiple Rapid Interactions
**Steps**:
1. Tap search bar multiple times rapidly
2. Tap location selector multiple times rapidly

**Expected**: Tooltips dismiss properly, no duplicate tooltips

### Edge Case 3: Screen Rotation (if applicable)
**Steps**:
1. Start tour
2. Rotate device
3. Continue tour

**Expected**: Tour repositions correctly, no layout issues

### Edge Case 4: Low Memory Conditions
**Steps**:
1. Run app with limited memory
2. Navigate to home screen with guidance

**Expected**: Guidance degrades gracefully if needed

## Debugging Tips

### Tour Not Appearing
- Check AsyncStorage: `shouldShowTour('home_tour')` should return true
- Verify GuidanceProvider is in app layout
- Check guidance level setting (should not be 'off')
- Look for console errors

### Tooltips Not Appearing
- Verify tour is completed first
- Check `shouldShowTooltip()` returns true
- Verify refs are attached to target elements
- Check tooltip IDs match content service

### Inactivity Timer Not Working
- Verify 10 seconds have passed
- Check hasInteracted is false
- Verify no interactions occurred
- Check timer ref is set correctly

### State Not Persisting
- Check AsyncStorage permissions
- Verify GuidanceStorageService is working
- Look for save/load errors in console
- Check state schema matches expected format

## Success Criteria
All tests pass with:
- ✅ No crashes or errors
- ✅ Smooth animations
- ✅ Correct content display
- ✅ Proper state persistence
- ✅ Appropriate timing
- ✅ Multilingual support working
- ✅ Settings respected

## Reporting Issues
When reporting issues, include:
1. Test scenario number
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/video if possible
5. Device/simulator info
6. App language setting
7. Guidance level setting
8. Console logs
