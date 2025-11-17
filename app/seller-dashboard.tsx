import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  MessageCircle,
  Heart,
  DollarSign,
  Package,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  promotedListings: number;
  totalEarnings: number;
}

interface TopListing {
  id: string;
  title: string;
  views: number;
  messages: number;
  favorites: number;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalMessages: 0,
    totalFavorites: 0,
    promotedListings: 0,
    totalEarnings: 0,
  });
  const [topListings, setTopListings] = useState<TopListing[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!user) return;

      // Load listings stats
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, status, is_promoted, views_count')
        .eq('seller_id', user.id);

      if (listingsError) throw listingsError;

      // Calculate stats
      const totalListings = listings?.length || 0;
      const activeListings = listings?.filter(l => l.status === 'active').length || 0;
      const soldListings = listings?.filter(l => l.status === 'sold').length || 0;
      const promotedListings = listings?.filter(l => l.is_promoted).length || 0;
      const totalViews = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;

      // Load messages count
      const { count: messagesCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);

      // Load favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listings?.map(l => l.id) || []);

      // Load top performing listings
      const { data: topPerformers } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          views_count,
          listing_stats (
            total_messages,
            total_favorites
          )
        `)
        .eq('seller_id', user.id)
        .order('views_count', { ascending: false })
        .limit(5);

      setStats({
        totalListings,
        activeListings,
        soldListings,
        totalViews,
        totalMessages: messagesCount || 0,
        totalFavorites: favoritesCount || 0,
        promotedListings,
        totalEarnings: soldListings * 50, // Mock calculation
      });

      setTopListings(
        topPerformers?.map(l => ({
          id: l.id,
          title: l.title,
          views: l.views_count || 0,
          messages: (l.listing_stats as any)?.[0]?.total_messages || 0,
          favorites: (l.listing_stats as any)?.[0]?.total_favorites || 0,
        })) || []
      );
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <View style={styles.backButton} />
      </View>

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
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Package size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.totalListings}</Text>
              <Text style={styles.statLabel}>Annonces totales</Text>
            </View>

            <View style={styles.statCard}>
              <Sparkles size={24} color="#22c55e" />
              <Text style={styles.statValue}>{stats.activeListings}</Text>
              <Text style={styles.statLabel}>Actives</Text>
            </View>

            <View style={styles.statCard}>
              <Eye size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{stats.totalViews}</Text>
              <Text style={styles.statLabel}>Vues totales</Text>
            </View>

            <View style={styles.statCard}>
              <MessageCircle size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats.totalMessages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>

            <View style={styles.statCard}>
              <Heart size={24} color="#ef4444" />
              <Text style={styles.statValue}>{stats.totalFavorites}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{stats.soldListings}</Text>
              <Text style={styles.statLabel}>Vendues</Text>
            </View>
          </View>
        </View>

        {/* Promoted Listings */}
        {stats.promotedListings > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Annonces promues</Text>
            </View>
            <View style={styles.promotedCard}>
              <Text style={styles.promotedValue}>{stats.promotedListings}</Text>
              <Text style={styles.promotedLabel}>
                annonce{stats.promotedListings > 1 ? 's' : ''} actuellement promue{stats.promotedListings > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Top Performing Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <BarChart3 size={20} color="#1e293b" /> */}
            <Text style={styles.sectionTitle}>Meilleures annonces</Text>
          </View>

          {topListings.length > 0 ? (
            topListings.map((listing, index) => (
              <TouchableOpacity
                key={listing.id}
                style={styles.topListingCard}
                onPress={() => router.push(`/listing/${listing.id}`)}
              >
                <View style={styles.topListingRank}>
                  <Text style={styles.topListingRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topListingInfo}>
                  <Text style={styles.topListingTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <View style={styles.topListingStats}>
                    <View style={styles.topListingStat}>
                      <Eye size={14} color="#64748b" />
                      <Text style={styles.topListingStatText}>{listing.views}</Text>
                    </View>
                    <View style={styles.topListingStat}>
                      <MessageCircle size={14} color="#64748b" />
                      <Text style={styles.topListingStatText}>{listing.messages}</Text>
                    </View>
                    <View style={styles.topListingStat}>
                      <Heart size={14} color="#64748b" />
                      <Text style={styles.topListingStatText}>{listing.favorites}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune donnée disponible pour le moment
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/post')}
          >
            <Package size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Créer une annonce</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile')}
          >
            <Eye size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Voir mes annonces</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/messages')}
          >
            <MessageCircle size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Mes messages</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statCardPrimary: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  promotedCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  promotedValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#92400e',
  },
  promotedLabel: {
    fontSize: 14,
    color: '#92400e',
    marginTop: 4,
    textAlign: 'center',
  },
  topListingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topListingRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topListingRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  topListingInfo: {
    flex: 1,
  },
  topListingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  topListingStats: {
    flexDirection: 'row',
    gap: 16,
  },
  topListingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topListingStatText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});
