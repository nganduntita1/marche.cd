import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import CreditCard from '@/components/CreditCard';

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
  const [credits, setCredits] = useState<number | null>(null);

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
      fetchUserCredits();
    }
  }, [user?.id]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setCredits(data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#9bbd1f']}
          tintColor="#9bbd1f"
        />
      }
    >
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        {/* <Text style={styles.tagline}>Mon profil</Text> */}
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

        <View style={styles.creditInfo}>
          <Text style={styles.creditLabel}>Crédits disponibles</Text>
          <View style={styles.creditBadge}>
            <Text style={styles.creditValue}>{credits || 0}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {(!user.phone || !user.location) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonHighlight]}
              onPress={() => router.push('/auth/complete-profile')}
            >
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                Compléter mon profil
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={signOut}>
            <Text style={styles.actionButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.creditsSection}>
        <Text style={styles.sectionTitle}>Acheter des crédits</Text>
        <Text style={[styles.messageText, { marginTop: 8, marginBottom: 16 }]}>
          Achetez des crédits pour publier vos annonces. Chaque annonce coûte 1 crédit.
        </Text>
        <View style={styles.listingsGrid}>
          <CreditCard amount={10} credits={10} />
          <CreditCard amount={25} credits={30} />
          <CreditCard amount={75} credits={100} />
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
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#bedc39',
  },
  logoImage: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
  },
  messageCard: {
    margin: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9bbd1f',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9bbd1f',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 16,
    lineHeight: 20,
  },
  profileSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#9bbd1f',
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
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonHighlight: {
    backgroundColor: '#9bbd1f',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  listingsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
  },
  newListingButton: {
    backgroundColor: '#9bbd1f',
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
    padding: 16,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    backgroundColor: '#9bbd1f',
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
  creditInfo: {
    marginVertical: 16,
    alignItems: 'center',
  },
  creditLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  creditBadge: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  creditValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  creditsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
});
