# Profile Management Guidance - Testing Guide

## Quick Test Checklist

### 1. Profile Completeness Tracker
**Location:** Profile Screen (main tab)

**Test Steps:**
1. Open the app and navigate to Profile tab
2. Look for the "Profil complété" section below your profile card
3. Verify the progress bar shows a percentage
4. Check the color coding:
   - Red (<50%): "Complétez votre profil"
   - Orange (50-79%): "Bon début !"
   - Green (≥80%): "Excellent profil !"

**Expected Results:**
- Progress bar displays with correct percentage
- Color matches completion level
- Message is appropriate for completion level

### 2. Profile Improvement Suggestions
**Location:** Profile Screen (below progress tracker)

**Test Steps:**
1. If profile is < 100%, look for "Améliorez votre profil" section
2. Verify suggestions appear for missing fields
3. Tap on a suggestion card
4. Verify it navigates to edit profile or shows relevant modal

**Expected Results:**
- Suggestions appear for incomplete fields
- High priority items (profile picture, name, phone) appear first
- Tapping suggestions takes appropriate action
- Priority indicator (colored dot) shows on right side

**Test Different Profiles:**
- Empty profile: Should show all suggestions
- Partial profile: Should show only missing field suggestions
- Complete profile: No suggestions section should appear

### 3. Edit Profile Field Tooltips
**Location:** Edit Profile Screen

**Test Steps:**
1. Navigate to Profile → "Modifier mon profil"
2. Look for help icons (?) next to field labels
3. Tap the help icon next to "Nom complet"
4. Verify tooltip appears with explanation
5. Dismiss tooltip
6. Repeat for "Numéro de téléphone" and "Ville" fields

**Expected Results:**
- Help icons visible next to each field label
- Tapping help icon shows tooltip
- Tooltip content is relevant to the field
- Tooltip can be dismissed
- Each field has unique, helpful guidance

**Tooltip Content to Verify:**
- **Name:** Explains importance of real name for trust
- **Phone:** Emphasizes need for active, correct number
- **Location:** Explains how location helps buyers

### 4. Profile Photo Tips
**Location:** Edit Profile Screen

**Test Steps:**
1. Navigate to Edit Profile
2. Look for "Conseils pour une bonne photo" button below avatar
3. Tap the button
4. Verify modal opens with photo tips
5. Review all tips (should have 5 tips)
6. Tap "Compris" to dismiss

**Expected Results:**
- Button is visible and styled with blue background
- Modal opens smoothly
- All 5 tips are displayed:
  1. Good lighting
  2. Clear face
  3. Recent photo
  4. Professional appearance
  5. What to avoid
- Each tip has icon, title, and description
- Modal dismisses properly

### 5. Ratings Explanation
**Location:** Profile Screen

**Test Steps:**
1. Navigate to Profile tab
2. Look at the rating section (star icon with number)
3. Tap on the rating (should have small help icon)
4. Verify ratings explanation modal opens
5. Review the content based on your rating status

**Expected Results:**
- Help icon visible next to rating
- Tapping opens ratings explanation modal
- Content varies based on rating:
  - **No ratings:** Explains how to get first rating
  - **High rating (≥4.5):** Congratulatory message
  - **Medium rating (3.5-4.4):** Encouragement message
  - **Low rating (<3.5):** Improvement suggestions
- Shows 5 tips for improving ratings
- Information box explains how ratings work
- Modal dismisses properly

## Edge Cases to Test

### Empty Profile
1. Create new account or clear profile data
2. Verify progress shows 0% or very low percentage
3. Verify all suggestions appear
4. Verify appropriate messaging

### Partial Profile
1. Fill only name and phone
2. Verify progress shows ~35%
3. Verify only missing field suggestions appear
4. Verify orange color coding

### Complete Profile
1. Fill all fields including profile picture
2. Complete at least one transaction (for rating)
3. Verify progress shows 100%
4. Verify green color coding
5. Verify no suggestions section appears

### Generated Email
1. User with auto-generated email (@marchecd.com)
2. Verify email field is not counted in completeness
3. Verify suggestion to add personal email appears

### No Ratings Yet
1. New user with no transactions
2. Tap rating section
3. Verify explanation shows "Nouveau" status
4. Verify message explains how to get first rating

### High Rating
1. User with rating ≥ 4.5
2. Tap rating section
3. Verify congratulatory message appears
4. Verify tips still shown for maintaining rating

## Integration Tests

### Profile → Edit Profile Flow
1. Start on Profile screen
2. See low completion percentage
3. Tap on a suggestion (e.g., "Add profile picture")
4. Verify navigation to Edit Profile
5. Tap photo tips button
6. Review tips
7. Add profile picture
8. Save and return to Profile
9. Verify progress increased

### Rating Understanding Flow
1. View profile with rating
2. Tap rating with help icon
3. Read explanation
4. Understand rating system
5. Dismiss modal
6. Feel informed about ratings

### Complete Profile Journey
1. Start with empty profile (0%)
2. Follow suggestions one by one
3. Add name → progress increases
4. Add phone → progress increases
5. Add location → progress increases
6. Add profile picture → progress increases significantly
7. Complete transaction → get rating → progress reaches 100%
8. Verify congratulatory message at 100%

## Visual Verification

### Progress Tracker
- [ ] Progress bar fills correctly
- [ ] Color changes at thresholds (50%, 80%)
- [ ] Percentage text is readable
- [ ] Message text is appropriate

### Suggestions Cards
- [ ] Cards have proper spacing
- [ ] Icons are visible and appropriate
- [ ] Priority dots are colored correctly
- [ ] Text is readable and not truncated
- [ ] Cards are tappable with visual feedback

### Modals
- [ ] Modals center on screen
- [ ] Background overlay is semi-transparent
- [ ] Content is scrollable if needed
- [ ] Buttons are accessible
- [ ] Modals dismiss properly

### Tooltips
- [ ] Tooltips appear near help icons
- [ ] Content is readable
- [ ] Icons display correctly
- [ ] Dismiss button works

## Performance Checks

- [ ] Profile completeness calculates quickly (<100ms)
- [ ] Progress tracker renders smoothly
- [ ] Suggestions load without delay
- [ ] Modals open/close smoothly
- [ ] No lag when tapping help icons
- [ ] No memory leaks after multiple modal opens/closes

## Accessibility Checks

- [ ] Help icons have adequate touch targets (44x44pt minimum)
- [ ] Text has sufficient contrast
- [ ] Modals can be dismissed with back button
- [ ] All interactive elements are tappable
- [ ] Text is readable at default font size

## Common Issues to Watch For

1. **Progress not updating:** Ensure user data is refreshed after edits
2. **Suggestions not appearing:** Check if profile is already complete
3. **Tooltips not showing:** Verify guidance context is properly initialized
4. **Modal not dismissing:** Check if onDismiss handlers are connected
5. **Wrong percentage:** Verify all fields are weighted correctly

## Success Criteria

✅ All 5 acceptance criteria are met:
1. Progress tracker displays on profile screen
2. Suggestions appear when < 80% complete
3. Field tooltips work in edit profile
4. Photo tips modal is accessible and helpful
5. Ratings explanation is clear and informative

✅ User experience is smooth and helpful
✅ No TypeScript or runtime errors
✅ Visual design is consistent with app
✅ Performance is acceptable
✅ Accessibility standards are met

## Notes for Developers

- Profile completeness is calculated client-side for performance
- Ratings are loaded separately from user object (not in auth context)
- Tooltips use guidance context for state management
- Modals are self-contained components
- All text is in French (primary language)
- Color coding follows app design system

## Reporting Issues

If you find any issues during testing, please note:
1. What you were doing (steps to reproduce)
2. What you expected to happen
3. What actually happened
4. Screenshots if applicable
5. Device/platform information
