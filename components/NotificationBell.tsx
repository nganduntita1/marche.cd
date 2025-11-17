import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

interface NotificationBellProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export default function NotificationBell({ 
  size = 24, 
  color = '#1e293b', 
  strokeWidth = 2,
  style 
}: NotificationBellProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotificationCount();
      
      // Set up real-time subscription for notifications
      const subscription = supabase
        .channel('notifications-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadNotificationCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotificationCount = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.id
      });
      
      if (!error && typeof data === 'number') {
        setNotificationCount(data);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.iconButton, style]}
      onPress={() => router.push('/notifications')}
    >
      <Bell size={size} color={color} strokeWidth={strokeWidth} />
      {notificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
