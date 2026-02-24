# Search and Filter Guidance - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the search and filter guidance features implemented in Task 13.

## Prerequisites
- App running on device or simulator
- Fresh install or cleared guidance state (for first-time experience testing)
- Access to both English and French language settings

## Test Scenarios

### Scenario 1: Search Bar Tooltip (Requirement 8.1)

**Objective:** Verify search tooltip appears and provides helpful tips

**Steps:**
1. Launch the app and navigate to home screen
2. Wait 1 second after home screen loads
3. Observe search bar area

**Expected Results:**
- ✅ Tooltip appears below search bar
- ✅ Shows icon 🔍
- ✅ Title: "Search Tips" (EN) or "Conseils de recherche" (FR)
- ✅ Message includes examples like "Samsung", "furniture", "bike"
- ✅ Has "Got it" / "Compris" dismiss button

**Test Dismissal:**
1. Tap "Got it" button
2. Navigate away and return to home screen

**Expected Results:**
- ✅ Tooltip does not reappear
- ✅ State persisted in AsyncStorage

**Test Auto-Dismiss:**
1. Clear guidance state
2. Return to home screen
3. Wait for tooltip to appear
4. Tap search bar and start typing

**Expected Results:**
- ✅ Tooltip dismisses automatically
- ✅ Search input receives focus
- ✅ Tooltip marked as dismissed in state

---

### Scenario 2: No Results Suggestions (Requirement 8.2)

**Objective:** Verify helpful suggestions appear when search returns no results

**Steps:**
1. Navigate to home screen
2. Tap search bar
3. Type a query that returns no results (e.g., "xyzabc123")
4. Wait 1.5 seconds

**Expected Results:**
- ✅ Contextual prompt appears
- ✅ Shows search icon
- ✅ Message: "No results for '[query]'. Try these suggestions:"
- ✅ Displays 4 suggestions:
  - Try more general keywords
  - Check your spelling
  - Remove active filters
  - Expand your search radius

**Test Suggestions:**
1. Tap on "Remove active filters" suggestion

**Expected Results:**
- ✅ Prompt dismisses
- ✅ Action is tracked

**Test Dismissal:**
1. Perform another no-results search
2. Tap outside the prompt or dismiss button

**Expected Results:**
- ✅ Prompt dismisses
- ✅ State updated

---

### Scenario 3: Filter Panel Tour (Requirement 8.3)

**Objective:** Verify filter panel tour guides users through filter features

**Steps:**
1. Navigate to home screen
2. Tap the filter button (sliders icon)
3. Wait 300ms for modal to open

**Expected Results:**
- ✅ Filter panel opens
- ✅ Tour overlay appears
- ✅ First step shows: "Search Filters 🎯"
- ✅ Message explains filter purpose
- ✅ Has "Show me" and "Skip" buttons

**Test Tour Navigation:**
1. Tap "Show me" / "Montrez-moi"
2. Observe step 2

**Expected Results:**
- ✅ Step 2 appears: "Price Range"
- ✅ Explains price filtering
- ✅ Has "Next" button

**Continue Tour:**
1. Tap "Next" / "Suivant"
2. Observe step 3

**Expected Results:**
- ✅ Step 3 appears: "Sort Results"
- ✅ Explains sorting options
- ✅ Has "Got it" button

**Complete Tour:**
1. Tap "Got it" / "Compris"

**Expected Results:**
- ✅ Tour dismisses
- ✅ Tour marked as completed
- ✅ Location filter tooltip appears after 500ms

**Test Skip:**
1. Clear guidance state
2. Open filter panel again
3. Tap "Skip" on first step

**Expected Results:**
- ✅ Tour dismisses immediately
- ✅ Tour marked as completed
- ✅ Won't appear again

---

### Scenario 4: Location Filter Explanation (Requirement 8.4)

**Objective:** Verify location filter tooltip explains search radius

**Steps:**
1. Complete filter panel tour (or have it already completed)
2. Open filter panel
3. Wait 1 second

**Expected Results:**
- ✅ Tooltip appears near location filter area
- ✅ Shows icon 📍
- ✅ Title: "Distance Filter" (EN) or "Filtre de distance" (FR)
- ✅ Explains radius relationship to results
- ✅ Has dismiss button

**Test Content:**
- ✅ English: "Choose a search radius to see items nearby. The smaller the radius, the closer the results!"
- ✅ French: "Choisissez un rayon de recherche pour voir les articles à proximité. Plus le rayon est petit, plus les résultats sont proches !"

**Test Dismissal:**
1. Tap dismiss button

**Expected Results:**
- ✅ Tooltip dismisses
- ✅ Won't reappear on subsequent filter panel opens

---

### Scenario 5: Real-time Price Filter Feedback (Requirement 8.5)

**Objective:** Verify live feedback as users adjust price filters

**Setup:**
1. Navigate to home screen
2. Note the current number of listings
3. Open filter panel

**Test Minimum Price:**
1. Enter "100" in minimum price field
2. Observe feedback

**Expected Results:**
- ✅ Feedback banner appears at top of screen
- ✅ Shows pricetag icon
- ✅ Message: "Showing items from $100 • X results"
- ✅ Result count updates in real-time
- ✅ Banner fades out after 2 seconds

**Test Maximum Price:**
1. Clear minimum price
2. Enter "500" in maximum price field
3. Observe feedback

**Expected Results:**
- ✅ Feedback banner appears
- ✅ Message: "Showing items up to $500 • X results"
- ✅ Result count accurate
- ✅ Banner fades out after 2 seconds

**Test Price Range:**
1. Enter "100" in minimum
2. Enter "500" in maximum
3. Observe feedback

**Expected Results:**
- ✅ Feedback banner appears
- ✅ Message: "Showing items between $100 and $500 • X results"
- ✅ Result count shows filtered results
- ✅ Banner fades out after 2 seconds

**Test Rapid Changes:**
1. Quickly change min price multiple times
2. Observe feedback behavior

**Expected Results:**
- ✅ Feedback updates smoothly
- ✅ No flickering or lag
- ✅ Always shows current filter state
- ✅ Animation is smooth

**Test Apply Filters:**
1. Set price range
2. Tap "Apply" / "Appliquer"
3. Observe home screen

**Expected Results:**
- ✅ Modal closes
- ✅ Listings filtered correctly
- ✅ Feedback banner shows on home screen
- ✅ Result count matches displayed listings

---

## Language Testing

### English Language Test

**Steps:**
1. Set app language to English
2. Clear guidance state
3. Run through all scenarios above

**Expected Results:**
- ✅ All tooltips in English
- ✅ All tours in English
- ✅ All prompts in English
- ✅ All feedback in English
- ✅ Grammar and spelling correct
- ✅ Culturally appropriate examples

### French Language Test

**Steps:**
1. Set app language to French
2. Clear guidance state
3. Run through all scenarios above

**Expected Results:**
- ✅ All tooltips in French
- ✅ All tours in French
- ✅ All prompts in French
- ✅ All feedback in French
- ✅ Grammar and spelling correct
- ✅ Culturally appropriate examples

### Language Switching Test

**Steps:**
1. Start with English
2. Trigger search tooltip
3. Switch to French mid-display
4. Observe tooltip

**Expected Results:**
- ✅ Tooltip content updates to French
- ✅ No layout issues
- ✅ Smooth transition

---

## Integration Testing

### Test with Existing Home Guidance

**Steps:**
1. Clear all guidance state
2. Navigate to home screen
3. Observe guidance sequence

**Expected Results:**
- ✅ Home tour appears first
- ✅ After home tour, search tooltip appears
- ✅ No conflicts between guidance systems
- ✅ Smooth transitions

### Test with Active Filters

**Steps:**
1. Apply category filter
2. Apply price filter
3. Apply location radius
4. Perform search with no results

**Expected Results:**
- ✅ No results prompt appears
- ✅ Suggestions include "Remove active filters"
- ✅ All filters visible in UI
- ✅ Feedback shows combined filter effect

### Test with Location Services

**Steps:**
1. Enable location services
2. Set search radius to 10km
3. Open filter panel
4. Observe location filter tooltip

**Expected Results:**
- ✅ Tooltip appears correctly
- ✅ Explains radius functionality
- ✅ Radius selector works
- ✅ Results update based on location

---

## Edge Cases

### Edge Case 1: Very Long Search Query

**Steps:**
1. Enter a search query with 100+ characters
2. Observe no results prompt

**Expected Results:**
- ✅ Prompt displays correctly
- ✅ Query text truncated if needed
- ✅ No layout overflow

### Edge Case 2: Special Characters in Search

**Steps:**
1. Search for: "!@#$%^&*()"
2. Observe no results prompt

**Expected Results:**
- ✅ Prompt appears
- ✅ Special characters displayed correctly
- ✅ No crashes or errors

### Edge Case 3: Rapid Filter Panel Open/Close

**Steps:**
1. Rapidly open and close filter panel 10 times
2. Observe tour behavior

**Expected Results:**
- ✅ Tour only triggers once
- ✅ No duplicate overlays
- ✅ No memory leaks
- ✅ Smooth performance

### Edge Case 4: Invalid Price Values

**Steps:**
1. Enter "abc" in price fields
2. Enter negative numbers
3. Enter very large numbers (999999999)

**Expected Results:**
- ✅ Input validation works
- ✅ Feedback shows appropriate message
- ✅ No crashes
- ✅ Graceful error handling

### Edge Case 5: No Location Permission

**Steps:**
1. Deny location permission
2. Open filter panel
3. Observe location filter tooltip

**Expected Results:**
- ✅ Tooltip still appears
- ✅ Explains functionality
- ✅ Gracefully handles missing location
- ✅ No crashes

---

## Performance Testing

### Performance Test 1: Tooltip Render Time

**Steps:**
1. Use React DevTools Profiler
2. Trigger search tooltip
3. Measure render time

**Expected Results:**
- ✅ Renders in < 100ms
- ✅ No janky animations
- ✅ Smooth appearance

### Performance Test 2: Price Feedback Animation

**Steps:**
1. Monitor frame rate during price feedback
2. Change price filters rapidly
3. Observe animation smoothness

**Expected Results:**
- ✅ Maintains 60fps
- ✅ No dropped frames
- ✅ Smooth fade in/out

### Performance Test 3: Memory Usage

**Steps:**
1. Monitor memory usage
2. Trigger all guidance features
3. Dismiss all guidance
4. Check for memory leaks

**Expected Results:**
- ✅ No memory leaks
- ✅ Proper cleanup on unmount
- ✅ Reasonable memory footprint

---

## Accessibility Testing

### Screen Reader Test

**Steps:**
1. Enable VoiceOver (iOS) or TalkBack (Android)
2. Navigate to search bar
3. Trigger tooltip
4. Listen to announcement

**Expected Results:**
- ✅ Tooltip content announced
- ✅ Dismiss button accessible
- ✅ Clear, understandable announcement

### Keyboard Navigation Test

**Steps:**
1. Use keyboard/external keyboard
2. Navigate to filter panel
3. Tab through filter options

**Expected Results:**
- ✅ All interactive elements focusable
- ✅ Focus order logical
- ✅ Tooltips don't block navigation

---

## Regression Testing

### Verify Existing Features Still Work

**Checklist:**
- [ ] Search functionality works
- [ ] Filter panel opens/closes
- [ ] Price filters apply correctly
- [ ] Category filters work
- [ ] Location filters work
- [ ] Sort options work
- [ ] Listings display correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No layout issues

---

## Bug Reporting Template

If you find issues, report using this template:

```
**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Requirement:** [e.g., 8.1, 8.2, etc.]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Video:**
[Attach if applicable]

**Environment:**
- Device: [e.g., iPhone 14, Pixel 6]
- OS: [e.g., iOS 17, Android 13]
- App Version: [version number]
- Language: [EN / FR]

**Additional Notes:**
[Any other relevant information]
```

---

## Test Completion Checklist

### Functional Tests
- [ ] Search bar tooltip (8.1)
- [ ] No results suggestions (8.2)
- [ ] Filter panel tour (8.3)
- [ ] Location filter explanation (8.4)
- [ ] Real-time price feedback (8.5)

### Language Tests
- [ ] English content
- [ ] French content
- [ ] Language switching

### Integration Tests
- [ ] Home guidance integration
- [ ] Active filters integration
- [ ] Location services integration

### Edge Cases
- [ ] Long search queries
- [ ] Special characters
- [ ] Rapid interactions
- [ ] Invalid inputs
- [ ] Missing permissions

### Performance Tests
- [ ] Render performance
- [ ] Animation smoothness
- [ ] Memory usage

### Accessibility Tests
- [ ] Screen reader support
- [ ] Keyboard navigation

### Regression Tests
- [ ] Existing features work
- [ ] No new errors

---

## Sign-Off

**Tester Name:** ___________________

**Date:** ___________________

**Test Result:** Pass / Fail / Partial

**Notes:**
___________________________________________
___________________________________________
___________________________________________

**Approved By:** ___________________

**Date:** ___________________
