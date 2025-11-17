/**
 * Script to seed the database with sample listings that have location coordinates
 * 
 * Setup:
 * 1. npm install @supabase/supabase-js
 * 2. Set your Supabase credentials in .env or replace below
 * 3. Run: node scripts/seed-listings.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Replace with your Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample listings data with coordinates across DRC cities
const sampleListings = [
  // Kinshasa listings (7 items)
  {
    title: 'iPhone 13 Pro Max 256GB',
    description: 'Excellent condition, barely used. Comes with original box and charger. Face ID works perfectly, battery health at 95%.',
    price: 850,
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800'],
    location: 'Kinshasa, Gombe',
    latitude: -4.3217,
    longitude: 15.3125,
    condition: 'like_new',
    is_featured: false,
  },
  {
    title: 'Samsung 55" 4K Smart TV',
    description: 'Brand new in box, never opened. Latest model with HDR support, built-in streaming apps.',
    price: 650,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'],
    location: 'Kinshasa, Lemba',
    latitude: -4.3850,
    longitude: 15.3150,
    condition: 'new',
    is_featured: true,
  },
  {
    title: 'MacBook Pro 2021 M1',
    description: '16GB RAM, 512GB SSD. Perfect for developers and designers. Includes original charger and case.',
    price: 1200,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    location: 'Kinshasa, Ngaliema',
    latitude: -4.3500,
    longitude: 15.2800,
    condition: 'good',
    is_featured: false,
  },
  {
    title: 'Canapé 3 places en cuir',
    description: 'Canapé moderne en cuir véritable, très confortable. Couleur marron, parfait état.',
    price: 450,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    location: 'Kinshasa, Kalamu',
    latitude: -4.3400,
    longitude: 15.3300,
    condition: 'good',
    is_featured: false,
  },
  {
    title: 'PlayStation 5 + 2 manettes',
    description: 'Console PS5 avec 2 manettes et 5 jeux inclus. État impeccable, garantie valide.',
    price: 750,
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'],
    location: 'Kinshasa, Bandalungwa',
    latitude: -4.3600,
    longitude: 15.2900,
    condition: 'like_new',
    is_featured: true,
  },
  {
    title: 'iPad Air 2022',
    description: 'Tablette Apple avec Apple Pencil. Parfait pour étudiants et professionnels.',
    price: 580,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
    location: 'Kinshasa, Kintambo',
    latitude: -4.3100,
    longitude: 15.2900,
    condition: 'like_new',
    is_featured: false,
  },
  {
    title: 'Bureau en bois massif',
    description: 'Grand bureau professionnel avec tiroirs. Très solide et élégant.',
    price: 380,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    location: 'Kinshasa, Kasa-Vubu',
    latitude: -4.3300,
    longitude: 15.3100,
    condition: 'good',
    is_featured: false,
  },

  // Lubumbashi listings (3 items)
  {
    title: 'Toyota RAV4 2019',
    description: 'SUV en excellent état, entretien régulier. 45,000 km au compteur. Papiers en règle.',
    price: 18500,
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'],
    location: 'Lubumbashi, Kenya',
    latitude: -11.6667,
    longitude: 27.4667,
    condition: 'good',
    is_featured: true,
  },
  {
    title: 'Réfrigérateur Samsung 400L',
    description: 'Grand réfrigérateur double porte, très économe en énergie. Garantie 1 an.',
    price: 380,
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'],
    location: 'Lubumbashi, Kampemba',
    latitude: -11.6500,
    longitude: 27.4800,
    condition: 'like_new',
    is_featured: false,
  },
  {
    title: 'Vélo VTT professionnel',
    description: 'Vélo tout terrain 21 vitesses, cadre aluminium. Parfait état, peu utilisé.',
    price: 280,
    images: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'],
    location: 'Lubumbashi, Katuba',
    latitude: -11.6900,
    longitude: 27.4500,
    condition: 'good',
    is_featured: false,
  },

  // Kipushi listings (2 items)
  {
    title: 'Générateur Honda 5KVA',
    description: 'Générateur silencieux, très fiable. Idéal pour maison ou commerce.',
    price: 850,
    images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
    location: 'Kipushi, Centre-ville',
    latitude: -11.7608,
    longitude: 27.2514,
    condition: 'good',
    is_featured: false,
  },
  {
    title: 'Table à manger + 6 chaises',
    description: 'Ensemble de salle à manger en bois massif. Très élégant et solide.',
    price: 420,
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
    location: 'Kipushi',
    latitude: -11.7650,
    longitude: 27.2550,
    condition: 'good',
    is_featured: false,
  },

  // Goma listings (2 items)
  {
    title: 'Canon EOS R6 + objectif',
    description: 'Appareil photo professionnel avec objectif 24-70mm. État neuf, peu utilisé.',
    price: 2200,
    images: ['https://images.unsplash.com/photo-1606980707986-7b0c1e7c4b8e?w=800'],
    location: 'Goma, Himbi',
    latitude: -1.6792,
    longitude: 29.2228,
    condition: 'like_new',
    is_featured: true,
  },
  {
    title: 'Drone DJI Mavic Air 2',
    description: 'Drone avec caméra 4K, portée 10km. Parfait pour vidéos aériennes professionnelles.',
    price: 950,
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800'],
    location: 'Goma, Mugunga',
    latitude: -1.6900,
    longitude: 29.2100,
    condition: 'good',
    is_featured: false,
  },

  // Bukavu listings (2 items)
  {
    title: 'Ordinateur portable Dell XPS',
    description: 'Intel i7, 16GB RAM, 1TB SSD. Parfait pour travail et gaming.',
    price: 980,
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'],
    location: 'Bukavu, Ibanda',
    latitude: -2.5083,
    longitude: 28.8608,
    condition: 'good',
    is_featured: false,
  },
  {
    title: 'Climatiseur Split 12000 BTU',
    description: 'Climatiseur inverter, très silencieux et économique. Installation incluse.',
    price: 420,
    images: ['https://images.unsplash.com/photo-1631545806609-c2f4e4e6e0e0?w=800'],
    location: 'Bukavu, Kadutu',
    latitude: -2.5200,
    longitude: 28.8700,
    condition: 'like_new',
    is_featured: false,
  },

  // Kisangani listing (1 item)
  {
    title: 'Moto Yamaha 125cc',
    description: 'Moto en très bon état, économique en carburant. Papiers en règle.',
    price: 1200,
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'],
    location: 'Kisangani, Makiso',
    latitude: 0.5167,
    longitude: 25.2000,
    condition: 'good',
    is_featured: false,
  },

  // Matadi listing (1 item)
  {
    title: 'Groupe électrogène Diesel 10KVA',
    description: 'Générateur professionnel, très puissant. Parfait pour entreprise.',
    price: 1800,
    images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
    location: 'Matadi, Mvuzi',
    latitude: -5.8167,
    longitude: 13.4500,
    condition: 'good',
    is_featured: true,
  },
];

async function seedListings() {
  console.log('🌱 Starting to seed listings with location data...\n');

  try {
    // Get first user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError) {
      console.error('❌ Error fetching users:', userError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Error: No users found in database.');
      console.error('   Please create a user account first.');
      return;
    }

    // Get first category
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoryError) {
      console.error('❌ Error fetching categories:', categoryError.message);
      return;
    }

    if (!categories || categories.length === 0) {
      console.error('❌ Error: No categories found in database.');
      console.error('   Please create categories first.');
      return;
    }

    const userId = users[0].id;
    const categoryId = categories[0].id;

    console.log(`✅ Using user ID: ${userId}`);
    console.log(`✅ Using category ID: ${categoryId}\n`);
    console.log('📍 Adding listings across DRC cities...\n');

    // Insert listings one by one
    let successCount = 0;
    let errorCount = 0;

    for (const listing of sampleListings) {
      const { error } = await supabase.from('listings').insert({
        ...listing,
        seller_id: userId,
        category_id: categoryId,
        status: 'active',
      });

      if (error) {
        console.error(`❌ Failed: ${listing.title}`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Added: ${listing.title}`);
        console.log(`   📍 ${listing.location} (${listing.latitude}, ${listing.longitude})`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seeding complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${successCount} listings`);
    console.log(`❌ Failed: ${errorCount} listings`);
    console.log('\n📊 Distribution:');
    console.log('   • Kinshasa: 7 listings');
    console.log('   • Lubumbashi: 3 listings');
    console.log('   • Kipushi: 2 listings');
    console.log('   • Goma: 2 listings');
    console.log('   • Bukavu: 2 listings');
    console.log('   • Kisangani: 1 listing');
    console.log('   • Matadi: 1 listing');
    console.log('\n💡 Tip: Open your app and test the distance filtering!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the seeding function
seedListings()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
