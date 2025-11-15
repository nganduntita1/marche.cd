import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

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
          loadUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to broadcast channel for instant updates
    const broadcastChannel = supabase.channel('messages-broadcast-global');
    broadcastChannel.on('broadcast', { event: 'new-message' }, (payload) => {
      loadUnreadCount();
    });
    broadcastChannel.subscribe();

    // Subscribe to new message events for global notifications
    const messagesInsertChannel = supabase.channel('global-messages-insert');
    messagesInsertChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const msg = payload.new as any;
        // Only notify if the message is for the current user and not sent by them
        if (msg && user && msg.sender_id !== user.id) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Nouveau message',
              body: msg.content || 'Vous avez reçu un nouveau message',
              data: { conversation_id: msg.conversation_id },
            },
            trigger: null, // Show immediately
          });
        }
      }
    );
    messagesInsertChannel.subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(messagesInsertChannel);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) {
      return;
    }

    try {
      // First get all conversations for the user
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (convError) throw convError;

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Get conversation IDs
      const conversationIds = conversations.map((c) => c.id);

      // Fetch unread messages (not using head: true to avoid the .in() issue)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .in('conversation_id', conversationIds);

      if (error) {
        return;
      }

      const count = messages?.length || 0;
      setUnreadCount(count);
    } catch (error) {
      // Error handling
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
