/**
 * Script to seed the database with sample listings that have location coordinates
 * Run with: npx ts-node scripts/seed-listings.ts
 * Or: npx tsx scripts/seed-listings.ts
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables or replace with your values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample listings data with coordinates
const sampleListings = [
  // Kinshasa listings
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

  // Lubumbashi listings
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

  // Kipushi listings
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

  // Goma listings
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

  // Bukavu listings
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

  // Kisangani listings
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

  // Matadi listings
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
  console.log('🌱 Starting to seed listings...\n');

  try {
    // Get first user and category
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Error: No users found. Please create a user first.');
      return;
    }

    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoryError || !categories || categories.length === 0) {
      console.error('❌ Error: No categories found. Please create categories first.');
      return;
    }

    const userId = users[0].id;
    const categoryId = categories[0].id;

    console.log(`✅ Found user: ${userId}`);
    console.log(`✅ Found category: ${categoryId}\n`);

    // Insert listings
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
        console.error(`❌ Error inserting "${listing.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Added: ${listing.title} (${listing.location})`);
        successCount++;
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   ✅ Success: ${successCount} listings`);
    console.log(`   ❌ Failed: ${errorCount} listings`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the seeding function
seedListings();
