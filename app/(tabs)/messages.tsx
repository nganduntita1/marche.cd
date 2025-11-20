import React, { useState, useEffect, useRef } from 'react';
import {
View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MessageCircle, Search, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Conversation } from '@/types/chat';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import NotificationBell from '@/components/NotificationBell';

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { refreshUnreadCount } = useMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<Record<string, string>>({});
  const conversationsRef = useRef<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    
    // Subscribe to broadcast for instant message updates
    const broadcastChannel = supabase.channel(`messages-broadcast-${user.id}`);
    broadcastChannel.on('broadcast', { event: 'new-message' }, (payload) => {
      const msg = (payload.payload || payload) as any;
      if (msg?.conversation_id) {
        setConversations((prev) => {
          // Update the conversation and re-sort by last_message_at
          const updated = prev.map((conv) => {
            if (conv.id === msg.conversation_id) {
              return {
                ...conv,
                last_message: msg.content,
                last_message_at: msg.created_at,
              };
            }
            return conv;
          }).sort((a, b) => {
            // Sort by last_message_at descending (newest first)
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
          });
          
          // Update the ref as well
          conversationsRef.current = updated;
          return updated;
        });
        
        // Immediately update unread count for instant visual feedback
        if (msg.sender_id !== user.id) {
          // First, optimistically increment the count for instant UI update
          setUnreadCounts((prev) => {
            const currentCount = prev[msg.conversation_id] || 0;
            const newCount = currentCount + 1;
            return {
              ...prev,
              [msg.conversation_id]: newCount,
            };
          });
          
          // Then fetch the actual count to ensure accuracy
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', msg.conversation_id)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .then(({ count, error }) => {
              if (!error && count !== null) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [msg.conversation_id]: count,
                }));
              }
            });
        } 
        
        // Refresh global unread count when new message received
        refreshUnreadCount();
      }
    });
    
    // Listen for messages-read broadcast event (when messages are marked as read)
    broadcastChannel.on('broadcast', { event: 'messages-read' }, (payload) => {
      // Extract the actual data from the payload
      const data = payload?.payload || payload;
      
      if (data?.conversation_id) {
        const count = data.count || 1;
        
        // Decrement unread count by the number of messages marked as read
        setUnreadCounts((prev) => {
          const currentCount = prev[data.conversation_id] || 0;
          const newCount = Math.max(0, currentCount - count);
          return {
            ...prev,
            [data.conversation_id]: newCount,
          };
        });
      } 
    });
    
    broadcastChannel.subscribe();

    // Subscribe to conversations table updates to get real-time last_message updates
    const conversationsChannel = supabase.channel('conversations-updates');
    conversationsChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const updatedConv = payload.new as any;
        
        // Check if this conversation belongs to the current user
        if (updatedConv.buyer_id === user.id || updatedConv.seller_id === user.id) {
          // Update the conversation in state with new last_message
          setConversations((prev) => {
            const exists = prev.some((conv) => conv.id === updatedConv.id);
            
            if (exists) {
              // Update existing conversation
              return prev.map((conv) => {
                if (conv.id === updatedConv.id) {
                  return {
                    ...conv,
                    last_message: updatedConv.last_message,
                    last_message_at: updatedConv.last_message_at,
                    updated_at: updatedConv.updated_at,
                  };
                }
                return conv;
              }).sort((a, b) => {
                // Re-sort by last_message_at
                return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
              });
            } else {
              // New conversation, reload all
              loadConversations();
              return prev;
            }
          });
          
          // Fetch the actual unread count for this conversation
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', updatedConv.id)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .then(({ count, error }) => {
              if (!error && count !== null) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [updatedConv.id]: count,
                }));
              }
            });
        }
      }
    );
    conversationsChannel.subscribe();

    // Subscribe to message INSERT events for real-time unread count updates
    const messagesInsertChannel = supabase.channel('messages-insert-events');
    messagesInsertChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const newMessage = payload.new as any;
        
        // Only update count if the message is not from the current user
        if (newMessage?.conversation_id && newMessage.sender_id !== user.id) {
          
          // Fetch the actual unread count for this conversation
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', newMessage.conversation_id)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .then(({ count, error }) => {
              if (!error && count !== null) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [newMessage.conversation_id]: count,
                }));
                // Also refresh global unread count
                refreshUnreadCount();
              }
            });
        }
      }
    );
    messagesInsertChannel.subscribe();

    // Subscribe to message UPDATE events to track when messages are marked as read
    const messagesUpdateChannel = supabase.channel('messages-update-events');
    messagesUpdateChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const newMessage = payload.new as any;
        if (newMessage?.conversation_id && newMessage?.is_read === true) {
          // Use the latest conversations from the ref for real-time accuracy
          loadUnreadCounts(conversationsRef.current);
        }
      }
    );
    messagesUpdateChannel.subscribe();

    // Polling fallback: check for updates every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollForUpdates();
    }, 3000);

    return () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesInsertChannel);
      supabase.removeChannel(messagesUpdateChannel);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [user]);

  // Refresh unread counts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Reload conversations to get latest last_message
      loadConversations();
      // Refresh global unread count
      refreshUnreadCount();
    }, [])
  );

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, price),
          buyer:users!conversations_buyer_id_fkey(id, name, email, profile_picture),
          seller:users!conversations_seller_id_fkey(id, name, email, profile_picture)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      const convsData = data || [];
      setConversations(convsData);
      conversationsRef.current = convsData;
      
      // Load unread counts for each conversation
      await loadUnreadCounts(convsData);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async (convs: Conversation[]) => {
    if (!user) return;

    try {
      const counts: Record<string, number> = {};
      
      for (const conv of convs) {
        // Simplified query: just select all unread messages and count them
        const { data, error } = await supabase
          .from('messages')
          .select('id', { head: false })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        if (!error && data) {
          counts[conv.id] = data.length;
        } else {
          counts[conv.id] = 0;
        }
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      // Error handling
    }
  };

  const pollForUpdates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, price),
          buyer:users!conversations_buyer_id_fkey(id, name, email, profile_picture),
          seller:users!conversations_seller_id_fkey(id, name, email, profile_picture)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const newData = data || [];
      
      // Check if anything changed
      let hasChanges = false;
      
      if (conversationsRef.current.length !== newData.length) {
        hasChanges = true;
      } else {
        // Check if any conversation's last_message changed
        for (const conv of newData) {
          const key = conv.id;
          const lastMsgHash = `${conv.last_message}-${conv.last_message_at}`;

          if (lastUpdateRef.current[key] !== lastMsgHash) {
            lastUpdateRef.current[key] = lastMsgHash;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        setConversations(newData);
        conversationsRef.current = newData;
        // Also refresh unread counts when conversations change
        await loadUnreadCounts(newData);
      }

      refreshUnreadCount();
    } catch (error) {
      // Error handling
    }
  };

  const subscribeToConversations = () => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `buyer_id=eq.${user.id},seller_id=eq.${user.id}`,
        },
        (payload) => {
          loadConversations();
        }
      )
      .subscribe();

    // Also subscribe to messages to update last_message in real-time
    const messagesChannel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    return user.id === conversation.buyer_id
      ? conversation.seller
      : conversation.buyer;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const deleteConversation = (conversationId: string) => {
    console.log('deleteConversation called for:', conversationId);
    setConversationToDelete(conversationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    
    console.log('User confirmed deletion');
    setShowDeleteModal(false);
    
    try {
      // Optimistically remove from UI first
      setConversations((prev) => {
        const filtered = prev.filter((conv) => conv.id !== conversationToDelete);
        console.log('Removed from UI, remaining:', filtered.length);
        return filtered;
      });
      
      // Then delete from database
      console.log('Attempting database delete...');
      const { data, error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete)
        .select();

      console.log('Delete result:', { data, error });

      if (error) {
        // If error, restore the conversation
        console.error('Error deleting conversation:', error);
        Alert.alert('Erreur', `Impossible de supprimer la conversation: ${error.message}`);
        loadConversations(); // Reload to restore
      } else {
        // Success - refresh unread count
        console.log('Successfully deleted conversation');
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Exception deleting conversation:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la conversation');
      loadConversations(); // Reload to restore
    } finally {
      setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(conv);
    const userName = otherUser?.name?.toLowerCase() || '';
    const listingTitle = conv.listing?.title?.toLowerCase() || '';
    const lastMessage = conv.last_message?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return userName.includes(query) || listingTitle.includes(query) || lastMessage.includes(query);
  });

  const SwipeableConversation = ({ item }: { item: Conversation }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isSwiping, setIsSwiping] = useState(false);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onSwipeLeft = () => {
      Animated.timing(translateX, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsSwiping(true));
    };

    const onSwipeRight = () => {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsSwiping(false));
    };

    const handlePressIn = () => {
      if (!isSwiping) {
        pressTimer.current = setTimeout(() => {
          onSwipeLeft();
        }, 500); // 500ms for long press
      }
    };

    const handlePressOut = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    };

    const handlePress = () => {
      if (isSwiping) {
        onSwipeRight();
      } else {
        router.push(`/chat/${item.id}`);
      }
    };

    return (
      <View style={styles.swipeContainer}>
        {/* Delete button (revealed on swipe) - only show when swiping */}
        {isSwiping && (
          <View 
            style={styles.deleteButtonContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e?.stopPropagation?.();
                console.log('Delete button pressed for:', item.id);
                deleteConversation(item.id);
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={24} color="#fff" />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conversation item */}
        <Animated.View style={{ 
          transform: [{ translateX }], 
          backgroundColor: '#fff',
          zIndex: isSwiping ? 0 : 2,
        }}>
          <TouchableOpacity
            style={[styles.conversationItem, isSwiping && styles.conversationItemSwiped]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            delayLongPress={500}
            activeOpacity={0.7}
          >
            <ConversationContent item={item} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const ConversationContent = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const listingImage = item.listing?.images?.[0];
    const profilePicture = otherUser?.profile_picture;
    const unreadCount = unreadCounts[item.id] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <>
        {/* User Avatar with listing thumbnail */}
        <View style={styles.avatarContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(otherUser?.name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          {listingImage && (
            <Image source={{ uri: listingImage }} style={styles.listingThumbnail} />
          )}
          {/* Online indicator (placeholder for future feature) */}
          {/* <View style={styles.onlineIndicator} /> */}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.userNameUnread]} numberOfLines={1}>
              {otherUser?.name || 'Utilisateur'}
            </Text>
            <Text style={[styles.time, hasUnread && styles.timeUnread]}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>
          
          <View style={styles.lastMessageRow}>
            <Text 
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} 
              numberOfLines={2}
            >
              {item.last_message || 'Aucun message'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    return <SwipeableConversation item={item} />;
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.headerIcons}>
              <NotificationBell />
            </View>
          </View>
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Connexion requise</Text>
            <Text style={styles.emptyText}>
              Connectez-vous pour voir vos conversations
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.headerIcons}>
              <NotificationBell />
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerIcons}>
            <NotificationBell />
          </View>
        </View>

        {/* TEST NOTIFICATION BUTTON - Commented out for production */}
        {/* 
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            padding: 16,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={async () => {
            console.log('🔔 Testing notification...');
            const { notificationService } = await import('@/services/notificationService');
            await notificationService.showLocalNotification(
              'Test Notification 🎉',
              'If you see this banner, in-app notifications are working perfectly!',
              { type: 'new_message' }
            );
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            🔔 TEST NOTIFICATION BANNER
          </Text>
        </TouchableOpacity>
        */}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8e8e93" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher"
              placeholderTextColor="#8e8e93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Safety Tip Banner */}
        {conversations.length > 0 && (
          <View style={styles.safetyTipBanner}>
            <Text style={styles.safetyTipIcon}>🛡️</Text>
            <Text style={styles.safetyTipText}>
              <Text style={styles.safetyTipBold}>Rappel:</Text> Ne payez jamais avant d'avoir vu le produit en personne.
            </Text>
          </View>
        )}

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptyText}>
              Vos conversations avec les vendeurs apparaîtront ici
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Supprimer la conversation</Text>
            <Text style={styles.deleteModalText}>
              Êtes-vous sûr de vouloir supprimer cette conversation? Cette action est irréversible.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalConfirmText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  safetyTipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 10,
  },
  safetyTipIcon: {
    fontSize: 18,
  },
  safetyTipText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    lineHeight: 16,
  },
  safetyTipBold: {
    fontWeight: '700',
    color: '#064e3b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 120,
  },
  swipeContainer: {
    position: 'relative',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    zIndex: 10,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conversationItemUnread: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  conversationItemSwiped: {
    backgroundColor: '#fef2f2',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  listingThumbnail: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f8fafc',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  userNameUnread: {
    fontWeight: '700',
    color: '#000',
    fontSize: 18,
  },
  time: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8e8e93',
  },
  timeUnread: {
    fontWeight: '500',
    color: '#8e8e93',
  },
  listingTitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginBottom: 2,
  },
  listingTitleUnread: {
    fontWeight: '400',
    color: '#8e8e93',
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastMessage: {
    fontSize: 15,
    color: '#8e8e93',
    flex: 1,
    lineHeight: 20,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: 16,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
