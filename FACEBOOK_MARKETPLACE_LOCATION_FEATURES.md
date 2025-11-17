# Facebook Marketplace Location Features Analysis & Implementation

## Facebook Marketplace Location Features

### 1. **Location Radius Selector** ⭐ HIGH PRIORITY
- Default: Within 40 miles/65 km
- Options: 1, 2, 5, 10, 20, 40, 60, 80, 100+ miles
- Sticky at top of feed
- **Our Implementation**: Distance filter chips (5km, 10km, 25km, 50km, 100km+)

### 2. **"Near You" Default Sort** ⭐ HIGH PRIORITY
- Listings sorted by distance by default
- Shows distance on each card
- **Our Implementation**: Auto-sort by distance when location enabled

### 3. **Distance Display on Cards** ⭐ HIGH PRIORITY
- "2.5 km away" on every listing
- Updates as you scroll
- **Our Implementation**: Show distance with MapPin icon

### 4. **Location in Search** ⭐ MEDIUM PRIORITY
- Search within specific city
- "in [City Name]" filter
- **Our Implementation**: City dropdown filter

### 5. **Pickup/Delivery Options** ⭐ MEDIUM PRIORITY
- Filter by "Pickup" or "Shipping"
- Show delivery radius
- **Our Implementation**: Add delivery_available field

### 6. **"Nearby" Badge** ⭐ LOW PRIORITY
- Special badge for items < 5km
- Makes them stand out
- **Our Implementation**: Green "Nearby" badge

### 7. **Location Change** ⭐ HIGH PRIORITY
- Easy to change location
- Search different areas
- **Our Implementation**: Location selector in header

### 8. **Map View** ⭐ LOW PRIORITY (Future)
- See listings on map
- Cluster markers
- **Our Implementation**: Phase 2

## Implementation Plan

### Phase 1: Essential Features (Implement Now)

#### 1.1 Distance Display on Cards
```typescript
// Show on every listing card
<View style={styles.distance}>
  <MapPin size={12} color="#64748b" />
  <Text>2.5 km</Text>
</View>
```

#### 1.2 Location Radius Filter
```typescript
// Filter chips at top
const DISTANCE_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100+ km', value: 100 },
];
```

#### 1.3 Location Selector in Header
```typescript
// Tap to change location
<TouchableOpacity onPress={openLocationPicker}>
  <MapPin size={20} />
  <Text>Kinshasa</Text>
  <ChevronDown size={16} />
</TouchableOpacity>
```

#### 1.4 Sort by Distance
```typescript
// Default sort
listings.sort((a, b) => {
  const distA = calculateDistance(userLat, userLon, a.lat, a.lon);
  const distB = calculateDistance(userLat, userLon, b.lat, b.lon);
  return distA - distB;
});
```

#### 1.5 "Nearby" Badge
```typescript
// Show badge if < 5km
{distance < 5 && (
  <View style={styles.nearbyBadge}>
    <Text>À proximité</Text>
  </View>
)}
```

### Phase 2: Enhanced Features

#### 2.1 Delivery Options
- Add "Livraison disponible" field
- Filter by delivery available
- Show delivery radius

#### 2.2 Location Search
- Search "iPhone in Lubumbashi"
- Parse location from search
- Filter results

#### 2.3 Save Favorite Locations
- Save multiple locations
- Quick switch between them
- "Home", "Work", etc.

## Detailed Implementation

### Feature 1: Location Header Component

Create: `components/LocationHeader.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { getCurrentLocation, findNearestCity } from '@/services/locationService';

export default function LocationHeader({ onLocationChange }) {
  const [currentCity, setCurrentCity] = useState('Kinshasa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLoading(true);
    const coords = await getCurrentLocation();
    if (coords) {
      const city = findNearestCity(coords.latitude, coords.longitude);
      setCurrentCity(city);
      onLocationChange(city, coords);
    }
    setLoading(false);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={detectLocation}>
      <MapPin size={20} color="#1e293b" />
      <Text style={styles.cityText}>{currentCity}</Text>
      <ChevronDown size={16} color="#64748b" />
    </TouchableOpacity>
  );
}
```

### Feature 2: Distance Filter Chips

Add to Home Screen:

```typescript
const DistanceFilters = ({ selectedDistance, onSelect }) => {
  const options = [
    { label: 'Tous', value: null },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 },
    { label: '100+ km', value: 100 },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.filterChip,
            selectedDistance === option.value && styles.filterChipActive
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
```

### Feature 3: Enhanced Listing Card

Update `components/ListingCard.tsx`:

```typescript
// Add distance prop
interface ListingCardProps {
  // ... existing props
  userLocation?: { latitude: number; longitude: number };
}

// Calculate distance
const distance = useMemo(() => {
  if (!userLocation || !listing.latitude || !listing.longitude) return null;
  
  const dist = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    listing.latitude,
    listing.longitude
  );
  
  return dist;
}, [userLocation, listing.latitude, listing.longitude]);

// Show distance and nearby badge
<View style={styles.locationInfo}>
  {distance !== null && (
    <>
      <View style={styles.distanceContainer}>
        <MapPin size={12} color="#64748b" />
        <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
      </View>
      
      {distance < 5 && (
        <View style={styles.nearbyBadge}>
          <Text style={styles.nearbyText}>À proximité</Text>
        </View>
      )}
    </>
  )}
  
  {listing.city && (
    <Text style={styles.cityText}>{listing.city}</Text>
  )}
</View>
```

### Feature 4: Location Context

Create: `contexts/LocationContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentLocation, LocationCoords } from '@/services/locationService';

interface LocationContextType {
  userLocation: LocationCoords | null;
  currentCity: string | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
  setManualLocation: (city: string, coords: LocationCoords) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshLocation();
  }, []);

  const refreshLocation = async () => {
    setLoading(true);
    const coords = await getCurrentLocation();
    if (coords) {
      setUserLocation(coords);
      const city = findNearestCity(coords.latitude, coords.longitude);
      setCurrentCity(city);
    }
    setLoading(false);
  };

  const setManualLocation = (city: string, coords: LocationCoords) => {
    setCurrentCity(city);
    setUserLocation(coords);
  };

  return (
    <LocationContext.Provider value={{
      userLocation,
      currentCity,
      loading,
      refreshLocation,
      setManualLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
```

### Feature 5: City Picker Modal

Create: `components/CityPickerModal.tsx`

```typescript
import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { CONGO_CITIES } from '@/services/locationService';
import { MapPin, X } from 'lucide-react-native';

export default function CityPickerModal({ visible, onClose, onSelect }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir une ville</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={CONGO_CITIES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <MapPin size={20} color="#64748b" />
                <Text style={styles.cityName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
```

## Implementation Priority

### Must Have (Implement First)
1. ✅ Distance display on cards
2. ✅ Location header with city name
3. ✅ Distance filter chips (5km, 10km, 25km, 50km, 100km+)
4. ✅ Sort by distance
5. ✅ City picker modal

### Nice to Have (Implement Later)
6. ⏳ "Nearby" badge for items < 5km
7. ⏳ Delivery options filter
8. ⏳ Save favorite locations
9. ⏳ Location in search
10. ⏳ Map view

## User Experience Flow

### First Time User
1. App requests location permission
2. Shows explanation: "To show you nearby products"
3. If granted → Auto-detect city
4. If denied → Show city picker
5. Save preference

### Browsing
1. See location in header (e.g., "Kinshasa")
2. See distance on every card (e.g., "2.5 km")
3. Filter by distance with chips
4. Tap location to change city
5. Results update automatically

### Posting
1. Auto-detect location
2. Show on map (optional)
3. Allow manual adjustment
4. Save with listing

## Benefits

✅ **Better Discovery** - Users find nearby items easily
✅ **Trust** - Seeing distance builds confidence
✅ **Convenience** - Filter by proximity
✅ **Familiar UX** - Like Facebook Marketplace
✅ **Local Focus** - Promotes local transactions

---

**Next Step**: Implement the 5 must-have features
**Estimated Time**: 3-4 hours
**Testing**: Physical device with GPS
