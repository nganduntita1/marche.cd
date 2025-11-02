import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';

type Listing = {
  id: string;
  title: string;
  price: number;
  images: string[];
  created_at: string;
  status: 'active' | 'sold';
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;
      await fetchUserListings();
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du statut de l\'annonce.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserListings();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserListings();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Marché.cd</Text>
          <Text style={styles.tagline}>Connectez-vous pour continuer</Text>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Connexion requise
          </Text>
          <Text style={styles.messageText}>
            Pour accéder à votre profil et gérer vos annonces, vous devez d'abord vous connecter.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#16a34a']}
          tintColor="#16a34a"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Marché.cd</Text>
        <Text style={styles.tagline}>Mon profil</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.email?.[0].toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.emailText}>{user.email}</Text>
            <Text style={styles.phoneText}>{user.phone || 'Aucun numéro'}</Text>
            <Text style={styles.locationText}>{user.location || 'Aucune ville'}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {(!user.phone || !user.location) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonHighlight]}
              onPress={() => router.push('/auth/complete-profile')}
            >
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                Compléter le profil
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={signOut}
          >
            <Text style={styles.actionButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listingsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes annonces</Text>
          <TouchableOpacity
            style={styles.newListingButton}
            onPress={() => router.push('/post')}
          >
            <Text style={styles.newListingButtonText}>Nouvelle annonce</Text>
          </TouchableOpacity>
        </View>

        {listings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune annonce</Text>
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore publié d'annonces.
              Commencez à vendre en publiant votre première annonce !
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/post')}
            >
              <Text style={styles.emptyStateButtonText}>
                Publier une annonce
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((listing) => (
              <View key={listing.id} style={styles.listingContainer}>
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  image={listing.images[0]}
                  status={listing.status}
                />
                {listing.status === 'active' && (
                  <TouchableOpacity
                    style={styles.markAsSoldButton}
                    onPress={() => handleMarkAsSold(listing.id)}
                  >
                    <Text style={styles.markAsSoldButtonText}>
                      Marquer comme vendu
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
  },
  messageCard: {
    margin: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 24,
    lineHeight: 20,
  },
  profileSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonHighlight: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  listingsSection: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
  },
  newListingButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newListingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  emptyState: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingContainer: {
    width: '48%',
    marginBottom: 16,
  },
  markAsSoldButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  markAsSoldButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
});
