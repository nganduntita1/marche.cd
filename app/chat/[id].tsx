import React, { useState, useEffect, useRef } from 'react';
import {
View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Message, Conversation } from '@/types/chat';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessages();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  // track optimistic messages to reconcile with server responses
  const optimisticRef = useRef<Record<string, boolean>>({});
  // keep a reference to the active supabase channel so we can broadcast on it
  const channelRef = useRef<any>(null);
  // track the last known message id to detect new messages via polling
  const lastMessageIdRef = useRef<string | null>(null);
  // polling interval to ensure messages are delivered even if Realtime fails
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id && user) {
      loadConversation();
      loadMessages();
      loadSafetyBannerState();
      const cleanup = subscribeToMessages();
      startPollingForNewMessages();
      
      // Mark messages as read when screen is focused
      const markAsReadInterval = setInterval(() => {
        markMessagesAsRead();
      }, 2000); // Check every 2 seconds
      
      return () => {
        cleanup();
        stopPolling();
        clearInterval(markAsReadInterval);
      };
    }
  }, [id, user]);

  const loadSafetyBannerState = async () => {
    try {
      const dismissed = await AsyncStorage.getItem(`safety_banner_dismissed_${id}`);
      if (dismissed === 'true') {
        setShowSafetyBanner(false);
      }
    } catch (error) {
      console.error('Error loading safety banner state:', error);
    }
  };

  const dismissSafetyBanner = async () => {
    try {
      await AsyncStorage.setItem(`safety_banner_dismissed_${id}`, 'true');
      setShowSafetyBanner(false);
    } catch (error) {
      console.error('Error saving safety banner state:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', id)
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .select();
      
      if (!error && data && data.length > 0) {
        console.log('[CHAT] Marked', data.length, 'messages as read');
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('[CHAT] Error marking messages as read:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, price),
          buyer:users!conversations_buyer_id_fkey(id, name, email, profile_picture),
          seller:users!conversations_seller_id_fkey(id, name, email, profile_picture)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Track the last message id for polling
      if (data && data.length > 0) {
        lastMessageIdRef.current = data[data.length - 1].id;
      }

      // Mark messages as read
      if (user) {
        const result = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', id)
          .neq('sender_id', user.id)
          .eq('is_read', false)
          .select();
        
        // If we marked any messages as read, refresh unread counts
        if (result.data && result.data.length > 0) {
          console.log('[CHAT] Marked', result.data.length, 'messages as read');
          // Refresh unread count globally
          console.log('[CHAT] Messages marked as read, refreshing unread count');
          refreshUnreadCount();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      // Scroll to bottom after loading is complete and UI has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase.channel(`messages-${id}`);
    
    console.log(`[CHAT] Subscribing to channel: messages-${id}`);

    // handle INSERT events
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${id}`,
      },
      (payload) => {
        console.log('[CHAT] INSERT event received:', payload);
        const newMsg = payload.new as Message;

        setMessages((prev) => {
          // dedupe by id
          if (prev.some((m) => m.id === newMsg.id)) return prev;

          // if this message was optimistic (we created a temp entry), remove flag
          if (optimisticRef.current[newMsg.id]) {
            delete optimisticRef.current[newMsg.id];
          }

          return [...prev, newMsg];
        });

        // Mark as read if not sent by current user
        if (user && newMsg.sender_id !== user.id) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMsg.id)
            .then(({ error }) => {
              if (!error) {
                console.log('[CHAT] New message marked as read');
                refreshUnreadCount();
              }
            }, () => {});
        }

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    // listen for broadcast events (immediate notifications)
    channel.on(
      'broadcast',
      { event: 'new-message' },
      (payload) => {
        console.log('[CHAT] Broadcast event received:', payload);
        // payload.payload contains the actual message
        const newMsg = (payload.payload || payload) as unknown as Message;
        if (!newMsg || !newMsg.conversation_id || newMsg.conversation_id !== id) {
          console.log('[CHAT] Skipping broadcast: missing msg or wrong conversation', { newMsg, id });
          return;
        }

        console.log('[CHAT] Adding broadcast message to state:', newMsg);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) {
            console.log('[CHAT] Message already in state, skipping');
            return prev;
          }
          console.log('[CHAT] Message added to state');
          return [...prev, newMsg];
        });

        // Mark as read if not sent by current user
        if (user && newMsg.sender_id !== user.id) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMsg.id)
            .then(({ error }) => {
              if (!error) {
                console.log('[CHAT] Broadcast message marked as read');
                refreshUnreadCount();
              }
            }, () => {});
        }

        // scroll
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    // handle UPDATE events (for example: is_read changes or server-side edits)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${id}`,
      },
      (payload) => {
        console.log('[CHAT] UPDATE event received:', payload);
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
    );

  console.log('[CHAT] Calling channel.subscribe()');
  channel.subscribe();
  channelRef.current = channel;

    return () => {
      // supabase v2 uses removeChannel
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // fallback to unsubscribe if available
        try {
          // @ts-ignore
          channel.unsubscribe();
        } catch {}
      }
      if (channelRef.current === channel) channelRef.current = null;
    };
  };

  const startPollingForNewMessages = () => {
    // Poll every 2 seconds for new messages as a fallback to Realtime
    console.log('[CHAT] Starting polling for new messages');
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Only fetch messages newer than what we already have
        const query = supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id as string)
          .order('created_at', { ascending: true });

        const { data, error } = await query;
        if (error) {
          console.log('[CHAT] Polling error:', error);
          return;
        }

        if (!data || data.length === 0) return;

        const lastMsg = data[data.length - 1];
        if (lastMsg.id === lastMessageIdRef.current) return; // No new messages

        console.log('[CHAT] Polling detected new messages');
        lastMessageIdRef.current = lastMsg.id;

        // Add any new messages we don't already have
        setMessages((prev) => {
          const newMsgs = data.filter((m) => !prev.some((existing) => existing.id === m.id));
          if (newMsgs.length === 0) return prev;
          console.log('[CHAT] Polling added', newMsgs.length, 'new messages');
          return [...prev, ...newMsgs];
        });

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (err) {
        console.log('[CHAT] Polling exception:', err);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('[CHAT] Stopping polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      // optimistic: create a temporary local message id
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: id as string,
        sender_id: user.id,
        content: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };

      console.log('[CHAT] Sending message (optimistic):', optimisticMessage);
      optimisticRef.current[tempId] = true;
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage('');

      // Insert and ask DB to return the created row (so we can reconcile)
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          content: optimisticMessage.content,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('[CHAT] Message inserted to DB:', data);

      // replace temp message with server message (dedupe)
      if (data) {
        setMessages((prev) => {
          // remove any temp messages with same content and timestamp-ish
          const withoutTemp = prev.filter((m) => m.id !== tempId);
          if (withoutTemp.some((m) => m.id === data.id)) return withoutTemp;
          return [...withoutTemp, data as Message];
        });
        if (optimisticRef.current[tempId]) delete optimisticRef.current[tempId];
        
        // Client-side broadcast: send the message to other connected clients on the same channel
        // This ensures real-time delivery even if the server-side broadcast fails or isn't available
        if (channelRef.current) {
          try {
            console.log('[CHAT] Sending client-side broadcast');
            channelRef.current.send({
              type: 'broadcast',
              event: 'new-message',
              payload: data as Message,
            }).then(() => {
              console.log('[CHAT] Client-side broadcast sent successfully');
            }, (err: unknown) => {
              console.log('[CHAT] Client-side broadcast error:', err);
            });
          } catch (err) {
            console.warn('client broadcast failed', err);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // on error: remove optimistic message(s)
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = () => {
    if (!conversation || !user) return null;
    return user.id === conversation.buyer_id
      ? conversation.seller
      : conversation.buyer;
  };

  const formatDateSeparator = (date: string) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return msgDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender_id === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(item, prevMessage);
    const showAvatar = !isMyMessage && (index === messages.length - 1 || messages[index + 1]?.sender_id !== item.sender_id);
    
    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparatorContainer}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.created_at)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMyMessage && showAvatar && (
            otherUser?.profile_picture ? (
              <Image 
                source={{ uri: otherUser.profile_picture }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(otherUser?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )
          )}
          {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}
          
          <View style={styles.messageWrapper}>
            <View
              style={[
                styles.messageBubble,
                isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText,
                ]}
              >
                {item.content}
              </Text>
            </View>
            <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTimeAlign : styles.otherMessageTimeAlign]}>
              {new Date(item.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </>
    );
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

  const otherUser = getOtherUser();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerInfo}
          onPress={() => {
            const otherUserId = user?.id === conversation?.buyer_id 
              ? conversation?.seller_id 
              : conversation?.buyer_id;
            if (otherUserId) {
              router.push(`/user/${otherUserId}`);
            }
          }}
          activeOpacity={0.7}
        >
          {otherUser?.profile_picture ? (
            <Image 
              source={{ uri: otherUser.profile_picture }} 
              style={styles.headerAvatarImage}
            />
          ) : (
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {(otherUser?.name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{otherUser?.name || 'Utilisateur'}</Text>
            {conversation?.listing && (
              <Text style={styles.headerListing} numberOfLines={1}>
                {conversation.listing.title}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Listing Preview Card */}
      {conversation?.listing && (
        <TouchableOpacity
          style={styles.listingPreview}
          onPress={() => router.push(`/listing/${conversation.listing_id}`)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: conversation.listing.images[0] }}
            style={styles.listingPreviewImage}
          />
          <View style={styles.listingPreviewInfo}>
            <Text style={styles.listingPreviewTitle} numberOfLines={2}>
              {conversation.listing.title}
            </Text>
            <Text style={styles.listingPreviewPrice}>
              ${conversation.listing.price.toLocaleString()}
            </Text>
          </View>
          <View style={styles.listingPreviewArrow}>
            <Text style={styles.listingPreviewArrowText}>›</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Safety Warning Banner */}
      {showSafetyBanner && (
        <View style={styles.safetyBanner}>
          <Text style={styles.safetyBannerIcon}>⚠️</Text>
          <Text style={styles.safetyBannerText}>
            <Text style={styles.safetyBannerBold}>Ne payez jamais avant d'avoir vu le produit.</Text> Rencontrez-vous en personne dans un lieu public.
          </Text>
          <TouchableOpacity 
            onPress={dismissSafetyBanner}
            style={styles.safetyBannerClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#92400e" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Écrire un message"
              placeholderTextColor="#8e8e93"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} color="#fff" fill="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerListing: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  listingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listingPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  listingPreviewInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  listingPreviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    marginBottom: 4,
  },
  listingPreviewPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#22c55e',
  },
  listingPreviewArrow: {
    paddingLeft: 8,
  },
  listingPreviewArrowText: {
    fontSize: 24,
    color: '#c7c7cc',
    fontWeight: '300',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    gap: 10,
  },
  safetyBannerIcon: {
    fontSize: 20,
  },
  safetyBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  safetyBannerBold: {
    fontWeight: '700',
    color: '#78350f',
  },
  safetyBannerClose: {
    padding: 4,
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '75%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessage: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  avatarSpacer: {
    width: 40,
  },
  messageWrapper: {
    flex: 1,
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#22c55e',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 4,
  },
  myMessageTimeAlign: {
    textAlign: 'right',
  },
  otherMessageTimeAlign: {
    textAlign: 'left',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 38,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#22c55e',
    opacity: 0.5,
  },
});
