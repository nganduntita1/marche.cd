# Centralized Color System

## Overview
All colors in the app are now managed through a single file: `constants/Colors.ts`

## How to Change the Primary Color

1. Open `constants/Colors.ts`
2. Change the `primary` value:
```typescript
export const Colors = {
  primary: '#00b86b',  // Change this value
  // ...
};
```

3. The color will automatically update throughout the entire app!

## Current Color Palette

### Primary Colors
- `Colors.primary` - Main brand color: `#00b86b`
- `Colors.primaryLight` - Lighter variant: `#00d97e`
- `Colors.primaryDark` - Darker variant: `#009955`
- `Colors.secondary` - Secondary accent: `#38ef7d`

### Usage in Components

Instead of hardcoding colors:
```typescript
// ❌ Don't do this
backgroundColor: '#00b86b'

// ✅ Do this
import Colors from '@/constants/Colors';
backgroundColor: Colors.primary
```

## Files Updated

The following files now use the centralized color system:

### Auth Pages
- `app/auth/register.tsx`
- `app/auth/login.tsx`
- `app/auth/complete-profile.tsx`

### Tab Pages
- `app/(tabs)/profile.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/post.tsx`
- `app/(tabs)/messages.tsx`

### Other Pages
- `app/settings.tsx`
- `app/favorites.tsx`
- `app/help-center.tsx`
- `app/edit-profile.tsx`
- `app/listing/[id].tsx`
- `app/user/[id].tsx`
- `app/edit-listing/[id].tsx`
- `app/chat/index.tsx`
- `app/chat/[id].tsx`

### Components
- `components/ListingCard.tsx`
- `components/CreditCard.tsx`
- `components/Popup.tsx`

### Services
- `services/notificationService.ts`

## Adding Colors to New Files

When creating a new component or page:

1. Import the Colors:
```typescript
import Colors from '@/constants/Colors';
```

2. Use in styles:
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
  },
  text: {
    color: Colors.text,
  },
});
```

## Available Color Categories

- **Primary**: Brand colors
- **Neutral**: Grays and basic colors
- **Status**: Success, warning, error, info
- **Background**: Page and section backgrounds
- **Text**: Text colors for different hierarchies
- **Border**: Border and divider colors
- **Overlay**: Semi-transparent overlays

## Benefits

✅ Change colors in one place
✅ Consistent design throughout the app
✅ Easy to create themes (light/dark mode)
✅ Better maintainability
✅ Type-safe color references
