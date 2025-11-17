# Location Services Implementation Plan

## Overview
Add location services to show users how far products are from them and where items were posted.

## Phase 1: Database Schema Updates

### 1.1 Add Location Fields to Listings Table
```sql
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Congo';
```

### 1.2 Add Location Fields to Users Table
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
```

### 1.3 Create Location Index
```sql
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(latitude, longitude);
```

## Phase 2: Location Permission & Services

### 2.1 Install Required Packages
```bash
npx expo install expo-location
```

### 2.2 Update app.json Permissions
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

### 2.3 Create Location Service
File: `services/locationService.ts`
- Request location permissions
- Get current location
- Calculate distance between two points
- Geocode address to coordinates
- Reverse geocode coordinates to address

## Phase 3: UI/UX Implementation

### 3.1 Post Listing Screen
- Add location picker
- Show map preview
- Auto-detect current location
- Manual city selection fallback

### 3.2 Listing Card
- Show distance from user (e.g., "2.5 km away")
- Show city name
- Location icon

### 3.3 Listing Detail Page
- Show full address/city
- Show distance
- "View on Map" button
- Map preview (optional)

### 3.4 Home Screen
- Filter by distance
- Sort by nearest
- Location-based search

### 3.5 User Profile
- Show user's city
- Privacy option to hide exact location

## Phase 4: Features

### 4.1 Distance Calculation
- Calculate distance between user and listing
- Display in km or m
- "Nearby" badge for items < 5km

### 4.2 Location Filters
- Filter by city
- Filter by distance radius (5km, 10km, 25km, 50km)
- "Near me" quick filter

### 4.3 Map View (Future)
- Show listings on map
- Cluster markers
- Tap marker to view listing

### 4.4 Privacy
- Option to show approximate location only
- Hide exact coordinates
- Show city/neighborhood only

## Phase 5: Congo-Specific Implementation

### 5.1 Major Cities Database
Pre-populate common Congo cities:
- Kinshasa
- Lubumbashi
- Mbuji-Mayi
- Kananga
- Kisangani
- Bukavu
- Goma
- Likasi
- Kolwezi
- Tshikapa

### 5.2 Neighborhoods (Kinshasa)
- Gombe
- Limete
- Ngaliema
- Bandalungwa
- Kalamu
- Kasa-Vubu
- Lemba
- Matete
- Ngiri-Ngiri
- Kimbanseke

### 5.3 Distance Display
- Use metric system (km)
- French language ("à 2,5 km")
- Show city if > 50km away

## Implementation Priority

### High Priority (Phase 1)
1. ✅ Database schema updates
2. ✅ Location service creation
3. ✅ Add location to post listing
4. ✅ Show distance on listing cards
5. ✅ Show location on listing detail

### Medium Priority (Phase 2)
6. ⏳ Location filters on home screen
7. ⏳ Sort by distance
8. ⏳ City picker with Congo cities
9. ⏳ User location in profile

### Low Priority (Phase 3)
10. ⏳ Map view
11. ⏳ Advanced location privacy
12. ⏳ Neighborhood selection

## Technical Considerations

### Distance Calculation Formula
Use Haversine formula for accurate distance:
```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### Performance
- Cache user location
- Update location periodically (not on every render)
- Use indexes for location queries
- Limit distance calculations to visible items

### Privacy
- Ask permission with clear explanation
- Allow users to decline
- Fallback to city selection
- Don't store exact coordinates publicly

### Offline Support
- Cache last known location
- Allow manual city entry
- Work without GPS

## User Flow

### Posting a Listing
1. User creates listing
2. App requests location permission
3. If granted → Auto-detect location
4. Show map preview with pin
5. User can adjust pin or enter city manually
6. Save coordinates + city name

### Viewing Listings
1. App gets user's current location (if permitted)
2. Calculate distance for each listing
3. Show "X km away" on cards
4. Allow filtering by distance
5. Sort by nearest first (optional)

### Privacy-Conscious Users
1. User declines location permission
2. App asks for city selection
3. Show city-based results
4. No distance calculations

## Success Metrics
- % of users who enable location
- % of listings with location data
- Engagement with "nearby" filter
- Distance-based search usage

## Next Steps
1. Create database migration
2. Build location service
3. Update post listing screen
4. Update listing cards
5. Add distance filters
6. Test on physical device

---

**Estimated Time**: 4-6 hours
**Complexity**: Medium
**Dependencies**: expo-location
**Testing**: Requires physical device with GPS
