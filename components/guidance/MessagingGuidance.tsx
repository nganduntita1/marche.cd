import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { AlertCircle, Shield, MessageCircle, Clock, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { useGuidance } from '@/contexts/GuidanceContext';
import MessageTemplatePicker from '../MessageTemplatePicker';

interface MessagingGuidanceProps {
  conversationId: string;
  messageCount: number;
  lastMessageTime?: string;
  onTemplateSelect?: (template: string) => void;
  showTemplatePickerTrigger?: boolean;
}

/**
 * MessagingGuidance Component
 * 
 * Provides contextual guidance for messaging including:
 * - Welcome message with safety tips (first visit)
 * - Message template picker (on input focus)
 * - Milestone prompts (5 messages)
 * - Contact info safety detector
 * - 24-hour response reminder
 */
export function MessagingGuidance({
  conversationId,
  messageCount,
  lastMessageTime,
  onTemplateSelect,
  showTemplatePickerTrigger = false,
}: MessagingGuidanceProps) {
  const {
    state,
    shouldShowTooltip,
    shouldShowPrompt,
    markTooltipDismissed,
    markActionCompleted,
    evaluateTrigger,
  } = useGuidance();

  const [showWelcome, setShowWelcome] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showSafetyReminder, setShowSafetyReminder] = useState(false);
  const [showResponseReminder, setShowResponseReminder] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const language = state?.settings.language || 'en';

  // Check if this is first chat visit
  useEffect(() => {
    const isFirstChat = evaluateTrigger({
      type: 'first_visit',
      params: { screenName: 'chat' },
    });

    if (isFirstChat && shouldShowTooltip('chat_welcome')) {
      setShowWelcome(true);
    }
  }, []);

  // Check for milestone (5 messages)
  useEffect(() => {
    if (messageCount === 5 && shouldShowPrompt('chat_milestone_5')) {
      setShowMilestone(true);
    }
  }, [messageCount]);

  // Check for 24-hour response reminder
  useEffect(() => {
    if (!lastMessageTime) return;

    const lastTime = new Date(lastMessageTime).getTime();
    const now = Date.now();
    const hoursSince = (now - lastTime) / (1000 * 60 * 60);

    if (hoursSince >= 24 && shouldShowPrompt('chat_response_reminder')) {
      setShowResponseReminder(true);
    }
  }, [lastMessageTime]);

  // Show template picker when triggered
  useEffect(() => {
    if (showTemplatePickerTrigger && shouldShowTooltip('chat_template_picker')) {
      setShowTemplatePicker(true);
    }
  }, [showTemplatePickerTrigger]);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcome(false);
    markTooltipDismissed('chat_welcome');
  }, [markTooltipDismissed]);

  const handleDismissMilestone = useCallback(() => {
    setShowMilestone(false);
    markTooltipDismissed('chat_milestone_5');
  }, [markTooltipDismissed]);

  const handleDismissSafety = useCallback(() => {
    setShowSafetyReminder(false);
    markTooltipDismissed('chat_safety_reminder');
  }, [markTooltipDismissed]);

  const handleDismissResponse = useCallback(() => {
    setShowResponseReminder(false);
    markTooltipDismissed('chat_response_reminder');
  }, [markTooltipDismissed]);

  const handleTemplateSelect = useCallback((template: string) => {
    setShowTemplatePicker(false);
    markActionCompleted('chat_template_used');
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  }, [onTemplateSelect, markActionCompleted]);

  // Detect contact information in messages
  const detectContactInfo = useCallback((message: string): boolean => {
    const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const addressPattern = /(avenue|av\.|rue|street|st\.|commune|quartier)/i;
    
    return phonePattern.test(message) || emailPattern.test(message) || addressPattern.test(message);
  }, []);

  // Show safety reminder when contact info is detected
  const checkMessageForContactInfo = useCallback((message: string) => {
    if (detectContactInfo(message) && shouldShowPrompt('chat_safety_reminder')) {
      setShowSafetyReminder(true);
    }
  }, [detectContactInfo, shouldShowPrompt]);

  const content = {
    welcome: {
      en: {
        title: 'Welcome to Chat! 💬',
        message: 'Here are some tips for safe communication:\n\n• Be polite and respectful\n• Meet in public places\n• Never share sensitive personal info\n• Report suspicious behavior\n• Use our message templates for quick replies',
        button: 'Got it',
      },
      fr: {
        title: 'Bienvenue dans le Chat ! 💬',
        message: 'Voici quelques conseils pour une communication sûre :\n\n• Soyez poli et respectueux\n• Rencontrez-vous dans des lieux publics\n• Ne partagez jamais d\'infos personnelles sensibles\n• Signalez les comportements suspects\n• Utilisez nos modèles de messages pour des réponses rapides',
        button: 'Compris',
      },
    },
    milestone: {
      en: {
        title: 'Great Conversation! 🎉',
        message: 'You\'ve exchanged 5 messages. Consider these next steps:\n\n• Agree on a meeting place (public location)\n• Discuss payment method\n• Confirm item availability\n• Set a specific time to meet',
        button: 'Thanks',
      },
      fr: {
        title: 'Belle conversation ! 🎉',
        message: 'Vous avez échangé 5 messages. Considérez ces prochaines étapes :\n\n• Convenez d\'un lieu de rencontre (lieu public)\n• Discutez du mode de paiement\n• Confirmez la disponibilité de l\'article\n• Fixez une heure précise pour vous rencontrer',
        button: 'Merci',
      },
    },
    safety: {
      en: {
        title: 'Safety Reminder 🛡️',
        message: 'We noticed contact information in this conversation.\n\nRemember:\n• Always meet in public places\n• Bring a friend if possible\n• Trust your instincts\n• Never send money before meeting\n• Verify the item before paying',
        button: 'Understood',
      },
      fr: {
        title: 'Rappel de sécurité 🛡️',
        message: 'Nous avons remarqué des informations de contact dans cette conversation.\n\nRappelez-vous :\n• Rencontrez-vous toujours dans des lieux publics\n• Amenez un ami si possible\n• Faites confiance à votre instinct\n• N\'envoyez jamais d\'argent avant de vous rencontrer\n• Vérifiez l\'article avant de payer',
        button: 'Compris',
      },
    },
    response: {
      en: {
        title: 'Response Reminder ⏰',
        message: 'You haven\'t responded in 24 hours. Quick replies help maintain buyer interest!\n\nSuggested responses:\n• "Still interested, when can we meet?"\n• "Is the item still available?"\n• "Sorry for the delay, let\'s continue"',
        button: 'Reply Now',
      },
      fr: {
        title: 'Rappel de réponse ⏰',
        message: 'Vous n\'avez pas répondu depuis 24 heures. Des réponses rapides aident à maintenir l\'intérêt de l\'acheteur !\n\nRéponses suggérées :\n• "Toujours intéressé(e), quand pouvons-nous nous rencontrer ?"\n• "L\'article est-il toujours disponible ?"\n• "Désolé(e) pour le retard, continuons"',
        button: 'Répondre maintenant',
      },
    },
  };

  return (
    <>
      {/* Welcome Message Modal */}
      <Modal
        visible={showWelcome}
        transparent
        animationType="fade"
        onRequestClose={handleDismissWelcome}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <MessageCircle size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{content.welcome[language].title}</Text>
            <Text style={styles.message}>{content.welcome[language].message}</Text>
            <TouchableOpacity style={styles.button} onPress={handleDismissWelcome}>
              <Text style={styles.buttonText}>{content.welcome[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Milestone Prompt Modal */}
      <Modal
        visible={showMilestone}
        transparent
        animationType="fade"
        onRequestClose={handleDismissMilestone}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissMilestone}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <MessageCircle size={32} color={Colors.success} />
            </View>
            <Text style={styles.title}>{content.milestone[language].title}</Text>
            <Text style={styles.message}>{content.milestone[language].message}</Text>
            <TouchableOpacity style={styles.button} onPress={handleDismissMilestone}>
              <Text style={styles.buttonText}>{content.milestone[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety Reminder Modal */}
      <Modal
        visible={showSafetyReminder}
        transparent
        animationType="fade"
        onRequestClose={handleDismissSafety}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissSafety}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.warning + '15' }]}>
              <Shield size={32} color={Colors.warning} />
            </View>
            <Text style={styles.title}>{content.safety[language].title}</Text>
            <Text style={styles.message}>{content.safety[language].message}</Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Colors.warning }]} 
              onPress={handleDismissSafety}
            >
              <Text style={styles.buttonText}>{content.safety[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Response Reminder Modal */}
      <Modal
        visible={showResponseReminder}
        transparent
        animationType="fade"
        onRequestClose={handleDismissResponse}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissResponse}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.info + '15' }]}>
              <Clock size={32} color={Colors.info} />
            </View>
            <Text style={styles.title}>{content.response[language].title}</Text>
            <Text style={styles.message}>{content.response[language].message}</Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Colors.info }]} 
              onPress={handleDismissResponse}
            >
              <Text style={styles.buttonText}>{content.response[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Message Template Picker */}
      <MessageTemplatePicker
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    ...TextStyles.button,
    color: '#fff',
  },
});
