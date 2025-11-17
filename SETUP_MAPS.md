# Quick Setup Guide: Maps Feature

## Option 1: With Google Maps (Recommended)

### Step 1: Install Package
```bash
npx expo install react-native-maps
```

### Step 2: Add to app.json
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
    ]
  }
}
```

### Step 3: Get API Keys (Optional for Development)

For production, get keys from [Google Cloud Console](https://console.cloud.google.com/):

1. Create project
2. Enable "Maps SDK for Android" and "Maps SDK for iOS"
3. Create API keys
4. Add to app.json:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_KEY"
        }
      }
    }
  }
}
```

### Step 4: Rebuild
```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

## Option 2: Without Maps (Simpler)

If you want to skip the maps setup:

### Step 1: Use the No-Maps Version

Replace the MapView section in `app/listing/[id].tsx` with:

```typescript
{/* Simple location display without map */}
{listing.latitude && listing.longitude && (
  <View style={styles.staticMapPlaceholder}>
    <View style={styles.mapPinIcon}>
      <MapPin size={32} color={Colors.primary} />
    </View>
    <Text style={styles.staticMapText}>
      📍 Zone: {listing.location}
    </Text>
    <Text style={styles.staticMapSubtext}>
      L'emplacement exact sera partagé après contact
    </Text>
  </View>
)}
```

### Step 2: Add Styles

```typescript
staticMapPlaceholder: {
  marginTop: 16,
  backgroundColor: '#f0fdf4',
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: Colors.primary,
  borderStyle: 'dashed',
},
mapPinIcon: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
staticMapText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: 4,
  textAlign: 'center',
},
staticMapSubtext: {
  fontSize: 13,
  color: '#64748b',
  textAlign: 'center',
},
```

### Step 3: Remove MapView Import

Remove this line:
```typescript
import MapView, { Marker, Circle } from 'react-native-maps';
```

## What You Get

### With Maps:
- ✅ Interactive map view
- ✅ Visual location context
- ✅ 1km radius circle for privacy
- ✅ Professional appearance
- ❌ Requires Google Maps API setup
- ❌ Needs development build

### Without Maps:
- ✅ Distance display still works
- ✅ Clean location card
- ✅ No API keys needed
- ✅ Works in Expo Go
- ✅ Simpler setup
- ❌ No visual map

## Recommendation

**For MVP/Testing**: Use Option 2 (without maps)
- Faster to implement
- No external dependencies
- Still shows distance

**For Production**: Use Option 1 (with maps)
- Better user experience
- More professional
- Visual context helps users

## Testing

After setup, test by:

1. Run the seeding script to add listings with coordinates:
   ```bash
   node scripts/seed-listings.js
   ```

2. Open a listing in the app

3. You should see:
   - Location name
   - Distance from you (if location enabled)
   - Map (Option 1) or location card (Option 2)

## Troubleshooting

### "Cannot find module 'react-native-maps'"
- Run: `npx expo install react-native-maps`
- Rebuild: `npx expo prebuild --clean`

### Map shows blank
- Check API keys in app.json
- Ensure you're using development build (not Expo Go)
- Check Google Cloud Console for API restrictions

### Distance not showing
- Enable location in app
- Select a city in location picker
- Ensure listing has latitude/longitude

## Cost

**Google Maps API:**
- Free tier: 28,000 map loads/month
- After that: $7 per 1,000 loads
- For most apps, free tier is sufficient

**Without Maps:**
- $0 - completely free
- No external dependencies
