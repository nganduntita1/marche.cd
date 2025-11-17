# Location Services Implementation Summary

## ✅ Completed

### 1. Database Schema
**File**: `supabase/migrations/20240119000000_add_location_fields.sql`
- Added latitude, longitude, city, country to listings table
- Added latitude, longitude, city to users table
- Created indexes for performance
- Ready to run in Supabase

### 2. Location Service
**File**: `services/locationService.ts`
- Complete location service with all functions
- 15 major Congo cities pre-configured
- Distance calculation (Haversine formula)
- Geocoding and reverse geocoding
- Permission handling
- Distance formatting

## 🚀 Next Steps to Implement

### Step 1: Install expo-location
```bash
npx expo install expo-location
```

### Step 2: Update app.json
Add location permissions:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Marche.cd to use your location to show nearby products."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Marche.cd needs your location to show nearby products and calculate distances."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

### Step 3: Run Database Migration
In Supabase SQL Editor, run:
```sql
-- Copy contents of supabase/migrations/20240119000000_add_location_fields.sql
```

### Step 4: Update Post Listing Screen
**File**: `app/(tabs)/post.tsx`

Add state:
```typescript
const [location, setLocation] = useState('');
const [city, setCity] = useState('');
const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
const [showCityPicker, setShowCityPicker] = useState(false);
const [detectingLocation, setDetectingLocation] = useState(false);
```

Add location detection:
```typescript
const detectLocation = async () => {
  setDetectingLocation(true);
  const coords = await getCurrentLocation();
  if (coords) {
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    const cityName = await getCityFromCoordinates(coords.latitude, coords.longitude);
    if (cityName) {
      setCity(cityName);
      setLocation(cityName);
    }
  }
  setDetectingLocation(false);
};
```

Add to form submission:
```typescript
const { data, error } = await supabase
  .from('listings')
  .insert({
    // ... existing fields
    latitude,
    longitude,
    city,
    country: 'Congo (RDC)',
  });
```

Add UI:
```tsx
<View style={styles.inputContainer}>
  <MapPin size={20} color={Colors.primary} />
  <TextInput
    style={styles.input}
    placeholder="Ville"
    value={city}
    onChangeText={setCity}
  />
  <TouchableOpacity onPress={detectLocation}>
    <Locate size={20} color={Colors.primary} />
  </TouchableOpacity>
</View>
```

### Step 5: Update Listing Card
**File**: `components/ListingCard.tsx`

Add distance calculation:
```typescript
import { calculateDistance, formatDistance } from '@/services/locationService';

// In component
const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
const [distance, setDistance] = useState<string | null>(null);

useEffect(() => {
  // Get user location and calculate distance
  getCurrentLocation().then(coords => {
    if (coords && listing.latitude && listing.longitude) {
      const dist = calculateDistance(
        coords.latitude,
        coords.longitude,
        listing.latitude,
        listing.longitude
      );
      setDistance(formatDistance(dist));
    }
  });
}, []);
```

Add to UI:
```tsx
{distance && (
  <View style={styles.distanceContainer}>
    <MapPin size={12} color="#64748b" />
    <Text style={styles.distanceText}>{distance}</Text>
  </View>
)}
```

### Step 6: Update Listing Detail
**File**: `app/listing/[id].tsx`

Add location display:
```tsx
{listing.city && (
  <View style={styles.locationSection}>
    <MapPin size={20} color={Colors.primary} />
    <Text style={styles.locationText}>{listing.city}</Text>
    {distance && (
      <Text style={styles.distanceText}>• {distance}</Text>
    )}
  </View>
)}
```

### Step 7: Add Location Filters to Home
**File**: `app/(tabs)/index.tsx`

Add filter state:
```typescript
const [locationFilter, setLocationFilter] = useState<'all' | 'nearby' | 'city'>('all');
const [selectedCity, setSelectedCity] = useState<string | null>(null);
const [maxDistance, setMaxDistance] = useState<number>(50); // km
```

Add filter logic:
```typescript
const filteredListings = listings.filter(listing => {
  // Existing filters...
  
  // Location filter
  if (locationFilter === 'nearby' && userLocation && listing.latitude && listing.longitude) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      listing.latitude,
      listing.longitude
    );
    return distance <= maxDistance;
  }
  
  if (locationFilter === 'city' && selectedCity) {
    return listing.city === selectedCity;
  }
  
  return true;
});
```

Add filter UI:
```tsx
<View style={styles.locationFilters}>
  <TouchableOpacity 
    style={[styles.filterChip, locationFilter === 'all' && styles.filterChipActive]}
    onPress={() => setLocationFilter('all')}
  >
    <Text>Tous</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={[styles.filterChip, locationFilter === 'nearby' && styles.filterChipActive]}
    onPress={() => setLocationFilter('nearby')}
  >
    <MapPin size={16} />
    <Text>À proximité</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={[styles.filterChip, locationFilter === 'city' && styles.filterChipActive]}
    onPress={() => setShowCityPicker(true)}
  >
    <Text>{selectedCity || 'Ville'}</Text>
  </TouchableOpacity>
</View>
```

## Quick Implementation Checklist

- [ ] Install expo-location package
- [ ] Update app.json with permissions
- [ ] Run database migration in Supabase
- [ ] Add location picker to post screen
- [ ] Add distance display to listing cards
- [ ] Add location info to listing detail
- [ ] Add location filters to home screen
- [ ] Test on physical device (GPS required)

## Testing

### On Physical Device
1. Enable location services
2. Grant app permission
3. Create a listing → Should detect location
4. View listings → Should show distances
5. Filter by nearby → Should show only nearby items

### Fallback (No GPS)
1. Decline location permission
2. Manually select city from list
3. View listings → Should show city names
4. Filter by city → Should work

## Privacy Considerations

- Always ask permission with clear explanation
- Allow users to decline
- Provide manual city selection
- Don't show exact coordinates to other users
- Only show city name and approximate distance

## Performance Tips

- Cache user location (don't fetch every render)
- Calculate distance only for visible items
- Use indexes for location queries
- Debounce location updates

## Congo-Specific Features

- 15 major cities pre-configured
- Metric system (km, not miles)
- French language ("à 2,5 km")
- City-based fallback for areas without GPS

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours
**Testing Device**: Physical device with GPS required
