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
import { LinearGradient } from 'expo-linear-gradient';
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

  const handleDeleteListing = async (listingId: string) => {
    console.log('Delete button pressed for listing:', listingId);
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled'),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed, attempting to delete listing:', listingId);
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId)
                .eq('seller_id', user?.id);

              if (error) {
                console.error('Delete error:', error);
                throw error;
              }
              
              console.log('Delete successful');
              await fetchUserListings();
              Alert.alert('Succès', 'L\'annonce a été supprimée avec succès.');
            } catch (error: any) {
              console.error('Error deleting listing:', error);
              Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la suppression de l\'annonce.');
            }
          },
        },
      ]
    );
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

      // Set up real-time subscription for user's listings
      const listingsSubscription = supabase
        .channel('user-listings-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'listings',
            filter: `seller_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time listing update:', payload);
            fetchUserListings();
          }
        )
        .subscribe();

      // Set up real-time subscription for user credits
      const creditsSubscription = supabase
        .channel('user-credits-channel')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time credits update:', payload);
            fetchUserCredits();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(listingsSubscription);
        supabase.removeChannel(creditsSubscription);
      };
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.gradientHeader}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.tagline}>Connectez-vous pour continuer</Text>
        </View>

        <View style={styles.messageContainer}>
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
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#9bbd1f']}
          tintColor="#9bbd1f"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.gradientHeader}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        {/* <Text style={styles.headerTitle}>Mon Profil</Text> */}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.email?.[0].toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.emailText}>{user.email}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.phoneText}>{user.phone || 'Aucun numéro'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.locationText}>{user.location || 'Aucune ville'}</Text>
            </View>
          </View>
          <View style={styles.creditContainer}>
            <View style={styles.creditCircle}>
              <Text style={styles.creditNumber}>{credits || 0}</Text>
            </View>
            <Text style={styles.creditLabel}>Crédits</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {(!user.phone || !user.location) && (
            <TouchableOpacity
              style={styles.modernActionButton}
              onPress={() => router.push('/auth/complete-profile')}
            >
              <Text style={styles.actionButtonText}>
                Compléter mon profil
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.creditsSection}>
        <Text style={styles.sectionTitle}>Acheter des crédits</Text>
        <Text style={styles.sectionSubtitle}>
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
          <View style={styles.emptyStateCard}>
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
                <View style={styles.listingActions}>
                  {listing.status === 'active' && (
                    <TouchableOpacity
                      style={styles.markAsSoldButton}
                      onPress={() => {
                        console.log('Mark as sold pressed');
                        handleMarkAsSold(listing.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.markAsSoldButtonText}>
                        Marquer vendu
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      console.log('Delete button clicked!');
                      handleDeleteListing(listing.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  gradientHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#bedc39',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoImage: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
  },
  
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  messageCard: {
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

  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#9bbd1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#9bbd1f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  creditContainer: {
    alignItems: 'center',
  },
  creditCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9bbd1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#9bbd1f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  creditNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  creditLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Credit section styles
  creditSection: {
    marginBottom: 24,
  },
  creditCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  creditBadge: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  creditBadgeGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  creditValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },

  // Action buttons
  actionButtons: {
    gap: 12,
  },
  modernActionButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },

  // Section styles
  creditsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listingsSection: {
    padding: 16,
  },
  sectionHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  newListingButton: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  newListingButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  newListingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty state
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateEmoji: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Listings grid
  creditsGrid: {
    gap: 12,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listingContainer: {
    width: '48%',
    marginBottom: 16,
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  markAsSoldButton: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  markAsSoldButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    lineHeight: 24,
  },

  // Button styles
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

});
