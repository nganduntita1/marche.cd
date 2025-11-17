# Location Features - Implementation Complete ✅

## What Was Built

### 1. Core Infrastructure
- ✅ **Database Schema** (`supabase/migrations/20240119000000_add_location_fields.sql`)
- ✅ **Location Service** (`services/locationService.ts`)
- ✅ **Location Context** (`contexts/LocationContext.tsx`)

### 2. UI Components
- ✅ **LocationHeader** - Shows current city with dropdown
- ✅ **CityPickerModal** - Select from 15 Congo cities
- ✅ **Location Service** - Distance calculation, geocoding, etc.

### 3. Features Ready to Use

#### Feature 1: Distance Display
Show "X km away" on listing cards
```typescript
import { calculateDistance, formatDistance } from '@/services/locationService';
import { useLocation } from '@/contexts/LocationContext';

const { userLocation } = useLocation();
const distance = calculateDistance(
  userLocation.latitude,
  userLocation.longitude,
  listing.latitude,
  listing.longitude
);
```

#### Feature 2: Location Header
```typescript
import LocationHeader from '@/components/LocationHeader';
import { useLocation } from '@/contexts/LocationContext';

const { currentCity, loading } = useLocation();
<LocationHeader 
  city={currentCity} 
  loading={loading}
  onPress={() => setShowCityPicker(true)}
/>
```

#### Feature 3: City Picker
```typescript
import CityPickerModal from '@/components/CityPickerModal';

<CityPickerModal
  visible={showCityPicker}
  onClose={() => setShowCityPicker(false)}
  onSelect={(city) => {
    setManualLocation(city.name, {
      latitude: city.latitude,
      longitude: city.longitude,
    });
  }}
  onDetectLocation={refreshLocation}
/>
```

#### Feature 4: Distance Filters
```typescript
const DISTANCE_OPTIONS = [
  { label: 'Tous', value: null },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100+ km', value: 100 },
];

// Filter listings
const filteredListings = listings.filter(listing => {
  if (!maxDistance || !userLocation) return true;
  const dist = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    listing.latitude,
    listing.longitude
  );
  return dist <= maxDistance;
});
```

#### Feature 5: Sort by Distance
```typescript
const sortedListings = [...listings].sort((a, b) => {
  if (!userLocation) return 0;
  const distA = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    a.latitude,
    a.longitude
  );
  const distB = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    b.latitude,
    b.longitude
  );
  return distA - distB;
});
```

## Installation Steps

### Step 1: Install Dependencies
```bash
npx expo install expo-location
```

### Step 2: Update app.json
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
    ]
  }
}
```

### Step 3: Run Database Migration
In Supabase SQL Editor, run:
```sql
-- Copy and paste contents of:
-- supabase/migrations/20240119000000_add_location_fields.sql
```

### Step 4: Wrap App with LocationProvider
In `app/_layout.tsx`:
```typescript
import { LocationProvider } from '@/contexts/LocationContext';

export default function RootLayout() {
  return (
    <LocationProvider>
      {/* Your app content */}
    </LocationProvider>
  );
}
```

## Usage Examples

### Example 1: Home Screen with Location

```typescript
import { useLocation } from '@/contexts/LocationContext';
import LocationHeader from '@/components/LocationHeader';
import CityPickerModal from '@/components/CityPickerModal';
import { calculateDistance, formatDistance } from '@/services/locationService';

export default function HomeScreen() {
  const { userLocation, currentCity, loading, refreshLocation, setManualLocation } = useLocation();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);

  // Filter by distance
  const filteredListings = listings.filter(listing => {
    if (!maxDistance || !userLocation || !listing.latitude || !listing.longitude) {
      return true;
    }
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      listing.latitude,
      listing.longitude
    );
    return dist <= maxDistance;
  });

  return (
    <View>
      {/* Location Header */}
      <LocationHeader
        city={currentCity}
        loading={loading}
        onPress={() => setShowCityPicker(true)}
      />

      {/* Distance Filters */}
      <ScrollView horizontal>
        {[null, 5, 10, 25, 50, 100].map(distance => (
          <TouchableOpacity
            key={distance}
            onPress={() => setMaxDistance(distance)}
            style={[
              styles.filterChip,
              maxDistance === distance && styles.filterChipActive
            ]}
          >
            <Text>{distance ? `${distance} km` : 'Tous'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={({ item }) => (
          <ListingCard listing={item} userLocation={userLocation} />
        )}
      />

      {/* City Picker Modal */}
      <CityPickerModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        onSelect={(city) => {
          setManualLocation(city.name, {
            latitude: city.latitude,
            longitude: city.longitude,
          });
          setShowCityPicker(false);
        }}
        onDetectLocation={() => {
          refreshLocation();
          setShowCityPicker(false);
        }}
      />
    </View>
  );
}
```

### Example 2: Listing Card with Distance

```typescript
import { calculateDistance, formatDistance } from '@/services/locationService';

export default function ListingCard({ listing, userLocation }) {
  const distance = useMemo(() => {
    if (!userLocation || !listing.latitude || !listing.longitude) return null;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      listing.latitude,
      listing.longitude
    );
  }, [userLocation, listing]);

  return (
    <View style={styles.card}>
      {/* ... other content ... */}
      
      {distance !== null && (
        <View style={styles.locationInfo}>
          <MapPin size={12} color="#64748b" />
          <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
          
          {distance < 5 && (
            <View style={styles.nearbyBadge}>
              <Text style={styles.nearbyText}>À proximité</Text>
            </View>
          )}
        </View>
      )}
      
      {listing.city && (
        <Text style={styles.cityText}>{listing.city}</Text>
      )}
    </View>
  );
}
```

### Example 3: Post Listing with Location

```typescript
import { getCurrentLocation, getCityFromCoordinates } from '@/services/locationService';

export default function PostScreen() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = async () => {
    setDetectingLocation(true);
    const coords = await getCurrentLocation();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      const cityName = await getCityFromCoordinates(coords.latitude, coords.longitude);
      if (cityName) setCity(cityName);
    }
    setDetectingLocation(false);
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        price,
        latitude,
        longitude,
        city,
        country: 'Congo (RDC)',
        // ... other fields
      });
  };

  return (
    <View>
      <View style={styles.locationInput}>
        <TextInput
          placeholder="Ville"
          value={city}
          onChangeText={setCity}
        />
        <TouchableOpacity onPress={detectLocation}>
          {detectingLocation ? (
            <ActivityIndicator />
          ) : (
            <Navigation size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

## Features Summary

### ✅ Implemented
1. **Location Context** - Global location state
2. **Location Header** - Shows current city
3. **City Picker** - 15 Congo cities
4. **Distance Calculation** - Haversine formula
5. **Distance Formatting** - "2.5 km" or "250 m"
6. **Location Service** - Complete API

### 🎯 Ready to Add
7. **Distance Display on Cards** - Just add to ListingCard component
8. **Distance Filters** - Add filter chips to home screen
9. **Sort by Distance** - Add sort option
10. **Nearby Badge** - Show for items < 5km
11. **Location in Post** - Add to post form

### 🚀 Future Enhancements
12. **Map View** - Show listings on map
13. **Delivery Options** - Filter by delivery available
14. **Save Locations** - Save favorite locations
15. **Location Search** - "iPhone in Lubumbashi"

## Benefits

✅ **Better Discovery** - Users find nearby items
✅ **Trust** - Distance builds confidence
✅ **Convenience** - Filter by proximity
✅ **Familiar UX** - Like Facebook Marketplace
✅ **Local Focus** - Promotes local transactions
✅ **Privacy** - Only shows city, not exact address

## Testing

### On Physical Device
1. Grant location permission
2. See current city in header
3. Tap to change city
4. See distances on cards
5. Filter by distance

### Without GPS
1. Decline permission
2. Manually select city
3. See city-based results
4. Everything still works

---

**Status**: ✅ Core Infrastructure Complete
**Next**: Add to Home Screen and Listing Cards
**Time to Integrate**: 1-2 hours
