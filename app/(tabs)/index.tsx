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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, MapPin, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails, Category } from '@/types/database';
import ListingCard from '@/components/ListingCard';

const PREDEFINED_LOCATIONS = [
  'Kinshasa, Gombe',
  'Kinshasa, Bandalungwa',
  'Kinshasa, Lingwala',
  'Kinshasa, Barumbu',
  'Kinshasa, Lemba',
  'Kinshasa, Limete',
];

export default function HomeScreen() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    loadListings();
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

      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
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

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location === selectedLocation ? null : location);
    setShowLocationModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>Marché.cd</Text>
      <Text style={styles.subtitle}>Marketplace local de RDC</Text>

      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocationModal(true)}
        >
          <MapPin size={20} color={selectedLocation ? '#16a34a' : '#94a3b8'} />
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <View style={styles.locationChip}>
          <MapPin size={16} color="#16a34a" />
          <Text style={styles.locationChipText}>{selectedLocation}</Text>
          <TouchableOpacity onPress={() => setSelectedLocation(null)}>
            <X size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}
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
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: ListingWithDetails }) => (
    <View style={styles.listingCardContainer}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price}
        image={item.images[0]}
        status={item.status}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listingsContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune annonce trouvée
              </Text>
            </View>
          }
        />
      )}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une localisation</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            <View style={styles.locationList}>
              {PREDEFINED_LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationOption,
                    location === selectedLocation && styles.locationOptionActive,
                  ]}
                  onPress={() => handleLocationSelect(location)}
                >
                  <MapPin
                    size={20}
                    color={location === selectedLocation ? '#16a34a' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.locationOptionText,
                      location === selectedLocation && styles.locationOptionTextActive,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  listingsContainer: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  listingCardContainer: {
    width: '48%',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#16a34a',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  locationChipText: {
    fontSize: 14,
    color: '#16a34a',
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
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  locationList: {
    gap: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
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
    color: '#16a34a',
    fontWeight: '500',
  },
});
