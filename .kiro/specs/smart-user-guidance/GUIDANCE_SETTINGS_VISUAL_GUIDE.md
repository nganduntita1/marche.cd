# Guidance Settings - Visual Guide

## Screen Layout

```
┌─────────────────────────────────────┐
│  ←  Guidance Settings          [ ]  │ ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✨  Current Level            │ │
│  │      Full Guidance            │ │ ← Status Card
│  │  All tutorials, tips, and     │ │
│  │  suggestions are shown...     │ │
│  └───────────────────────────────┘ │
│                                     │
│  GUIDANCE LEVEL                     │
│  ┌───────────────────────────────┐ │
│  │ ✨  Change Level          →   │ │
│  │     Full Guidance             │ │
│  └───────────────────────────────┘ │
│                                     │
│  TUTORIAL MANAGEMENT                │
│  ┌───────────────────────────────┐ │
│  │ 📖  Replay Tutorials      →   │ │
│  │     Review any tutorial again │ │
│  ├───────────────────────────────┤ │
│  │ 🔄  Reset All             →   │ │
│  │     Reset all tutorials       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ACCESSIBILITY                      │
│  ┌───────────────────────────────┐ │
│  │ 🔊  Screen Reader             │ │
│  │     Screen reader enabled     │ │
│  ├───────────────────────────────┤ │
│  │ ✨  Show Animations      [●]  │ │
│  │     Visual animations         │ │
│  └───────────────────────────────┘ │
│                                     │
│  PRIVACY & ANALYTICS                │
│  ┌───────────────────────────────┐ │
│  │ 👁️  Analytics Tracking   [○]  │ │
│  │     Help us improve (anon)    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ℹ️  The guidance system helps you │
│     learn the app at your own...  │
│                                     │
│     Guidance adapts to your usage │
│                                     │
└─────────────────────────────────────┘
```

## Guidance Level Modal

```
┌─────────────────────────────────────┐
│  Choose Guidance Level          ✕   │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✨  Full Guidance         ✓   │ │ ← Selected
│  │     All tutorials, tips, and  │ │
│  │     suggestions are shown     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ⚡  Minimal Tips               │ │
│  │     Only critical safety      │ │
│  │     warnings and errors       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 👁️‍🗨️  Off                        │ │
│  │     No proactive guidance,    │ │
│  │     help icons remain         │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Tutorial List Modal

```
┌─────────────────────────────────────┐
│  Select Tutorial                ✕   │
├─────────────────────────────────────┤
│                                     │
│  ✓  Landing Page              🔄   │
│  ✓  Authentication            🔄   │
│  ✓  Home Screen               🔄   │
│  ✓  Listing Details           🔄   │
│  ○  Messaging                 🔄   │ ← Not completed
│  ✓  Post Listing              🔄   │
│  ✓  Profile                   🔄   │
│  ○  Search & Filters          🔄   │
│  ○  Seller Dashboard          🔄   │
│                                     │
└─────────────────────────────────────┘
```

## Reset Confirmation Modal

```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │     🔄      │             │
│         └─────────────┘             │
│                                     │
│      Reset All Guidance             │
│                                     │
│  Are you sure you want to reset    │
│  all tutorials and tips?           │
│                                     │
│  All your guidance progress will   │
│  be cleared and you'll see all     │
│  tutorials again.                  │
│                                     │
│  ┌──────────┐  ┌──────────────┐   │
│  │  Cancel  │  │    Reset     │   │
│  └──────────┘  └──────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Color Scheme

### Icons and Indicators

| Element | Color | Hex |
|---------|-------|-----|
| Full Guidance Icon | Primary Green | #10b981 |
| Minimal Tips Icon | Amber | #f59e0b |
| Off Icon | Gray | #64748b |
| Safety/Critical | Red | #ef4444 |
| Info | Blue | #3b82f6 |
| Success | Green | #10b981 |

### Status Card

```
Background: White (#fff)
Border: Light Gray (#e2e8f0)
Icon Background: Primary Green 15% opacity (#10b98115)
Title: Gray (#64748b)
Level Text: Primary Green (#10b981)
Description: Gray (#64748b)
```

### Level Options

```
Default Border: Light Gray (#e2e8f0)
Selected Border: Primary Green (#10b981)
Selected Background: Light Green (#f0fdf4)
Icon Background: Matching color 15% opacity
```

## Interaction States

### Buttons/Touchables

```
Default:
  Background: White
  Border: Light Gray
  
Pressed:
  Opacity: 0.7
  
Disabled:
  Opacity: 0.5
  Background: Light Gray
```

### Switches

```
Off:
  Track: Light Gray (#e2e8f0)
  Thumb: White
  
On:
  Track: Primary Green (#10b981)
  Thumb: White
```

## Typography

### Header Title
```
Font Size: 18px
Font Weight: 600
Color: Dark Gray (#1e293b)
```

### Section Title
```
Font Size: 13px
Font Weight: 600
Color: Gray (#64748b)
Text Transform: Uppercase
Letter Spacing: 0.5px
```

### Setting Item Title
```
Font Size: 16px
Font Weight: 500
Color: Dark Gray (#1e293b)
```

### Setting Item Subtitle
```
Font Size: 13px
Font Weight: 400
Color: Gray (#64748b)
```

### Modal Title
```
Font Size: 18px
Font Weight: 700
Color: Dark Gray (#1e293b)
```

### Level Option Title
```
Font Size: 16px
Font Weight: 600
Color: Dark Gray (#1e293b)
```

### Level Option Description
```
Font Size: 13px
Font Weight: 400
Color: Gray (#64748b)
Line Height: 18px
```

## Spacing

### Screen Padding
```
Horizontal: 20px
Vertical: 16px (header)
```

### Section Spacing
```
Top Margin: 24px
Bottom Margin: 8px (title)
```

### Setting Item Padding
```
Vertical: 12px
Horizontal: 20px
```

### Icon Container
```
Size: 36x36px
Border Radius: 18px
Margin Right: 12px
```

### Modal Padding
```
Content: 20px
Header: 20px
```

## Animations

### Modal Entry
```
Type: Slide from bottom
Duration: 300ms
Easing: Ease out
```

### Confirmation Modal
```
Type: Fade
Duration: 200ms
Easing: Linear
```

### Button Press
```
Type: Opacity change
Duration: 150ms
Target Opacity: 0.7
```

### Switch Toggle
```
Type: Spring animation
Duration: 200ms
Damping: 15
```

## Accessibility

### Touch Targets
```
Minimum Size: 44x44px
Actual Size: 48x48px (recommended)
```

### Color Contrast
```
Text on White: 4.5:1 minimum
Icons on Background: 3:1 minimum
Selected State: Clear visual indicator beyond color
```

### Focus Indicators
```
Visible focus ring for keyboard navigation
High contrast mode support
```

## Responsive Behavior

### Small Screens (<375px width)
```
- Reduce padding to 16px
- Smaller icon containers (32x32px)
- Adjust font sizes (-1px)
```

### Large Screens (>768px width)
```
- Max width: 600px
- Center content
- Larger touch targets
```

### Landscape Mode
```
- Modal max height: 80%
- Scrollable content
- Maintain aspect ratios
```

## Dark Mode (Future)

### Planned Colors
```
Background: #1e293b
Card Background: #334155
Text: #f1f5f9
Subtitle: #94a3b8
Border: #475569
```

## Platform Differences

### iOS
```
- Native switch component
- Haptic feedback on toggle
- Swipe to go back
```

### Android
```
- Material Design switches
- Ripple effect on press
- Hardware back button support
```

### Web
```
- Hover states
- Cursor changes
- Keyboard navigation
```

## Loading States

### Initial Load
```
Show skeleton screens
Fade in content when ready
```

### Action Loading
```
Disable buttons
Show activity indicator
Prevent double-tap
```

## Error States

### Network Error
```
Show error message
Provide retry button
Maintain user input
```

### Storage Error
```
Show fallback UI
Log error for debugging
Allow continued use
```

## Success Feedback

### Setting Changed
```
Alert with success message
Brief duration (2-3 seconds)
Clear confirmation text
```

### Tutorial Reset
```
Success alert
Return to previous screen
Update UI immediately
```

## Empty States

### No Completed Tours
```
Show encouraging message
Suggest exploring the app
Provide help link
```

## Best Practices

1. **Consistency**: Use same spacing and colors throughout
2. **Clarity**: Clear labels and descriptions
3. **Feedback**: Immediate response to user actions
4. **Accessibility**: All elements accessible via screen reader
5. **Performance**: Smooth animations, no lag
6. **Error Handling**: Graceful degradation
7. **Localization**: Support for RTL languages (future)
