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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails, Category } from '@/types/database';
import ListingCard from '@/components/ListingCard';

// Major cities in DRC (includes user examples like Kipushi & Lubumbashi)
// Location picker disabled for now

export default function HomeScreen() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Location picker disabled for now
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    loadListings();

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
          // Reload listings when there's a change
          loadListings();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(listingsSubscription);
    };
  }, [selectedCategory]);

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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      // Location filtering disabled for now

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
    <>
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.subtitle}>Marketplace local de RDC</Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des articles..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Tout' }, ...categories]}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                (item.id === 'all' && !selectedCategory) ||
                item.id === selectedCategory
                  ? styles.categoryChipActive
                  : null,
              ]}
              onPress={() =>
                setSelectedCategory(item.id === 'all' ? null : item.id)
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  (item.id === 'all' && !selectedCategory) ||
                  item.id === selectedCategory
                    ? styles.categoryChipTextActive
                    : null,
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
      <View style={styles.listingsHeader} />
    </>
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
    return (
    <View style={styles.listingCardContainer}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price}
        image={item.images[0]}
          status={coercedStatus}
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
              <Text style={styles.emptyStateTitle}>Aucune annonce trouvée</Text>
              <Text style={styles.emptyStateText}>
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories
              </Text>
            </View>
          }
        />
      )}
      {/* Location modal disabled */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bedc39',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#bedc39',
    paddingTop: 16,
    paddingBottom: 16,
  },
  logoImage: {
    width: '100%',
    height: 56,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  categoriesContainer: {
    paddingLeft: 16,
  },
  categoriesList: {
    marginBottom: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#9bbd1f',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  listingsContainer: {
    paddingBottom: 100,
  },
  listingsHeader: {
    height: 16,
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
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  locationChipText: {
    fontSize: 14,
    color: '#9bbd1f',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  locationList: {
    gap: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  locationOptionActive: {
    backgroundColor: '#f0fdf4',
  },
  locationOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  locationOptionTextActive: {
    color: '#9bbd1f',
    fontWeight: '500',
  },
});
