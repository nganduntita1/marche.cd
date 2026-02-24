// Error With Solution Component
// Displays error messages with actionable solutions
// Provides context-specific troubleshooting steps

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface ErrorWithSolutionProps {
  visible: boolean;
  errorType: string;
  errorMessage: string;
  onClose: () => void;
  onRetry?: () => void;
  language?: 'en' | 'fr';
}

interface ErrorSolution {
  title: string;
  description: string;
  solutions: string[];
  retryLabel?: string;
}

// Error solutions database
const ERROR_SOLUTIONS: Record<string, { en: ErrorSolution; fr: ErrorSolution }> = {
  network: {
    en: {
      title: 'Connection Error',
      description: 'We couldn\'t connect to the server. This usually happens when your internet connection is unstable.',
      solutions: [
        'Check your WiFi or mobile data connection',
        'Try turning airplane mode on and off',
        'Move to an area with better signal',
        'Restart your device if the problem persists',
      ],
      retryLabel: 'Try Again',
    },
    fr: {
      title: 'Erreur de connexion',
      description: 'Nous n\'avons pas pu nous connecter au serveur. Cela se produit généralement lorsque votre connexion Internet est instable.',
      solutions: [
        'Vérifiez votre connexion WiFi ou données mobiles',
        'Essayez d\'activer et désactiver le mode avion',
        'Déplacez-vous vers une zone avec un meilleur signal',
        'Redémarrez votre appareil si le problème persiste',
      ],
      retryLabel: 'Réessayer',
    },
  },
  upload: {
    en: {
      title: 'Upload Failed',
      description: 'We couldn\'t upload your file. This might be due to file size or format issues.',
      solutions: [
        'Make sure the file is under 10MB',
        'Check that the file is in JPG or PNG format',
        'Try compressing the image',
        'Check your internet connection',
      ],
      retryLabel: 'Try Again',
    },
    fr: {
      title: 'Échec du téléchargement',
      description: 'Nous n\'avons pas pu télécharger votre fichier. Cela peut être dû à la taille ou au format du fichier.',
      solutions: [
        'Assurez-vous que le fichier fait moins de 10 Mo',
        'Vérifiez que le fichier est au format JPG ou PNG',
        'Essayez de compresser l\'image',
        'Vérifiez votre connexion Internet',
      ],
      retryLabel: 'Réessayer',
    },
  },
  auth: {
    en: {
      title: 'Authentication Error',
      description: 'We couldn\'t verify your credentials. Please check your login information.',
      solutions: [
        'Make sure your phone number is correct',
        'Check that your password is correct',
        'Try resetting your password',
        'Contact support if you can\'t access your account',
      ],
      retryLabel: 'Try Again',
    },
    fr: {
      title: 'Erreur d\'authentification',
      description: 'Nous n\'avons pas pu vérifier vos identifiants. Veuillez vérifier vos informations de connexion.',
      solutions: [
        'Assurez-vous que votre numéro de téléphone est correct',
        'Vérifiez que votre mot de passe est correct',
        'Essayez de réinitialiser votre mot de passe',
        'Contactez le support si vous ne pouvez pas accéder à votre compte',
      ],
      retryLabel: 'Réessayer',
    },
  },
  validation: {
    en: {
      title: 'Validation Error',
      description: 'Some required information is missing or incorrect.',
      solutions: [
        'Check that all required fields are filled',
        'Make sure phone numbers are in the correct format',
        'Verify that prices are valid numbers',
        'Ensure all fields meet the minimum requirements',
      ],
      retryLabel: 'Review Form',
    },
    fr: {
      title: 'Erreur de validation',
      description: 'Certaines informations requises sont manquantes ou incorrectes.',
      solutions: [
        'Vérifiez que tous les champs requis sont remplis',
        'Assurez-vous que les numéros de téléphone sont au bon format',
        'Vérifiez que les prix sont des nombres valides',
        'Assurez-vous que tous les champs respectent les exigences minimales',
      ],
      retryLabel: 'Revoir le formulaire',
    },
  },
  credits: {
    en: {
      title: 'Insufficient Credits',
      description: 'You don\'t have enough credits to complete this action.',
      solutions: [
        'Purchase more credits from your profile',
        'Contact support via WhatsApp to buy credits',
        'Check your credit balance in your profile',
      ],
      retryLabel: 'Buy Credits',
    },
    fr: {
      title: 'Crédits insuffisants',
      description: 'Vous n\'avez pas assez de crédits pour effectuer cette action.',
      solutions: [
        'Achetez plus de crédits depuis votre profil',
        'Contactez le support via WhatsApp pour acheter des crédits',
        'Vérifiez votre solde de crédits dans votre profil',
      ],
      retryLabel: 'Acheter des crédits',
    },
  },
  permission: {
    en: {
      title: 'Permission Required',
      description: 'This feature requires permission to access your device.',
      solutions: [
        'Go to your device Settings',
        'Find Marché.cd in the apps list',
        'Enable the required permissions',
        'Restart the app after granting permissions',
      ],
      retryLabel: 'Open Settings',
    },
    fr: {
      title: 'Permission requise',
      description: 'Cette fonctionnalité nécessite une permission pour accéder à votre appareil.',
      solutions: [
        'Allez dans les Paramètres de votre appareil',
        'Trouvez Marché.cd dans la liste des applications',
        'Activez les permissions requises',
        'Redémarrez l\'application après avoir accordé les permissions',
      ],
      retryLabel: 'Ouvrir les paramètres',
    },
  },
  server: {
    en: {
      title: 'Server Error',
      description: 'Something went wrong on our end. We\'re working to fix it.',
      solutions: [
        'Wait a few minutes and try again',
        'Check if the app needs an update',
        'Contact support if the problem persists',
        'Try restarting the app',
      ],
      retryLabel: 'Try Again',
    },
    fr: {
      title: 'Erreur du serveur',
      description: 'Quelque chose s\'est mal passé de notre côté. Nous travaillons pour le corriger.',
      solutions: [
        'Attendez quelques minutes et réessayez',
        'Vérifiez si l\'application nécessite une mise à jour',
        'Contactez le support si le problème persiste',
        'Essayez de redémarrer l\'application',
      ],
      retryLabel: 'Réessayer',
    },
  },
  notfound: {
    en: {
      title: 'Not Found',
      description: 'The item or page you\'re looking for doesn\'t exist or has been removed.',
      solutions: [
        'Check that the link is correct',
        'The item may have been sold or deleted',
        'Try searching for similar items',
        'Go back to the home screen',
      ],
      retryLabel: 'Go Home',
    },
    fr: {
      title: 'Non trouvé',
      description: 'L\'article ou la page que vous recherchez n\'existe pas ou a été supprimé.',
      solutions: [
        'Vérifiez que le lien est correct',
        'L\'article a peut-être été vendu ou supprimé',
        'Essayez de rechercher des articles similaires',
        'Retournez à l\'écran d\'accueil',
      ],
      retryLabel: 'Aller à l\'accueil',
    },
  },
};

export const ErrorWithSolution: React.FC<ErrorWithSolutionProps> = ({
  visible,
  errorType,
  errorMessage,
  onClose,
  onRetry,
  language = 'fr',
}) => {
  const solution = ERROR_SOLUTIONS[errorType]?.[language] || {
    title: language === 'fr' ? 'Erreur' : 'Error',
    description: errorMessage || (language === 'fr' ? 'Une erreur s\'est produite' : 'An error occurred'),
    solutions: [
      language === 'fr'
        ? 'Réessayez dans quelques instants'
        : 'Try again in a few moments',
      language === 'fr'
        ? 'Contactez le support si le problème persiste'
        : 'Contact support if the problem persists',
    ],
    retryLabel: language === 'fr' ? 'Réessayer' : 'Try Again',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
          </View>

          <Text style={styles.title}>{solution.title}</Text>
          <Text style={styles.description}>{solution.description}</Text>

          <ScrollView style={styles.solutionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.solutionsTitle}>
              {language === 'fr' ? 'Solutions possibles :' : 'Possible solutions:'}
            </Text>
            {solution.solutions.map((sol, index) => (
              <View key={index} style={styles.solutionItem}>
                <View style={styles.solutionNumber}>
                  <Text style={styles.solutionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.solutionText}>{sol}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            {onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  onClose();
                  onRetry();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>{solution.retryLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeButton, !onRetry && styles.closeButtonFull]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  solutionsContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  solutionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  solutionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  solutionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  solutionText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  closeButtonFull: {
    flex: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});

