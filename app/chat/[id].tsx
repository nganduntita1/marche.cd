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
import { ArrowLeft, Send } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Message, Conversation } from '@/types/chat';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  // track optimistic messages to reconcile with server responses
  const optimisticRef = useRef<Record<string, boolean>>({});
  // keep a reference to the active supabase channel so we can broadcast on it
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (id && user) {
      loadConversation();
      loadMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [id, user]);

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(id, title, images, price),
          buyer:users!conversations_buyer_id_fkey(id, name, email),
          seller:users!conversations_seller_id_fkey(id, name, email)
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

      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', id)
          .neq('sender_id', user.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase.channel(`messages-${id}`);

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
            // avoid relying on .catch() because of PromiseLike typing in this env
            .then(() => {}, () => {});
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
        // payload is the message object; cast safely via unknown
        const newMsg = payload as unknown as Message;
        if (!newMsg || newMsg.conversation_id !== id) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

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
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
    );

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

      // replace temp message with server message (dedupe)
      if (data) {
        setMessages((prev) => {
          // remove any temp messages with same content and timestamp-ish
          const withoutTemp = prev.filter((m) => m.id !== tempId);
          if (withoutTemp.some((m) => m.id === data.id)) return withoutTemp;
          return [...withoutTemp, data as Message];
        });
        if (optimisticRef.current[tempId]) delete optimisticRef.current[tempId];
        
        // invoke edge function to broadcast to other clients (server-side broadcast)
        try {
          // supabase.functions.invoke requires a function deployed to Supabase Edge Functions
          // We pass the created message id so the function can fetch and broadcast it using the service role
          supabase.functions.invoke('broadcast-message', {
            body: { messageId: (data as Message).id },
          }).then(() => {}, () => {});
        } catch (err) {
          // non-fatal: broadcasting is best-effort
          console.warn('broadcast invoke failed', err);
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
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
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9bbd1f" />
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
          <ArrowLeft size={24} color="#1e293b" />
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
          <Text style={styles.headerName}>{otherUser?.name || 'Utilisateur'}</Text>
          {conversation?.listing && (
            <Text style={styles.headerListing} numberOfLines={1}>
              {conversation.listing.title}
            </Text>
          )}
          <Text style={styles.viewProfileHint}>Appuyez pour voir le profil</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} color={newMessage.trim() ? '#fff' : '#94a3b8'} />
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
    backgroundColor: '#bedc39',
  },
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerListing: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  viewProfileHint: {
    fontSize: 12,
    color: '#9bbd1f',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: '#9bbd1f',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#1e293b',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9bbd1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
});
