import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  type?: 'new_message' | 'listing_update' | 'other';
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Register for push notifications and get the Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('[NOTIFICATIONS] Push notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[NOTIFICATIONS] Must use physical device for Push Notifications');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NOTIFICATIONS] Permission not granted for push notifications');
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('[NOTIFICATIONS] No project ID found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;
      console.log('[NOTIFICATIONS] Expo Push Token:', token.data);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#9bbd1f',
          sound: 'default',
        });
      }

      return token.data;
    } catch (error) {
      console.error('[NOTIFICATIONS] Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Save the push token to the user's profile in Supabase
   */
  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) throw error;
      console.log('[NOTIFICATIONS] Push token saved to database');
    } catch (error) {
      console.error('[NOTIFICATIONS] Error saving push token:', error);
    }
  }

  /**
   * Show a local notification (for testing or when app is in foreground)
   */
  async showLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: (data || {}) as Record<string, unknown>,
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('[NOTIFICATIONS] Error showing local notification:', error);
    }
  }

  /**
   * Send a push notification to a specific user (requires backend)
   * This is a placeholder - you'll need to implement the backend endpoint
   */
  async sendPushNotification(
    recipientUserId: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<void> {
    try {
      // Get recipient's push token from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', recipientUserId)
        .single();

      if (error || !userData?.push_token) {
        console.log('[NOTIFICATIONS] No push token found for user:', recipientUserId);
        return;
      }

      // TODO: Call your backend endpoint to send the push notification
      // For now, we'll use Supabase Edge Functions or a separate backend
      console.log('[NOTIFICATIONS] Would send push to:', userData.push_token);
      
      // Example: Call Supabase Edge Function
      // const { error: sendError } = await supabase.functions.invoke('send-push-notification', {
      //   body: {
      //     pushToken: userData.push_token,
      //     title,
      //     body,
      //     data,
      //   },
      // });
    } catch (error) {
      console.error('[NOTIFICATIONS] Error sending push notification:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get the current Expo push token
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
