# Listing Creation Validation - Visual Guide

## What Users See Now

### 1. Title Field

#### When typing (under 5 characters):
```
┌─────────────────────────────────────────┐
│ 📄 Titre *                              │
├─────────────────────────────────────────┤
│ iPhone                                  │
└─────────────────────────────────────────┘
  5/5 minimum              ⚠️ 0 caractères restants
  (orange text)            (orange text)
```

#### When valid (5+ characters):
```
┌─────────────────────────────────────────┐
│ 📄 Titre *                              │
├─────────────────────────────────────────┤
│ iPhone 11 Pro Max 256GB                 │
└─────────────────────────────────────────┘
                                    27/100
                                  (gray text)
```

### 2. Description Field

#### When typing (under 20 characters):
```
┌─────────────────────────────────────────┐
│ 📄 Description *                        │
│ Décrivez l'état, les caractéristiques  │
│ et les détails importants              │
│ (minimum 20 caractères)                 │
├─────────────────────────────────────────┤
│ Good phone                              │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
  10/20 minimum           ⚠️ 10 caractères restants
  (orange text)           (orange text)
```

#### When valid (20+ characters):
```
┌─────────────────────────────────────────┐
│ 📄 Description *                        │
│ Décrivez l'état, les caractéristiques  │
│ et les détails importants              │
│ (minimum 20 caractères)                 │
├─────────────────────────────────────────┤
│ This is a very good phone in excellent  │
│ condition with all original accessories │
│ and box. Battery health is 95%.         │
│                                         │
└─────────────────────────────────────────┘
                                   112/1000
                                 (gray text)
```

### 3. Error Alerts

#### Short Description Error:
```
┌─────────────────────────────────────────┐
│           Description trop courte        │
├─────────────────────────────────────────┤
│ La description doit contenir au moins   │
│ 20 caractères pour aider les acheteurs  │
│ à comprendre votre article.             │
│                                         │
│ Actuellement: 10 caractères.            │
├─────────────────────────────────────────┤
│                                    [OK] │
└─────────────────────────────────────────┘
```

#### Short Title Error:
```
┌─────────────────────────────────────────┐
│              Titre trop court            │
├─────────────────────────────────────────┤
│ Le titre doit contenir au moins         │
│ 5 caractères.                           │
│                                         │
│ Actuellement: 3 caractères.             │
├─────────────────────────────────────────┤
│                                    [OK] │
└─────────────────────────────────────────┘
```

#### Invalid Price Error:
```
┌─────────────────────────────────────────┐
│              Prix invalide               │
├─────────────────────────────────────────┤
│ Veuillez entrer un prix valide          │
│ supérieur à 0.                          │
├─────────────────────────────────────────┤
│                                    [OK] │
└─────────────────────────────────────────┘
```

## Color Coding

### Normal State (Valid):
- Character count: `#94a3b8` (gray)
- No warning message

### Warning State (Invalid):
- Character count: `#f59e0b` (orange)
- Warning message: `#f59e0b` (orange)
- Warning icon: ⚠️

## User Flow Example

### Scenario: User tries to post with short description

1. **User fills form:**
   - Title: "iPhone 11"
   - Description: "Good phone" (10 chars)
   - Price: "500"
   - Images: 1 added
   - Category: "Phones"

2. **User sees warnings:**
   - Description shows: "10/20 minimum" (orange)
   - Warning: "⚠️ 10 caractères restants" (orange)

3. **User clicks submit:**
   - Alert appears: "Description trop courte"
   - Message explains: "La description doit contenir au moins 20 caractères..."
   - Shows current count: "Actuellement: 10 caractères."

4. **User adds more details:**
   - Description: "Good phone in excellent condition" (35 chars)
   - Counter changes to: "35/1000" (gray)
   - Warning disappears

5. **User clicks submit again:**
   - ✅ Success! Listing created

## Benefits of Visual Feedback

### Before (No Visual Feedback):
```
User types → Clicks submit → Nothing happens → Confused
```

### After (With Visual Feedback):
```
User types → Sees warning → Knows what's wrong → Fixes it → Success
```

## Validation Rules Summary

| Field       | Minimum | Maximum | Validation                    |
|-------------|---------|---------|-------------------------------|
| Title       | 5 chars | 100     | Must not be empty or spaces   |
| Description | 20 chars| 1000    | Must not be empty or spaces   |
| Price       | > 0     | -       | Must be valid number          |
| Images      | 1       | 5       | At least one required         |
| Category    | -       | -       | Must be selected              |

## Mobile vs Desktop

The validation works identically on both:
- ✅ Desktop browser: Full validation + visual feedback
- ✅ Mobile browser: Full validation + visual feedback
- ✅ Mobile app: Full validation + visual feedback

## Accessibility

- Clear error messages in user's language (French/English)
- Visual indicators (color + icon)
- Specific character counts
- Helpful guidance text

## Testing Checklist

- [ ] Type 4 characters in title → See "4/5 minimum" (orange)
- [ ] Type 5 characters in title → See "5/100" (gray)
- [ ] Type 19 characters in description → See "19/20 minimum" (orange)
- [ ] Type 20 characters in description → See "20/1000" (gray)
- [ ] Try to submit with short description → See error alert
- [ ] Try to submit with short title → See error alert
- [ ] Try to submit with price "0" → See error alert
- [ ] Submit with valid data → Success!
