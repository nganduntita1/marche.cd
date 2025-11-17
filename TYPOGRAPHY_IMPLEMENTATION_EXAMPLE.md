# Typography Implementation Example

## Quick Start

Here's how to update your components to use the new Montserrat + Roboto typography system.

### Example: Auth Screen

**Before:**
```typescript
const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 15,
    color: '#000000',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
```

**After:**
```typescript
import { TextStyles } from '@/constants/Typography';

const styles = StyleSheet.create({
  welcomeText: {
    ...TextStyles.h4,  // Montserrat SemiBold 20px
    color: '#000000',
  },
  subtitle: {
    ...TextStyles.body,  // Roboto Regular 16px (adjusted from 15px)
    color: '#000000',
    fontSize: 15,  // Override if needed
  },
  label: {
    ...TextStyles.label,  // Roboto Medium 14px
    fontSize: 16,  // Override to match current
    color: '#1e293b',
  },
  buttonText: {
    ...TextStyles.button,  // Roboto Bold 16px
    fontSize: 17,  // Override to match current
    color: '#fff',
  },
});
```

## Component-by-Component Guide

### 1. Profile Screen
```typescript
// Section titles
sectionTitle: {
  ...TextStyles.h3,  // Montserrat SemiBold 24px
  color: Colors.text,
}

// User name
userName: {
  ...TextStyles.h4,  // Montserrat SemiBold 20px
  color: Colors.text,
}

// Stats, info text
infoText: {
  ...TextStyles.body,  // Roboto Regular 16px
  color: Colors.textSecondary,
}

// Button text
buttonText: {
  ...TextStyles.button,  // Roboto Bold 16px
  color: '#fff',
}
```

### 2. Listing Card
```typescript
// Product title
title: {
  ...TextStyles.h5,  // Montserrat Medium 18px
  color: Colors.text,
}

// Price
price: {
  ...TextStyles.bodyBold,  // Roboto Bold 16px
  color: Colors.primary,
}

// Location, category
metadata: {
  ...TextStyles.small,  // Roboto Regular 12px
  color: Colors.textLight,
}
```

### 3. Settings Screen
```typescript
// Section headers
sectionHeader: {
  ...TextStyles.sectionHeader,  // Montserrat SemiBold 20px
  color: Colors.text,
}

// Setting item labels
settingLabel: {
  ...TextStyles.bodyMedium,  // Roboto Medium 16px
  color: Colors.text,
}

// Descriptions
settingDescription: {
  ...TextStyles.small,  // Roboto Regular 12px
  color: Colors.textSecondary,
}
```

## Migration Steps

### Step 1: Add Import
```typescript
import { TextStyles } from '@/constants/Typography';
```

### Step 2: Identify Text Types
- **Headings/Titles** → Use Montserrat (TextStyles.h1-h6)
- **Body/Content** → Use Roboto (TextStyles.body)
- **Buttons** → Use Roboto Bold (TextStyles.button)
- **Labels** → Use Roboto Medium (TextStyles.label)

### Step 3: Replace Styles
Use the spread operator to apply pre-defined styles:
```typescript
...TextStyles.h4,
```

### Step 4: Override if Needed
You can override specific properties:
```typescript
{
  ...TextStyles.body,
  fontSize: 15,  // Custom size
  color: Colors.primary,  // Custom color
}
```

## Testing Checklist

- [ ] Fonts load on app start
- [ ] Headings use Montserrat
- [ ] Body text uses Roboto
- [ ] Buttons use Roboto Bold
- [ ] Text is readable on all backgrounds
- [ ] Consistent sizing across similar elements
- [ ] No font loading errors in console

## Common Issues

### Fonts Not Loading
**Solution**: Make sure `app/_layout.tsx` has the font loading code and wait for `fontsLoaded` before rendering.

### Text Looks Different
**Solution**: The new fonts may have different metrics. Adjust spacing/padding if needed.

### Performance
**Solution**: Fonts are cached after first load. No performance impact after initial load.

## Next Steps

1. Start with high-visibility screens (auth, home, profile)
2. Update one component at a time
3. Test on device (fonts may look different than simulator)
4. Gradually migrate all screens
5. Remove old font-related styles

## Support

Refer to `TYPOGRAPHY_SYSTEM.md` for complete documentation.
