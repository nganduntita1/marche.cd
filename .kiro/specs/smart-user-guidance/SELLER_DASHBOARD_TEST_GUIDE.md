# Seller Dashboard Guidance - Test Guide

## Manual Testing Checklist

### Pre-Test Setup

1. **Clear Guidance State**
   ```typescript
   // In app, clear AsyncStorage for guidance
   AsyncStorage.removeItem('guidance_state');
   ```

2. **Create Test Data**
   - Create at least 3 listings
   - Ensure 1-2 listings have low views (< 10)
   - Have some active conversations

3. **Test Both Languages**
   - Test in French (default)
   - Test in English
   - Verify all content translates

---

## Test Cases

### TC1: Dashboard Tour (First Visit)

**Requirement**: 11.1

**Steps**:
1. Clear guidance state
2. Navigate to seller dashboard
3. Observe tour modal

**Expected Results**:
- ✅ Tour modal appears automatically
- ✅ Shows "Seller Dashboard" title with 🎯 icon
- ✅ Displays 4 feature descriptions
- ✅ Shows "Got it!" button
- ✅ Content is in correct language

**Verification**:
- [ ] Tour appears on first visit
- [ ] All 4 features listed
- [ ] Button is clickable
- [ ] Modal dismisses on click
- [ ] Tour doesn't show on second visit

---

### TC2: Low-View Listing Detection

**Requirement**: 11.2

**Setup**:
- Create listing with < 10 views
- Wait 24 hours or set daysActive = 1

**Steps**:
1. Open seller dashboard
2. Scroll to guidance section
3. Observe warning card

**Expected Results**:
- ✅ Warning card appears with ⚠️ icon
- ✅ Shows "Needs Attention" title
- ✅ Lists low-view listings
- ✅ Shows view count and days active
- ✅ Displays 4 suggestions
- ✅ Shows Edit and Promote buttons

**Verification**:
- [ ] Card appears for low-view listings
- [ ] Listing title displayed correctly
- [ ] View count accurate
- [ ] All 4 suggestions shown
- [ ] Edit button navigates correctly
- [ ] Promote button navigates correctly

---

### TC3: Response Templates

**Requirement**: 11.3

**Steps**:
1. Open seller dashboard
2. Click "Quick Responses" card
3. Observe templates modal

**Expected Results**:
- ✅ Modal opens with slide animation
- ✅ Shows "Quick Responses" title with 💬 icon
- ✅ Displays 6 templates
- ✅ Each template has icon, title, and preview
- ✅ Templates are tappable
- ✅ Close button (✕) works

**Verification**:
- [ ] Modal opens smoothly
- [ ] All 6 templates visible
- [ ] Template categories correct:
  - [ ] ✅ Item Available
  - [ ] 💰 Price Firm
  - [ ] 🤝 Open to Offers
  - [ ] 📍 Arrange Meeting
  - [ ] 📅 Schedule Viewing
  - [ ] 📝 More Details
- [ ] Tapping template selects it
- [ ] Modal closes after selection
- [ ] Close button works

---

### TC4: Mark as Sold Guidance

**Requirement**: 11.4

**Steps**:
1. Trigger mark-as-sold action
2. Observe guidance modal

**Expected Results**:
- ✅ Modal appears with fade animation
- ✅ Shows "Mark as Sold" title with ✅ icon
- ✅ Displays 4 process steps
- ✅ Shows info box with 💡 tip
- ✅ Has Cancel and Continue buttons

**Verification**:
- [ ] Modal appears correctly
- [ ] All 4 steps listed:
  - [ ] ✅ Mark item as sold
  - [ ] 👤 Select buyer
  - [ ] ⭐ Rate experience
  - [ ] 💬 Buyer rates you
- [ ] Info box visible
- [ ] Cancel button dismisses modal
- [ ] Continue button proceeds

---

### TC5: Promotion Options

**Requirement**: 11.5

**Steps**:
1. Open seller dashboard
2. Click "Promotions" card
3. Observe promotion modal

**Expected Results**:
- ✅ Modal opens with slide animation
- ✅ Shows "Promotion Options" title with ✨ icon
- ✅ Displays 3 promotion tiers
- ✅ Each tier shows icon, title, cost, description, benefit
- ✅ Shows tip box at bottom
- ✅ Has "Got it!" button

**Verification**:
- [ ] Modal opens smoothly
- [ ] All 3 tiers visible:
  - [ ] ⭐ Featured Listing (500 FC, 7 days, 5x views)
  - [ ] 🚀 Boost (300 FC, 3 days, 3x views)
  - [ ] 📍 Local Highlight (400 FC, 5 days, 4x local views)
- [ ] Costs displayed correctly
- [ ] Benefits shown with 🎯 icon
- [ ] Tip box visible
- [ ] Button dismisses modal

---

### TC6: Quick Action Cards

**Steps**:
1. Open seller dashboard
2. Scroll to guidance section
3. Observe quick action cards

**Expected Results**:
- ✅ Two cards displayed side-by-side
- ✅ "Quick Responses" card with 💬 icon
- ✅ "Promotions" card with ✨ icon
- ✅ Cards are tappable
- ✅ Cards have hover/press feedback

**Verification**:
- [ ] Both cards visible
- [ ] Icons displayed correctly
- [ ] Titles and descriptions clear
- [ ] Cards respond to touch
- [ ] Visual feedback on press
- [ ] Cards open correct modals

---

### TC7: Language Switching

**Steps**:
1. Set app language to French
2. Open seller dashboard
3. Verify all content in French
4. Switch to English
5. Verify all content in English

**Expected Results**:
- ✅ All guidance content updates
- ✅ Tour content translated
- ✅ Templates translated
- ✅ Promotion options translated
- ✅ Button labels translated

**Verification**:
- [ ] French content correct
- [ ] English content correct
- [ ] No mixed languages
- [ ] Translations accurate
- [ ] Cultural appropriateness

---

### TC8: State Persistence

**Steps**:
1. View dashboard tour
2. Dismiss tour
3. Close app
4. Reopen app
5. Navigate to seller dashboard

**Expected Results**:
- ✅ Tour doesn't show again
- ✅ State persisted correctly
- ✅ Other guidance still works

**Verification**:
- [ ] Tour dismissed permanently
- [ ] State saved to AsyncStorage
- [ ] State loads on app restart
- [ ] Other features unaffected

---

### TC9: No Low-View Listings

**Setup**:
- Ensure all listings have > 10 views

**Steps**:
1. Open seller dashboard
2. Observe guidance section

**Expected Results**:
- ✅ No warning card appears
- ✅ Quick action cards still visible
- ✅ No errors or empty states

**Verification**:
- [ ] Warning card not shown
- [ ] Quick actions still work
- [ ] No console errors
- [ ] Layout looks correct

---

### TC10: Multiple Low-View Listings

**Setup**:
- Create 3+ listings with < 10 views

**Steps**:
1. Open seller dashboard
2. Observe warning card

**Expected Results**:
- ✅ All low-view listings shown
- ✅ Each listing has own card
- ✅ Suggestions shown for each
- ✅ Actions work for each

**Verification**:
- [ ] All listings displayed
- [ ] Cards stacked vertically
- [ ] Each has edit/promote buttons
- [ ] Buttons navigate correctly
- [ ] No performance issues

---

## Edge Cases

### E1: Empty Dashboard
- **Scenario**: No listings at all
- **Expected**: Guidance still loads, no errors
- **Verify**: Quick actions work, tour shows

### E2: Very Long Listing Titles
- **Scenario**: Listing title > 50 characters
- **Expected**: Title truncates with ellipsis
- **Verify**: Layout doesn't break

### E3: Rapid Modal Opening
- **Scenario**: Quickly tap multiple cards
- **Expected**: Only one modal opens at a time
- **Verify**: No modal stacking

### E4: Network Failure
- **Scenario**: Load dashboard offline
- **Expected**: Guidance loads from cache
- **Verify**: No crashes, graceful degradation

### E5: Missing Translation
- **Scenario**: Content missing in one language
- **Expected**: Falls back to default language
- **Verify**: No blank content

---

## Performance Testing

### P1: Modal Animation
- **Test**: Open/close modals repeatedly
- **Expected**: Smooth 60fps animation
- **Measure**: No frame drops

### P2: Large Listing Count
- **Test**: Dashboard with 50+ listings
- **Expected**: Guidance loads quickly
- **Measure**: < 100ms render time

### P3: Memory Usage
- **Test**: Open/close guidance multiple times
- **Expected**: No memory leaks
- **Measure**: Stable memory usage

---

## Accessibility Testing

### A1: Screen Reader
- **Test**: Enable VoiceOver/TalkBack
- **Expected**: All content readable
- **Verify**: Proper labels and hints

### A2: Touch Targets
- **Test**: Measure button sizes
- **Expected**: Minimum 44x44pt
- **Verify**: Easy to tap

### A3: Color Contrast
- **Test**: Check text contrast ratios
- **Expected**: WCAG AA compliance
- **Verify**: Readable in all conditions

### A4: Keyboard Navigation
- **Test**: Navigate with keyboard
- **Expected**: Logical tab order
- **Verify**: All actions accessible

---

## Integration Testing

### I1: Navigation Flow
- **Test**: Complete seller workflow
- **Expected**: Smooth transitions
- **Verify**: No broken links

### I2: Data Consistency
- **Test**: Update listing, check guidance
- **Expected**: Guidance reflects changes
- **Verify**: Real-time updates

### I3: Cross-Screen State
- **Test**: Navigate between screens
- **Expected**: Guidance state persists
- **Verify**: No state loss

---

## Regression Testing

### R1: Existing Features
- **Test**: All dashboard features
- **Expected**: Nothing broken
- **Verify**: Stats, listings, actions work

### R2: Other Guidance
- **Test**: Profile, posting guidance
- **Expected**: Still functional
- **Verify**: No conflicts

### R3: Performance
- **Test**: Dashboard load time
- **Expected**: No slowdown
- **Verify**: < 1s load time

---

## Bug Report Template

```markdown
### Bug Title
[Brief description]

### Severity
[ ] Critical - Blocks usage
[ ] High - Major feature broken
[ ] Medium - Feature partially broken
[ ] Low - Minor issue

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Device: 
- OS Version: 
- App Version: 
- Language: 

### Screenshots
[Attach if applicable]

### Additional Notes
[Any other relevant information]
```

---

## Test Results Summary

### Test Execution Date: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Dashboard Tour | ⬜ | |
| TC2: Low-View Detection | ⬜ | |
| TC3: Response Templates | ⬜ | |
| TC4: Mark as Sold | ⬜ | |
| TC5: Promotion Options | ⬜ | |
| TC6: Quick Actions | ⬜ | |
| TC7: Language Switch | ⬜ | |
| TC8: State Persistence | ⬜ | |
| TC9: No Low-View | ⬜ | |
| TC10: Multiple Low-View | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Partial | ⬜ Not Tested

### Overall Status: ___________

### Issues Found: ___________

### Recommendations: ___________

---

## Sign-Off

**Tester**: ___________________
**Date**: ___________________
**Approved**: ⬜ Yes ⬜ No

---

## Notes for Testers

1. **Test in both languages** - French and English
2. **Test on multiple devices** - Phone, tablet, different screen sizes
3. **Test with real data** - Use actual listings and conversations
4. **Document everything** - Screenshots, videos, detailed notes
5. **Report immediately** - Don't wait to report critical bugs
6. **Retest after fixes** - Verify bugs are actually fixed
7. **Think like a user** - Test realistic scenarios
8. **Be thorough** - Don't skip edge cases

## Common Issues to Watch For

- Modal not dismissing
- Buttons not responding
- Content not translating
- State not persisting
- Layout breaking on small screens
- Performance issues with many listings
- Navigation errors
- Console errors/warnings

## Success Criteria

All test cases must pass with:
- ✅ No critical bugs
- ✅ No high-severity bugs
- ✅ < 3 medium-severity bugs
- ✅ All requirements met
- ✅ Performance acceptable
- ✅ Accessibility compliant
- ✅ Both languages working

---

**Happy Testing! 🧪**
