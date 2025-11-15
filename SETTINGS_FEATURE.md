# Settings Feature

## Overview
Comprehensive settings page that makes Marché.cd feel professional and complete.

## Features Implemented

### 1. Account Settings
- ✅ Edit profile (redirects to edit-profile page)
- ✅ Email display and change option
- ✅ Security settings placeholder

### 2. Notifications
- ✅ Push notifications toggle
- ✅ Email notifications toggle
- ✅ Message alerts toggle
- ✅ All toggles functional with state management

### 3. Preferences
- ✅ Language selection (French, English coming soon)
- ✅ Dark mode toggle (ready for implementation)
- ✅ Privacy settings

### 4. Support & Help
- ✅ Help center
- ✅ Contact support (WhatsApp integration)
- ✅ Terms of service
- ✅ Privacy policy

### 5. App Info
- ✅ Version number (dynamic from app.json)
- ✅ Rate the app
- ✅ Share with friends

### 6. Danger Zone
- ✅ Sign out (with confirmation)
- ✅ Delete account (with double confirmation)

## Design Features

### Visual Polish
- Clean, organized sections with headers
- Icon for each setting (color-coded green)
- Subtle separators between items
- Toggle switches for boolean settings
- Chevron arrows for navigation items
- Proper spacing and padding

### User Experience
- Confirmation dialogs for destructive actions
- Subtitles for clarity
- Disabled states for coming soon features
- Smooth navigation
- Professional footer with branding

### Accessibility
- Large touch targets (44x44 minimum)
- Clear labels and descriptions
- Proper contrast ratios
- Logical grouping

## Settings Button Location
Added to profile page header, next to the bell icon.

## Future Enhancements (Placeholders Ready)

1. **Two-Factor Authentication**
2. **Login History**
3. **Saved Searches**
4. **Blocked Users**
5. **Auto-Renew Listings**
6. **Currency Selection**
7. **Default Location**
8. **Help Center Content**

## Technical Implementation

### State Management
```typescript
const [pushNotifications, setPushNotifications] = useState(true);
const [emailNotifications, setEmailNotifications] = useState(true);
const [messageAlerts, setMessageAlerts] = useState(true);
const [darkMode, setDarkMode] = useState(false);
```

### Reusable Components
- `SettingSection`: Groups related settings
- `SettingItem`: Standard setting row
- `ToggleItem`: Setting with switch

### Navigation
- Back button to return to profile
- Deep links to other screens (edit-profile, etc.)
- External links (WhatsApp support)

## User Flow

1. User taps settings icon in profile
2. Settings screen opens
3. User can:
   - Toggle notifications
   - Edit profile
   - Contact support
   - Sign out
   - Delete account
4. Confirmations for destructive actions
5. Smooth navigation back

## Styling

- Consistent with app design language
- Green accent color (#9bbd1f)
- Clean white backgrounds
- Subtle borders and shadows
- Professional typography

## Security

- Sign out requires confirmation
- Delete account requires double confirmation
- Sensitive actions clearly marked
- "Danger Zone" section for destructive actions

## Localization Ready

All text strings are in French, ready for:
- English translation
- Other languages
- i18n implementation

## Testing Checklist

- [ ] Settings button appears in profile
- [ ] Settings screen opens correctly
- [ ] All toggles work
- [ ] Navigation items work
- [ ] Sign out confirmation works
- [ ] Delete account confirmation works
- [ ] Contact support opens WhatsApp
- [ ] Back button returns to profile
- [ ] Version number displays correctly
- [ ] All icons render properly
