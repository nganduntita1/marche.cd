/**
 * Mobile Listing Creation Test Script
 * 
 * This script helps test and debug listing creation on mobile devices.
 * Run this in the browser console on mobile to test each step independently.
 */

// Test 1: Check Supabase Connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

// Test 2: Check User Authentication
async function testUserAuth() {
  console.log('🔍 Testing user authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('❌ User not authenticated:', error);
      return false;
    }
    console.log('✅ User authenticated:', user.id);
    console.log('   Phone:', user.phone);
    return true;
  } catch (err) {
    console.error('❌ Auth check error:', err);
    return false;
  }
}

// Test 3: Check User Credits
async function testUserCredits() {
  console.log('🔍 Testing user credits...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Credits check failed:', error);
      return false;
    }
    console.log('✅ User credits:', data.credits);
    return data.credits > 0;
  } catch (err) {
    console.error('❌ Credits check error:', err);
    return false;
  }
}

// Test 4: Test Image Upload
async function testImageUpload(imageUri) {
  console.log('🔍 Testing image upload...');
  console.log('   Image URI:', imageUri.substring(0, 50) + '...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch the image
    console.log('   Fetching image data...');
    const response = await fetch(imageUri);
    if (!response.ok) {
      console.error('❌ Image fetch failed:', response.status, response.statusText);
      return false;
    }
    
    const blob = await response.blob();
    console.log('   Blob size:', blob.size, 'bytes');
    console.log('   Blob type:', blob.type);
    
    if (blob.size === 0) {
      console.error('❌ Image blob is empty');
      return false;
    }
    
    // Upload to Supabase
    const fileName = `test/${user.id}/${Date.now()}.jpg`;
    console.log('   Uploading to:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return false;
    }
    
    console.log('✅ Image uploaded successfully');
    
    // Clean up test file
    await supabase.storage.from('listings').remove([fileName]);
    console.log('   Test file cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Image upload error:', err);
    return false;
  }
}

// Test 5: Test Category Lookup
async function testCategoryLookup(categorySlug) {
  console.log('🔍 Testing category lookup...');
  console.log('   Category slug:', categorySlug);
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', categorySlug)
      .single();
    
    if (error) {
      console.error('❌ Category lookup failed:', error);
      return false;
    }
    
    if (!data) {
      console.error('❌ Category not found');
      return false;
    }
    
    console.log('✅ Category found:', data);
    return true;
  } catch (err) {
    console.error('❌ Category lookup error:', err);
    return false;
  }
}

// Test 6: Test Listing Creation (without images)
async function testListingCreation() {
  console.log('🔍 Testing listing creation...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get a category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();
    
    if (!category) {
      console.error('❌ No categories found');
      return false;
    }
    
    const testListing = {
      seller_id: user.id,
      title: 'Test Listing - Mobile Debug',
      category_id: category.id,
      description: 'This is a test listing created for mobile debugging',
      price: 10.00,
      images: ['https://via.placeholder.com/300'],
      status: 'pending',
      location: 'Test City',
      city: 'Test City',
      country: 'Congo (RDC)',
    };
    
    console.log('   Creating test listing...');
    const { data, error } = await supabase
      .from('listings')
      .insert(testListing)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Listing creation failed:', error);
      return false;
    }
    
    console.log('✅ Listing created:', data.id);
    
    // Clean up test listing
    await supabase.from('listings').delete().eq('id', data.id);
    console.log('   Test listing cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Listing creation error:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Mobile Listing Creation Tests...\n');
  
  const results = {
    connection: await testSupabaseConnection(),
    auth: await testUserAuth(),
    credits: await testUserCredits(),
    category: await testCategoryLookup('telephones'),
    listing: await testListingCreation(),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));
  
  return results;
}

// Export for use in console
window.mobileListingTests = {
  runAll: runAllTests,
  testConnection: testSupabaseConnection,
  testAuth: testUserAuth,
  testCredits: testUserCredits,
  testCategory: testCategoryLookup,
  testListing: testListingCreation,
  testImage: testImageUpload,
};

console.log('📱 Mobile Listing Tests loaded!');
console.log('Run: mobileListingTests.runAll()');
console.log('Or run individual tests:');
console.log('  - mobileListingTests.testConnection()');
console.log('  - mobileListingTests.testAuth()');
console.log('  - mobileListingTests.testCredits()');
console.log('  - mobileListingTests.testCategory("telephones")');
console.log('  - mobileListingTests.testListing()');
console.log('  - mobileListingTests.testImage(imageUri)');
