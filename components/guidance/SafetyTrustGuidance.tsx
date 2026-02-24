import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Shield, AlertTriangle, Star, CheckCircle, X, MapPin, Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';
import { useGuidance } from '@/contexts/GuidanceContext';

interface SafetyTrustGuidanceProps {
  // Contact info detection
  messageText?: string;
  onContactInfoDetected?: () => void;
  
  // Meeting arrangement
  hasMeetingArrangement?: boolean;
  meetingContext?: 'daytime' | 'evening' | 'night';
  
  // Transaction completion
  isFirstTransaction?: boolean;
  onFirstTransactionComplete?: () => void;
  
  // Low rating feedback
  userRating?: number;
  showLowRatingGuidance?: boolean;
  
  // Suspicious activity report
  reportSubmitted?: boolean;
  onReportAcknowledged?: () => void;
}

/**
 * SafetyTrustGuidance Component
 * 
 * Provides safety and trust guidance including:
 * - Contact info detection with safety reminders (Req 12.1)
 * - Meeting arrangement safety tips (Req 12.2)
 * - First transaction guidance (Req 12.3)
 * - Low rating constructive feedback (Req 12.4)
 * - Suspicious activity report confirmation (Req 12.5)
 */
export function SafetyTrustGuidance({
  messageText,
  onContactInfoDetected,
  hasMeetingArrangement = false,
  meetingContext = 'daytime',
  isFirstTransaction = false,
  onFirstTransactionComplete,
  userRating,
  showLowRatingGuidance = false,
  reportSubmitted = false,
  onReportAcknowledged,
}: SafetyTrustGuidanceProps) {
  const {
    state,
    shouldShowPrompt,
    markTooltipDismissed,
    markActionCompleted,
  } = useGuidance();

  const [showContactInfoWarning, setShowContactInfoWarning] = useState(false);
  const [showMeetingSafetyTips, setShowMeetingSafetyTips] = useState(false);
  const [showFirstTransactionGuidance, setShowFirstTransactionGuidance] = useState(false);
  const [showLowRatingFeedback, setShowLowRatingFeedback] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);

  const language = state?.settings.language || 'fr';

  // Detect contact information in messages (Req 12.1)
  useEffect(() => {
    if (!messageText) return;

    const hasContactInfo = detectContactInfo(messageText);
    if (hasContactInfo && shouldShowPrompt('safety_contact_info_warning')) {
      setShowContactInfoWarning(true);
      if (onContactInfoDetected) {
        onContactInfoDetected();
      }
    }
  }, [messageText, shouldShowPrompt, onContactInfoDetected]);

  // Show meeting safety tips (Req 12.2)
  useEffect(() => {
    if (hasMeetingArrangement && shouldShowPrompt('safety_meeting_tips')) {
      setShowMeetingSafetyTips(true);
    }
  }, [hasMeetingArrangement, shouldShowPrompt]);

  // Show first transaction guidance (Req 12.3)
  useEffect(() => {
    if (isFirstTransaction && shouldShowPrompt('safety_first_transaction')) {
      setShowFirstTransactionGuidance(true);
    }
  }, [isFirstTransaction, shouldShowPrompt]);

  // Show low rating feedback (Req 12.4)
  useEffect(() => {
    if (showLowRatingGuidance && userRating && userRating < 3 && shouldShowPrompt('safety_low_rating_feedback')) {
      setShowLowRatingFeedback(true);
    }
  }, [showLowRatingGuidance, userRating, shouldShowPrompt]);

  // Show report confirmation (Req 12.5)
  useEffect(() => {
    if (reportSubmitted && shouldShowPrompt('safety_report_confirmation')) {
      setShowReportConfirmation(true);
    }
  }, [reportSubmitted, shouldShowPrompt]);

  // Contact info detection patterns
  const detectContactInfo = useCallback((text: string): boolean => {
    // Phone number patterns (various formats)
    const phonePatterns = [
      /(\+?243[\s-]?)?[0-9]{9,10}/,  // DRC phone numbers
      /\b0[0-9]{9}\b/,                 // Local format
      /\b\d{3}[\s-]?\d{3}[\s-]?\d{3,4}\b/, // Generic phone
    ];

    // Address patterns (French and common terms)
    const addressPatterns = [
      /\b(avenue|av\.|rue|street|st\.|commune|quartier|boulevard|blvd\.)\b/i,
      /\b(kinshasa|lubumbashi|goma|bukavu|kisangani|kananga|mbuji-mayi)\b/i,
      /\b(adresse|address|lieu|location|endroit)\b/i,
    ];

    // Email patterns
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    // Check all patterns
    const hasPhone = phonePatterns.some(pattern => pattern.test(text));
    const hasAddress = addressPatterns.some(pattern => pattern.test(text));
    const hasEmail = emailPattern.test(text);

    return hasPhone || hasAddress || hasEmail;
  }, []);

  const handleDismissContactWarning = useCallback(() => {
    setShowContactInfoWarning(false);
    markTooltipDismissed('safety_contact_info_warning');
  }, [markTooltipDismissed]);

  const handleDismissMeetingTips = useCallback(() => {
    setShowMeetingSafetyTips(false);
    markTooltipDismissed('safety_meeting_tips');
    markActionCompleted('safety_meeting_tips_viewed');
  }, [markTooltipDismissed, markActionCompleted]);

  const handleDismissFirstTransaction = useCallback(() => {
    setShowFirstTransactionGuidance(false);
    markTooltipDismissed('safety_first_transaction');
    markActionCompleted('first_transaction_completed');
    if (onFirstTransactionComplete) {
      onFirstTransactionComplete();
    }
  }, [markTooltipDismissed, markActionCompleted, onFirstTransactionComplete]);

  const handleDismissLowRating = useCallback(() => {
    setShowLowRatingFeedback(false);
    markTooltipDismissed('safety_low_rating_feedback');
  }, [markTooltipDismissed]);

  const handleDismissReportConfirmation = useCallback(() => {
    setShowReportConfirmation(false);
    markTooltipDismissed('safety_report_confirmation');
    if (onReportAcknowledged) {
      onReportAcknowledged();
    }
  }, [markTooltipDismissed, onReportAcknowledged]);

  const content = {
    contactInfo: {
      en: {
        title: 'Safety Reminder 🛡️',
        message: 'We noticed contact information in this conversation.\n\nImportant safety tips:\n\n• Always meet in public, well-lit places\n• Bring a friend or family member if possible\n• Never send money before meeting in person\n• Trust your instincts - if something feels wrong, it probably is\n• Verify the item condition before paying',
        button: 'I Understand',
      },
      fr: {
        title: 'Rappel de sécurité 🛡️',
        message: 'Nous avons remarqué des informations de contact dans cette conversation.\n\nConseils de sécurité importants :\n\n• Rencontrez-vous toujours dans des lieux publics et bien éclairés\n• Amenez un ami ou un membre de la famille si possible\n• N\'envoyez jamais d\'argent avant de vous rencontrer en personne\n• Faites confiance à votre instinct - si quelque chose semble suspect, c\'est probablement le cas\n• Vérifiez l\'état de l\'article avant de payer',
        button: 'Je comprends',
      },
    },
    meetingDaytime: {
      en: {
        title: 'Meeting Safety Tips ☀️',
        message: 'Great! You\'re arranging a meeting during daytime.\n\nSafety checklist:\n\n✓ Meet in a busy public place (mall, café, market)\n✓ Tell someone where you\'re going\n✓ Bring your phone fully charged\n✓ Inspect the item carefully\n✓ Count money in a safe place\n✓ Don\'t share personal details unnecessarily',
        button: 'Got It',
      },
      fr: {
        title: 'Conseils de sécurité pour la rencontre ☀️',
        message: 'Super ! Vous organisez une rencontre pendant la journée.\n\nListe de sécurité :\n\n✓ Rencontrez-vous dans un lieu public fréquenté (centre commercial, café, marché)\n✓ Informez quelqu\'un de votre destination\n✓ Apportez votre téléphone complètement chargé\n✓ Inspectez l\'article soigneusement\n✓ Comptez l\'argent dans un endroit sûr\n✓ Ne partagez pas de détails personnels inutilement',
        button: 'Compris',
      },
    },
    meetingEvening: {
      en: {
        title: 'Evening Meeting - Extra Caution ⚠️',
        message: 'You\'re meeting in the evening. Please take extra precautions:\n\n⚠️ Choose well-lit, busy locations only\n⚠️ Strongly consider bringing someone with you\n⚠️ Share your location with a trusted contact\n⚠️ Keep your phone accessible\n⚠️ If you feel unsafe, reschedule for daytime\n\nYour safety is the priority!',
        button: 'I\'ll Be Careful',
      },
      fr: {
        title: 'Rencontre en soirée - Prudence supplémentaire ⚠️',
        message: 'Vous vous rencontrez en soirée. Veuillez prendre des précautions supplémentaires :\n\n⚠️ Choisissez uniquement des endroits bien éclairés et fréquentés\n⚠️ Envisagez fortement d\'amener quelqu\'un avec vous\n⚠️ Partagez votre position avec un contact de confiance\n⚠️ Gardez votre téléphone accessible\n⚠️ Si vous ne vous sentez pas en sécurité, reportez à la journée\n\nVotre sécurité est la priorité !',
        button: 'Je serai prudent(e)',
      },
    },
    meetingNight: {
      en: {
        title: 'Night Meeting - High Risk 🚨',
        message: 'Meeting at night carries significant risks.\n\nWe strongly recommend:\n\n🚨 Reschedule to daytime if possible\n🚨 If you must meet, bring multiple people\n🚨 Only meet in 24-hour establishments\n🚨 Share live location with trusted contacts\n🚨 Have an exit plan ready\n\nConsider if this transaction is worth the risk.',
        button: 'Understood',
      },
      fr: {
        title: 'Rencontre nocturne - Risque élevé 🚨',
        message: 'Se rencontrer la nuit comporte des risques importants.\n\nNous recommandons fortement :\n\n🚨 Reportez à la journée si possible\n🚨 Si vous devez vous rencontrer, amenez plusieurs personnes\n🚨 Rencontrez-vous uniquement dans des établissements ouverts 24h/24\n🚨 Partagez votre position en direct avec des contacts de confiance\n🚨 Ayez un plan de sortie prêt\n\nDemandez-vous si cette transaction vaut le risque.',
        button: 'Compris',
      },
    },
    firstTransaction: {
      en: {
        title: 'Your First Transaction! 🎉',
        message: 'Congratulations on completing your first transaction!\n\nHelp build trust in our community:\n\n⭐ Leave an honest rating for the other person\n⭐ Mention what went well\n⭐ Be constructive if there were issues\n⭐ Your feedback helps others make informed decisions\n\nHonest ratings make Marché.cd safer for everyone!',
        button: 'Leave Rating',
        skipButton: 'Maybe Later',
      },
      fr: {
        title: 'Votre première transaction ! 🎉',
        message: 'Félicitations pour avoir complété votre première transaction !\n\nAidez à construire la confiance dans notre communauté :\n\n⭐ Laissez une évaluation honnête pour l\'autre personne\n⭐ Mentionnez ce qui s\'est bien passé\n⭐ Soyez constructif s\'il y a eu des problèmes\n⭐ Vos commentaires aident les autres à prendre des décisions éclairées\n\nDes évaluations honnêtes rendent Marché.cd plus sûr pour tous !',
        button: 'Laisser une évaluation',
        skipButton: 'Peut-être plus tard',
      },
    },
    lowRating: {
      en: {
        title: 'Let\'s Improve Together 💪',
        message: `We noticed you received a ${userRating}-star rating. Don\'t worry - everyone can improve!\n\nTips for better ratings:\n\n📸 Post clear, accurate photos\n📝 Describe items honestly\n💬 Respond to messages quickly\n🤝 Be punctual for meetings\n✅ Ensure items match descriptions\n😊 Be friendly and professional\n\nSmall improvements lead to better experiences!`,
        button: 'I\'ll Do Better',
      },
      fr: {
        title: 'Améliorons-nous ensemble 💪',
        message: `Nous avons remarqué que vous avez reçu une note de ${userRating} étoiles. Ne vous inquiétez pas - tout le monde peut s\'améliorer !\n\nConseils pour de meilleures notes :\n\n📸 Publiez des photos claires et précises\n📝 Décrivez les articles honnêtement\n💬 Répondez aux messages rapidement\n🤝 Soyez ponctuel pour les rencontres\n✅ Assurez-vous que les articles correspondent aux descriptions\n😊 Soyez amical et professionnel\n\nDe petites améliorations mènent à de meilleures expériences !`,
        button: 'Je ferai mieux',
      },
    },
    reportConfirmation: {
      en: {
        title: 'Report Received ✅',
        message: 'Thank you for reporting suspicious activity.\n\nWhat happens next:\n\n🔍 Our team will review your report within 24 hours\n🛡️ We take all reports seriously\n📧 You\'ll receive an update via notification\n🚫 If confirmed, appropriate action will be taken\n🤝 Your report helps keep our community safe\n\nYou can continue using the app normally.',
        button: 'Understood',
      },
      fr: {
        title: 'Signalement reçu ✅',
        message: 'Merci d\'avoir signalé une activité suspecte.\n\nQue se passe-t-il ensuite :\n\n🔍 Notre équipe examinera votre signalement dans les 24 heures\n🛡️ Nous prenons tous les signalements au sérieux\n📧 Vous recevrez une mise à jour par notification\n🚫 Si confirmé, des mesures appropriées seront prises\n🤝 Votre signalement aide à garder notre communauté sûre\n\nVous pouvez continuer à utiliser l\'application normalement.',
        button: 'Compris',
      },
    },
  };

  // Get meeting content based on context
  const getMeetingContent = () => {
    if (meetingContext === 'night') {
      return content.meetingNight[language];
    } else if (meetingContext === 'evening') {
      return content.meetingEvening[language];
    }
    return content.meetingDaytime[language];
  };

  return (
    <>
      {/* Contact Info Warning Modal */}
      <Modal
        visible={showContactInfoWarning}
        transparent
        animationType="fade"
        onRequestClose={handleDismissContactWarning}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissContactWarning}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.warning + '15' }]}>
              <Shield size={40} color={Colors.warning} />
            </View>
            <Text style={styles.title}>{content.contactInfo[language].title}</Text>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.message}>{content.contactInfo[language].message}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Colors.warning }]} 
              onPress={handleDismissContactWarning}
            >
              <Text style={styles.buttonText}>{content.contactInfo[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Meeting Safety Tips Modal */}
      <Modal
        visible={showMeetingSafetyTips}
        transparent
        animationType="fade"
        onRequestClose={handleDismissMeetingTips}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissMeetingTips}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { 
              backgroundColor: meetingContext === 'night' ? Colors.error + '15' : 
                              meetingContext === 'evening' ? Colors.warning + '15' : 
                              Colors.success + '15' 
            }]}>
              <MapPin size={40} color={
                meetingContext === 'night' ? Colors.error : 
                meetingContext === 'evening' ? Colors.warning : 
                Colors.success
              } />
            </View>
            <Text style={styles.title}>{getMeetingContent().title}</Text>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.message}>{getMeetingContent().message}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.button, { 
                backgroundColor: meetingContext === 'night' ? Colors.error : 
                                meetingContext === 'evening' ? Colors.warning : 
                                Colors.success 
              }]} 
              onPress={handleDismissMeetingTips}
            >
              <Text style={styles.buttonText}>{getMeetingContent().button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* First Transaction Guidance Modal */}
      <Modal
        visible={showFirstTransactionGuidance}
        transparent
        animationType="fade"
        onRequestClose={handleDismissFirstTransaction}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissFirstTransaction}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.success + '15' }]}>
              <CheckCircle size={40} color={Colors.success} />
            </View>
            <Text style={styles.title}>{content.firstTransaction[language].title}</Text>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.message}>{content.firstTransaction[language].message}</Text>
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonSecondary]} 
                onPress={handleDismissFirstTransaction}
              >
                <Text style={[styles.buttonText, { color: Colors.primary }]}>
                  {content.firstTransaction[language].skipButton}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary]} 
                onPress={handleDismissFirstTransaction}
              >
                <Text style={styles.buttonText}>{content.firstTransaction[language].button}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Low Rating Feedback Modal */}
      <Modal
        visible={showLowRatingFeedback}
        transparent
        animationType="fade"
        onRequestClose={handleDismissLowRating}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissLowRating}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.info + '15' }]}>
              <Star size={40} color={Colors.info} />
            </View>
            <Text style={styles.title}>{content.lowRating[language].title}</Text>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.message}>{content.lowRating[language].message}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Colors.info }]} 
              onPress={handleDismissLowRating}
            >
              <Text style={styles.buttonText}>{content.lowRating[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Confirmation Modal */}
      <Modal
        visible={showReportConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleDismissReportConfirmation}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={handleDismissReportConfirmation}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconContainer, { backgroundColor: Colors.success + '15' }]}>
              <CheckCircle size={40} color={Colors.success} />
            </View>
            <Text style={styles.title}>{content.reportConfirmation[language].title}</Text>
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.message}>{content.reportConfirmation[language].message}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: Colors.success }]} 
              onPress={handleDismissReportConfirmation}
            >
              <Text style={styles.buttonText}>{content.reportConfirmation[language].button}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    maxHeight: 300,
    marginBottom: 20,
  },
  message: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
