# Favorites & Notifications Guidance - Integration Example

## Complete Integration Example

This document shows a complete, working example of how to integrate the Favorites and Notifications guidance into your screens.

---

## Example 1: Favorites Screen Integration

### Full Implementation

```typescript
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
import { useGuidance } from '@/contexts/GuidanceContext';
import ListingCard from '@/components/ListingCard';
import { FavoritesGuidance } from '@/components/guidance';
import { ListingWithDetails } from '@/types/database';
import Colors from '@/constants/Colors';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, shouldShowTooltip, incrementScreenView } = useGuidance();
  
  // State
  const [favorites, setFavorites] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Guidance state
  const [showEmptyGuidance, setShowEmptyGuidance] = useState(false);
  const [showSoldItemsGuidance, setShowSoldItemsGuidance] = useState(false);
  const [showPriceDropGuidance, setShowPriceDropGuidance] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
    incrementScreenView('favorites');
  }, []);

  // Check guidance conditions
  useEffect(() => {
    if (loading) return;

    // Empty state guidance
    if (favorites.length === 0 && shouldShowTooltip('favorites_empty_state')) {
      setShowEmptyGuidance(true);
    }

    // Sold items guidance
    const soldItems = favorites.filter(item => item.status === 'sold');
    if (soldItems.length > 0 && shouldShowTooltip('favorites_sold_items')) {
      setShowSoldItemsGuidance(true);
    }

    // Price drop guidance (would require price tracking)
    // For demo purposes, you could check a price_history field
    // const priceDrops = favorites.filter(item => item.has_price_drop);
    // if (priceDrops.length > 0 && shouldShowTooltip('favorites_price_drop')) {
    //   setShowPriceDropGuidance(true);
    // }
  }, [favorites, loading]);

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
    const coercedStatus: 'active' | 'sold' = 
      item.status === 'sold' ? 'sold' : 'active';
    
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
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Favoris</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
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
              <Text style={styles.browseButtonText}>
                Parcourir les annonces
              </Text>
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

      {/* Guidance Components */}
      <FavoritesGuidance
        visible={showEmptyGuidance}
        isEmpty={true}
        onDismiss={() => setShowEmptyGuidance(false)}
      />
      
      <FavoritesGuidance
        visible={showSoldItemsGuidance}
        isEmpty={false}
        hasSoldItems={true}
        onDismiss={() => setShowSoldItemsGuidance(false)}
      />
      
      <FavoritesGuidance
        visible={showPriceDropGuidance}
        isEmpty={false}
        hasPriceDrops={true}
        onDismiss={() => setShowPriceDropGuidance(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... styles here
});
```

---

## Example 2: Notifications Screen Integration

### Full Implementation

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Bell, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGuidance } from '@/contexts/GuidanceContext';
import Colors from '@/constants/Colors';
import { NotificationsGuidance } from '@/components/guidance';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    state, 
    shouldShowTooltip, 
    shouldShowTour, 
    incrementScreenView 
  } = useGuidance();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Guidance state
  const [showFirstNotificationGuidance, setShowFirstNotificationGuidance] = 
    useState(false);
  const [showUnreadReminder, setShowUnreadReminder] = useState(false);
  const [showTypesTour, setShowTypesTour] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
    incrementScreenView('notifications');
  }, []);

  // Check guidance conditions
  useEffect(() => {
    if (loading || notifications.length === 0) return;

    // First notification guidance
    if (shouldShowTooltip('notifications_first')) {
      setShowFirstNotificationGuidance(true);
    }

    // Notification types tour (with delay for better UX)
    if (shouldShowTour('notifications_types_tour')) {
      setTimeout(() => {
        setShowTypesTour(true);
      }, 1000);
    }

    // Unread reminder (48+ hours old)
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const oldestUnread = unreadNotifications[unreadNotifications.length - 1];
      const notificationAge = 
        Date.now() - new Date(oldestUnread.created_at).getTime();
      const fortyEightHours = 48 * 60 * 60 * 1000;

      if (
        notificationAge > fortyEightHours && 
        shouldShowTooltip('notifications_unread_reminder')
      ) {
        setShowUnreadReminder(true);
      }
    }
  }, [notifications, loading]);

  const loadNotifications = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
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
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Handle notification action based on type
    // ... notification handling logic
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

      {/* Content */}
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
            <Text style={styles.emptyStateTitle}>
              Aucune notification
            </Text>
            <Text style={styles.emptyStateText}>
              Vous recevrez des notifications ici quand quelqu'un 
              interagit avec vos annonces
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
                ]}
                onPress={() => handleNotificationPress(notification)}
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
                </View>

                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Guidance Components */}
      <NotificationsGuidance
        visible={showFirstNotificationGuidance}
        isFirstNotification={true}
        onDismiss={() => setShowFirstNotificationGuidance(false)}
      />

      <NotificationsGuidance
        visible={showUnreadReminder}
        hasUnreadNotifications={true}
        onDismiss={() => setShowUnreadReminder(false)}
      />

      <NotificationsGuidance
        visible={showTypesTour}
        showTypesTour={true}
        onDismiss={() => setShowTypesTour(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... styles here
});
```

---

## Key Integration Points

### 1. Import Required Dependencies

```typescript
import { useGuidance } from '@/contexts/GuidanceContext';
import { FavoritesGuidance, NotificationsGuidance } from '@/components/guidance';
```

### 2. Set Up Guidance Hooks

```typescript
const { 
  state,                    // Current guidance state
  shouldShowTooltip,        // Check if tooltip should show
  shouldShowTour,           // Check if tour should show
  incrementScreenView,      // Track screen visits
  markTooltipDismissed,     // Mark tooltip as seen
  markTourCompleted         // Mark tour as completed
} = useGuidance();
```

### 3. Create Guidance State

```typescript
const [showEmptyGuidance, setShowEmptyGuidance] = useState(false);
const [showSoldItemsGuidance, setShowSoldItemsGuidance] = useState(false);
// ... more guidance states
```

### 4. Track Screen Views

```typescript
useEffect(() => {
  incrementScreenView('favorites'); // or 'notifications'
}, []);
```

### 5. Check Guidance Conditions

```typescript
useEffect(() => {
  // Check if conditions are met
  if (condition && shouldShowTooltip('tooltip_id')) {
    setShowGuidance(true);
  }
}, [dependencies]);
```

### 6. Render Guidance Components

```typescript
<FavoritesGuidance
  visible={showGuidance}
  isEmpty={isEmpty}
  hasSoldItems={hasSoldItems}
  hasPriceDrops={hasPriceDrops}
  onDismiss={() => setShowGuidance(false)}
/>
```

---

## Common Patterns

### Pattern 1: Empty State Detection

```typescript
useEffect(() => {
  if (loading) return;
  
  if (items.length === 0 && shouldShowTooltip('empty_state_id')) {
    setShowEmptyGuidance(true);
  }
}, [items, loading]);
```

### Pattern 2: Time-Based Triggers

```typescript
useEffect(() => {
  const oldItems = items.filter(item => {
    const age = Date.now() - new Date(item.created_at).getTime();
    return age > THRESHOLD;
  });
  
  if (oldItems.length > 0 && shouldShowTooltip('old_items_id')) {
    setShowOldItemsGuidance(true);
  }
}, [items]);
```

### Pattern 3: Tour with Delay

```typescript
useEffect(() => {
  if (shouldShowTour('tour_id')) {
    setTimeout(() => {
      setShowTour(true);
    }, 1000); // 1 second delay
  }
}, []);
```

### Pattern 4: Multiple Conditions

```typescript
useEffect(() => {
  if (loading) return;
  
  // Priority 1: First time
  if (isFirstTime && shouldShowTooltip('first_time_id')) {
    setShowFirstTimeGuidance(true);
    return;
  }
  
  // Priority 2: Special condition
  if (specialCondition && shouldShowTooltip('special_id')) {
    setShowSpecialGuidance(true);
    return;
  }
  
  // Priority 3: General guidance
  if (shouldShowTooltip('general_id')) {
    setShowGeneralGuidance(true);
  }
}, [loading, isFirstTime, specialCondition]);
```

---

## Testing Your Integration

### 1. Test Empty State
```typescript
// Set favorites to empty array
setFavorites([]);
// Verify guidance appears
```

### 2. Test Sold Items
```typescript
// Add sold items to favorites
setFavorites([
  { ...item1, status: 'sold' },
  { ...item2, status: 'active' }
]);
// Verify sold items guidance appears
```

### 3. Test First Notification
```typescript
// Clear guidance state (for testing)
await resetGuidance();
// Add first notification
setNotifications([notification1]);
// Verify first notification guidance appears
```

### 4. Test Tour
```typescript
// Clear tour completion state
await resetGuidance('notifications_types_tour');
// Navigate to notifications screen
// Verify tour starts automatically
```

---

## Troubleshooting

### Guidance Not Showing

**Check:**
1. Is `visible` prop true?
2. Does `shouldShowTooltip` return true?
3. Is tooltip ID correct?
4. Has it been dismissed before?

**Debug:**
```typescript
console.log('Should show:', shouldShowTooltip('tooltip_id'));
console.log('Visible:', showGuidance);
console.log('State:', state.dismissedTooltips);
```

### Guidance Showing Repeatedly

**Check:**
1. Is `markTooltipDismissed` being called?
2. Is correct tooltip ID used?
3. Is state persisting correctly?

**Fix:**
```typescript
const handleDismiss = async () => {
  await markTooltipDismissed('tooltip_id');
  setShowGuidance(false);
};
```

### Tour Not Progressing

**Check:**
1. Is `markTourCompleted` called on finish?
2. Are step transitions working?
3. Is tour state managed correctly?

**Fix:**
```typescript
const handleTourComplete = async () => {
  await markTourCompleted('tour_id');
  setShowTour(false);
};
```

---

## Best Practices

1. **Always track screen views** - Helps with analytics and trigger conditions
2. **Check loading state** - Don't show guidance while loading
3. **Use delays for tours** - Give users time to see the screen first
4. **Handle multiple guidance** - Show one at a time with priorities
5. **Test both languages** - Ensure translations work correctly
6. **Clean up state** - Reset guidance state when appropriate
7. **Respect user preferences** - Honor guidance level settings

