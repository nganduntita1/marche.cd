import React, { useState, useEffect } from 'react';
import {
View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ListingCard from '@/components/ListingCard';
import { ListingWithDetails } from '@/types/database';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          listings:listing_id (
            *,
            seller:seller_id(*),
            category:category_id(*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract listings from the nested structure
      const listingsData = data
        ?.map((fav: any) => fav.listings)
        .filter((listing: any) => listing !== null) || [];

      setFavorites(listingsData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

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
          location={item.location}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mes Favoris</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          <View style={styles.placeholder} />
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Package size={48} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyStateTitle}>Aucun favori</Text>
            <Text style={styles.emptyStateText}>
              Les annonces que vous ajoutez à vos favoris apparaîtront ici
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.back()}
            >
              <Text style={styles.browseButtonText}>Parcourir les annonces</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  listingCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
