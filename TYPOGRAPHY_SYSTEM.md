# Typography System - Montserrat + Roboto

## Overview
Professional typography system using:
- **Montserrat** for headings (bold, urban, attention-grabbing)
- **Roboto** for body text (neutral, legible, UI-optimized)

## Font Pairing

### Montserrat (Headings)
- **Purpose**: Titles, section names, featured content
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Style**: Strong, urban, bold
- **Use for**: H1-H6, section headers, category names

### Roboto (Body Text)
- **Purpose**: Listings, navigation, buttons, content
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Style**: Neutral, legible, excellent for UI
- **Use for**: Body text, buttons, labels, descriptions

## Installation

Fonts are automatically loaded in `app/_layout.tsx`:
```typescript
import { useFonts } from 'expo-font';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
```

## Usage

### Import Typography
```typescript
import { Typography, TextStyles } from '@/constants/Typography';
```

### Using Pre-defined Styles

#### Headings (Montserrat)
```typescript
const styles = StyleSheet.create({
  title: {
    ...TextStyles.h1,  // 32px, Bold
    color: Colors.text,
  },
  sectionTitle: {
    ...TextStyles.h3,  // 24px, SemiBold
    color: Colors.text,
  },
  cardTitle: {
    ...TextStyles.h5,  // 18px, Medium
    color: Colors.text,
  },
});
```

#### Body Text (Roboto)
```typescript
const styles = StyleSheet.create({
  description: {
    ...TextStyles.body,  // 16px, Regular
    color: Colors.textSecondary,
  },
  price: {
    ...TextStyles.bodyBold,  // 16px, Bold
    color: Colors.primary,
  },
  label: {
    ...TextStyles.label,  // 14px, Medium
    color: Colors.textLight,
  },
});
```

#### Buttons (Roboto Bold)
```typescript
const styles = StyleSheet.create({
  buttonText: {
    ...TextStyles.button,  // 16px, Bold
    color: '#fff',
  },
  smallButtonText: {
    ...TextStyles.buttonSmall,  // 14px, Bold
    color: '#fff',
  },
});
```

### Using Font Families Directly
```typescript
const styles = StyleSheet.create({
  customHeading: {
    fontFamily: Typography.fonts.heading,  // Montserrat Bold
    fontSize: 22,
    color: Colors.text,
  },
  customBody: {
    fontFamily: Typography.fonts.body,  // Roboto Regular
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
```

## Typography Scale

### Headings (Montserrat)
- **H1**: 32px - Page titles, hero text
- **H2**: 28px - Major section headers
- **H3**: 24px - Section titles
- **H4**: 20px - Card titles, subsections
- **H5**: 18px - Small headers
- **H6**: 16px - Smallest headers

### Body (Roboto)
- **Large**: 18px - Emphasized content
- **Regular**: 16px - Standard body text
- **Medium**: 14px - Labels, secondary text
- **Small**: 12px - Captions, hints
- **Tiny**: 10px - Badges, tags

## Common Patterns

### Product Card
```typescript
const styles = StyleSheet.create({
  productTitle: {
    ...TextStyles.h4,  // Montserrat SemiBold 20px
    color: Colors.text,
  },
  productPrice: {
    ...TextStyles.bodyBold,  // Roboto Bold 16px
    color: Colors.primary,
  },
  productDescription: {
    ...TextStyles.body,  // Roboto Regular 16px
    color: Colors.textSecondary,
  },
});
```

### Section Header
```typescript
const styles = StyleSheet.create({
  sectionTitle: {
    ...TextStyles.sectionHeader,  // Montserrat SemiBold 20px
    color: Colors.text,
  },
  sectionSubtitle: {
    ...TextStyles.sectionSubheader,  // Montserrat Medium 16px
    color: Colors.textSecondary,
  },
});
```

### Form Labels & Inputs
```typescript
const styles = StyleSheet.create({
  label: {
    ...TextStyles.label,  // Roboto Medium 14px
    color: Colors.text,
  },
  input: {
    ...TextStyles.body,  // Roboto Regular 16px
    color: Colors.text,
  },
  hint: {
    ...TextStyles.small,  // Roboto Regular 12px
    color: Colors.textLight,
  },
});
```

## Best Practices

### ✅ Do:
- Use Montserrat for all headings and titles
- Use Roboto for all body text, buttons, and UI elements
- Use bold weights for emphasis and CTAs
- Maintain consistent sizing across similar elements
- Use the pre-defined TextStyles for consistency

### ❌ Don't:
- Mix font families within the same text element
- Use too many font sizes (stick to the scale)
- Use Montserrat for long paragraphs (use Roboto)
- Use Roboto for main headings (use Montserrat)

## Accessibility

- Minimum font size: 12px for readability
- Use sufficient contrast ratios
- Bold text for important information
- Proper line heights for readability

## Migration Guide

To update existing components:

1. Import Typography:
```typescript
import { TextStyles } from '@/constants/Typography';
```

2. Replace font styles:
```typescript
// Before
fontSize: 20,
fontWeight: '600',

// After
...TextStyles.h4,
```

3. Test on device to ensure fonts load correctly

## Vibe
**Confident, Professional, and Crisp** ✨
