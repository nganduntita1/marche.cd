// Seller Dashboard Guidance Component
// Provides guidance for seller dashboard features, low-view listings, inquiry responses, and promotions

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import {
  TrendingUp,
  Eye,
  MessageCircle,
  Sparkles,
  Package,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Target,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface SellerDashboardGuidanceProps {
  // Dashboard stats
  totalListings: number;
  activeListings: number;
  lowViewListings?: Array<{
    id: string;
    title: string;
    views: number;
    daysActive: number;
  }>;
  
  // Callbacks
  onPromotePress?: (listingId: string) => void;
  onEditPress?: (listingId: string) => void;
  onMarkAsSoldPress?: (listingId: string) => void;
}

interface ResponseTemplate {
  id: string;
  category: 'inquiry' | 'negotiation' | 'availability' | 'meeting';
  title: string;
  text: string;
  icon: string;
}

// ============================================================================
// SELLER DASHBOARD TOUR MODAL
// ============================================================================

interface DashboardTourProps {
  visible: boolean;
  onDismiss: () => void;
  language: 'en' | 'fr';
}

const DashboardTour: React.FC<DashboardTourProps> = ({ visible, onDismiss, language }) => {
  const features = [
    {
      icon: '📊',
      title: language === 'en' ? 'Overview Stats' : 'Statistiques générales',
      description: language === 'en' 
        ? 'Track your total listings, views, messages, and sales' 
        : 'Suivez vos annonces totales, vues, messages et ventes',
    },
    {
      icon: '📈',
      title: language === 'en' ? 'Top Performers' : 'Meilleures annonces',
      description: language === 'en' 
        ? 'See which listings are getting the most attention' 
        : 'Voyez quelles annonces reçoivent le plus d\'attention',
    },
    {
      icon: '✨',
      title: language === 'en' ? 'Promotions' : 'Promotions',
      description: language === 'en' 
        ? 'Boost your listings to reach more buyers' 
        : 'Boostez vos annonces pour atteindre plus d\'acheteurs',
    },
    {
      icon: '💬',
      title: language === 'en' ? 'Messages' : 'Messages',
      description: language === 'en' 
        ? 'Respond quickly to buyer inquiries' 
        : 'Répondez rapidement aux demandes des acheteurs',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.tourCard}>
          <View style={styles.tourHeader}>
            <TrendingUp size={32} color={Colors.primary} />
            <Text style={styles.tourTitle}>
              {language === 'en' ? 'Seller Dashboard' : 'Tableau de bord vendeur'}
            </Text>
          </View>

          <Text style={styles.tourSubtitle}>
            {language === 'en'
              ? 'Manage your listings and track your sales performance'
              : 'Gérez vos annonces et suivez vos performances de vente'}
          </Text>

          <ScrollView style={styles.featuresList} showsVerticalScrollIndicator={false}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.tourButton} onPress={onDismiss}>
            <Text style={styles.tourButtonText}>
              {language === 'en' ? 'Got it!' : 'Compris !'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// LOW VIEW LISTING SUGGESTIONS
// ============================================================================

interface LowViewSuggestionsProps {
  listings: Array<{
    id: string;
    title: string;
    views: number;
    daysActive: number;
  }>;
  onImprove: (listingId: string) => void;
  onPromote: (listingId: string) => void;
  language: 'en' | 'fr';
}

const LowViewSuggestions: React.FC<LowViewSuggestionsProps> = ({
  listings,
  onImprove,
  onPromote,
  language,
}) => {
  if (listings.length === 0) return null;

  const suggestions = [
    {
      icon: '📸',
      text: language === 'en' ? 'Add more photos' : 'Ajoutez plus de photos',
    },
    {
      icon: '💰',
      text: language === 'en' ? 'Adjust the price' : 'Ajustez le prix',
    },
    {
      icon: '✏️',
      text: language === 'en' ? 'Improve description' : 'Améliorez la description',
    },
    {
      icon: '✨',
      text: language === 'en' ? 'Promote listing' : 'Promouvoir l\'annonce',
    },
  ];

  return (
    <View style={styles.lowViewContainer}>
      <View style={styles.lowViewHeader}>
        <AlertCircle size={20} color="#f59e0b" />
        <Text style={styles.lowViewTitle}>
          {language === 'en' ? 'Needs Attention' : 'Nécessite attention'}
        </Text>
      </View>

      {listings.map((listing) => (
        <View key={listing.id} style={styles.lowViewCard}>
          <View style={styles.lowViewInfo}>
            <Text style={styles.lowViewListingTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <View style={styles.lowViewStats}>
              <Eye size={14} color="#64748b" />
              <Text style={styles.lowViewStatText}>
                {listing.views} {language === 'en' ? 'views' : 'vues'}
              </Text>
              <Text style={styles.lowViewDays}>
                • {listing.daysActive} {language === 'en' ? 'days' : 'jours'}
              </Text>
            </View>
          </View>

          <View style={styles.suggestionsList}>
            <Text style={styles.suggestionsLabel}>
              {language === 'en' ? 'Try:' : 'Essayez :'}
            </Text>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionItem}>
                {suggestion.icon} {suggestion.text}
              </Text>
            ))}
          </View>

          <View style={styles.lowViewActions}>
            <TouchableOpacity
              style={styles.improveButton}
              onPress={() => onImprove(listing.id)}
            >
              <Text style={styles.improveButtonText}>
                {language === 'en' ? 'Edit' : 'Modifier'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promoteButton}
              onPress={() => onPromote(listing.id)}
            >
              <Sparkles size={16} color="#fff" />
              <Text style={styles.promoteButtonText}>
                {language === 'en' ? 'Promote' : 'Promouvoir'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// INQUIRY RESPONSE TEMPLATES
// ============================================================================

interface ResponseTemplatesProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectTemplate: (template: ResponseTemplate) => void;
  language: 'en' | 'fr';
}

const ResponseTemplates: React.FC<ResponseTemplatesProps> = ({
  visible,
  onDismiss,
  onSelectTemplate,
  language,
}) => {
  const templates: ResponseTemplate[] = [
    {
      id: 'inquiry_available',
      category: 'inquiry',
      title: language === 'en' ? 'Item Available' : 'Article disponible',
      text: language === 'en'
        ? 'Yes, this item is still available! Would you like to know more details or arrange a meeting?'
        : 'Oui, cet article est toujours disponible ! Voulez-vous plus de détails ou organiser une rencontre ?',
      icon: '✅',
    },
    {
      id: 'negotiation_firm',
      category: 'negotiation',
      title: language === 'en' ? 'Price Firm' : 'Prix ferme',
      text: language === 'en'
        ? 'Thank you for your interest! The price is firm as the item is in excellent condition.'
        : 'Merci pour votre intérêt ! Le prix est ferme car l\'article est en excellent état.',
      icon: '💰',
    },
    {
      id: 'negotiation_flexible',
      category: 'negotiation',
      title: language === 'en' ? 'Open to Offers' : 'Ouvert aux offres',
      text: language === 'en'
        ? 'I\'m open to reasonable offers. What price did you have in mind?'
        : 'Je suis ouvert aux offres raisonnables. Quel prix aviez-vous en tête ?',
      icon: '🤝',
    },
    {
      id: 'meeting_arrange',
      category: 'meeting',
      title: language === 'en' ? 'Arrange Meeting' : 'Organiser rencontre',
      text: language === 'en'
        ? 'Great! I\'m available [days/times]. Where would be convenient for you to meet? I suggest [public place].'
        : 'Super ! Je suis disponible [jours/heures]. Où serait-il pratique pour vous de nous rencontrer ? Je suggère [lieu public].',
      icon: '📍',
    },
    {
      id: 'availability_schedule',
      category: 'availability',
      title: language === 'en' ? 'Schedule Viewing' : 'Planifier visite',
      text: language === 'en'
        ? 'I\'m available for viewing this week. What day works best for you?'
        : 'Je suis disponible pour une visite cette semaine. Quel jour vous convient le mieux ?',
      icon: '📅',
    },
    {
      id: 'inquiry_details',
      category: 'inquiry',
      title: language === 'en' ? 'More Details' : 'Plus de détails',
      text: language === 'en'
        ? 'Happy to provide more details! What specific information would you like to know?'
        : 'Heureux de fournir plus de détails ! Quelles informations spécifiques aimeriez-vous connaître ?',
      icon: '📝',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.templatesCard}>
          <View style={styles.templatesHeader}>
            <MessageCircle size={24} color={Colors.primary} />
            <Text style={styles.templatesTitle}>
              {language === 'en' ? 'Quick Responses' : 'Réponses rapides'}
            </Text>
            <TouchableOpacity onPress={onDismiss}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => {
                  onSelectTemplate(template);
                  onDismiss();
                }}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <View style={styles.templateContent}>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateText} numberOfLines={2}>
                    {template.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MARK AS SOLD GUIDANCE
// ============================================================================

interface MarkAsSoldGuidanceProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  language: 'en' | 'fr';
}

const MarkAsSoldGuidance: React.FC<MarkAsSoldGuidanceProps> = ({
  visible,
  onDismiss,
  onConfirm,
  language,
}) => {
  const steps = [
    {
      icon: '✅',
      text: language === 'en' 
        ? 'Mark the item as sold' 
        : 'Marquer l\'article comme vendu',
    },
    {
      icon: '👤',
      text: language === 'en' 
        ? 'Select the buyer from your conversations' 
        : 'Sélectionner l\'acheteur parmi vos conversations',
    },
    {
      icon: '⭐',
      text: language === 'en' 
        ? 'Rate your experience with the buyer' 
        : 'Évaluer votre expérience avec l\'acheteur',
    },
    {
      icon: '💬',
      text: language === 'en' 
        ? 'The buyer will be prompted to rate you too' 
        : 'L\'acheteur sera invité à vous évaluer aussi',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <CheckCircle size={32} color={Colors.primary} />
            <Text style={styles.guidanceTitle}>
              {language === 'en' ? 'Mark as Sold' : 'Marquer comme vendu'}
            </Text>
          </View>

          <Text style={styles.guidanceSubtitle}>
            {language === 'en'
              ? 'Here\'s what happens when you mark an item as sold:'
              : 'Voici ce qui se passe lorsque vous marquez un article comme vendu :'}
          </Text>

          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Lightbulb size={20} color="#0369a1" />
            <Text style={styles.infoText}>
              {language === 'en'
                ? 'Ratings help build trust and improve your reputation as a seller!'
                : 'Les évaluations aident à établir la confiance et à améliorer votre réputation en tant que vendeur !'}
            </Text>
          </View>

          <View style={styles.guidanceActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
              <Text style={styles.cancelButtonText}>
                {language === 'en' ? 'Cancel' : 'Annuler'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>
                {language === 'en' ? 'Continue' : 'Continuer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// PROMOTION OPTIONS EXPLANATION
// ============================================================================

interface PromotionExplanationProps {
  visible: boolean;
  onDismiss: () => void;
  language: 'en' | 'fr';
}

const PromotionExplanation: React.FC<PromotionExplanationProps> = ({
  visible,
  onDismiss,
  language,
}) => {
  const promotionOptions = [
    {
      icon: '⭐',
      title: language === 'en' ? 'Featured Listing' : 'Annonce en vedette',
      description: language === 'en'
        ? 'Appear at the top of search results for 7 days'
        : 'Apparaître en haut des résultats de recherche pendant 7 jours',
      benefit: language === 'en' ? '5x more views' : '5x plus de vues',
      cost: '500 FC',
    },
    {
      icon: '🚀',
      title: language === 'en' ? 'Boost' : 'Boost',
      description: language === 'en'
        ? 'Increase visibility in your category for 3 days'
        : 'Augmenter la visibilité dans votre catégorie pendant 3 jours',
      benefit: language === 'en' ? '3x more views' : '3x plus de vues',
      cost: '300 FC',
    },
    {
      icon: '📍',
      title: language === 'en' ? 'Local Highlight' : 'Mise en avant locale',
      description: language === 'en'
        ? 'Show prominently to buyers in your city for 5 days'
        : 'Afficher en évidence aux acheteurs de votre ville pendant 5 jours',
      benefit: language === 'en' ? '4x more local views' : '4x plus de vues locales',
      cost: '400 FC',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.promotionCard}>
          <View style={styles.promotionHeader}>
            <Sparkles size={32} color="#f59e0b" />
            <Text style={styles.promotionTitle}>
              {language === 'en' ? 'Promotion Options' : 'Options de promotion'}
            </Text>
          </View>

          <Text style={styles.promotionSubtitle}>
            {language === 'en'
              ? 'Boost your listings to reach more buyers faster'
              : 'Boostez vos annonces pour atteindre plus d\'acheteurs plus rapidement'}
          </Text>

          <ScrollView style={styles.promotionsList} showsVerticalScrollIndicator={false}>
            {promotionOptions.map((option, index) => (
              <View key={index} style={styles.promotionOption}>
                <View style={styles.promotionOptionHeader}>
                  <Text style={styles.promotionIcon}>{option.icon}</Text>
                  <View style={styles.promotionInfo}>
                    <Text style={styles.promotionOptionTitle}>{option.title}</Text>
                    <Text style={styles.promotionCost}>{option.cost}</Text>
                  </View>
                </View>
                <Text style={styles.promotionDescription}>{option.description}</Text>
                <View style={styles.promotionBenefit}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.promotionBenefitText}>{option.benefit}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.promotionTip}>
            <Lightbulb size={20} color="#f59e0b" />
            <Text style={styles.promotionTipText}>
              {language === 'en'
                ? 'Tip: Promote listings with good photos and descriptions for best results!'
                : 'Astuce : Promouvez les annonces avec de bonnes photos et descriptions pour de meilleurs résultats !'}
            </Text>
          </View>

          <TouchableOpacity style={styles.promotionButton} onPress={onDismiss}>
            <Text style={styles.promotionButtonText}>
              {language === 'en' ? 'Got it!' : 'Compris !'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN SELLER DASHBOARD GUIDANCE COMPONENT
// ============================================================================

export const SellerDashboardGuidance: React.FC<SellerDashboardGuidanceProps> = ({
  totalListings,
  activeListings,
  lowViewListings = [],
  onPromotePress,
  onEditPress,
  onMarkAsSoldPress,
}) => {
  const { state, shouldShowTour, markTourCompleted, incrementScreenView } = useGuidance();
  
  const [showTour, setShowTour] = useState(false);
  const [showResponseTemplates, setShowResponseTemplates] = useState(false);
  const [showMarkAsSoldGuidance, setShowMarkAsSoldGuidance] = useState(false);
  const [showPromotionExplanation, setShowPromotionExplanation] = useState(false);

  const language = state?.settings.language || 'fr';

  useEffect(() => {
    // Track screen view
    incrementScreenView('seller_dashboard');

    // Show tour on first visit
    if (shouldShowTour('seller_dashboard_tour')) {
      setShowTour(true);
    }
  }, []);

  const handleDismissTour = () => {
    setShowTour(false);
    markTourCompleted('seller_dashboard_tour');
  };

  const handleSelectTemplate = (template: ResponseTemplate) => {
    // This would be handled by parent component to insert template into message
    console.log('Selected template:', template);
  };

  const handleConfirmMarkAsSold = () => {
    setShowMarkAsSoldGuidance(false);
    // Parent component handles the actual marking as sold
  };

  // Filter low view listings (less than 10 views after 24 hours)
  const needsAttention = lowViewListings.filter(
    (listing) => listing.views < 10 && listing.daysActive >= 1
  );

  return (
    <View style={styles.container}>
      {/* Dashboard Tour */}
      <DashboardTour
        visible={showTour}
        onDismiss={handleDismissTour}
        language={language}
      />

      {/* Low View Suggestions */}
      {needsAttention.length > 0 && (
        <LowViewSuggestions
          listings={needsAttention}
          onImprove={(id) => onEditPress?.(id)}
          onPromote={(id) => onPromotePress?.(id)}
          language={language}
        />
      )}

      {/* Response Templates Modal */}
      <ResponseTemplates
        visible={showResponseTemplates}
        onDismiss={() => setShowResponseTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
        language={language}
      />

      {/* Mark as Sold Guidance */}
      <MarkAsSoldGuidance
        visible={showMarkAsSoldGuidance}
        onDismiss={() => setShowMarkAsSoldGuidance(false)}
        onConfirm={handleConfirmMarkAsSold}
        language={language}
      />

      {/* Promotion Explanation */}
      <PromotionExplanation
        visible={showPromotionExplanation}
        onDismiss={() => setShowPromotionExplanation(false)}
        language={language}
      />

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowResponseTemplates(true)}
        >
          <MessageCircle size={24} color={Colors.primary} />
          <Text style={styles.actionTitle}>
            {language === 'en' ? 'Quick Responses' : 'Réponses rapides'}
          </Text>
          <Text style={styles.actionDescription}>
            {language === 'en' ? 'Use templates' : 'Utiliser des modèles'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowPromotionExplanation(true)}
        >
          <Sparkles size={24} color="#f59e0b" />
          <Text style={styles.actionTitle}>
            {language === 'en' ? 'Promotions' : 'Promotions'}
          </Text>
          <Text style={styles.actionDescription}>
            {language === 'en' ? 'Boost visibility' : 'Booster visibilité'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Tour Styles
  tourCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  tourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tourTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  tourSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  tourButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tourButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Low View Suggestions
  lowViewContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  lowViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  lowViewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#92400e',
  },
  lowViewCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lowViewInfo: {
    marginBottom: 12,
  },
  lowViewListingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  lowViewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lowViewStatText: {
    fontSize: 13,
    color: '#64748b',
  },
  lowViewDays: {
    fontSize: 13,
    color: '#64748b',
  },
  suggestionsList: {
    marginBottom: 12,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  suggestionItem: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 4,
  },
  lowViewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  improveButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  improveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  promoteButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Response Templates
  templatesCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  templatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  templatesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '600',
  },
  templatesList: {
    padding: 20,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  templateIcon: {
    fontSize: 24,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  templateText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },

  // Mark as Sold Guidance
  guidanceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  guidanceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  guidanceSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 22,
  },
  stepsList: {
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 18,
  },
  guidanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Promotion Explanation
  promotionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  promotionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  promotionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    lineHeight: 22,
  },
  promotionsList: {
    paddingHorizontal: 20,
  },
  promotionOption: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fde68a',
  },
  promotionOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  promotionIcon: {
    fontSize: 32,
  },
  promotionInfo: {
    flex: 1,
  },
  promotionOptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  promotionCost: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  promotionBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  promotionBenefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  promotionTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
  },
  promotionTipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  promotionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    margin: 20,
    marginTop: 0,
    alignItems: 'center',
  },
  promotionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SellerDashboardGuidance;
