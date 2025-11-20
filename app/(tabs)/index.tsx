import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Search, 
  TrendingUp, 
  Package, 
  Heart,
  Sparkles,
  X,
  SlidersHorizontal
} from 'lucide-react-native';
import NotificationBell from '@/components/NotificationBell';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails, Category } from '@/types/database';
import ListingCard from '@/components/ListingCard';
import FeaturedListingCard from '@/components/FeaturedListingCard';
import LocationHeader from '@/components/LocationHeader';
import CityPickerModal from '@/components/CityPickerModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { calculateDistance, formatDistance } from '@/services/locationService';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

// Major cities in DRC (includes user examples like Kipushi & Lubumbashi)
// Location picker disabled for now

export default function HomeScreen() {
  const { user } = useAuth();
  const { userLocation, currentCity, loading: locationLoading, refreshLocation, setManualLocation } = useLocation();
  const { t } = useTranslation();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high'>('recent');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [stats, setStats] = useState({ totalListings: 0, totalFavorites: 0, todayListings: 0 });
  const [userFavoritesCount, setUserFavoritesCount] = useState(0);
  const [searchRadius, setSearchRadius] = useState<number | null>(null); // null = show all
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const router = useRouter();
  
  // Header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(-100)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCategories();
    loadListings();
    loadStats();
    loadUserFavoritesCount();

    // Set up real-time subscription for listings
    const listingsSubscription = supabase
      .channel('listings-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadListings();
          loadStats();
        }
      )
      .subscribe();

    // Set up real-time subscription for favorites
    const favoritesSubscription = supabase
      .channel('favorites-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
        },
        (payload) => {
          console.log('Favorites update:', payload);
          loadUserFavoritesCount();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsSubscription);
      supabase.removeChannel(favoritesSubscription);
    };
  }, [selectedCategory, user, sortBy, priceRange]);

  const loadStats = async () => {
    try {
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        totalListings: totalListings || 0,
        totalFavorites: totalFavorites || 0,
        todayListings: todayListings || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserFavoritesCount = async () => {
    try {
      if (!user) {
        setUserFavoritesCount(0);
        return;
      }

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setUserFavoritesCount(count || 0);
    } catch (error) {
      console.error('Error loading user favorites count:', error);
      setUserFavoritesCount(0);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:users(*),
          category:categories(*)
        `)
        .eq('status', 'active');

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply price filters
      if (priceRange.min) {
        query = query.gte('price', parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        query = query.lte('price', parseFloat(priceRange.max));
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Location selection disabled for now

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;
    
    if (scrollDiff < 0 && currentScrollY > 50) {
      // Scrolling up - make header fixed with animation
      if (!isHeaderFixed) {
        setIsHeaderFixed(true);
        // Animate header sliding down
        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else if (scrollDiff > 0) {
      // Scrolling down - header not fixed
      if (isHeaderFixed) {
        // Animate header sliding up
        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsHeaderFixed(false);
        });
      }
    }
    
    if (currentScrollY <= 0) {
      if (isHeaderFixed) {
        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsHeaderFixed(false);
        });
      }
    }
    
    lastScrollY.current = currentScrollY;
  };

  // Filter listings by search, category, price, and distance
  const filteredListings = listings
    .filter(listing => {
      // Search filter
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || listing.category_id === selectedCategory;
      
      // Price filter
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = listing.price >= minPrice && listing.price <= maxPrice;
      
      // Distance filter
      let matchesDistance = true;
      if (searchRadius && userLocation && listing.latitude && listing.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listing.latitude,
          listing.longitude
        );
        matchesDistance = distance <= searchRadius;
      }
      
      return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
    })
    .map(listing => {
      // Add distance to each listing
      if (userLocation && listing.latitude && listing.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listing.latitude,
          listing.longitude
        );
        return { ...listing, distance };
      }
      return listing;
    });

  const renderHeader = () => {
    return (
      <Animated.View 
        style={[
          styles.headerContainer,
          isHeaderFixed && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >

      {/* Top Bar with Logo and Icons */}
      <View style={styles.topBar}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.topBarIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/favorites')}
          >
            <Heart size={24} color="#1e293b" strokeWidth={2} />
            {userFavoritesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {userFavoritesCount > 99 ? '99+' : userFavoritesCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <NotificationBell />
        </View>
      </View>

      {/* Search Bar and Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
          />
        </View>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowPriceModal(true)}
        >
          <SlidersHorizontal size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {/* All Categories Button */}
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        
        {/* Individual Categories */}
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryChip,
              item.id === selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                item.id === selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
    );
  };

  const renderLocationSelector = () => {
    if (!currentCity) return null;

    return (
      <View style={styles.locationSelectorContainer}>
        <TouchableOpacity 
          style={styles.locationSelector}
          onPress={() => {
            setShowCityPicker(true);
          }}
        >
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>{t('home.location')}</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {currentCity}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        {userLocation && (
          <TouchableOpacity 
            style={styles.radiusSelector}
            onPress={() => setShowRadiusModal(true)}
          >
            <Ionicons name="radio-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.radiusText}>
              {searchRadius ? `${t('home.within')} ${searchRadius} km` : t('home.allListings')}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render listings with featured items inserted
  const renderListingsGrid = () => {
    const rows: React.ReactElement[] = [];
    const itemsPerRow = 2;
    const rowsBeforeFeatured = 3;
    
    for (let i = 0; i < filteredListings.length; i += itemsPerRow) {
      const rowItems = filteredListings.slice(i, i + itemsPerRow);
      const rowIndex = Math.floor(i / itemsPerRow);
      
      // Render regular row
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => {
            const coercedStatus: 'active' | 'sold' = item.status === 'sold' ? 'sold' : 'active';
            const mockRating = Math.random() > 0.3 ? (4 + Math.random()).toFixed(1) : undefined;
            const isVerified = Math.random() > 0.5;
            const isOwner = user?.id === item.seller_id;
            
            return (
              <View key={item.id} style={styles.listingCardContainer}>
                <ListingCard
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.images[0]}
                  status={coercedStatus}
                  location={item.location}
                  distance={(item as any).distance}
                  sellerRating={mockRating ? parseFloat(mockRating) : undefined}
                  isVerified={isVerified}
                  isOwner={isOwner}
                  isPromoted={item.is_promoted}
                  onDelete={loadListings}
                />
              </View>
            );
          })}
        </View>
      );
      
      // Insert featured listing after every 3 rows
      if ((rowIndex + 1) % rowsBeforeFeatured === 0 && i + itemsPerRow < filteredListings.length) {
        const featuredIndex = Math.min(i + itemsPerRow, filteredListings.length - 1);
        const featuredItem = filteredListings[featuredIndex];
        
        if (featuredItem) {
          rows.push(
            <View key={`featured-${i}`} style={styles.featuredContainer}>
              <FeaturedListingCard
                id={featuredItem.id}
                title={featuredItem.title}
                price={featuredItem.price}
                image={featuredItem.images[0]}
                location={featuredItem.location}
                views={Math.floor(Math.random() * 500) + 100}
                isFeatured={true}
              />
            </View>
          );
        }
      }
    }
    
    return rows;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {isHeaderFixed && renderHeader()}
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={isHeaderFixed ? { paddingTop: 200 } : {}}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          >
            {!isHeaderFixed && renderHeader()}
            {renderLocationSelector()}
            <View style={styles.listingsContainer}>
            {filteredListings.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Package size={48} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyStateTitle}>Aucune annonce trouvée</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery 
                    ? 'Aucun résultat pour votre recherche'
                    : 'Essayez de modifier vos critères de recherche'}
                </Text>
                {(searchQuery || selectedCategory) && (
                  <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              renderListingsGrid()
            )}
          </View>
        </ScrollView>
        </View>
      )}
      {/* Price Filter Modal */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPriceModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Filtres</Text>
            
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Fourchette de prix ($)</Text>
              <View style={styles.priceInputRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={tempPriceRange.min}
                  onChangeText={(text) => setTempPriceRange({ ...tempPriceRange, min: text })}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={tempPriceRange.max}
                  onChangeText={(text) => setTempPriceRange({ ...tempPriceRange, max: text })}
                />
              </View>
            </View>

            {/* Quick Price Ranges */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Gammes rapides</Text>
              <View style={styles.quickRanges}>
                <TouchableOpacity 
                  style={styles.quickRangeChip}
                  onPress={() => setTempPriceRange({ min: '0', max: '100' })}
                >
                  <Text style={styles.quickRangeText}>0 - 100$</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickRangeChip}
                  onPress={() => setTempPriceRange({ min: '100', max: '500' })}
                >
                  <Text style={styles.quickRangeText}>100 - 500$</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickRangeChip}
                  onPress={() => setTempPriceRange({ min: '500', max: '1000' })}
                >
                  <Text style={styles.quickRangeText}>500 - 1000$</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickRangeChip}
                  onPress={() => setTempPriceRange({ min: '1000', max: '' })}
                >
                  <Text style={styles.quickRangeText}>1000$+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Trier par</Text>
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'recent' && styles.sortOptionActive]}
                onPress={() => setSortBy('recent')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'recent' && styles.sortOptionTextActive]}>
                  Plus récents
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'price_low' && styles.sortOptionActive]}
                onPress={() => setSortBy('price_low')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'price_low' && styles.sortOptionTextActive]}>
                  Prix croissant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'price_high' && styles.sortOptionActive]}
                onPress={() => setSortBy('price_high')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'price_high' && styles.sortOptionTextActive]}>
                  Prix décroissant
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalResetButton}
                onPress={() => {
                  setTempPriceRange({ min: '', max: '' });
                  setPriceRange({ min: '', max: '' });
                  setSortBy('recent');
                }}
              >
                <Text style={styles.modalResetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => {
                  setPriceRange(tempPriceRange);
                  setShowPriceModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Radius Selector Modal */}
      <Modal
        visible={showRadiusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRadiusModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{t('home.searchRadius')}</Text>
            
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={[styles.radiusOption, searchRadius === null && styles.radiusOptionActive]}
                onPress={() => {
                  setSearchRadius(null);
                  setShowRadiusModal(false);
                }}
              >
                <Text style={[styles.radiusOptionText, searchRadius === null && styles.radiusOptionTextActive]}>
                  {t('home.allListings')}
                </Text>
              </TouchableOpacity>
              
              {[5, 10, 25, 50, 100].map((radius) => (
                <TouchableOpacity 
                  key={radius}
                  style={[styles.radiusOption, searchRadius === radius && styles.radiusOptionActive]}
                  onPress={() => {
                    setSearchRadius(radius);
                    setShowRadiusModal(false);
                  }}
                >
                  <Text style={[styles.radiusOptionText, searchRadius === radius && styles.radiusOptionTextActive]}>
                    {t('home.within')} {radius} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logoImage: {
    width: 160,
    height: 48,
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  locationRow: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    padding: 0,
  },
  sortButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    marginBottom: 12,
    paddingLeft: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
  },
  categoryChip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  listingsContainer: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listingCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  featuredContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    width: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceSeparator: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    width: '10%',
    textAlign: 'center',
  },
  quickRanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickRangeChip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  sortOption: {
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  sortOptionTextActive: {
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalResetButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalResetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationSelectorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  radiusText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  radiusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  radiusOption: {
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  radiusOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  radiusOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  radiusOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
