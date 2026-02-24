// Inactivity Detector Component
// Detects when user is inactive for a specified duration
// Shows contextual prompts to offer assistance

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useGuidance } from '../../contexts/GuidanceContext';

interface InactivityDetectorProps {
  screenName: string;
  inactivityThreshold?: number; // in milliseconds, default 30000 (30 seconds)
  onHelpRequested: () => void;
  enabled?: boolean;
}

export const InactivityDetector: React.FC<InactivityDetectorProps> = ({
  screenName,
  inactivityThreshold = 30000,
  onHelpRequested,
  enabled = true,
}) => {
  const { state } = useGuidance();
  const [showPrompt, setShowPrompt] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const language = state?.settings.language || 'fr';

  // Reset inactivity timer
  const resetTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (enabled && state?.settings.guidanceLevel !== 'off') {
      inactivityTimer.current = setTimeout(() => {
        setShowPrompt(true);
      }, inactivityThreshold);
    }
  };

  useEffect(() => {
    resetTimer();

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [enabled, inactivityThreshold, state?.settings.guidanceLevel]);

  useEffect(() => {
    if (showPrompt) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPrompt]);

  const handleDismiss = () => {
    setShowPrompt(false);
    resetTimer();
  };

  const handleGetHelp = () => {
    setShowPrompt(false);
    onHelpRequested();
  };

  if (!showPrompt || !enabled || state?.settings.guidanceLevel === 'off') {
    return null;
  }

  const promptText = {
    en: {
      title: 'Need help?',
      message: 'You seem to be stuck. Would you like some assistance?',
      helpButton: 'Get Help',
      dismissButton: 'No, thanks',
    },
    fr: {
      title: 'Besoin d\'aide ?',
      message: 'Vous semblez bloqué. Voulez-vous de l\'aide ?',
      helpButton: 'Obtenir de l\'aide',
      dismissButton: 'Non, merci',
    },
  };

  const content = promptText[language];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={32} color={Colors.primary} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissButtonText}>{content.dismissButton}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.helpButton}
            onPress={handleGetHelp}
            activeOpacity={0.7}
          >
            <Text style={styles.helpButtonText}>{content.helpButton}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9998,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

