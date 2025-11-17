# Mesh Gradient for Auth Screens ✨

## Overview
Replaced the solid green background with a beautiful mesh-like gradient effect on all authentication screens.

## Gradient Design

### Primary Gradient Layer
```typescript
colors: ['#60c882', Colors.primary, '#00a85d', '#60c882']
start: { x: 0, y: 0 }
end: { x: 1, y: 1 }
locations: [0, 0.3, 0.7, 1]
```

**Color Breakdown:**
- `#60c882` - Light mint green (top-left & bottom-right)
- `Colors.primary` (#00b86b) - Your primary green (30% position)
- `#00a85d` - Darker green (70% position)
- Creates a diagonal flow from top-left to bottom-right

### Mesh Overlay Layer
```typescript
colors: ['rgba(255, 255, 255, 0.15)', 'transparent', 'rgba(255, 255, 255, 0.1)']
```

**Purpose:**
- Adds subtle white highlights
- Creates depth and dimension
- Makes the gradient look more organic and "mesh-like"
- Enhances text readability

## Visual Effect

The gradient creates a smooth, modern look with:
- ✨ Diagonal color flow
- 🌊 Smooth transitions between shades
- 💎 Subtle white shimmer overlay
- 🎨 Professional, polished appearance

## Files Updated

1. **app/auth/register.tsx**
   - Registration screen header

2. **app/auth/login.tsx**
   - Login screen header

3. **app/auth/complete-profile.tsx**
   - Profile completion screen header

## Technical Details

### Gradient Structure
```
┌─────────────────────────┐
│ #60c882 (Light Green)   │ ← Top-left
│    ↘                    │
│      Colors.primary     │ ← 30%
│         ↘               │
│           #00a85d       │ ← 70%
│              ↘          │
│                #60c882  │ ← Bottom-right
└─────────────────────────┘
```

### Overlay Effect
```
White shimmer (15% opacity)
    ↓
Transparent center
    ↓
White shimmer (10% opacity)
```

## Customization

### Change Gradient Colors
Edit the colors array in each auth file:

```typescript
<LinearGradient
  colors={[
    '#60c882',        // Change this
    Colors.primary,   // Uses your primary color
    '#00a85d',        // Change this
    '#60c882'         // Change this
  ]}
  // ...
/>
```

### Adjust Gradient Direction
Modify start and end points:

```typescript
start={{ x: 0, y: 0 }}  // Top-left
end={{ x: 1, y: 1 }}    // Bottom-right

// Other options:
// Vertical: start={{ x: 0, y: 0 }}, end={{ x: 0, y: 1 }}
// Horizontal: start={{ x: 0, y: 0 }}, end={{ x: 1, y: 0 }}
```

### Adjust Color Positions
Modify the locations array:

```typescript
locations={[0, 0.3, 0.7, 1]}
// [start, color2_position, color3_position, end]
```

### Change Overlay Intensity
Adjust the rgba opacity values:

```typescript
colors={[
  'rgba(255, 255, 255, 0.15)',  // Increase for more shimmer
  'transparent',
  'rgba(255, 255, 255, 0.1)'    // Increase for more shimmer
]}
```

## Benefits

✅ **Modern Design** - Trendy mesh gradient effect
✅ **Brand Consistency** - Uses your primary color
✅ **Smooth Transitions** - No harsh color breaks
✅ **Professional Look** - Polished, high-quality appearance
✅ **Easy to Customize** - Change colors in one place
✅ **Performance** - Native gradient rendering

## Preview

The gradient flows diagonally from light mint green through your primary green to darker green, with subtle white highlights creating a mesh-like, dimensional effect. Perfect for a modern marketplace app!
