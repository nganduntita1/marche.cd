import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
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
  Bell,
  SlidersHorizontal
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails, Category } from '@/types/database';
import ListingCard from '@/components/ListingCard';
import { useAuth } from '@/contexts/AuthContext';

// Major cities in DRC (includes user examples like Kipushi & Lubumbashi)
// Location picker disabled for now

export default function HomeScreen() {
  const { user } = useAuth();
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
  const [stats, setStats] = useState({ totalListings: 0, totalFavorites: 0, todayListings: 0 });
  const [userFavoritesCount, setUserFavoritesCount] = useState(0);
  const router = useRouter();

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

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar and Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
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
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              item.id === selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id === selectedCategory ? null : item.id)}
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
        )}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesList}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9bbd1f" />
        </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: ListingWithDetails }) => {
    const coercedStatus: 'active' | 'sold' = item.status === 'sold' ? 'sold' : 'active';
    // Mock seller rating for now (will be real data later)
    const mockRating = Math.random() > 0.3 ? (4 + Math.random()).toFixed(1) : undefined;
    const isVerified = Math.random() > 0.5; // 50% chance of verified badge
    const isOwner = user?.id === item.seller_id;
    
    return (
    <View style={styles.listingCardContainer}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price}
        image={item.images[0]}
        status={coercedStatus}
        location={item.location}
        sellerRating={mockRating ? parseFloat(mockRating) : undefined}
        isVerified={isVerified}
        isOwner={isOwner}
        onDelete={loadListings}
      />
    </View>
  );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9bbd1f" />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.listingsContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#9bbd1f']}
              tintColor="#9bbd1f"
            />
          }
          ListEmptyComponent={
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
          }
        />
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
    marginBottom: 20,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    padding: 0,
  },
  sortButton: {
    width: 56,
    height: 56,
    backgroundColor: '#9bbd1f',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    marginBottom: 12,
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
    backgroundColor: '#9bbd1f',
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
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listingCardContainer: {
    width: '48%',
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
    backgroundColor: '#9bbd1f',
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
    borderColor: '#9bbd1f',
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  sortOptionTextActive: {
    color: '#9bbd1f',
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
    backgroundColor: '#9bbd1f',
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
});
