# Location Selector Added to Home Screen

## Overview
Added a location selector component to the home screen that displays the current city and allows users to change their location.

## Changes Made

### 1. Home Screen (app/(tabs)/index.tsx)
- Added `Ionicons` import from `@expo/vector-icons`
- Added `useTranslation` hook import from `react-i18next`
- Added translation hook usage: `const { t } = useTranslation()`
- Created `renderLocationSelector()` function that:
  - Shows current city from LocationContext
  - Opens CityPickerModal when tapped
  - Displays location icon and chevron-down icon
  - Only renders when currentCity is available
- Integrated location selector into main ScrollView (appears after header, before listings)
- Added styles for location selector:
  - `locationSelectorContainer`: Container with padding and border
  - `locationSelector`: Touchable row with icons and text
  - `locationTextContainer`: Flex container for label and city name
  - `locationLabel`: Small secondary text for "Location" label
  - `locationText`: Bold text for city name
  - `radiusInfo`: Container for radius display (prepared for future use)
  - `radiusText`: Text style for radius information

### 2. Translation Files
Added new translation keys for location selector:

**English (assets/locales/en.json):**
```json
"home": {
  "location": "Location",
  "currentLocation": "Current Location",
  "within": "Within"
}
```

**French (assets/locales/fr.json):**
```json
"home": {
  "location": "Localisation",
  "currentLocation": "Position actuelle",
  "within": "Dans un rayon de"
}
```

## Features
- Displays current city from LocationContext
- Tapping opens the existing CityPickerModal
- Clean, minimal design matching the app's style
- Bilingual support (English/French)
- Positioned prominently after categories, before listings
- Uses existing location infrastructure (LocationContext, CityPickerModal)

## User Experience
1. User sees their current city displayed below the categories
2. Tapping the location selector opens the city picker modal
3. After selecting a new city, the location updates and listings filter accordingly
4. The component only shows when a city is available (graceful handling of no location)

## Next Steps (Optional)
- Add search radius display when implementing distance-based filtering
- Add animation when location changes
- Consider adding "Nearby" quick filter option
