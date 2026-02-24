# Contextual Help System - Visual Guide

## 🎨 Component Previews

### 1. Help Button

**Location**: Bottom-right corner of screen  
**Appearance**: Floating circular button with help icon  
**Behavior**: Pulses to draw attention, opens contextual help on tap

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│     Screen Content              │
│                                 │
│                                 │
│                                 │
│                                 │
│                          ┌────┐ │
│                          │ ?  │ │ ← Help Button
│                          └────┘ │
└─────────────────────────────────┘
```

**Visual Details**:
- Size: 56x56 pixels
- Color: Primary color (#FF6B35)
- Icon: Help circle (Ionicons)
- Shadow: Elevated with shadow
- Animation: Subtle pulse every 2 seconds

---

### 2. Contextual Help Modal

**Location**: Slides up from bottom  
**Appearance**: Rounded modal with help content  
**Behavior**: Shows tips and common issues for current screen

```
┌─────────────────────────────────┐
│ ╔═════════════════════════════╗ │
│ ║  ?  Home Screen Help     ✕  ║ │ ← Header
│ ╠═════════════════════════════╣ │
│ ║ Browse and search for items ║ │ ← Description
│ ║                             ║ │
│ ║ 💡 Tips                     ║ │ ← Tips Section
│ ║ • Use search bar            ║ │
│ ║ • Tap location button       ║ │
│ ║ • Swipe to refresh          ║ │
│ ║                             ║ │
│ ║ 🔧 Common Issues            ║ │ ← Issues Section
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ No items showing        │ ║ │
│ ║ │ Try expanding radius... │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ [View full help center →]  ║ │ ← Link
│ ╚═════════════════════════════╝ │
└─────────────────────────────────┘
```

**Visual Details**:
- Max height: 80% of screen
- Border radius: 24px (top corners)
- Background: White
- Shadow: Elevated
- Animation: Slide up from bottom

**Content Structure**:
1. **Header**: Icon + Title + Close button
2. **Description**: Brief explanation of screen
3. **Tips Section**: 3-5 actionable tips with bullet points
4. **Common Issues**: Problems with solutions in cards
5. **Footer**: Link to full help center

---

### 3. Inactivity Detector Prompt

**Location**: Top of screen (below header)  
**Appearance**: Card with help offer  
**Behavior**: Appears after 30 seconds of inactivity

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │  ┌────┐                     │ │
│ │  │ ?  │  Need help?         │ │ ← Title
│ │  └────┘                     │ │
│ │  You seem to be stuck.      │ │ ← Message
│ │  Would you like assistance? │ │
│ │                             │ │
│ │  [No, thanks] [Get Help →] │ │ ← Actions
│ └─────────────────────────────┘ │
│                                 │
│     Screen Content              │
│                                 │
└─────────────────────────────────┘
```

**Visual Details**:
- Position: Absolute, top: 60px
- Padding: 16px
- Border radius: 16px
- Background: White
- Shadow: Medium elevation
- Animation: Fade in + slide down

**Interaction**:
- **No, thanks**: Dismisses prompt, resets timer
- **Get Help**: Opens contextual help modal

---

### 4. Error With Solution Modal

**Location**: Center of screen  
**Appearance**: Modal with error details and solutions  
**Behavior**: Shows error with step-by-step solutions

```
┌─────────────────────────────────┐
│                                 │
│   ┌───────────────────────┐    │
│   │       ⚠️              │    │ ← Icon
│   │                       │    │
│   │  Connection Error     │    │ ← Title
│   │                       │    │
│   │  We couldn't connect  │    │ ← Description
│   │  to the server...     │    │
│   │                       │    │
│   │  Possible solutions:  │    │ ← Solutions
│   │  ┌─┐ Check WiFi      │    │
│   │  │1│ connection       │    │
│   │  └─┘                  │    │
│   │  ┌─┐ Try airplane     │    │
│   │  │2│ mode on/off      │    │
│   │  └─┘                  │    │
│   │  ┌─┐ Move to better   │    │
│   │  │3│ signal area      │    │
│   │  └─┘                  │    │
│   │                       │    │
│   │  [🔄 Try Again]       │    │ ← Actions
│   │  [Close]              │    │
│   └───────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Visual Details**:
- Max width: 400px
- Max height: 80% of screen
- Border radius: 20px
- Background: White
- Shadow: High elevation
- Animation: Fade in

**Content Structure**:
1. **Icon**: Large error icon (48px)
2. **Title**: Error type name
3. **Description**: What went wrong
4. **Solutions**: Numbered list of steps
5. **Actions**: Retry button (optional) + Close button

**Error Types & Icons**:
- Network: 🌐 (alert-circle, red)
- Upload: 📤 (cloud-upload, red)
- Auth: 🔒 (lock-closed, red)
- Validation: ✏️ (create, orange)
- Credits: 💳 (card, orange)
- Permission: 🔐 (key, orange)
- Server: ⚙️ (settings, red)
- Not Found: 🔍 (search, gray)

---

### 5. Enhanced Help Center

**Location**: Full screen  
**Appearance**: Searchable FAQ list  
**Behavior**: Filter and expand/collapse answers

```
┌─────────────────────────────────┐
│ ← Centre d'aide              ⋮  │ ← Header
├─────────────────────────────────┤
│ Questions fréquentes            │ ← Title
│ Trouvez rapidement des réponses │
├─────────────────────────────────┤
│ 🔍 Rechercher dans l'aide...    │ ← Search Bar
├─────────────────────────────────┤
│                                 │
│ VENDRE                          │ ← Category
│ ┌─────────────────────────────┐ │
│ │ Comment publier?         ▼  │ │ ← FAQ Item
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Comment marquer vendu?   ▼  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ACHETER                         │ ← Category
│ ┌─────────────────────────────┐ │
│ │ Comment contacter?       ▼  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Besoin d'aide supplémentaire?│ │ ← Contact
│ │ Notre équipe est disponible  │ │
│ │ [Contacter le support]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Visual Details**:
- Full screen layout
- Search bar: Rounded, light background
- Categories: Bold, uppercase, spaced
- FAQ items: White cards with rounded corners
- Expanded answers: Light background
- Contact section: Highlighted card at bottom

**Features**:
1. **Search Bar**: Real-time filtering
2. **Categories**: Grouped questions
3. **Expandable**: Tap to show/hide answers
4. **Clear Button**: Reset search (X icon)
5. **No Results**: Helpful message when no matches

---

## 🎨 Color Palette

### Primary Colors
- **Primary**: #FF6B35 (Orange-red)
- **Primary Light**: #FF6B3515 (15% opacity)
- **Primary Dark**: #E55A2B

### Neutral Colors
- **Text Primary**: #1e293b (Dark slate)
- **Text Secondary**: #64748b (Slate)
- **Text Tertiary**: #94a3b8 (Light slate)
- **Background**: #f8fafc (Very light gray)
- **Card Background**: #ffffff (White)
- **Border**: #e2e8f0 (Light gray)

### Semantic Colors
- **Error**: #ef4444 (Red)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Info**: #3b82f6 (Blue)

---

## 📐 Spacing & Sizing

### Component Sizes
- **Help Button**: 56x56px
- **Icon Container**: 40x40px (small), 56x56px (large)
- **Touch Target**: Minimum 44x44px

### Spacing
- **Padding Small**: 12px
- **Padding Medium**: 16px
- **Padding Large**: 20px
- **Padding XL**: 24px
- **Gap**: 8-12px between elements

### Border Radius
- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **XL**: 20px
- **Circle**: 50% (for buttons)

### Typography
- **Title**: 20-24px, Bold (700)
- **Heading**: 18px, Semibold (600)
- **Body**: 15-16px, Regular (400)
- **Caption**: 14px, Regular (400)
- **Small**: 12px, Regular (400)

---

## 🎭 Animations

### Help Button
- **Entrance**: Scale from 0 to 1 (spring animation)
- **Pulse**: Scale 1 → 1.1 → 1 (loop, 2s delay)
- **Duration**: 200-300ms

### Contextual Help Modal
- **Entrance**: Slide up from bottom + fade in
- **Exit**: Slide down + fade out
- **Duration**: 300ms
- **Easing**: Spring (friction: 8, tension: 40)

### Inactivity Prompt
- **Entrance**: Fade in + slide down from top
- **Exit**: Fade out + slide up
- **Duration**: 300ms

### Error Modal
- **Entrance**: Fade in + scale from 0.9 to 1
- **Exit**: Fade out
- **Duration**: 200-300ms

### FAQ Expansion
- **Expand**: Height animation + fade in
- **Collapse**: Height animation + fade out
- **Duration**: 200ms

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Full width modals
- Single column layout
- Larger touch targets
- Bottom sheet style for modals

### Tablet (768px - 1024px)
- Max width modals (600px)
- Centered modals
- More padding
- Side-by-side buttons

### Desktop (> 1024px)
- Max width modals (800px)
- Centered modals
- Hover states
- Keyboard shortcuts

---

## ♿ Accessibility

### Screen Reader Support
- All buttons have `accessibilityLabel`
- All buttons have `accessibilityRole`
- All buttons have `accessibilityHint`
- Modals announce when opened
- Focus management on modal open/close

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for navigation

### Visual Accessibility
- High contrast ratios (WCAG AA)
- Minimum touch target size (44x44px)
- Clear focus indicators
- Reduced motion support

---

## 🎯 Z-Index Hierarchy

```
10000: Error Modal (highest)
9999:  Contextual Help Modal
9998:  Inactivity Prompt
9997:  Help Button
...
1:     Regular content
```

This ensures proper layering of components.

---

## 📊 Component States

### Help Button
- **Default**: Primary color, no pulse
- **Hover**: Slightly darker (web only)
- **Active**: Pressed state
- **Pulsing**: Animated scale
- **Hidden**: Opacity 0, not rendered

### Contextual Help
- **Closed**: Not rendered
- **Opening**: Slide up animation
- **Open**: Fully visible, scrollable
- **Closing**: Slide down animation

### Inactivity Prompt
- **Hidden**: Not rendered
- **Appearing**: Fade in + slide down
- **Visible**: Fully visible
- **Dismissing**: Fade out + slide up

### Error Modal
- **Closed**: Not rendered
- **Opening**: Fade in + scale up
- **Open**: Fully visible
- **Closing**: Fade out

---

## 🔄 User Flow Diagrams

### Help Flow
```
User on Screen
     ↓
Sees Help Button (pulsing)
     ↓
Taps Help Button
     ↓
Contextual Help Opens
     ↓
Reads Tips & Solutions
     ↓
[Taps "View full help center"]
     ↓
Help Center Opens
     ↓
Searches FAQs
     ↓
Finds Answer
     ↓
Problem Solved ✓
```

### Inactivity Flow
```
User on Screen
     ↓
30 seconds pass (no interaction)
     ↓
Inactivity Prompt Appears
     ↓
User chooses:
  ├─ "No, thanks" → Prompt dismisses, timer resets
  └─ "Get Help" → Contextual Help Opens
```

### Error Flow
```
User performs action
     ↓
Error occurs
     ↓
Error Modal Shows
     ↓
User reads solutions
     ↓
User chooses:
  ├─ "Close" → Modal dismisses
  └─ "Try Again" → Action retries
```

---

## 💡 Design Principles

1. **Non-Intrusive**: Help is available but doesn't block workflow
2. **Contextual**: Content is specific to current screen
3. **Actionable**: Solutions are step-by-step and clear
4. **Accessible**: Works for all users, all abilities
5. **Consistent**: Same patterns across all screens
6. **Responsive**: Adapts to different screen sizes
7. **Performant**: Smooth animations, fast loading

---

## ✅ Visual Checklist

When implementing, verify:
- [ ] Colors match design system
- [ ] Spacing is consistent
- [ ] Typography is correct
- [ ] Animations are smooth (60fps)
- [ ] Touch targets are large enough
- [ ] Contrast ratios meet WCAG AA
- [ ] Components layer correctly
- [ ] Responsive on all screen sizes
- [ ] Accessible with screen reader
- [ ] Works in both languages

