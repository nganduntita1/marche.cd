# Chat Listing Preview Feature

## Overview
Added a clickable listing preview card at the top of the chat screen, allowing users to quickly view the listing they're discussing.

## Implementation

### Visual Design
```
┌─────────────────────────────────────┐
│  ← [Avatar] User Name               │  ← Header
│     Listing Title                   │
├─────────────────────────────────────┤
│  [Image] Listing Title          ›   │  ← NEW: Listing Preview
│          $1,234                     │
├─────────────────────────────────────┤
│                                     │
│  Chat messages...                   │
│                                     │
└─────────────────────────────────────┘
```

### Features
- **Listing Image**: 60x60px thumbnail with rounded corners
- **Title**: 2-line truncated listing title
- **Price**: Prominently displayed in green
- **Arrow Indicator**: Visual cue that it's clickable
- **Tap Action**: Opens the full listing detail page

### Styling Details
- Clean white background
- Subtle shadow for depth
- Border separator from chat messages
- Consistent with app's design language
- Responsive touch feedback (opacity change)

### User Experience
1. User enters a chat about a listing
2. Listing preview appears at the top
3. User can tap to view full listing details
4. Easy to reference what they're discussing
5. Quick access to listing info without leaving chat

### Code Location
- **File**: `app/chat/[id].tsx`
- **Component**: Listing preview card (conditional render)
- **Styles**: `listingPreview*` styles

### Benefits
- **Context**: Users always see what listing they're discussing
- **Quick Access**: One tap to view full listing details
- **Trust**: Transparency about the item being discussed
- **UX**: Reduces need to navigate away and back
- **Visual**: Professional, polished interface

## Testing Checklist
- [ ] Listing preview appears in chat
- [ ] Image loads correctly
- [ ] Title truncates properly at 2 lines
- [ ] Price displays correctly
- [ ] Tapping opens listing detail page
- [ ] Works on both iOS and Android
- [ ] Responsive to different screen sizes
- [ ] Smooth animations and transitions
