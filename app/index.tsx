import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Heart, Bell, SlidersHorizontal, Package } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails, Category } from '@/types/database';
import ListingCard from '@/components/ListingCard';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleAuthRequired = (action: string) => {
    Alert.alert(
      'Connexion requise',
      `Vous devez être connecté pour ${action}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/auth/login') },
      ]
    );
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderListingsGrid = () => {
    const rows: React.ReactElement[] = [];
    const itemsPerRow = 2;
    
    for (let i = 0; i < filteredListings.length; i += itemsPerRow) {
      const rowItems = filteredListings.slice(i, i + itemsPerRow);
      
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => {
            const coercedStatus: 'active' | 'sold' = item.status === 'sold' ? 'sold' : 'active';
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
                  isOwner={isOwner}
                  isPromoted={item.is_promoted}
                  onDelete={loadListings}
                />
              </View>
            );
          })}
        </View>
      );
    }
    
    return rows;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => user ? router.push('/favorites') : handleAuthRequired('voir vos favoris')}
            >
              <Heart size={24} color="#1e293b" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => user ? router.push('/notifications') : handleAuthRequired('voir les notifications')}
            >
              <Bell size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryChip, item.id === selectedCategory && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[styles.categoryChipText, item.id === selectedCategory && styles.categoryChipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          >
            <View style={styles.listingsContainer}>
              {filteredListings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Package size={48} color="#cbd5e1" />
                  <Text style={styles.emptyStateTitle}>Aucune annonce trouvée</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery 
                      ? 'Aucun résultat pour votre recherche'
                      : 'Aucune annonce disponible pour le moment'}
                  </Text>
                </View>
              ) : (
                renderListingsGrid()
              )}
            </View>
          </ScrollView>
        )}

        {/* Bottom Banner - Not Logged In */}
        {!user && (
          <View style={[styles.bottomBanner, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerText}>Connectez-vous pour publier et interagir</Text>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={styles.bannerButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 140,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingsContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  listingCardContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  bottomBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    lineHeight: 18,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
