# Quick Test Guide - Location & Map Features

## 🚀 Test in 3 Steps (5 minutes)

### Step 1: Add Sample Data
```bash
node scripts/seed-listings.js
```
This adds 20 listings with coordinates across DRC cities.

### Step 2: Open Your App
```bash
npm run dev
```
Open in browser (usually http://localhost:8081)

### Step 3: Test Features

#### A. Home Screen - Distance Filtering
1. Go to home screen
2. Look for location selector at top
3. Tap radius selector
4. Choose "Within 10 km"
5. ✅ Listings should filter by distance
6. ✅ Each card shows "2.3 km • City"

#### B. Listing Detail - Map View
1. Click any listing
2. Scroll to "Localisation" section
3. ✅ Should see location name
4. ✅ Should see distance: "À X km de vous"
5. ✅ Should see interactive Google Map
6. ✅ Map shows ~3km area with neighborhood names
7. ✅ Privacy message at bottom

## What You Should See

### Home Screen
```
┌─────────────────────────────────┐
│ 📍 Kinshasa                     │
│ 📻 Within 10 km ▼               │
└─────────────────────────────────┘

┌──────────────┬──────────────┐
│ iPhone 13    │ MacBook Pro  │
│ $850         │ $1,200       │
│ 2.3 km •     │ 4.1 km •     │
│ Kinshasa     │ Kinshasa     │
└──────────────┴──────────────┘
```

### Listing Detail
```
┌─────────────────────────────────┐
│ Localisation                    │
├─────────────────────────────────┤
│ 📍 Kinshasa, Gombe              │
│    À 2.3 km de vous             │
├─────────────────────────────────┤
│                                 │
│   [Google Map showing area]     │
│   - Zoom level 14               │
│   - Shows neighborhood names    │
│   - Shows major streets         │
│                                 │
├─────────────────────────────────┤
│ 📍 Zone approximative pour      │
│    votre sécurité               │
└─────────────────────────────────┘
```

## Test Scenarios

### Scenario 1: Kinshasa User
1. Select "Kinshasa" as location
2. Choose "Within 5 km" radius
3. ✅ Should see 7 Kinshasa listings
4. ✅ Each shows distance < 5km
5. Open any listing
6. ✅ Map shows Kinshasa neighborhood

### Scenario 2: Lubumbashi User
1. Select "Lubumbashi" as location
2. Choose "Within 25 km" radius
3. ✅ Should see 3 Lubumbashi listings
4. ✅ Might see 2 Kipushi listings (~10km away)
5. Open any listing
6. ✅ Map shows Lubumbashi area

### Scenario 3: All Listings
1. Select "All listings" (no radius)
2. ✅ Should see all 20 listings
3. ✅ Distance still shows on each card
4. Open any listing
5. ✅ Map still displays

## Verify Features

### ✅ Distance Calculation
- [ ] Shows on listing cards
- [ ] Format: "2.3 km" or "500 m"
- [ ] Updates when location changes
- [ ] Accurate (use Google Maps to verify)

### ✅ Radius Filtering
- [ ] Modal opens when tapped
- [ ] 6 options: All, 5km, 10km, 25km, 50km, 100km
- [ ] Filters apply immediately
- [ ] Works with other filters (search, category, price)

### ✅ Map Display
- [ ] Shows on listing detail page
- [ ] Interactive on web
- [ ] Shows neighborhood names
- [ ] Zoom level appropriate (~3km view)
- [ ] Privacy message visible

### ✅ Location Selector
- [ ] Shows current city
- [ ] Opens city picker when tapped
- [ ] Updates listings when changed
- [ ] Persists during session

## Common Issues & Fixes

### "No listings showing"
**Fix:** Run the seeding script first
```bash
node scripts/seed-listings.js
```

### "Distance not showing"
**Fix:** Enable location or select a city manually

### "Map not loading"
**Fix:** 
- Check internet connection
- Verify listing has coordinates
- Check browser console for errors

### "Wrong distances"
**Fix:** 
- Verify coordinates in database
- Check location is set correctly
- Ensure using correct city

## Performance Check

### Should Be Fast
- ✅ Distance calculation: < 1ms per listing
- ✅ Filtering 20 listings: < 10ms
- ✅ Map load: < 500ms
- ✅ No lag when scrolling

### If Slow
- Check network tab for slow requests
- Verify map is lazy loading
- Check for console errors

## Browser Compatibility

### ✅ Tested On
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

### Should Work On
- Any modern browser
- Desktop and mobile
- Different screen sizes

## Next Steps After Testing

### If Everything Works
1. ✅ Get your own Google Maps API key
2. ✅ Replace demo key in code
3. ✅ Add API key restrictions
4. ✅ Deploy to production

### If Issues Found
1. Check documentation files
2. Review console errors
3. Verify database has coordinates
4. Check LocationContext is working

## Quick Commands

```bash
# Seed database
node scripts/seed-listings.js

# Start dev server
npm run dev

# Check for errors
npm run typecheck

# View in browser
# Usually: http://localhost:8081
```

## Expected Results

After testing, you should have:
- ✅ 20 listings with coordinates
- ✅ Distance showing on all cards
- ✅ Radius filtering working
- ✅ Maps displaying on listing details
- ✅ Location selector functional
- ✅ Privacy maintained

## Success!

If you can:
1. ✅ Filter listings by distance
2. ✅ See distance on cards
3. ✅ View map on listing detail
4. ✅ See neighborhood names on map

Then everything is working perfectly! 🎉

## Get Help

If you encounter issues:
1. Check `LOCATION_FEATURES_SUMMARY.md`
2. Review `WEB_MAP_IMPLEMENTATION.md`
3. See `MAP_FEATURE_COMPLETE.md`
4. Check browser console for errors

## Time to Test!

Run the seeding script and start exploring:
```bash
node scripts/seed-listings.js
```

Then open your app and test all the features. The map should show a nice 3km area view with neighborhood names clearly visible! 🗺️
