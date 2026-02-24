import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tour, TourStep } from '../../types/guidance';
import Colors from '../../constants/Colors';
import { TextStyles } from '../../constants/Typography';

interface GuidedTourProps {
  tour: Tour;
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const GuidedTour: React.FC<GuidedTourProps> = ({
  tour,
  visible,
  onComplete,
  onSkip,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const currentStep = tour.steps[currentStepIndex];
  const isLastStep = currentStepIndex === tour.steps.length - 1;
  const progress = ((currentStepIndex + 1) / tour.steps.length) * 100;

  useEffect(() => {
    if (visible) {
      // Reset to first step when tour becomes visible
      setCurrentStepIndex(0);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Animate step transitions
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!visible || !currentStep) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <View style={styles.container}>
        {/* Overlay */}
        {currentStep.showOverlay && (
          <Animated.View
            style={[
              styles.overlay,
              { opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7],
              })},
            ]}
          />
        )}

        {/* Highlight area (if specified) */}
        {currentStep.highlightArea && currentStep.showOverlay && (
          <View
            style={[
              styles.highlightArea,
              {
                top: currentStep.highlightArea.y,
                left: currentStep.highlightArea.x,
                width: currentStep.highlightArea.width,
                height: currentStep.highlightArea.height,
              },
            ]}
          />
        )}

        {/* Step content */}
        <Animated.View
          style={[
            styles.stepContainer,
            getStepPosition(currentStep.placement),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          {/* Step indicator */}
          <Text style={styles.stepIndicator}>
            Step {currentStepIndex + 1} of {tour.steps.length}
          </Text>

          {/* Content */}
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.message}>{currentStep.message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.leftActions}>
              {currentStepIndex > 0 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePrevious}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.rightActions}>
              {currentStep.skipLabel && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>{currentStep.skipLabel}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? 'Done' : currentStep.nextLabel}
                </Text>
                {!isLastStep && (
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getStepPosition = (placement: TourStep['placement']) => {
  switch (placement) {
    case 'top':
      return {
        top: 60,
        left: 16,
        right: 16,
      };
    case 'bottom':
      return {
        bottom: 60,
        left: 16,
        right: 16,
      };
    case 'center':
      return {
        top: SCREEN_HEIGHT / 2 - 150,
        left: 16,
        right: 16,
      };
    default:
      return {
        top: SCREEN_HEIGHT / 2 - 150,
        left: 16,
        right: 16,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  highlightArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    zIndex: 1,
  },
  stepContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepIndicator: {
    ...TextStyles.small,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    ...TextStyles.h2,
    color: Colors.text,
    marginBottom: 12,
  },
  message: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 4,
  },
  primaryButtonText: {
    ...TextStyles.button,
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  secondaryButtonText: {
    ...TextStyles.button,
    color: Colors.textSecondary,
  },
});
