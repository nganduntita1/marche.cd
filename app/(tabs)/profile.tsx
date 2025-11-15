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
import { Bell, MapPin, Phone, Mail, Star, Package } from 'lucide-react-native';

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
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#1e293b" strokeWidth={2} />
            </TouchableOpacity>
          </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
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
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/edit-profile')}
          >
            {user.profile_picture ? (
              <Image 
                source={{ uri: user.profile_picture }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name || 'Utilisateur'}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.statValue}>4.8</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Package size={14} color="#64748b" />
                <Text style={styles.statValue}>{listings.length}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Mail size={18} color="#64748b" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Phone size={18} color="#64748b" />
            <Text style={styles.infoText}>{user.phone || 'Aucun numéro'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={18} color="#64748b" />
            <Text style={styles.infoText}>{user.location || 'Aucune ville'}</Text>
          </View>
        </View>

        <View style={styles.creditBanner}>
          <View style={styles.creditInfo}>
            <Text style={styles.creditLabel}>Crédits disponibles</Text>
            <Text style={styles.creditValue}>{credits || 0}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addCreditButton}
            onPress={() => {
              // Scroll to credits section
            }}
          >
            <Text style={styles.addCreditButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {!user.profile_picture && (
          <View style={styles.promptBanner}>
            <Text style={styles.promptText}>
              📸 Ajoutez une photo de profil pour inspirer confiance
            </Text>
            <TouchableOpacity
              style={styles.promptButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={styles.promptButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.modernActionButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.actionButtonText}>
              Modifier mon profil
            </Text>
          </TouchableOpacity>
          {(!user.phone || !user.location) && (
            <TouchableOpacity
              style={styles.completeProfileButton}
              onPress={() => router.push('/auth/complete-profile')}
            >
              <Text style={styles.completeProfileButtonText}>
                Compléter les informations
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.creditsSection}>
        <View style={styles.sectionHeaderWithIcon}>
          <View>
            <Text style={styles.sectionTitle}>Acheter des crédits</Text>
            <Text style={styles.sectionSubtitle}>
              Chaque annonce coûte 1 crédit
            </Text>
          </View>
        </View>
        <View style={styles.creditsGrid}>
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
            <View style={styles.emptyStateIcon}>
              <Package size={48} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyStateTitle}>Aucune annonce</Text>
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore publié d'annonces.{'\n'}
              Commencez à vendre dès maintenant !
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
                  isOwner={true}
                  onDelete={fetchUserListings}
                />
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoImage: {
    width: 160,
    height: 48,
  },
  headerIcons: {
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
  },

  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9bbd1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#e2e8f0',
  },
  infoSection: {
    marginBottom: 20,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#64748b',
    flex: 1,
  },
  creditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  creditInfo: {
    flex: 1,
  },
  creditLabel: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
    marginBottom: 4,
  },
  creditValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16a34a',
  },
  addCreditButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCreditButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },

  // Prompt banner
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    marginRight: 12,
  },
  promptButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  promptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Action buttons
  actionButtons: {
    gap: 12,
  },
  modernActionButton: {
    backgroundColor: '#9bbd1f',
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
  completeProfileButton: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completeProfileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  listingsSection: {
    paddingTop: 8,
  },
  sectionHeaderWithIcon: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  creditsGrid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  newListingButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  newListingButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty state
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyStateButton: {
    backgroundColor: '#9bbd1f',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#9bbd1f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Listings grid
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  listingContainer: {
    width: '48%',
  },

  // Message container
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 22,
  },

  // Button styles
  button: {
    backgroundColor: '#9bbd1f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
