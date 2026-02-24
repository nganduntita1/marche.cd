# Guidance Settings - Test Guide

## Manual Testing Checklist

### 1. Accessing Guidance Settings

#### Test 1.1: Navigate from Main Settings
- [ ] Open app and go to Profile tab
- [ ] Tap Settings
- [ ] Scroll to Preferences section
- [ ] Verify "Guidance Settings" option is visible
- [ ] Tap "Guidance Settings"
- [ ] Verify guidance settings screen opens

**Expected**: Smooth navigation, screen loads without errors

#### Test 1.2: Back Navigation
- [ ] From guidance settings, tap back button
- [ ] Verify returns to main settings
- [ ] Navigate to guidance settings again
- [ ] Use system back gesture/button
- [ ] Verify returns to main settings

**Expected**: Back navigation works consistently

---

### 2. Guidance Level Selection

#### Test 2.1: View Current Level
- [ ] Open guidance settings
- [ ] Verify status card shows current level
- [ ] Verify icon matches level (✨ Full, ⚡ Minimal, 👁️‍🗨️ Off)
- [ ] Verify description is accurate

**Expected**: Current level clearly displayed

#### Test 2.2: Change to Full Guidance
- [ ] Tap "Change Level"
- [ ] Verify modal opens
- [ ] Select "Full Guidance"
- [ ] Verify checkmark appears
- [ ] Verify modal closes
- [ ] Verify success alert appears
- [ ] Verify status card updates

**Expected**: Level changes immediately, UI updates

#### Test 2.3: Change to Minimal Tips
- [ ] Tap "Change Level"
- [ ] Select "Minimal Tips"
- [ ] Verify amber icon (⚡)
- [ ] Verify success message
- [ ] Verify status card shows "Minimal Tips"

**Expected**: Level changes, minimal mode active

#### Test 2.4: Change to Off
- [ ] Tap "Change Level"
- [ ] Select "Off"
- [ ] Verify gray icon (👁️‍🗨️)
- [ ] Verify success message
- [ ] Verify status card shows "Off"

**Expected**: Guidance disabled, UI reflects change

#### Test 2.5: Modal Dismissal
- [ ] Tap "Change Level"
- [ ] Tap X button
- [ ] Verify modal closes without changing level
- [ ] Tap "Change Level"
- [ ] Tap outside modal
- [ ] Verify modal closes

**Expected**: Modal dismisses without changes

---

### 3. Guidance Level Filtering

#### Test 3.1: Full Mode Behavior
- [ ] Set guidance level to "Full"
- [ ] Navigate to home screen
- [ ] Verify all tooltips appear (if first visit)
- [ ] Navigate to other screens
- [ ] Verify tours and prompts appear

**Expected**: All guidance shown

#### Test 3.2: Minimal Mode Behavior
- [ ] Set guidance level to "Minimal"
- [ ] Navigate through app
- [ ] Verify only safety warnings appear
- [ ] Verify general tips don't appear
- [ ] Verify error messages still appear

**Expected**: Only critical guidance shown

#### Test 3.3: Off Mode Behavior
- [ ] Set guidance level to "Off"
- [ ] Navigate through app
- [ ] Verify no proactive guidance appears
- [ ] Verify help buttons still visible
- [ ] Tap help button
- [ ] Verify help content accessible

**Expected**: No proactive guidance, help available

---

### 4. Tutorial Replay

#### Test 4.1: View Tutorial List
- [ ] Tap "Replay Tutorials"
- [ ] Verify modal opens
- [ ] Verify list of all tours shown
- [ ] Verify completed tours have checkmark (✓)
- [ ] Verify incomplete tours have circle (○)

**Expected**: All tours listed with correct status

#### Test 4.2: Replay Completed Tutorial
- [ ] Select a completed tour (with ✓)
- [ ] Verify confirmation dialog appears
- [ ] Tap "Reset"
- [ ] Verify success message
- [ ] Verify modal closes
- [ ] Navigate to relevant screen
- [ ] Verify tour appears again

**Expected**: Tour resets and can be viewed again

#### Test 4.3: Replay Incomplete Tutorial
- [ ] Select an incomplete tour (with ○)
- [ ] Verify confirmation dialog
- [ ] Tap "Reset"
- [ ] Navigate to relevant screen
- [ ] Verify tour appears

**Expected**: Tour available to view

#### Test 4.4: Cancel Tutorial Replay
- [ ] Tap "Replay Tutorials"
- [ ] Select a tour
- [ ] Tap "Cancel" in confirmation
- [ ] Verify no changes made
- [ ] Verify modal remains open

**Expected**: No changes, can select another tour

---

### 5. Reset All Functionality

#### Test 5.1: Reset All Guidance
- [ ] Complete some tours
- [ ] Dismiss some tooltips
- [ ] Tap "Reset All"
- [ ] Verify warning modal appears
- [ ] Read warning message
- [ ] Tap "Reset"
- [ ] Verify confirmation dialog
- [ ] Tap "Reset" again
- [ ] Verify success message
- [ ] Navigate through app
- [ ] Verify all guidance appears again

**Expected**: All progress cleared, guidance reappears

#### Test 5.2: Cancel Reset All
- [ ] Tap "Reset All"
- [ ] Verify warning modal
- [ ] Tap "Cancel"
- [ ] Verify modal closes
- [ ] Verify no changes made
- [ ] Check guidance state unchanged

**Expected**: No changes when cancelled

---

### 6. Accessibility Features

#### Test 6.1: Screen Reader Detection
- [ ] Enable device screen reader (VoiceOver/TalkBack)
- [ ] Open guidance settings
- [ ] Verify "Screen Reader" shows "enabled"
- [ ] Disable screen reader
- [ ] Return to guidance settings
- [ ] Verify shows "disabled"

**Expected**: Correct detection of screen reader

#### Test 6.2: Screen Reader Navigation
- [ ] Enable screen reader
- [ ] Navigate through guidance settings
- [ ] Verify all elements are announced
- [ ] Verify labels are clear
- [ ] Verify hints are helpful
- [ ] Tap elements with screen reader
- [ ] Verify actions work correctly

**Expected**: Full screen reader support

#### Test 6.3: Animation Toggle
- [ ] Verify "Show Animations" toggle
- [ ] Toggle off
- [ ] Verify success message
- [ ] Navigate through app
- [ ] Verify animations reduced/disabled
- [ ] Return to settings
- [ ] Toggle on
- [ ] Verify animations restored

**Expected**: Animation preference respected

---

### 7. Analytics Opt-in

#### Test 7.1: Initial State
- [ ] Fresh install or cleared data
- [ ] Open guidance settings
- [ ] Verify analytics toggle is OFF
- [ ] Verify subtitle explains purpose

**Expected**: Analytics disabled by default

#### Test 7.2: Opt-in to Analytics
- [ ] Toggle analytics ON
- [ ] Verify thank you alert appears
- [ ] Tap OK
- [ ] Verify toggle remains ON
- [ ] Close and reopen app
- [ ] Verify setting persisted

**Expected**: Opt-in works, persists

#### Test 7.3: Opt-out of Analytics
- [ ] With analytics ON
- [ ] Toggle analytics OFF
- [ ] Verify toggle updates
- [ ] Close and reopen app
- [ ] Verify setting persisted

**Expected**: Opt-out works, persists

---

### 8. Persistence Testing

#### Test 8.1: Settings Persist Across Restarts
- [ ] Set guidance level to "Minimal"
- [ ] Toggle animations OFF
- [ ] Toggle analytics ON
- [ ] Close app completely
- [ ] Reopen app
- [ ] Open guidance settings
- [ ] Verify all settings preserved

**Expected**: All settings persist

#### Test 8.2: Settings Persist Across Updates
- [ ] Note current settings
- [ ] Simulate app update (reinstall without clearing data)
- [ ] Open guidance settings
- [ ] Verify settings preserved

**Expected**: Settings survive updates

---

### 9. Language Support

#### Test 9.1: French Language
- [ ] Change app language to French
- [ ] Open guidance settings
- [ ] Verify all text in French
- [ ] Verify tour names in French
- [ ] Change guidance level
- [ ] Verify messages in French

**Expected**: Complete French translation

#### Test 9.2: English Language
- [ ] Change app language to English
- [ ] Open guidance settings
- [ ] Verify all text in English
- [ ] Verify tour names in English
- [ ] Change guidance level
- [ ] Verify messages in English

**Expected**: Complete English translation

#### Test 9.3: Language Switching
- [ ] Open guidance settings in French
- [ ] Change language to English
- [ ] Verify UI updates immediately
- [ ] Change back to French
- [ ] Verify UI updates

**Expected**: Immediate language updates

---

### 10. Error Handling

#### Test 10.1: Storage Error Handling
- [ ] Simulate storage full condition
- [ ] Try to change guidance level
- [ ] Verify error message shown
- [ ] Verify app doesn't crash
- [ ] Verify can still navigate

**Expected**: Graceful error handling

#### Test 10.2: Network Independence
- [ ] Turn off network connection
- [ ] Open guidance settings
- [ ] Change settings
- [ ] Verify all features work
- [ ] Verify settings save locally

**Expected**: Works offline

---

### 11. UI/UX Testing

#### Test 11.1: Visual Consistency
- [ ] Check all icons are correct
- [ ] Check all colors match design
- [ ] Check spacing is consistent
- [ ] Check typography is correct
- [ ] Check borders and shadows

**Expected**: Matches design specifications

#### Test 11.2: Touch Targets
- [ ] Verify all buttons are easy to tap
- [ ] Verify switches are easy to toggle
- [ ] Verify no accidental taps
- [ ] Test with different hand sizes

**Expected**: All targets ≥44x44pt

#### Test 11.3: Animations
- [ ] Verify modal animations smooth
- [ ] Verify no lag or jank
- [ ] Verify 60fps performance
- [ ] Test on older devices

**Expected**: Smooth animations

#### Test 11.4: Scrolling
- [ ] Scroll through settings list
- [ ] Verify smooth scrolling
- [ ] Verify no content cut off
- [ ] Test on small screens

**Expected**: Smooth, accessible scrolling

---

### 12. Integration Testing

#### Test 12.1: Main Settings Integration
- [ ] Navigate from main settings
- [ ] Verify link works
- [ ] Verify back navigation
- [ ] Verify consistent styling

**Expected**: Seamless integration

#### Test 12.2: Guidance System Integration
- [ ] Change guidance level
- [ ] Verify guidance behavior changes
- [ ] Reset tutorials
- [ ] Verify tours reappear
- [ ] Toggle animations
- [ ] Verify guidance respects preference

**Expected**: Full integration with guidance system

---

### 13. Edge Cases

#### Test 13.1: Rapid Changes
- [ ] Quickly change guidance level multiple times
- [ ] Verify no crashes
- [ ] Verify final state correct
- [ ] Verify no duplicate alerts

**Expected**: Handles rapid changes

#### Test 13.2: Simultaneous Actions
- [ ] Open modal
- [ ] Quickly tap multiple options
- [ ] Verify only one selection processed
- [ ] Verify no race conditions

**Expected**: Handles concurrent actions

#### Test 13.3: Low Memory
- [ ] Simulate low memory condition
- [ ] Open guidance settings
- [ ] Change settings
- [ ] Verify app doesn't crash
- [ ] Verify settings save

**Expected**: Works in low memory

---

### 14. Platform-Specific Testing

#### Test 14.1: iOS Specific
- [ ] Test on iPhone (various sizes)
- [ ] Test on iPad
- [ ] Verify safe area handling
- [ ] Test with VoiceOver
- [ ] Test haptic feedback
- [ ] Test swipe back gesture

**Expected**: Works perfectly on iOS

#### Test 14.2: Android Specific
- [ ] Test on various Android devices
- [ ] Test with TalkBack
- [ ] Test hardware back button
- [ ] Test with different Android versions
- [ ] Verify Material Design compliance

**Expected**: Works perfectly on Android

#### Test 14.3: Web Specific (if applicable)
- [ ] Test in browser
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test responsive design
- [ ] Test hover states

**Expected**: Works perfectly on web

---

## Automated Testing

### Unit Tests

```typescript
describe('Guidance Settings', () => {
  test('should change guidance level', async () => {
    const { result } = renderHook(() => useGuidance());
    await act(async () => {
      await result.current.setGuidanceLevel('minimal');
    });
    expect(result.current.state.settings.guidanceLevel).toBe('minimal');
  });
  
  test('should filter tooltips based on level', () => {
    const { result } = renderHook(() => useGuidance());
    act(() => {
      result.current.setGuidanceLevel('minimal');
    });
    expect(result.current.shouldShowTooltip('general_tip')).toBe(false);
    expect(result.current.shouldShowTooltip('safety_warning')).toBe(true);
  });
  
  test('should reset guidance', async () => {
    const { result } = renderHook(() => useGuidance());
    await act(async () => {
      await result.current.resetGuidance();
    });
    expect(result.current.state.completedTours).toEqual([]);
  });
});
```

### Integration Tests

```typescript
describe('Guidance Settings Integration', () => {
  test('should navigate to guidance settings', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Guidance Settings'));
    expect(screen.getByText('Current Level')).toBeTruthy();
  });
  
  test('should change level and update UI', async () => {
    const { getByText } = render(<GuidanceSettingsScreen />);
    fireEvent.press(getByText('Change Level'));
    fireEvent.press(getByText('Minimal Tips'));
    await waitFor(() => {
      expect(getByText('Minimal Tips')).toBeTruthy();
    });
  });
});
```

---

## Performance Testing

### Test 15.1: Load Time
- [ ] Measure time to open guidance settings
- [ ] Target: < 500ms
- [ ] Test on various devices

### Test 15.2: Settings Change Time
- [ ] Measure time to change guidance level
- [ ] Target: < 100ms
- [ ] Verify no UI lag

### Test 15.3: Memory Usage
- [ ] Monitor memory during use
- [ ] Verify no memory leaks
- [ ] Test with multiple changes

---

## Regression Testing

After any changes to guidance system:
- [ ] Re-run all manual tests
- [ ] Run automated test suite
- [ ] Verify no existing features broken
- [ ] Test on multiple devices
- [ ] Test in multiple languages

---

## Sign-off Checklist

Before marking as complete:
- [ ] All manual tests passed
- [ ] All automated tests passed
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested with screen readers
- [ ] Tested in French and English
- [ ] Performance meets targets
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code reviewed

---

## Bug Report Template

If issues found:

```
**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Device**: 
**OS Version**: 
**App Version**: 
**Language**: 

**Screenshots**: [If applicable]

**Additional Notes**:
```

---

## Test Results Log

| Test | Date | Tester | Result | Notes |
|------|------|--------|--------|-------|
| 1.1 | | | ☐ Pass ☐ Fail | |
| 1.2 | | | ☐ Pass ☐ Fail | |
| ... | | | | |

---

**Testing Status**: ☐ Not Started ☐ In Progress ☐ Complete
**Sign-off**: _________________ Date: _________
