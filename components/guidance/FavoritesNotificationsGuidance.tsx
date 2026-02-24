// Favorites and Notifications Guidance Component
// Provides contextual guidance for favorites and notifications screens
// Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Bell, Heart, Package, Star, Info, X } from 'lucide-react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

interface FavoritesGuidanceProps {
  visible: boolean;
  isEmpty: boolean;
  hasSoldItems?: boolean;
  hasPriceDrops?: boolean;
  onDismiss: () => void;
}

export const FavoritesGuidance: React.FC<FavoritesGuidanceProps> = ({
  visible,
  isEmpty,
  hasSoldItems = false,
  hasPriceDrops = false,
  onDismiss,
}) => {
  const { state, markTooltipDismissed, incrementScreenView } = useGuidance();
  const language = state.settings.language;

  useEffect(() => {
    if (visible) {
      incrementScreenView('favorites');
    }
  }, [visible]);

  const content = {
    en: {
      emptyTitle: 'Your Favorites',
      emptyMessage: 'Items you save will appear here. Tap the heart icon on any listing to add it to your favorites!',
      emptyAction: 'Got it',
      soldTitle: 'Items Sold',
      soldMessage: 'Some of your saved items have been marked as sold. You may want to remove them from your favorites.',
      soldAction: 'Understood',
      priceDropTitle: 'Price Drop! 🎉',
      priceDropMessage: 'Great news! Some items in your favorites have reduced prices. Check them out!',
      priceDropAction: 'View Items',
      explanationTitle: 'About Favorites',
      explanationMessage: 'Save items you\'re interested in to easily find them later. You\'ll be notified of price changes and when items are sold.',
      explanationAction: 'Got it',
    },
    fr: {
      emptyTitle: 'Vos Favoris',
      emptyMessage: 'Les articles que vous sauvegardez apparaîtront ici. Appuyez sur l\'icône cœur sur n\'importe quelle annonce pour l\'ajouter à vos favoris !',
      emptyAction: 'Compris',
      soldTitle: 'Articles vendus',
      soldMessage: 'Certains de vos articles sauvegardés ont été marqués comme vendus. Vous voudrez peut-être les retirer de vos favoris.',
      soldAction: 'Compris',
      priceDropTitle: 'Baisse de prix ! 🎉',
      priceDropMessage: 'Bonne nouvelle ! Certains articles dans vos favoris ont des prix réduits. Consultez-les !',
      priceDropAction: 'Voir les articles',
      explanationTitle: 'À propos des Favoris',
      explanationMessage: 'Sauvegardez les articles qui vous intéressent pour les retrouver facilement plus tard. Vous serez notifié des changements de prix et quand les articles sont vendus.',
      explanationAction: 'Compris',
    },
  };

  const t = content[language];

  // Show empty state guidance
  if (isEmpty && visible) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Heart size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t.emptyTitle}</Text>
            <Text style={styles.message}>{t.emptyMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                markTooltipDismissed('favorites_empty_state');
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>{t.emptyAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show sold items notification
  if (hasSoldItems && visible) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
              <Package size={48} color="#f59e0b" />
            </View>
            <Text style={styles.title}>{t.soldTitle}</Text>
            <Text style={styles.message}>{t.soldMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                markTooltipDismissed('favorites_sold_items');
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>{t.soldAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show price drop notification
  if (hasPriceDrops && visible) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.priceDropIcon}>💰</Text>
            </View>
            <Text style={styles.title}>{t.priceDropTitle}</Text>
            <Text style={styles.message}>{t.priceDropMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                markTooltipDismissed('favorites_price_drop');
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>{t.priceDropAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

interface NotificationsGuidanceProps {
  visible: boolean;
  isFirstNotification?: boolean;
  hasUnreadNotifications?: boolean;
  showTypesTour?: boolean;
  onDismiss: () => void;
}

export const NotificationsGuidance: React.FC<NotificationsGuidanceProps> = ({
  visible,
  isFirstNotification = false,
  hasUnreadNotifications = false,
  showTypesTour = false,
  onDismiss,
}) => {
  const { state, markTooltipDismissed, markTourCompleted, incrementScreenView } = useGuidance();
  const language = state.settings.language;
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (visible) {
      incrementScreenView('notifications');
    }
  }, [visible]);

  const content = {
    en: {
      firstTitle: 'Your First Notification! 🎉',
      firstMessage: 'This is where you\'ll receive updates about your listings, messages, and transactions. Stay informed!',
      firstAction: 'Got it',
      unreadTitle: 'Unread Notifications',
      unreadMessage: 'You have unread notifications. Check them to stay updated on your listings and messages!',
      unreadAction: 'View Now',
      tourSteps: [
        {
          title: 'Notification Types',
          message: 'You\'ll receive different types of notifications: messages, ratings, and transaction updates.',
          icon: <Bell size={48} color={Colors.primary} />,
        },
        {
          title: 'Rating Requests',
          message: 'After a sale, you\'ll be asked to rate the buyer or seller. This helps build trust in our community!',
          icon: <Star size={48} color="#fbbf24" />,
        },
        {
          title: 'Stay Updated',
          message: 'Enable notifications in your device settings to never miss important updates!',
          icon: <Info size={48} color={Colors.primary} />,
        },
      ],
      settingsTitle: 'Notification Settings',
      settingsMessage: 'You can customize which notifications you receive in the Settings screen. Choose what\'s important to you!',
      settingsAction: 'Understood',
      next: 'Next',
      finish: 'Finish',
      skip: 'Skip',
    },
    fr: {
      firstTitle: 'Votre première notification ! 🎉',
      firstMessage: 'C\'est ici que vous recevrez des mises à jour sur vos annonces, messages et transactions. Restez informé !',
      firstAction: 'Compris',
      unreadTitle: 'Notifications non lues',
      unreadMessage: 'Vous avez des notifications non lues. Consultez-les pour rester à jour sur vos annonces et messages !',
      unreadAction: 'Voir maintenant',
      tourSteps: [
        {
          title: 'Types de notifications',
          message: 'Vous recevrez différents types de notifications : messages, évaluations et mises à jour de transactions.',
          icon: <Bell size={48} color={Colors.primary} />,
        },
        {
          title: 'Demandes d\'évaluation',
          message: 'Après une vente, on vous demandera d\'évaluer l\'acheteur ou le vendeur. Cela aide à établir la confiance dans notre communauté !',
          icon: <Star size={48} color="#fbbf24" />,
        },
        {
          title: 'Restez à jour',
          message: 'Activez les notifications dans les paramètres de votre appareil pour ne jamais manquer les mises à jour importantes !',
          icon: <Info size={48} color={Colors.primary} />,
        },
      ],
      settingsTitle: 'Paramètres de notification',
      settingsMessage: 'Vous pouvez personnaliser les notifications que vous recevez dans l\'écran Paramètres. Choisissez ce qui est important pour vous !',
      settingsAction: 'Compris',
      next: 'Suivant',
      finish: 'Terminer',
      skip: 'Passer',
    },
  };

  const t = content[language];

  // Show first notification explanation
  if (isFirstNotification && visible) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Bell size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t.firstTitle}</Text>
            <Text style={styles.message}>{t.firstMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                markTooltipDismissed('notifications_first');
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>{t.firstAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show unread notification reminder
  if (hasUnreadNotifications && visible) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
              <Bell size={48} color="#f59e0b" />
            </View>
            <Text style={styles.title}>{t.unreadTitle}</Text>
            <Text style={styles.message}>{t.unreadMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                markTooltipDismissed('notifications_unread_reminder');
                onDismiss();
              }}
            >
              <Text style={styles.buttonText}>{t.unreadAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show notification types tour
  if (showTypesTour && visible) {
    const currentStep = t.tourSteps[tourStep];
    const isLastStep = tourStep === t.tourSteps.length - 1;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                markTourCompleted('notifications_types_tour');
                onDismiss();
              }}
            >
              <X size={24} color="#64748b" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              {currentStep.icon}
            </View>
            
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.message}>{currentStep.message}</Text>
            
            <View style={styles.tourProgress}>
              {t.tourSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === tourStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.tourButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  markTourCompleted('notifications_types_tour');
                  onDismiss();
                }}
              >
                <Text style={styles.skipButtonText}>{t.skip}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (isLastStep) {
                    markTourCompleted('notifications_types_tour');
                    onDismiss();
                  } else {
                    setTourStep(tourStep + 1);
                  }
                }}
              >
                <Text style={styles.buttonText}>
                  {isLastStep ? t.finish : t.next}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceDropIcon: {
    fontSize: 48,
  },
  title: {
    ...TextStyles.h2,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...TextStyles.body,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...TextStyles.button,
    color: '#fff',
  },
  tourProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  tourButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  skipButtonText: {
    ...TextStyles.button,
    color: '#64748b',
  },
});

