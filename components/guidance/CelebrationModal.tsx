// Celebration Modal Component
// Displays celebratory animation when achievements are unlocked

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Achievement } from '../../types/guidance';
import Colors from '../../constants/Colors';
import { TextStyles } from '../../constants/Typography';

interface CelebrationModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  achievement,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible && achievement) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnims.forEach(anim => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });

      // Start animations
      Animated.parallel([
        // Scale in the card
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Confetti animation
        Animated.stagger(
          50,
          confettiAnims.map(anim =>
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: height,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: (Math.random() - 0.5) * width,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: Math.random() * 720,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 3000,
                useNativeDriver: true,
              }),
            ])
          )
        ),
      ]).start();
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Background Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.9],
              }),
            },
          ]}
        />

        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: (width / 2) + (Math.random() - 0.5) * 100,
                top: height * 0.2,
                backgroundColor: getConfettiColor(index),
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Achievement Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnim },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{achievement.icon}</Text>
            <View style={styles.sparkle}>
              <Text style={styles.sparkleText}>✨</Text>
            </View>
          </View>

          <Text style={styles.title}>Succès débloqué !</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          {achievement.reward && (
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardIcon}>🎁</Text>
              <Text style={styles.rewardText}>{achievement.reward}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Génial !</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getConfettiColor = (index: number): string => {
  const colors = [
    Colors.primary,
    '#F59E0B',
    '#10B981',
    '#8B5CF6',
    '#EF4444',
    '#3B82F6',
    '#EC4899',
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.text,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  icon: {
    fontSize: 80,
  },
  sparkle: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkleText: {
    fontSize: 30,
  },
  title: {
    ...TextStyles.h2,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementTitle: {
    ...TextStyles.h1,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    ...TextStyles.body,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rewardText: {
    ...TextStyles.body,
    color: '#B8860B',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 150,
  },
  buttonText: {
    ...TextStyles.button,
    color: Colors.white,
    textAlign: 'center',
  },
});
