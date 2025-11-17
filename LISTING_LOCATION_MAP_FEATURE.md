# Listing Location & Map Feature

## Overview
Added location information and an interactive map to the listing detail page, showing users where the item is located and how far it is from them.

## Features Added

### 1. Distance Display
- Shows distance from user's location to the listing
- Format: "À 2.3 km de vous" (2.3 km from you)
- Only shows when user has location enabled
- Uses accurate Haversine formula calculation

### 2. Interactive Map
- Shows approximate location with 1km radius circle
- Privacy-focused: doesn't show exact address
- Map marker indicates general area
- Overlay text explains it's an approximate area
- Non-interactive (scroll/zoom disabled) to prevent accidental navigation

### 3. Location Info Card
- Clean card design with location icon
- City/neighborhood name
- Distance from user (if available)
- Styled to match app design

## Installation Required

### Step 1: Install react-native-maps

```bash
npx expo install react-native-maps
```

### Step 2: Configure app.json

Add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

### Step 3: Get Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API keys for both platforms
5. Add keys to `app.json`

**Note:** For development, you can use the same key for both platforms.

### Step 4: Rebuild the app

```bash
# For development build
npx expo prebuild --clean

# Then run
npx expo run:ios
# or
npx expo run:android
```

**Important:** Maps won't work in Expo Go. You need a development build or production build.

## Files Modified

### 1. `app/listing/[id].tsx`

**Added Imports:**
```typescript
import { useLocation } from '@/contexts/LocationContext';
import { calculateDistance, formatDistance } from '@/services/locationService';
import MapView, { Marker, Circle } from 'react-native-maps';
```

**Added State:**
```typescript
const { userLocation } = useLocation();
```

**Added Location Section:**
- Location info card with distance
- MapView with Circle (1km radius)
- Marker at listing location
- Privacy overlay message

**Added Styles:**
- `locationInfo`: Card container
- `locationRow`: Flex row for icon and text
- `locationTextContainer`: Text container
- `locationCity`: City name style
- `locationDistance`: Distance text style
- `mapContainer`: Map wrapper
- `map`: Map dimensions
- `mapOverlay`: Bottom overlay
- `mapOverlayText`: Overlay text

### 2. Translation Files

**English (assets/locales/en.json):**
```json
"listing": {
  "location": "Location",
  "awayFromYou": "from you",
  "approximateArea": "Approximate area for your safety"
}
```

**French (assets/locales/fr.json):**
```json
"listing": {
  "location": "Localisation",
  "awayFromYou": "de vous",
  "approximateArea": "Zone approximative pour votre sécurité"
}
```

## How It Works

### Distance Calculation
```typescript
if (userLocation && listing.latitude && listing.longitude) {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    listing.latitude,
    listing.longitude
  );
  // Shows: "À 2.3 km de vous"
}
```

### Map Display
```typescript
<MapView
  initialRegion={{
    latitude: listing.latitude,
    longitude: listing.longitude,
    latitudeDelta: 0.05,  // ~5km view
    longitudeDelta: 0.05,
  }}
  scrollEnabled={false}  // Prevent accidental scrolling
  zoomEnabled={false}
>
  {/* 1km radius circle for privacy */}
  <Circle
    center={{ latitude, longitude }}
    radius={1000}
    fillColor="rgba(168, 245, 184, 0.3)"
    strokeColor={Colors.primary}
  />
  
  <Marker
    coordinate={{ latitude, longitude }}
    title={listing.location}
  />
</MapView>
```

## Privacy Features

1. **Approximate Location**: Shows 1km radius circle instead of exact point
2. **Overlay Message**: Clearly states it's an approximate area
3. **Non-Interactive**: Map doesn't allow zooming/panning to prevent exact location discovery
4. **General Area Only**: Marker shows neighborhood, not specific address

## User Experience

### For Buyers:
1. See how far the item is from their location
2. View general area on map
3. Understand approximate neighborhood
4. Make informed decisions about pickup distance

### For Sellers:
1. Privacy protected (exact address not shown)
2. Buyers can gauge distance
3. Reduces unnecessary inquiries from far-away buyers
4. Professional listing appearance

## Visual Design

### Location Card
- Light gray background (#f8fafc)
- Primary color icon
- Bold city name
- Green distance text
- Clean spacing

### Map
- 200px height
- Rounded corners (16px)
- Border for definition
- Semi-transparent circle overlay
- Dark overlay at bottom with privacy message

## Testing

### Test Scenarios:

1. **With User Location**
   - Enable location in app
   - Open a listing with coordinates
   - Should see distance: "À 2.3 km de vous"
   - Map should show with circle

2. **Without User Location**
   - Disable location
   - Open listing
   - Should see city name only
   - No distance shown
   - Map still displays

3. **Listing Without Coordinates**
   - Open old listing (no lat/long)
   - Should see city name only
   - No map displayed
   - No errors

## Benefits

1. **Better User Experience**: Users know how far items are
2. **Informed Decisions**: Distance helps buyers decide
3. **Privacy Protected**: Sellers' exact locations hidden
4. **Professional Look**: Maps add credibility
5. **Reduced Friction**: Fewer "where is this?" questions
6. **Visual Context**: Map provides neighborhood context

## Alternative: Without Google Maps

If you don't want to use Google Maps API, you can:

1. **Remove the MapView** and keep just the distance display
2. **Use a static map image** from a service like Mapbox
3. **Show only text-based location** info

To remove the map but keep distance:
```typescript
// Just comment out the MapView section
{/* 
{listing.latitude && listing.longitude && (
  <View style={styles.mapContainer}>
    ...
  </View>
)}
*/}
```

## Next Steps (Optional Enhancements)

1. **Tap to Open in Maps**: Allow users to open in Google Maps/Apple Maps
2. **Multiple Listings Map**: Show all nearby listings on one map
3. **Route Planning**: Show estimated travel time
4. **Public Transport**: Show nearby transit options
5. **Neighborhood Info**: Add area description/safety info

## Notes

- Maps require a development build (won't work in Expo Go)
- Google Maps API has free tier (28,000 map loads/month)
- Consider adding API key restrictions for security
- Test on both iOS and Android
- Map performance is good even on older devices
