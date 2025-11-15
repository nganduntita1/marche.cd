import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';

interface MessageContextType {
  unreadCount: number;
  lastMessage: Message | null;
  messages: Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    // Subscribe to broadcast channel for all messages
    const channel = supabase.channel(`messages-broadcast-global`);
    channel.on('broadcast', { event: 'new-message' }, (payload) => {
      const msg = payload as Message;
      if (!msg) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setLastMessage(msg);
      if (msg.sender_id !== user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });
    channel.subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user]);

  return (
    <MessageContext.Provider value={{ unreadCount, lastMessage, messages }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessageContext() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessageContext must be used within MessageProvider');
  return ctx;
}
