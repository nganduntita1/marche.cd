import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, Package, MapPin, Phone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ListingWithDetails } from '@/types/database';
import { ListingCard } from '@/components/ListingCard';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'pending' | 'sold'>('active');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user, selectedTab]);

  const loadListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:users(*),
          category:categories(*)
        `)
        .eq('seller_id', user.id)
        .eq('status', selectedTab)
        .order('created_at', { ascending: false });

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

  const handleSignOut = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth/login');
          } catch (error: any) {
            Alert.alert('Erreur', error.message);
          }
        },
      },
    ]);
  };

  const handleDeleteListing = (listingId: string) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

              if (error) throw error;
              loadListings();
              Alert.alert('Succès', 'Annonce supprimée');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;
      loadListings();
      Alert.alert('Succès', 'Annonce marquée comme vendue');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.infoRow}>
            <Phone size={14} color="#64748b" />
            <Text style={styles.infoText}>{user?.phone}</Text>
          </View>
          {user?.location && (
            <View style={styles.infoRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.infoText}>{user.location}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
          onPress={() => setSelectedTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'pending' && styles.tabTextActive,
            ]}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'sold' && styles.tabActive]}
          onPress={() => setSelectedTab('sold')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'sold' && styles.tabTextActive,
            ]}
          >
            Vendues
          </Text>
        </TouchableOpacity>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={listings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <ListingCard
              listing={item}
              onPress={() => router.push(`/listing/${item.id}`)}
            />
            {selectedTab === 'active' && (
              <View style={styles.listingActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleMarkAsSold(item.id)}
                >
                  <Text style={styles.actionButtonText}>Marquer vendu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteListing(item.id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedTab === 'pending' && (
              <View style={styles.listingActions}>
                <View style={styles.pendingNotice}>
                  <Text style={styles.pendingText}>
                    En attente de modération
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteListing(item.id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Aucune annonce</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'active' && "Vous n'avez pas encore d'annonces actives"}
              {selectedTab === 'pending' && "Vous n'avez pas d'annonces en attente"}
              {selectedTab === 'sold' && "Vous n'avez pas encore vendu d'articles"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#16a34a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  pendingNotice: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
