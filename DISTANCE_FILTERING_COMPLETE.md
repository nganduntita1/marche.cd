# Distance-Based Filtering Implementation

## Overview
Implemented comprehensive distance-based filtering for listings, allowing users to see how far away items are and filter by search radius.

## Features Implemented

### 1. Distance Calculation
- Uses Haversine formula to calculate accurate distances between user and listings
- Displays distance on each listing card
- Formats distance appropriately (meters for < 1km, kilometers otherwise)

### 2. Search Radius Selector
- Added radius selector to location component
- Options: All listings, 5km, 10km, 25km, 50km, 100km
- Persists selection during session
- Only shows when user has location enabled

### 3. Listing Filtering
Enhanced filtering system to include:
- Search query (title/description)
- Category selection
- Price range
- **Distance radius** (new)

### 4. Distance Display on Cards
- Shows distance prominently on each listing card
- Format: "2.3 km • Kinshasa" or "500 m • Lubumbashi"
- Falls back to location only if no distance available

## Files Modified

### 1. `app/(tabs)/index.tsx`
**Added:**
- `searchRadius` state (null = show all)
- `showRadiusModal` state
- Distance calculation imports from locationService
- Enhanced filtering logic with distance calculation
- Radius selector in location component
- Radius modal UI
- Distance prop passed to ListingCard

**New Functions:**
- Distance filtering in `filteredListings`
- Distance calculation and attachment to each listing
- Radius selector modal with 5 preset options

### 2. `components/ListingCard.tsx`
**Added:**
- `distance?: number` prop
- Distance display in location section
- Format: "2.3 km • Location" or just distance if no location

### 3. `types/database.ts`
**Added to Listing interface:**
- `latitude?: number`
- `longitude?: number`

### 4. Translation Files

**English (assets/locales/en.json):**
```json
"home": {
  "location": "Location",
  "currentLocation": "Current Location",
  "within": "Within",
  "allListings": "All listings",
  "searchRadius": "Search Radius"
}
```

**French (assets/locales/fr.json):**
```json
"home": {
  "location": "Localisation",
  "currentLocation": "Position actuelle",
  "within": "Dans un rayon de",
  "allListings": "Toutes les annonces",
  "searchRadius": "Rayon de recherche"
}
```

## User Experience Flow

1. **User opens home screen**
   - Sees location selector with current city
   - If location enabled, sees radius selector showing "All listings"

2. **User taps radius selector**
   - Modal opens with radius options
   - Can choose: All listings, 5km, 10km, 25km, 50km, 100km
   - Selection applies immediately

3. **Listings update**
   - Only shows listings within selected radius
   - Each card displays distance from user
   - Distance shown as "2.3 km • City" format

4. **Combined filtering**
   - Distance filter works alongside:
     - Search query
     - Category selection
     - Price range
   - All filters apply simultaneously

## Technical Details

### Distance Calculation
```typescript
// Uses Haversine formula from locationService
const distance = calculateDistance(
  userLocation.latitude,
  userLocation.longitude,
  listing.latitude,
  listing.longitude
);
```

### Filtering Logic
```typescript
// Distance filter only applies if:
// 1. User has selected a radius
// 2. User location is available
// 3. Listing has coordinates
if (searchRadius && userLocation && listing.latitude && listing.longitude) {
  const distance = calculateDistance(...);
  matchesDistance = distance <= searchRadius;
}
```

### Distance Display Format
- < 1 km: "500 m"
- 1-10 km: "2.3 km" (1 decimal)
- > 10 km: "25 km" (rounded)

## Styling

### Location Selector Container
- White background with bottom border
- Padding: 24px horizontal, 16px vertical
- Contains city selector and radius selector

### Radius Selector
- Appears below city selector with top border
- Shows current selection or "All listings"
- Chevron-down icon indicates it's tappable

### Radius Modal
- Clean modal with 6 options
- Active option highlighted in green
- Tapping option applies immediately and closes modal

## Benefits

1. **Better Discovery**: Users find nearby items easily
2. **Realistic Expectations**: See distance before viewing details
3. **Flexible Filtering**: Choose radius based on needs
4. **Location-Aware**: Leverages existing location infrastructure
5. **Performance**: Efficient client-side filtering

## Next Steps (Optional Enhancements)

1. **Distance-Based Sorting**
   - Add "Nearby" sort option
   - Sort listings by distance ascending

2. **Map View**
   - Show listings on interactive map
   - Cluster nearby items
   - Visual radius indicator

3. **Smart Defaults**
   - Remember user's preferred radius
   - Suggest radius based on listing density

4. **Distance in Search Results**
   - Show distance in search results
   - Filter search by distance

5. **Seller Distance**
   - Show distance to seller on listing detail
   - "Meet in person" location suggestions
