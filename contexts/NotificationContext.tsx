import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { notificationService, NotificationData } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications when user logs in
    if (user) {
      registerForPushNotificationsAsync();
      setupNotificationListeners();
      const cleanup = setupRealtimeNotifications();

      return () => {
        // Clean up listeners
        notificationListener.current?.remove();
        responseListener.current?.remove();
        if (cleanup) cleanup();
      };
    }
  }, [user]);

  const registerForPushNotificationsAsync = async () => {
    if (!user) return;

    const token = await notificationService.registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      // Save token to database
      await notificationService.savePushToken(user.id, token);
    }
  };

  const setupNotificationListeners = () => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[NOTIFICATIONS] Notification received in foreground:', notification);
      setNotification(notification);
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[NOTIFICATIONS] Notification tapped:', response);
      const data = response.notification.request.content.data as NotificationData;

      // Navigate to the appropriate screen based on notification type
      if (data.type === 'new_message' && data.conversationId) {
        router.push(`/chat/${data.conversationId}` as any);
      }
    });
  };

  const setupRealtimeNotifications = () => {
    if (!user) return;

    // Skip notifications on web
    if (Platform.OS === 'web') {
      console.log('[NOTIFICATIONS] Skipping notification setup on web');
      return;
    }

    console.log('[NOTIFICATIONS] Setting up realtime notifications for physical device');

    // Subscribe to broadcast channel for new messages
    const channel = supabase.channel(`notifications-${user.id}`);
    
    channel.on('broadcast', { event: 'new-message' }, async (payload) => {
      console.log('[NOTIFICATIONS] New message broadcast received:', payload);
      const msg = (payload.payload || payload) as any;

      // Only show notification if message is from another user
      if (msg.sender_id !== user.id) {
        // Get sender info
        const { data: senderData } = await supabase
          .from('users')
          .select('name')
          .eq('id', msg.sender_id)
          .single();

        const senderName = senderData?.name || 'Quelqu\'un';

        // Show local notification
        await notificationService.showLocalNotification(
          `Nouveau message de ${senderName}`,
          msg.content || 'Vous avez reçu un nouveau message',
          {
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            senderName,
            message: msg.content,
            type: 'new_message',
          }
        );
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
}
