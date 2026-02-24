// Contextual Help Component
// Provides context-specific help content for each screen
// Includes inactivity detection and error handling

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useGuidance } from '../../contexts/GuidanceContext';

interface ContextualHelpProps {
  screenName: string;
  visible: boolean;
  onClose: () => void;
}

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  commonIssues?: Array<{
    problem: string;
    solution: string;
  }>;
}

// Context-specific help content
const HELP_CONTENT: Record<string, { en: HelpContent; fr: HelpContent }> = {
  home: {
    en: {
      title: 'Home Screen Help',
      description: 'Browse and search for items in your area.',
      tips: [
        'Use the search bar to find specific items',
        'Tap the location button to filter by distance',
        'Swipe down to refresh the listings',
        'Tap any item to see full details',
      ],
      commonIssues: [
        {
          problem: 'No items showing',
          solution: 'Try expanding your search radius or checking your internet connection.',
        },
        {
          problem: 'Search not working',
          solution: 'Make sure you\'re typing at least 3 characters and check your spelling.',
        },
      ],
    },
    fr: {
      title: 'Aide de l\'écran d\'accueil',
      description: 'Parcourez et recherchez des articles dans votre région.',
      tips: [
        'Utilisez la barre de recherche pour trouver des articles spécifiques',
        'Appuyez sur le bouton de localisation pour filtrer par distance',
        'Faites glisser vers le bas pour actualiser les annonces',
        'Appuyez sur n\'importe quel article pour voir tous les détails',
      ],
      commonIssues: [
        {
          problem: 'Aucun article affiché',
          solution: 'Essayez d\'élargir votre rayon de recherche ou vérifiez votre connexion Internet.',
        },
        {
          problem: 'La recherche ne fonctionne pas',
          solution: 'Assurez-vous de taper au moins 3 caractères et vérifiez votre orthographe.',
        },
      ],
    },
  },
  listing: {
    en: {
      title: 'Listing Details Help',
      description: 'View item details and contact the seller.',
      tips: [
        'Swipe through photos to see all angles',
        'Check the seller\'s rating and profile',
        'Tap the message button to contact the seller',
        'Save to favorites by tapping the heart icon',
      ],
      commonIssues: [
        {
          problem: 'Can\'t send message',
          solution: 'Make sure you\'re logged in and have a complete profile.',
        },
        {
          problem: 'Photos not loading',
          solution: 'Check your internet connection and try refreshing the page.',
        },
      ],
    },
    fr: {
      title: 'Aide des détails de l\'annonce',
      description: 'Consultez les détails de l\'article et contactez le vendeur.',
      tips: [
        'Faites glisser les photos pour voir tous les angles',
        'Vérifiez la note et le profil du vendeur',
        'Appuyez sur le bouton de message pour contacter le vendeur',
        'Sauvegardez dans les favoris en appuyant sur l\'icône cœur',
      ],
      commonIssues: [
        {
          problem: 'Impossible d\'envoyer un message',
          solution: 'Assurez-vous d\'être connecté et d\'avoir un profil complet.',
        },
        {
          problem: 'Les photos ne se chargent pas',
          solution: 'Vérifiez votre connexion Internet et essayez de rafraîchir la page.',
        },
      ],
    },
  },
  chat: {
    en: {
      title: 'Messaging Help',
      description: 'Communicate safely with buyers and sellers.',
      tips: [
        'Use message templates for quick replies',
        'Always be polite and professional',
        'Never share personal banking information',
        'Arrange to meet in public places',
      ],
      commonIssues: [
        {
          problem: 'Messages not sending',
          solution: 'Check your internet connection and make sure the conversation is still active.',
        },
        {
          problem: 'Not receiving notifications',
          solution: 'Enable notifications in your device settings and app settings.',
        },
      ],
    },
    fr: {
      title: 'Aide de messagerie',
      description: 'Communiquez en toute sécurité avec les acheteurs et vendeurs.',
      tips: [
        'Utilisez les modèles de messages pour des réponses rapides',
        'Soyez toujours poli et professionnel',
        'Ne partagez jamais vos informations bancaires personnelles',
        'Convenez de vous rencontrer dans des lieux publics',
      ],
      commonIssues: [
        {
          problem: 'Les messages ne s\'envoient pas',
          solution: 'Vérifiez votre connexion Internet et assurez-vous que la conversation est toujours active.',
        },
        {
          problem: 'Pas de réception de notifications',
          solution: 'Activez les notifications dans les paramètres de votre appareil et de l\'application.',
        },
      ],
    },
  },
  post: {
    en: {
      title: 'Create Listing Help',
      description: 'Post your items for sale quickly and easily.',
      tips: [
        'Add at least 3 clear photos',
        'Write a detailed description',
        'Set a competitive price',
        'Choose the correct category',
        'Include your location',
      ],
      commonIssues: [
        {
          problem: 'Can\'t upload photos',
          solution: 'Check photo permissions in settings and ensure photos are under 10MB each.',
        },
        {
          problem: 'Listing not publishing',
          solution: 'Make sure all required fields are filled and you have enough credits.',
        },
      ],
    },
    fr: {
      title: 'Aide de création d\'annonce',
      description: 'Publiez vos articles à vendre rapidement et facilement.',
      tips: [
        'Ajoutez au moins 3 photos claires',
        'Rédigez une description détaillée',
        'Fixez un prix compétitif',
        'Choisissez la bonne catégorie',
        'Incluez votre localisation',
      ],
      commonIssues: [
        {
          problem: 'Impossible de télécharger des photos',
          solution: 'Vérifiez les autorisations de photos dans les paramètres et assurez-vous que les photos font moins de 10 Mo chacune.',
        },
        {
          problem: 'L\'annonce ne se publie pas',
          solution: 'Assurez-vous que tous les champs requis sont remplis et que vous avez suffisamment de crédits.',
        },
      ],
    },
  },
  profile: {
    en: {
      title: 'Profile Help',
      description: 'Manage your profile and listings.',
      tips: [
        'Complete your profile to build trust',
        'Add a profile photo',
        'Keep your WhatsApp number updated',
        'Respond quickly to messages',
        'Maintain a good rating',
      ],
      commonIssues: [
        {
          problem: 'Can\'t update profile',
          solution: 'Check your internet connection and make sure all fields are valid.',
        },
        {
          problem: 'Profile photo not uploading',
          solution: 'Ensure the photo is under 5MB and in JPG or PNG format.',
        },
      ],
    },
    fr: {
      title: 'Aide du profil',
      description: 'Gérez votre profil et vos annonces.',
      tips: [
        'Complétez votre profil pour établir la confiance',
        'Ajoutez une photo de profil',
        'Gardez votre numéro WhatsApp à jour',
        'Répondez rapidement aux messages',
        'Maintenez une bonne note',
      ],
      commonIssues: [
        {
          problem: 'Impossible de mettre à jour le profil',
          solution: 'Vérifiez votre connexion Internet et assurez-vous que tous les champs sont valides.',
        },
        {
          problem: 'La photo de profil ne se télécharge pas',
          solution: 'Assurez-vous que la photo fait moins de 5 Mo et est au format JPG ou PNG.',
        },
      ],
    },
  },
  favorites: {
    en: {
      title: 'Favorites Help',
      description: 'Manage your saved items.',
      tips: [
        'Tap the heart icon on any listing to save it',
        'Get notified of price drops',
        'Remove sold items to keep your list clean',
        'Check back regularly for updates',
      ],
      commonIssues: [
        {
          problem: 'Favorites not saving',
          solution: 'Make sure you\'re logged in and have a stable internet connection.',
        },
        {
          problem: 'Not getting price drop notifications',
          solution: 'Enable notifications in your device and app settings.',
        },
      ],
    },
    fr: {
      title: 'Aide des favoris',
      description: 'Gérez vos articles sauvegardés.',
      tips: [
        'Appuyez sur l\'icône cœur sur n\'importe quelle annonce pour la sauvegarder',
        'Soyez notifié des baisses de prix',
        'Retirez les articles vendus pour garder votre liste propre',
        'Vérifiez régulièrement pour les mises à jour',
      ],
      commonIssues: [
        {
          problem: 'Les favoris ne se sauvegardent pas',
          solution: 'Assurez-vous d\'être connecté et d\'avoir une connexion Internet stable.',
        },
        {
          problem: 'Pas de notifications de baisse de prix',
          solution: 'Activez les notifications dans les paramètres de votre appareil et de l\'application.',
        },
      ],
    },
  },
  notifications: {
    en: {
      title: 'Notifications Help',
      description: 'Stay updated with your activity.',
      tips: [
        'Enable push notifications for instant updates',
        'Tap any notification to view details',
        'Manage notification preferences in settings',
        'Check regularly to not miss important updates',
      ],
      commonIssues: [
        {
          problem: 'Not receiving notifications',
          solution: 'Enable notifications in device settings and check app notification settings.',
        },
        {
          problem: 'Notifications delayed',
          solution: 'Check your internet connection and ensure the app is not in battery saver mode.',
        },
      ],
    },
    fr: {
      title: 'Aide des notifications',
      description: 'Restez à jour avec votre activité.',
      tips: [
        'Activez les notifications push pour des mises à jour instantanées',
        'Appuyez sur n\'importe quelle notification pour voir les détails',
        'Gérez les préférences de notification dans les paramètres',
        'Vérifiez régulièrement pour ne pas manquer les mises à jour importantes',
      ],
      commonIssues: [
        {
          problem: 'Pas de réception de notifications',
          solution: 'Activez les notifications dans les paramètres de l\'appareil et vérifiez les paramètres de notification de l\'application.',
        },
        {
          problem: 'Notifications retardées',
          solution: 'Vérifiez votre connexion Internet et assurez-vous que l\'application n\'est pas en mode économie de batterie.',
        },
      ],
    },
  },
  'seller-dashboard': {
    en: {
      title: 'Seller Dashboard Help',
      description: 'Manage your listings and sales.',
      tips: [
        'Monitor your active listings',
        'Respond quickly to inquiries',
        'Update prices to stay competitive',
        'Mark items as sold when complete',
        'Use promotion options to boost visibility',
      ],
      commonIssues: [
        {
          problem: 'Listing not getting views',
          solution: 'Try improving photos, adjusting price, or using promotion options.',
        },
        {
          problem: 'Can\'t mark as sold',
          solution: 'Make sure you have an active conversation with a buyer first.',
        },
      ],
    },
    fr: {
      title: 'Aide du tableau de bord vendeur',
      description: 'Gérez vos annonces et ventes.',
      tips: [
        'Surveillez vos annonces actives',
        'Répondez rapidement aux demandes',
        'Mettez à jour les prix pour rester compétitif',
        'Marquez les articles comme vendus une fois terminé',
        'Utilisez les options de promotion pour augmenter la visibilité',
      ],
      commonIssues: [
        {
          problem: 'L\'annonce n\'obtient pas de vues',
          solution: 'Essayez d\'améliorer les photos, d\'ajuster le prix ou d\'utiliser les options de promotion.',
        },
        {
          problem: 'Impossible de marquer comme vendu',
          solution: 'Assurez-vous d\'avoir d\'abord une conversation active avec un acheteur.',
        },
      ],
    },
  },
  settings: {
    en: {
      title: 'Settings Help',
      description: 'Customize your app experience.',
      tips: [
        'Change language between English and French',
        'Manage notification preferences',
        'Update your account information',
        'Control guidance level',
        'Access privacy and terms',
      ],
      commonIssues: [
        {
          problem: 'Settings not saving',
          solution: 'Check your internet connection and try again.',
        },
        {
          problem: 'Language not changing',
          solution: 'Restart the app after changing language settings.',
        },
      ],
    },
    fr: {
      title: 'Aide des paramètres',
      description: 'Personnalisez votre expérience de l\'application.',
      tips: [
        'Changez la langue entre anglais et français',
        'Gérez les préférences de notification',
        'Mettez à jour vos informations de compte',
        'Contrôlez le niveau de guidage',
        'Accédez à la confidentialité et aux conditions',
      ],
      commonIssues: [
        {
          problem: 'Les paramètres ne se sauvegardent pas',
          solution: 'Vérifiez votre connexion Internet et réessayez.',
        },
        {
          problem: 'La langue ne change pas',
          solution: 'Redémarrez l\'application après avoir changé les paramètres de langue.',
        },
      ],
    },
  },
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  screenName,
  visible,
  onClose,
}) => {
  const { state } = useGuidance();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const language = state?.settings.language || 'fr';

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const helpContent = HELP_CONTENT[screenName]?.[language] || {
    title: language === 'fr' ? 'Aide' : 'Help',
    description: language === 'fr' ? 'Contenu d\'aide non disponible' : 'Help content not available',
    tips: [],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.title}>{helpContent.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.description}>{helpContent.description}</Text>

            {helpContent.tips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'fr' ? '💡 Conseils' : '💡 Tips'}
                </Text>
                {helpContent.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {helpContent.commonIssues && helpContent.commonIssues.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {language === 'fr' ? '🔧 Problèmes courants' : '🔧 Common Issues'}
                </Text>
                {helpContent.commonIssues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Text style={styles.problemText}>{issue.problem}</Text>
                    <Text style={styles.solutionText}>{issue.solution}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.moreHelpButton}
              onPress={() => {
                onClose();
                // Navigate to help center
              }}
            >
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <Text style={styles.moreHelpText}>
                {language === 'fr' ? 'Voir le centre d\'aide complet' : 'View full help center'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  issueItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  problemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  solutionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  moreHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  moreHelpText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginHorizontal: 8,
  },
});

