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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MessageCircle, Bell, Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Conversation } from '@/types/chat';

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { refreshUnreadCount } = useMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<Record<string, string>>({});
  const conversationsRef = useRef<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    
    console.log('[MESSAGES] Setting up subscriptions');
    
    // Subscribe to broadcast for instant message updates
    const broadcastChannel = supabase.channel(`messages-broadcast-${user.id}`);
    broadcastChannel.on('broadcast', { event: 'new-message' }, (payload) => {
      console.log('[MESSAGES] Broadcast received');
      const msg = (payload.payload || payload) as any;
      if (msg?.conversation_id) {
        console.log('[MESSAGES] Updating conversation with new message:', msg.conversation_id);
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
          console.log('[MESSAGES] Broadcast: Conversations updated and sorted');
          return updated;
        });
        
        // Fetch actual unread count from database instead of just incrementing
        // This ensures accuracy even if multiple messages arrive
        if (msg.sender_id !== user.id) {
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', msg.conversation_id)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .then(({ count, error }) => {
              if (!error && count !== null) {
                console.log('[MESSAGES] Broadcast: Fetched unread count for conversation:', msg.conversation_id, '=', count);
                setUnreadCounts((prev) => {
                  const newCounts = {
                    ...prev,
                    [msg.conversation_id]: count,
                  };
                  console.log('[MESSAGES] Broadcast: Updated unread counts:', newCounts);
                  return newCounts;
                });
              }
            });
        } else {
          console.log('[MESSAGES] Broadcast: Message from current user, not updating unread count');
        }
        
        // Refresh global unread count when new message received
        refreshUnreadCount();
      }
    });
    
    // Listen for messages-read broadcast event (when messages are marked as read)
    broadcastChannel.on('broadcast', { event: 'messages-read' }, (payload) => {
      console.log('[MESSAGES] Messages read broadcast received, full payload:', JSON.stringify(payload));
      // Extract the actual data from the payload
      const data = payload?.payload || payload;
      console.log('[MESSAGES] Extracted data:', JSON.stringify(data));
      
      if (data?.conversation_id) {
        const count = data.count || 1;
        console.log('[MESSAGES] Decrementing conversation', data.conversation_id, 'by', count);
        
        // Decrement unread count by the number of messages marked as read
        setUnreadCounts((prev) => {
          const currentCount = prev[data.conversation_id] || 0;
          const newCount = Math.max(0, currentCount - count);
          console.log('[MESSAGES] Unread count change:', data.conversation_id, `${currentCount} -> ${newCount}`);
          return {
            ...prev,
            [data.conversation_id]: newCount,
          };
        });
        console.log('[MESSAGES] Decremented unread count for conversation:', data.conversation_id, 'by', count);
      } else {
        console.log('[MESSAGES] No conversation_id found in broadcast data');
      }
    });
    
    broadcastChannel.subscribe();

    // Subscribe to conversations table updates to get real-time last_message updates
    console.log('[MESSAGES] Setting up conversations UPDATE subscription');
    const conversationsChannel = supabase.channel('conversations-updates');
    conversationsChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        console.log('[MESSAGES] Conversation UPDATE event received:', payload.new);
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
                  console.log('[MESSAGES] Updating conversation last_message:', updatedConv.last_message);
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
              console.log('[MESSAGES] New conversation detected, reloading...');
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
                console.log('[MESSAGES] Updated unread count for conversation:', updatedConv.id, '=', count);
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
    console.log('[MESSAGES] Setting up INSERT subscription for new messages');
    const messagesInsertChannel = supabase.channel('messages-insert-events');
    messagesInsertChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('[MESSAGES] Message INSERT event received:', payload.new);
        const newMessage = payload.new as any;
        
        // Only update count if the message is not from the current user
        if (newMessage?.conversation_id && newMessage.sender_id !== user.id) {
          console.log('[MESSAGES] New message from another user, fetching unread count...');
          
          // Fetch the actual unread count for this conversation
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', newMessage.conversation_id)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .then(({ count, error }) => {
              if (!error && count !== null) {
                console.log('[MESSAGES] INSERT: Updated unread count for conversation:', newMessage.conversation_id, '=', count);
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
    console.log('[MESSAGES] Setting up UPDATE subscription for real-time unread tracking');
    const messagesUpdateChannel = supabase.channel('messages-update-events');
    messagesUpdateChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('[MESSAGES] Message UPDATE event received:', payload.new);
        const newMessage = payload.new as any;
        if (newMessage?.conversation_id && newMessage?.is_read === true) {
          console.log('[MESSAGES] Message marked as read, refetching unread counts...');
          // Use the latest conversations from the ref for real-time accuracy
          loadUnreadCounts(conversationsRef.current);
        }
      }
    );
    messagesUpdateChannel.subscribe();

    // Polling fallback: check for updates every 3 seconds
    console.log('[MESSAGES] Starting polling for updates');
    pollingIntervalRef.current = setInterval(() => {
      console.log('[MESSAGES] Polling for updates...');
      pollForUpdates();
    }, 3000);

    return () => {
      console.log('[MESSAGES] Cleaning up subscriptions');
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
      console.log('[MESSAGES] Screen focused, doing full refresh');
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
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async (convs: Conversation[]) => {
    if (!user) return;

    try {
      console.log('[MESSAGES-LIST] Loading unread counts for', convs.length, 'conversations');
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
          if (data.length > 0) {
            console.log('[MESSAGES-LIST] Conversation', conv.id, 'has', data.length, 'unread messages');
          }
        } else {
          console.log('[MESSAGES-LIST] Error or no data for conversation', conv.id, ':', error);
          counts[conv.id] = 0;
        }
      }
      
      console.log('[MESSAGES-LIST] Final unread counts:', counts);
      setUnreadCounts(counts);
    } catch (error) {
      console.error('[MESSAGES-LIST] Error loading unread counts:', error);
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

      setConversations((prev) => {
        // Check if anything changed
        const newData = data || [];
        if (prev.length !== newData.length) {
          console.log('[MESSAGES] Polling: conversation count changed');
          return newData;
        }

        // Check if any conversation's last_message changed
        let hasChanges = false;
        const updated = newData.map((conv) => {
          const prevConv = prev.find((c) => c.id === conv.id);
          const key = conv.id;
          const lastMsgHash = `${conv.last_message}-${conv.last_message_at}`;

          if (lastUpdateRef.current[key] !== lastMsgHash) {
            console.log('[MESSAGES] Polling: detected update in conversation', conv.id);
            lastUpdateRef.current[key] = lastMsgHash;
            hasChanges = true;
          }
          return conv;
        });

        return hasChanges ? updated : prev;
      });

      refreshUnreadCount();
    } catch (error) {
      console.error('Polling error:', error);
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
          console.log('Conversation updated:', payload);
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
          console.log('New message received:', payload);
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

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(conv);
    const userName = otherUser?.name?.toLowerCase() || '';
    const listingTitle = conv.listing?.title?.toLowerCase() || '';
    const lastMessage = conv.last_message?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return userName.includes(query) || listingTitle.includes(query) || lastMessage.includes(query);
  });

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const listingImage = item.listing?.images?.[0];
    const profilePicture = otherUser?.profile_picture;
    const unreadCount = unreadCounts[item.id] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.conversationItemUnread]}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color="#1e293b" strokeWidth={2} />
              </TouchableOpacity>
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color="#1e293b" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9bbd1f" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#1e293b" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

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
    backgroundColor: '#9bbd1f',
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
    paddingBottom: 100,
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
    borderLeftColor: '#9bbd1f',
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
    backgroundColor: '#9bbd1f',
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
});
