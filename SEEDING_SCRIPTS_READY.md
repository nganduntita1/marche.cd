# Database Seeding Scripts - Ready to Use

## Overview
Created comprehensive seeding scripts to populate your database with sample listings that have location coordinates for testing the distance-based filtering feature.

## What's Been Created

### 1. **seed-listings.js** (Main Script)
- Node.js script that's ready to run
- Adds 20 sample listings across 7 DRC cities
- Each listing has proper coordinates (latitude/longitude)
- Includes error handling and progress reporting
- Uses your existing Supabase credentials from .env

### 2. **seed-listings.ts** (TypeScript Version)
- Same functionality as the JS version
- For projects using TypeScript/tsx

### 3. **seed-listings-with-location.sql** (SQL Version)
- Raw SQL for direct database insertion
- Can be run in Supabase SQL Editor

### 4. **scripts/README.md**
- Complete documentation
- Usage instructions
- Troubleshooting guide
- Customization tips

## Quick Start

### Step 1: Install Dependencies (if needed)
```bash
npm install @supabase/supabase-js
```

### Step 2: Run the Script
```bash
node scripts/seed-listings.js
```

### Step 3: Test in Your App
1. Open the app
2. Select a city (e.g., Kinshasa)
3. Tap the radius selector
4. Choose a radius (5km, 10km, etc.)
5. See listings filtered by distance!

## What You'll Get

**20 Sample Listings** distributed across:
- **Kinshasa**: 7 listings (iPhone, MacBook, TV, PS5, etc.)
- **Lubumbashi**: 3 listings (Toyota RAV4, Refrigerator, Bike)
- **Kipushi**: 2 listings (Generator, Dining Table)
- **Goma**: 2 listings (Camera, Drone)
- **Bukavu**: 2 listings (Laptop, AC)
- **Kisangani**: 1 listing (Motorcycle)
- **Matadi**: 1 listing (Generator)

Each listing includes:
- ✅ Title and description
- ✅ Price
- ✅ Image URL
- ✅ Location name
- ✅ **Latitude coordinate**
- ✅ **Longitude coordinate**
- ✅ Condition (new, like_new, good)
- ✅ Featured status

## Testing Scenarios

### Scenario 1: Kinshasa User (5km radius)
If you're in Kinshasa center (-4.3217, 15.3125):
- Should see ~7 listings within 5km
- Each shows distance (e.g., "2.3 km")

### Scenario 2: Kinshasa User (10km radius)
- Should see all 7 Kinshasa listings
- Distances range from 0.5km to 8km

### Scenario 3: Lubumbashi User (25km radius)
If you're in Lubumbashi (-11.6667, 27.4667):
- Should see 3 Lubumbashi listings
- Might see Kipushi listings (~10km away)

### Scenario 4: All Listings (no radius)
- Shows all 20 listings
- Still displays distances if location enabled

## Requirements

Before running the script, make sure you have:

1. **Supabase credentials** in `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. **At least one user** in the database
   - Create an account in your app first

3. **At least one category** in the database
   - The script will use the first category found

4. **Location fields migration** applied
   - Migration `20240119000000_add_location_fields.sql` should be run

## Script Output

When you run the script, you'll see:
```
🌱 Starting to seed listings with location data...

✅ Using user ID: abc123...
✅ Using category ID: xyz789...

📍 Adding listings across DRC cities...

✅ Added: iPhone 13 Pro Max 256GB
   📍 Kinshasa, Gombe (-4.3217, 15.3125)
✅ Added: Samsung 55" 4K Smart TV
   📍 Kinshasa, Lemba (-4.3850, 15.3150)
...

============================================================
🎉 Seeding complete!
============================================================
✅ Successfully added: 20 listings
❌ Failed: 0 listings

📊 Distribution:
   • Kinshasa: 7 listings
   • Lubumbashi: 3 listings
   • Kipushi: 2 listings
   • Goma: 2 listings
   • Bukavu: 2 listings
   • Kisangani: 1 listing
   • Matadi: 1 listing

💡 Tip: Open your app and test the distance filtering!
```

## Troubleshooting

### Issue: "No users found"
**Solution**: Create a user account in your app first

### Issue: "No categories found"
**Solution**: Add a category via SQL:
```sql
INSERT INTO categories (name, icon, slug) 
VALUES ('Electronics', '📱', 'electronics');
```

### Issue: "Missing Supabase credentials"
**Solution**: Check your `.env` file has the correct values

### Issue: Listings don't show distance
**Solution**: 
1. Make sure location migration is applied
2. Enable location in the app or select a city
3. Check that listings have latitude/longitude values

## Next Steps

After seeding:

1. **Test the radius filter**
   - Try different radii
   - Switch between cities
   - Check distance calculations

2. **Verify distance display**
   - Each card should show distance
   - Format should be "2.3 km • City"

3. **Test edge cases**
   - No location enabled
   - Very small radius (5km)
   - Very large radius (100km)

4. **Add more listings**
   - Edit the script to add your own
   - Use the coordinates reference in README

## Benefits

With these seeded listings, you can now:
- ✅ Test distance-based filtering
- ✅ Verify distance calculations
- ✅ Demo the location features
- ✅ Show realistic data to stakeholders
- ✅ Test performance with distributed data
- ✅ Validate the user experience

## Files Created

```
scripts/
├── seed-listings.js              # Main seeding script (Node.js)
├── seed-listings.ts              # TypeScript version
├── seed-listings-with-location.sql  # SQL version
└── README.md                     # Documentation
```

All scripts are ready to use and well-documented!
