# Contextual Help System - Testing Guide

## 🧪 Testing Overview

This guide provides comprehensive testing procedures for the contextual help system.

## 📋 Pre-Testing Checklist

Before starting tests, ensure:
- [ ] All components are imported correctly
- [ ] GuidanceContext is set up in app root
- [ ] Language settings are configured
- [ ] No TypeScript errors
- [ ] App builds successfully

## 🎯 Component Testing

### 1. Help Button Tests

#### Test 1.1: Button Visibility
**Steps:**
1. Navigate to any major screen
2. Look for help button in bottom-right corner

**Expected:**
- ✅ Button is visible
- ✅ Button has help icon (?)
- ✅ Button has primary color
- ✅ Button has shadow/elevation

**Pass Criteria:** Button is clearly visible and accessible

---

#### Test 1.2: Button Animation
**Steps:**
1. Wait 2 seconds after screen loads
2. Observe help button

**Expected:**
- ✅ Button pulses (scales up slightly)
- ✅ Animation is smooth
- ✅ Animation loops continuously

**Pass Criteria:** Pulsing animation draws attention without being annoying

---

#### Test 1.3: Button Interaction
**Steps:**
1. Tap help button
2. Observe response

**Expected:**
- ✅ Button responds to tap
- ✅ Contextual help modal opens
- ✅ Transition is smooth

**Pass Criteria:** Tapping opens help immediately

---

#### Test 1.4: Button Accessibility
**Steps:**
1. Enable screen reader (TalkBack/VoiceOver)
2. Focus on help button
3. Listen to announcement

**Expected:**
- ✅ Button is focusable
- ✅ Label is announced ("Get help for [screen]")
- ✅ Role is announced ("button")
- ✅ Hint is provided

**Pass Criteria:** Screen reader users can find and use button

---

### 2. Contextual Help Modal Tests

#### Test 2.1: Modal Opening
**Steps:**
1. Tap help button
2. Observe modal

**Expected:**
- ✅ Modal slides up from bottom
- ✅ Backdrop appears (semi-transparent)
- ✅ Animation is smooth
- ✅ Content is visible

**Pass Criteria:** Modal opens smoothly with proper animation

---

#### Test 2.2: Content Accuracy
**Steps:**
1. Open help on different screens
2. Read content for each screen

**Expected:**
- ✅ Title matches screen name
- ✅ Description is relevant
- ✅ Tips are actionable
- ✅ Common issues are accurate

**Pass Criteria:** Content is specific and helpful for each screen

**Test on these screens:**
- Home
- Listing detail
- Chat
- Post/Create listing
- Profile
- Favorites
- Notifications
- Seller dashboard
- Settings

---

#### Test 2.3: Modal Scrolling
**Steps:**
1. Open help modal
2. Try scrolling content

**Expected:**
- ✅ Content scrolls smoothly
- ✅ Header stays fixed
- ✅ Scroll indicator appears
- ✅ Can scroll to bottom

**Pass Criteria:** All content is accessible via scrolling

---

#### Test 2.4: Modal Closing
**Steps:**
1. Open help modal
2. Try closing via:
   - Close button (X)
   - Tapping backdrop
   - Back button (Android)

**Expected:**
- ✅ Modal closes via all methods
- ✅ Slide down animation plays
- ✅ Returns to screen properly

**Pass Criteria:** Modal can be closed easily

---

#### Test 2.5: Language Support
**Steps:**
1. Change app language to French
2. Open help modal
3. Change to English
4. Open help modal again

**Expected:**
- ✅ Content is in French when language is FR
- ✅ Content is in English when language is EN
- ✅ All text is translated
- ✅ No missing translations

**Pass Criteria:** Both languages work correctly

---

### 3. Inactivity Detector Tests

#### Test 3.1: Timer Activation
**Steps:**
1. Navigate to a screen with inactivity detector
2. Don't interact for 30 seconds
3. Observe

**Expected:**
- ✅ Prompt appears after 30 seconds
- ✅ Prompt slides down from top
- ✅ Message is clear
- ✅ Two buttons are visible

**Pass Criteria:** Prompt appears at correct time

---

#### Test 3.2: Timer Reset
**Steps:**
1. Wait 20 seconds
2. Tap anywhere on screen
3. Wait another 20 seconds

**Expected:**
- ✅ Prompt doesn't appear at 20s
- ✅ Timer resets on interaction
- ✅ Prompt appears 30s after last interaction

**Pass Criteria:** Timer resets on any interaction

---

#### Test 3.3: Get Help Action
**Steps:**
1. Wait for inactivity prompt
2. Tap "Get Help" button

**Expected:**
- ✅ Prompt dismisses
- ✅ Contextual help modal opens
- ✅ Transition is smooth

**Pass Criteria:** Help opens when requested

---

#### Test 3.4: Dismiss Action
**Steps:**
1. Wait for inactivity prompt
2. Tap "No, thanks" button

**Expected:**
- ✅ Prompt dismisses
- ✅ Timer resets
- ✅ Prompt appears again after 30s

**Pass Criteria:** Dismissing works and timer resets

---

#### Test 3.5: Guidance Level Respect
**Steps:**
1. Set guidance level to "off"
2. Wait 30 seconds

**Expected:**
- ✅ Prompt doesn't appear
- ✅ Detector is disabled

**Pass Criteria:** Respects user preferences

---

### 4. Error With Solution Tests

#### Test 4.1: Network Error
**Steps:**
1. Trigger network error
2. Observe error modal

**Expected:**
- ✅ Modal appears
- ✅ Title: "Connection Error" (or FR equivalent)
- ✅ 4 solutions listed
- ✅ Retry button present

**Pass Criteria:** Network error shows correct solutions

---

#### Test 4.2: Upload Error
**Steps:**
1. Try uploading large file
2. Observe error modal

**Expected:**
- ✅ Modal appears
- ✅ Title: "Upload Failed"
- ✅ Solutions mention file size/format
- ✅ Retry button present

**Pass Criteria:** Upload error shows correct solutions

---

#### Test 4.3: Auth Error
**Steps:**
1. Try logging in with wrong credentials
2. Observe error modal

**Expected:**
- ✅ Modal appears
- ✅ Title: "Authentication Error"
- ✅ Solutions mention credentials
- ✅ Retry button present

**Pass Criteria:** Auth error shows correct solutions

---

#### Test 4.4: Validation Error
**Steps:**
1. Submit form with missing fields
2. Observe error modal

**Expected:**
- ✅ Modal appears
- ✅ Title: "Validation Error"
- ✅ Solutions mention required fields
- ✅ Review button present

**Pass Criteria:** Validation error shows correct solutions

---

#### Test 4.5: Credits Error
**Steps:**
1. Try action requiring credits without enough
2. Observe error modal

**Expected:**
- ✅ Modal appears
- ✅ Title: "Insufficient Credits"
- ✅ Solutions mention buying credits
- ✅ Buy Credits button present

**Pass Criteria:** Credits error shows correct solutions

---

#### Test 4.6: Error Retry
**Steps:**
1. Trigger any error with retry
2. Tap retry button

**Expected:**
- ✅ Modal closes
- ✅ Action retries
- ✅ Retry callback is called

**Pass Criteria:** Retry functionality works

---

#### Test 4.7: Error Language
**Steps:**
1. Trigger error in French
2. Change to English
3. Trigger error again

**Expected:**
- ✅ Error in French when language is FR
- ✅ Error in English when language is EN
- ✅ All text is translated

**Pass Criteria:** Errors work in both languages

---

### 5. Help Center Tests

#### Test 5.1: Search Functionality
**Steps:**
1. Open help center
2. Type in search bar
3. Observe results

**Expected:**
- ✅ Results filter in real-time
- ✅ Matching FAQs are shown
- ✅ Non-matching FAQs are hidden
- ✅ Search is case-insensitive

**Pass Criteria:** Search filters FAQs correctly

---

#### Test 5.2: Search Clear
**Steps:**
1. Type in search bar
2. Tap clear button (X)

**Expected:**
- ✅ Search text clears
- ✅ All FAQs reappear
- ✅ Clear button disappears

**Pass Criteria:** Clear button works

---

#### Test 5.3: No Results
**Steps:**
1. Search for nonsense text
2. Observe

**Expected:**
- ✅ "No results" message appears
- ✅ Suggestion to try other keywords
- ✅ No FAQs are shown

**Pass Criteria:** No results state is helpful

---

#### Test 5.4: FAQ Expansion
**Steps:**
1. Tap any FAQ question
2. Observe

**Expected:**
- ✅ Answer expands smoothly
- ✅ Chevron icon rotates
- ✅ Answer is readable

**Pass Criteria:** FAQs expand/collapse properly

---

#### Test 5.5: Category Grouping
**Steps:**
1. Scroll through help center
2. Observe organization

**Expected:**
- ✅ FAQs are grouped by category
- ✅ Category headers are visible
- ✅ Categories are in logical order

**Pass Criteria:** Categories organize content well

---

#### Test 5.6: Help Center Language
**Steps:**
1. Open help center in French
2. Change to English
3. Open help center again

**Expected:**
- ✅ FAQs are in French when language is FR
- ✅ FAQs are in English when language is EN
- ✅ All content is translated

**Pass Criteria:** Help center works in both languages

---

## 🔄 Integration Tests

### Integration Test 1: Complete Help Flow
**Steps:**
1. Open app
2. Navigate to home screen
3. Wait 30 seconds (inactivity)
4. Tap "Get Help" on prompt
5. Read contextual help
6. Tap "View full help center"
7. Search for a question
8. Expand an answer
9. Go back to home

**Expected:**
- ✅ All transitions are smooth
- ✅ No crashes or errors
- ✅ Help content is relevant
- ✅ Navigation works correctly

**Pass Criteria:** Complete flow works end-to-end

---

### Integration Test 2: Error Recovery Flow
**Steps:**
1. Trigger a network error
2. Read error solutions
3. Tap retry
4. If fails again, tap help button
5. Read contextual help
6. Try action again

**Expected:**
- ✅ Error modal shows
- ✅ Solutions are helpful
- ✅ Retry works
- ✅ Help is accessible
- ✅ Can recover from error

**Pass Criteria:** User can recover from errors

---

### Integration Test 3: Multi-Screen Help
**Steps:**
1. Open help on home screen
2. Navigate to listing detail
3. Open help again
4. Navigate to chat
5. Open help again

**Expected:**
- ✅ Help content changes per screen
- ✅ No content from previous screen
- ✅ All content is relevant
- ✅ No memory leaks

**Pass Criteria:** Help adapts to each screen

---

## ♿ Accessibility Tests

### Accessibility Test 1: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate to help button
3. Activate help button
4. Navigate through modal

**Expected:**
- ✅ All elements are announced
- ✅ Labels are descriptive
- ✅ Navigation is logical
- ✅ Can close modal

**Pass Criteria:** Fully usable with screen reader

---

### Accessibility Test 2: Keyboard Navigation
**Steps:**
1. Use keyboard only (web/desktop)
2. Tab to help button
3. Press Enter
4. Tab through modal
5. Press Escape

**Expected:**
- ✅ Can reach all interactive elements
- ✅ Focus is visible
- ✅ Enter activates buttons
- ✅ Escape closes modal

**Pass Criteria:** Fully usable with keyboard

---

### Accessibility Test 3: High Contrast
**Steps:**
1. Enable high contrast mode
2. Open help components

**Expected:**
- ✅ All text is readable
- ✅ Buttons are visible
- ✅ Icons are clear
- ✅ Contrast ratios meet WCAG AA

**Pass Criteria:** Usable in high contrast mode

---

### Accessibility Test 4: Large Text
**Steps:**
1. Increase system font size
2. Open help components

**Expected:**
- ✅ Text scales appropriately
- ✅ Layout doesn't break
- ✅ All content is readable
- ✅ Buttons are still tappable

**Pass Criteria:** Works with large text

---

## 📱 Device Tests

### Device Test 1: Small Phone (< 5")
**Steps:**
1. Test on small phone
2. Open all help components

**Expected:**
- ✅ Components fit on screen
- ✅ Text is readable
- ✅ Buttons are tappable
- ✅ No horizontal scrolling

**Pass Criteria:** Works on small screens

---

### Device Test 2: Large Phone (> 6")
**Steps:**
1. Test on large phone
2. Open all help components

**Expected:**
- ✅ Components use space well
- ✅ Text is not too small
- ✅ Layout is balanced

**Pass Criteria:** Works on large screens

---

### Device Test 3: Tablet
**Steps:**
1. Test on tablet
2. Open all help components

**Expected:**
- ✅ Modals are centered
- ✅ Max width is respected
- ✅ Layout is optimized

**Pass Criteria:** Works on tablets

---

## ⚡ Performance Tests

### Performance Test 1: Animation Smoothness
**Steps:**
1. Open/close help modal 10 times
2. Observe frame rate

**Expected:**
- ✅ Animations are smooth (60fps)
- ✅ No stuttering
- ✅ No lag

**Pass Criteria:** Animations are consistently smooth

---

### Performance Test 2: Memory Usage
**Steps:**
1. Open help on multiple screens
2. Monitor memory usage

**Expected:**
- ✅ No memory leaks
- ✅ Memory is released when closed
- ✅ App remains responsive

**Pass Criteria:** No memory issues

---

### Performance Test 3: Search Performance
**Steps:**
1. Type quickly in search bar
2. Observe filtering speed

**Expected:**
- ✅ Results update in real-time
- ✅ No lag or delay
- ✅ Typing is responsive

**Pass Criteria:** Search is fast and responsive

---

## 🐛 Edge Case Tests

### Edge Case 1: Rapid Interactions
**Steps:**
1. Rapidly tap help button multiple times
2. Observe behavior

**Expected:**
- ✅ Modal opens once
- ✅ No duplicate modals
- ✅ No crashes

**Pass Criteria:** Handles rapid taps gracefully

---

### Edge Case 2: Network Changes
**Steps:**
1. Open help
2. Turn off internet
3. Interact with help

**Expected:**
- ✅ Help still works (offline)
- ✅ Content is cached
- ✅ No errors

**Pass Criteria:** Works offline

---

### Edge Case 3: Language Change During Use
**Steps:**
1. Open help modal
2. Change language (via settings)
3. Close and reopen modal

**Expected:**
- ✅ Content updates to new language
- ✅ No crashes
- ✅ Layout adjusts if needed

**Pass Criteria:** Handles language changes

---

### Edge Case 4: Guidance Level Changes
**Steps:**
1. Set guidance to "full"
2. Open help
3. Set guidance to "off"
4. Try opening help

**Expected:**
- ✅ Help respects new setting
- ✅ Inactivity detector disables
- ✅ Help button still works

**Pass Criteria:** Respects guidance settings

---

## 📊 Test Results Template

Use this template to record test results:

```
Test: [Test Name]
Date: [Date]
Tester: [Name]
Device: [Device Model]
OS: [OS Version]
App Version: [Version]

Result: ✅ PASS / ❌ FAIL

Notes:
- [Any observations]
- [Issues found]
- [Suggestions]

Screenshots: [Attach if needed]
```

---

## ✅ Test Completion Checklist

Mark each category when all tests pass:

- [ ] Help Button Tests (4 tests)
- [ ] Contextual Help Modal Tests (5 tests)
- [ ] Inactivity Detector Tests (5 tests)
- [ ] Error With Solution Tests (7 tests)
- [ ] Help Center Tests (6 tests)
- [ ] Integration Tests (3 tests)
- [ ] Accessibility Tests (4 tests)
- [ ] Device Tests (3 tests)
- [ ] Performance Tests (3 tests)
- [ ] Edge Case Tests (4 tests)

**Total Tests: 44**

---

## 🚨 Critical Issues

If any of these fail, fix immediately:

1. Help button not visible
2. Modal doesn't open
3. Inactivity detector doesn't work
4. Error solutions are wrong
5. Search doesn't work
6. Screen reader can't access help
7. App crashes when opening help
8. Content is in wrong language

---

## 📝 Bug Report Template

```
Title: [Brief description]

Component: [Which component]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Device: [Device model]
OS: [OS version]
App Version: [Version]

Screenshots: [Attach]

Severity: Critical / High / Medium / Low
```

---

## ✨ Test Automation

Consider automating these tests:

```typescript
// Example: Help button visibility test
describe('HelpButton', () => {
  it('should be visible on screen', () => {
    const { getByLabelText } = render(<HomeScreen />);
    const helpButton = getByLabelText(/get help/i);
    expect(helpButton).toBeTruthy();
  });
});

// Example: Inactivity detection test
describe('InactivityDetector', () => {
  it('should show prompt after threshold', async () => {
    jest.useFakeTimers();
    const { getByText } = render(<ScreenWithDetector />);
    
    jest.advanceTimersByTime(30000);
    
    expect(getByText(/need help/i)).toBeTruthy();
  });
});
```

---

## 🎓 Testing Best Practices

1. **Test on Real Devices**: Emulators don't catch everything
2. **Test Both Languages**: Don't assume translations work
3. **Test Accessibility**: Use screen readers regularly
4. **Test Edge Cases**: Users will find them
5. **Document Issues**: Clear bug reports help developers
6. **Retest After Fixes**: Verify fixes work
7. **Test Performance**: Smooth UX is critical
8. **Get User Feedback**: Real users find real issues

---

## 📞 Support

If you find issues or have questions:
1. Check the README for documentation
2. Review the example file for usage
3. Contact the development team
4. File a bug report with details

