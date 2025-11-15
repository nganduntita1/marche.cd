import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type MessagesContextType = {
  unreadCount: number;
  refreshUnreadCount: () => void;
};

const MessagesContext = createContext<MessagesContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

export const useMessages = () => useContext(MessagesContext);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    // Subscribe to messages changes globally
    const messagesChannel = supabase
      .channel('global-messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message update received:', payload.eventType);
          loadUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to conversations changes globally
    const conversationsChannel = supabase
      .channel('global-conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('Conversation update received:', payload.eventType);
          loadUnreadCount();
        }
      )
      .subscribe();

      // Subscribe to broadcast channel for instant updates
      const broadcastChannel = supabase.channel('messages-broadcast-global');
      broadcastChannel.on('broadcast', { event: 'new-message' }, (payload) => {
        console.log('Broadcast message received:', payload);
        loadUnreadCount();
      });
      broadcastChannel.subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
        supabase.removeChannel(broadcastChannel);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) {
      console.log('[MESSAGES] No user, returning');
      return;
    }

    try {
      console.log('[MESSAGES] Loading unread count for user:', user.id);
      
      // First get all conversations for the user
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (convError) throw convError;

      if (!conversations || conversations.length === 0) {
        console.log('[MESSAGES] No conversations found, unread count = 0');
        setUnreadCount(0);
        return;
      }

      console.log('[MESSAGES] Found', conversations.length, 'conversations');

      // Get conversation IDs
      const conversationIds = conversations.map(c => c.id);

      // Fetch unread messages (not using head: true to avoid the .in() issue)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .in('conversation_id', conversationIds);

      if (error) {
        console.error('[MESSAGES] Error fetching unread count:', error);
        return;
      }
      
      const count = messages?.length || 0;
      console.log('[MESSAGES] Unread count updated:', count, 'current state:', unreadCount);
      setUnreadCount(count);
    } catch (error) {
      console.error('[MESSAGES] Error loading unread count:', error);
    }
  };

  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  return (
    <MessagesContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </MessagesContext.Provider>
  );
}
