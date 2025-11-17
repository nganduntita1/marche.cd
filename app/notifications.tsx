import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Bell, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import RatingModal from '@/components/RatingModal';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  alreadyRated?: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{
    transactionId: string;
    revieweeId: string;
    revieweeName: string;
    listingId: string;
  } | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For rating_request notifications, check if user has already rated
      const notificationsWithStatus = await Promise.all(
        (data || []).map(async (notification) => {
          if (notification.type === 'rating_request' && notification.data?.transaction_id) {
            const { data: review } = await supabase
              .from('reviews')
              .select('id')
              .eq('transaction_id', notification.data.transaction_id)
              .eq('reviewer_id', user.id)
              .maybeSingle();
            
            return {
              ...notification,
              alreadyRated: !!review,
            };
          }
          return notification;
        })
      );

      setNotifications(notificationsWithStatus);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await supabase.rpc('mark_notifications_read', {
        p_user_id: user?.id,
        p_notification_ids: [notification.id],
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Handle different notification types
    if (notification.type === 'rating_request') {
      // Check if user has already submitted a review for this transaction
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('transaction_id', notification.data.transaction_id)
        .eq('reviewer_id', user?.id)
        .maybeSingle();

      if (existingReview) {
        // User has already rated - show message
        Alert.alert(
          'Déjà évalué',
          'Vous avez déjà soumis votre évaluation pour cette transaction.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get transaction details
      const { data: transaction } = await supabase
        .from('transactions')
        .select(`
          id,
          seller_id,
          buyer_id,
          listing:listing_id (
            id,
            title
          ),
          seller:seller_id (
            id,
            name
          ),
          buyer:buyer_id (
            id,
            name
          )
        `)
        .eq('id', notification.data.transaction_id)
        .single();

      if (transaction) {
        // Determine who to rate (the other person)
        const isUserSeller = transaction.seller_id === user?.id;
        const revieweeId = isUserSeller ? transaction.buyer_id : transaction.seller_id;
        const revieweeName = isUserSeller 
          ? (transaction.buyer as any)?.name || 'Acheteur'
          : (transaction.seller as any)?.name || 'Vendeur';

        setSelectedRating({
          transactionId: transaction.id,
          revieweeId,
          revieweeName,
          listingId: notification.data.listing_id,
        });
        setShowRatingModal(true);
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    await supabase.rpc('mark_notifications_read', {
      p_user_id: user?.id,
      p_notification_ids: unreadIds,
    });

    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rating_request':
        return <Star size={20} color="#fbbf24" />;
      case 'rating_received':
        return <Star size={20} color={Colors.primary} />;
      case 'transaction_completed':
        return <CheckCircle size={20} color={Colors.primary} />;
      default:
        return <Bell size={20} color="#64748b" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
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
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>Aucune notification</Text>
            <Text style={styles.emptyStateText}>
              Vous recevrez des notifications ici quand quelqu'un interagit avec vos annonces
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread,
                  notification.alreadyRated && styles.notificationCardCompleted,
                ]}
                onPress={() => handleNotificationPress(notification)}
                disabled={notification.alreadyRated}
              >
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.read && styles.notificationTitleUnread,
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  {notification.alreadyRated && (
                    <Text style={styles.completedText}>
                      ✓ Évaluation soumise
                    </Text>
                  )}
                  <Text style={styles.notificationDate}>
                    {formatDate(notification.created_at)}
                  </Text>
                </View>

                {!notification.read && !notification.alreadyRated && (
                  <View style={styles.unreadDot} />
                )}
                {notification.alreadyRated && (
                  <CheckCircle size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      {selectedRating && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedRating(null);
          }}
          transactionId={selectedRating.transactionId}
          revieweeId={selectedRating.revieweeId}
          revieweeName={selectedRating.revieweeName}
          listingId={selectedRating.listingId}
          onSuccess={() => {
            loadNotifications(); // Refresh notifications
          }}
        />
      )}
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
  markAllRead: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
    lineHeight: 20,
  },
  notificationsList: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationCardUnread: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  notificationCardCompleted: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    opacity: 0.7,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    color: '#1e293b',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});
