# Database Seeding Scripts

This directory contains scripts to populate your database with sample data for testing the location-based features.

## Available Scripts

### 1. `seed-listings.js` (Recommended)
Node.js script that adds 20 sample listings with location coordinates across DRC cities.

**Usage:**
```bash
# Make sure you have the Supabase client installed
npm install @supabase/supabase-js

# Run the script
node scripts/seed-listings.js
```

**Requirements:**
- Your `.env` file must have `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- At least one user in the database
- At least one category in the database

### 2. `seed-listings.ts`
TypeScript version of the seeding script.

**Usage:**
```bash
# Install tsx if you don't have it
npm install -g tsx

# Run the script
tsx scripts/seed-listings.ts
```

### 3. `seed-listings-with-location.sql`
Raw SQL script for direct database insertion.

**Usage:**
```bash
# Connect to your Supabase database and run the SQL file
# Or use the Supabase SQL Editor in the dashboard
```

## What Gets Created

The scripts create **20 sample listings** distributed across major DRC cities:

### Kinshasa (7 listings)
- iPhone 13 Pro Max - Gombe
- Samsung 55" TV - Lemba
- MacBook Pro M1 - Ngaliema
- Leather Sofa - Kalamu
- PlayStation 5 - Bandalungwa
- iPad Air - Kintambo
- Wooden Desk - Kasa-Vubu

### Lubumbashi (3 listings)
- Toyota RAV4 - Kenya
- Samsung Refrigerator - Kampemba
- Mountain Bike - Katuba

### Kipushi (2 listings)
- Honda Generator - Centre-ville
- Dining Table Set - Kipushi

### Goma (2 listings)
- Canon EOS R6 Camera - Himbi
- DJI Drone - Mugunga

### Bukavu (2 listings)
- Dell XPS Laptop - Ibanda
- Air Conditioner - Kadutu

### Kisangani (1 listing)
- Yamaha Motorcycle - Makiso

### Matadi (1 listing)
- Diesel Generator - Mvuzi

## Testing Distance Features

After seeding:

1. **Open your app** and navigate to the home screen
2. **Enable location** or select a city (e.g., Kinshasa)
3. **Test radius filtering**:
   - Tap the radius selector below the location
   - Try different radii: 5km, 10km, 25km, 50km, 100km
   - Watch listings filter based on distance
4. **Check distance display**:
   - Each listing card should show distance (e.g., "2.3 km")
   - Distance appears next to the location name

## Troubleshooting

### "No users found"
Create a user account in your app first, then run the script.

### "No categories found"
You need to create at least one category. You can do this via:
```sql
INSERT INTO categories (name, icon, slug) 
VALUES ('Electronics', '📱', 'electronics');
```

### "Missing Supabase credentials"
Make sure your `.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Listings don't show distance
1. Make sure the migration `20240119000000_add_location_fields.sql` has been run
2. Check that listings have `latitude` and `longitude` values
3. Ensure your user has location enabled or a city selected

## Customization

To add your own listings, edit the `sampleListings` array in `seed-listings.js`:

```javascript
{
  title: 'Your Product',
  description: 'Product description',
  price: 100,
  images: ['https://example.com/image.jpg'],
  location: 'City, Neighborhood',
  latitude: -4.3217,  // Your coordinates
  longitude: 15.3125,
  condition: 'new',    // new, like_new, good, fair, poor
  is_featured: false,
}
```

## Coordinates Reference

Major DRC cities coordinates:
- **Kinshasa**: -4.3217, 15.3125
- **Lubumbashi**: -11.6667, 27.4667
- **Kipushi**: -11.7608, 27.2514
- **Goma**: -1.6792, 29.2228
- **Bukavu**: -2.5083, 28.8608
- **Kisangani**: 0.5167, 25.2000
- **Matadi**: -5.8167, 13.4500
- **Kananga**: -5.8833, 22.4167

Use these as reference points when adding listings in specific cities.
