import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TooltipContent } from '../../types/guidance';
import Colors from '../../constants/Colors';
import { TextStyles } from '../../constants/Typography';

interface TooltipProps {
  content: TooltipContent;
  targetRef?: React.RefObject<View | null>;
  visible: boolean;
  onDismiss: () => void;
  onAction?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const TOOLTIP_PADDING = 16;
const ARROW_SIZE = 8;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  targetRef,
  visible,
  onDismiss,
  onAction,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = React.useState<'top' | 'bottom' | 'left' | 'right'>('top');

  useEffect(() => {
    if (visible) {
      // Calculate position based on target element
      if (targetRef?.current) {
        targetRef.current.measure((x, y, width, height, pageX, pageY) => {
          calculatePosition(pageX, pageY, width, height);
        });
      } else {
        // Default to center if no target
        setPosition({
          top: SCREEN_HEIGHT / 2 - 100,
          left: TOOLTIP_PADDING,
        });
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, targetRef]);

  const calculatePosition = (
    targetX: number,
    targetY: number,
    targetWidth: number,
    targetHeight: number
  ) => {
    const tooltipWidth = SCREEN_WIDTH - TOOLTIP_PADDING * 2;
    const estimatedHeight = 120; // Approximate tooltip height

    let top = 0;
    let left = TOOLTIP_PADDING;
    let placement = content.placement;

    // Calculate position based on placement
    switch (placement) {
      case 'top':
        top = targetY - estimatedHeight - ARROW_SIZE - 8;
        left = Math.max(
          TOOLTIP_PADDING,
          Math.min(
            targetX + targetWidth / 2 - tooltipWidth / 2,
            SCREEN_WIDTH - tooltipWidth - TOOLTIP_PADDING
          )
        );
        setArrowPosition('bottom');
        break;

      case 'bottom':
        top = targetY + targetHeight + ARROW_SIZE + 8;
        left = Math.max(
          TOOLTIP_PADDING,
          Math.min(
            targetX + targetWidth / 2 - tooltipWidth / 2,
            SCREEN_WIDTH - tooltipWidth - TOOLTIP_PADDING
          )
        );
        setArrowPosition('top');
        break;

      case 'left':
        top = targetY + targetHeight / 2 - estimatedHeight / 2;
        left = targetX - tooltipWidth - ARROW_SIZE - 8;
        setArrowPosition('right');
        break;

      case 'right':
        top = targetY + targetHeight / 2 - estimatedHeight / 2;
        left = targetX + targetWidth + ARROW_SIZE + 8;
        setArrowPosition('left');
        break;
    }

    // Ensure tooltip stays within screen bounds
    if (top < TOOLTIP_PADDING) {
      top = TOOLTIP_PADDING;
    }
    if (top + estimatedHeight > SCREEN_HEIGHT - TOOLTIP_PADDING) {
      top = SCREEN_HEIGHT - estimatedHeight - TOOLTIP_PADDING;
    }
    if (left < TOOLTIP_PADDING) {
      left = TOOLTIP_PADDING;
    }
    if (left + tooltipWidth > SCREEN_WIDTH - TOOLTIP_PADDING) {
      left = SCREEN_WIDTH - tooltipWidth - TOOLTIP_PADDING;
    }

    setPosition({ top, left });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container as any,
        {
          top: position.top,
          left: position.left,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Arrow */}
      <View style={[styles.arrow, styles[`arrow${arrowPosition.charAt(0).toUpperCase() + arrowPosition.slice(1)}` as keyof typeof styles] as any]} />

      {/* Content */}
      <View style={styles.content}>
        {content.icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={content.icon as any} size={24} color={Colors.primary} />
          </View>
        )}

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>

        <View style={styles.actions}>
          {onAction && content.actionLabel && (
            <TouchableOpacity
              style={[styles.button, styles.actionButton]}
              onPress={onAction}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>{content.actionLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissButtonText}>
              {content.dismissLabel || 'Got it'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    maxWidth: SCREEN_WIDTH - TOOLTIP_PADDING * 2,
    zIndex: 9999,
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
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    ...TextStyles.h3,
    marginBottom: 8,
    color: Colors.text,
  },
  message: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    ...TextStyles.button,
    color: '#fff',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dismissButtonText: {
    ...TextStyles.button,
    color: Colors.textSecondary,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -ARROW_SIZE,
    left: '50%',
    marginLeft: -ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  arrowBottom: {
    bottom: -ARROW_SIZE,
    left: '50%',
    marginLeft: -ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  arrowLeft: {
    left: -ARROW_SIZE,
    top: '50%',
    marginTop: -ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#fff',
  },
  arrowRight: {
    right: -ARROW_SIZE,
    top: '50%',
    marginTop: -ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
  },
});
