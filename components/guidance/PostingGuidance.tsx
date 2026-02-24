import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Sparkles, Camera, FileText, DollarSign, MapPin, CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { TextStyles } from '@/constants/Typography';

interface PostingGuidanceProps {
  // Form state
  title: string;
  description: string;
  price: string;
  images: string[];
  category: string;
  city: string;
  
  // Callbacks
  onFieldFocus?: (field: 'title' | 'description' | 'price' | 'category' | 'location' | 'photos') => void;
  onFirstListingSuccess?: () => void;
}

export interface PostingGuidanceHandle {
  triggerSuccessCelebration: () => void;
}

export const PostingGuidance = forwardRef<PostingGuidanceHandle, PostingGuidanceProps>(({
  title,
  description,
  price,
  images,
  category,
  city,
  onFieldFocus,
  onFirstListingSuccess,
}, ref) => {
  const { state, shouldShowTooltip, markTooltipDismissed, shouldShowTour, markTourCompleted } = useGuidance();
  
  const [showOverview, setShowOverview] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [showDescriptionTemplate, setShowDescriptionTemplate] = useState(false);
  const [showCategoryTip, setShowCategoryTip] = useState(false);
  const [showValidationFeedback, setShowValidationFeedback] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const photoPromptAnim = useRef(new Animated.Value(0)).current;

  // Show posting overview on first visit
  useEffect(() => {
    if (shouldShowTour('post_overview_tour')) {
      setShowOverview(true);
    }
  }, []);

  // Show photo prompt when less than 3 photos
  useEffect(() => {
    if (images.length > 0 && images.length < 3 && shouldShowTooltip('post_photo_count_prompt')) {
      setShowPhotoPrompt(true);
      Animated.spring(photoPromptAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      setShowPhotoPrompt(false);
      photoPromptAnim.setValue(0);
    }
  }, [images.length]);

  // Show category-specific tips when category is selected
  useEffect(() => {
    if (category && shouldShowTooltip(`post_category_tip_${category}`)) {
      setShowCategoryTip(true);
    }
  }, [category]);

  // Trigger first listing success celebration
  const triggerSuccessCelebration = () => {
    if (!state?.features.hasPostedFirstListing) {
      setShowSuccessCelebration(true);
      Animated.sequence([
        Animated.spring(celebrationAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.delay(3000),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessCelebration(false);
        onFirstListingSuccess?.();
      });
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    triggerSuccessCelebration,
  }));

  // Get description template based on category
  const getDescriptionTemplate = (category: string): string => {
    const templates: Record<string, { en: string; fr: string }> = {
      telephones: {
        en: `📱 Condition: [New/Like New/Good/Fair]
💾 Storage: [e.g., 128GB]
🎨 Color: [e.g., Black]
📦 Includes: [e.g., Charger, Box, Earphones]
⚠️ Issues: [None/Describe any issues]
📍 Reason for selling: [Optional]`,
        fr: `📱 État : [Neuf/Comme neuf/Bon/Correct]
💾 Stockage : [ex: 128GB]
🎨 Couleur : [ex: Noir]
📦 Inclus : [ex: Chargeur, Boîte, Écouteurs]
⚠️ Problèmes : [Aucun/Décrire les problèmes]
📍 Raison de la vente : [Optionnel]`,
      },
      vehicules: {
        en: `🚗 Year: [e.g., 2018]
⚙️ Mileage: [e.g., 50,000 km]
⛽ Fuel Type: [Petrol/Diesel/Electric]
🔧 Condition: [Excellent/Good/Fair]
📋 Service History: [Yes/No]
⚠️ Issues: [None/Describe any issues]`,
        fr: `🚗 Année : [ex: 2018]
⚙️ Kilométrage : [ex: 50 000 km]
⛽ Type de carburant : [Essence/Diesel/Électrique]
🔧 État : [Excellent/Bon/Correct]
📋 Historique d'entretien : [Oui/Non]
⚠️ Problèmes : [Aucun/Décrire les problèmes]`,
      },
      electronique: {
        en: `💻 Brand & Model: [e.g., Dell XPS 15]
📅 Age: [e.g., 1 year old]
⚡ Condition: [New/Like New/Good/Fair]
📦 Includes: [e.g., Charger, Box, Accessories]
⚠️ Issues: [None/Describe any issues]
🔋 Battery Health: [If applicable]`,
        fr: `💻 Marque & Modèle : [ex: Dell XPS 15]
📅 Âge : [ex: 1 an]
⚡ État : [Neuf/Comme neuf/Bon/Correct]
📦 Inclus : [ex: Chargeur, Boîte, Accessoires]
⚠️ Problèmes : [Aucun/Décrire les problèmes]
🔋 Santé de la batterie : [Si applicable]`,
      },
      default: {
        en: `📝 Condition: [New/Like New/Good/Fair]
📦 What's Included: [List items]
⚠️ Any Issues: [None/Describe any issues]
📍 Reason for Selling: [Optional]
💡 Additional Details: [Any other important information]`,
        fr: `📝 État : [Neuf/Comme neuf/Bon/Correct]
📦 Ce qui est inclus : [Lister les articles]
⚠️ Problèmes : [Aucun/Décrire les problèmes]
📍 Raison de la vente : [Optionnel]
💡 Détails supplémentaires : [Toute autre information importante]`,
      },
    };

    const language = state?.settings.language || 'fr';
    return templates[category]?.[language] || templates.default[language];
  };

  // Get category-specific tips
  const getCategoryTip = (category: string): string => {
    const tips: Record<string, { en: string; fr: string }> = {
      telephones: {
        en: '📱 Tip: Include IMEI number, battery health, and any screen protectors or cases!',
        fr: '📱 Astuce : Incluez le numéro IMEI, l\'état de la batterie et les protections d\'écran ou coques !',
      },
      vehicules: {
        en: '🚗 Tip: Mention recent maintenance, tire condition, and if papers are up to date!',
        fr: '🚗 Astuce : Mentionnez l\'entretien récent, l\'état des pneus et si les papiers sont à jour !',
      },
      electronique: {
        en: '💻 Tip: Specify RAM, processor, and storage. Mention if warranty is still valid!',
        fr: '💻 Astuce : Précisez la RAM, le processeur et le stockage. Mentionnez si la garantie est valide !',
      },
      'maison-jardin': {
        en: '🏠 Tip: Include dimensions, material, and condition. Photos from multiple angles help!',
        fr: '🏠 Astuce : Incluez les dimensions, le matériau et l\'état. Des photos sous plusieurs angles aident !',
      },
      'mode-beaute': {
        en: '👗 Tip: Mention size, brand, and if items have been worn. Original tags add value!',
        fr: '👗 Astuce : Mentionnez la taille, la marque et si les articles ont été portés. Les étiquettes originales ajoutent de la valeur !',
      },
    };

    const language = state?.settings.language || 'fr';
    return tips[category]?.[language] || '';
  };

  // Get validation feedback
  const getValidationFeedback = () => {
    const missing: string[] = [];
    const language = state?.settings.language || 'fr';

    if (!title) missing.push(language === 'en' ? 'Title' : 'Titre');
    if (!category) missing.push(language === 'en' ? 'Category' : 'Catégorie');
    if (!description) missing.push(language === 'en' ? 'Description' : 'Description');
    if (!price) missing.push(language === 'en' ? 'Price' : 'Prix');
    if (images.length === 0) missing.push(language === 'en' ? 'At least 1 photo' : 'Au moins 1 photo');
    if (!city) missing.push(language === 'en' ? 'City' : 'Ville');

    return missing;
  };

  const handleDismissOverview = () => {
    setShowOverview(false);
    markTourCompleted('post_overview_tour');
  };

  const handleDismissPhotoPrompt = () => {
    setShowPhotoPrompt(false);
    markTooltipDismissed('post_photo_count_prompt');
  };

  const handleUseTemplate = () => {
    setShowDescriptionTemplate(false);
    // This would be handled by parent component
  };

  const handleDismissCategoryTip = () => {
    setShowCategoryTip(false);
    if (category) {
      markTooltipDismissed(`post_category_tip_${category}`);
    }
  };

  return (
    <>
      {/* Posting Process Overview Modal */}
      <Modal
        visible={showOverview}
        transparent
        animationType="fade"
        onRequestClose={handleDismissOverview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Sparkles size={32} color={Colors.primary} />
              <Text style={styles.overviewTitle}>
                {state?.settings.language === 'en' ? 'Create Your Listing' : 'Créer votre annonce'}
              </Text>
            </View>
            
            <Text style={styles.overviewSubtitle}>
              {state?.settings.language === 'en' 
                ? 'Follow these steps to create an attractive listing:' 
                : 'Suivez ces étapes pour créer une annonce attractive :'}
            </Text>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {state?.settings.language === 'en' ? '📸 Add Photos' : '📸 Ajouter des photos'}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {state?.settings.language === 'en' 
                      ? 'Add 3-5 clear photos from different angles' 
                      : 'Ajoutez 3-5 photos claires sous différents angles'}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {state?.settings.language === 'en' ? '✏️ Write Details' : '✏️ Écrire les détails'}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {state?.settings.language === 'en' 
                      ? 'Add a clear title, category, and detailed description' 
                      : 'Ajoutez un titre clair, une catégorie et une description détaillée'}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {state?.settings.language === 'en' ? '💰 Set Price' : '💰 Fixer le prix'}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {state?.settings.language === 'en' 
                      ? 'Check similar items and set a competitive price' 
                      : 'Vérifiez les articles similaires et fixez un prix compétitif'}
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {state?.settings.language === 'en' ? '📍 Add Location' : '📍 Ajouter la localisation'}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {state?.settings.language === 'en' 
                      ? 'Set your city to help buyers find your item' 
                      : 'Définissez votre ville pour aider les acheteurs à trouver votre article'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.estimatedTime}>
              {state?.settings.language === 'en' 
                ? '⏱️ Estimated time: 3-5 minutes' 
                : '⏱️ Temps estimé : 3-5 minutes'}
            </Text>

            <TouchableOpacity style={styles.overviewButton} onPress={handleDismissOverview}>
              <Text style={styles.overviewButtonText}>
                {state?.settings.language === 'en' ? 'Got it, let\'s start!' : 'Compris, commençons !'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Count Prompt */}
      {showPhotoPrompt && (
        <Animated.View 
          style={[
            styles.photoPrompt,
            {
              transform: [{
                translateY: photoPromptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              }],
              opacity: photoPromptAnim,
            },
          ]}
        >
          <View style={styles.promptContent}>
            <Camera size={24} color={Colors.primary} />
            <View style={styles.promptText}>
              <Text style={styles.promptTitle}>
                {state?.settings.language === 'en' ? 'Add more photos!' : 'Ajoutez plus de photos !'}
              </Text>
              <Text style={styles.promptMessage}>
                {state?.settings.language === 'en' 
                  ? `You have ${images.length} photo${images.length !== 1 ? 's' : ''}. Add ${3 - images.length} more to attract buyers!` 
                  : `Vous avez ${images.length} photo${images.length !== 1 ? 's' : ''}. Ajoutez ${3 - images.length} de plus pour attirer les acheteurs !`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDismissPhotoPrompt}>
              <Text style={styles.promptDismiss}>✕</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Category-Specific Tip */}
      {showCategoryTip && category && getCategoryTip(category) && (
        <View style={styles.categoryTip}>
          <View style={styles.tipContent}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{getCategoryTip(category)}</Text>
            <TouchableOpacity onPress={handleDismissCategoryTip}>
              <Text style={styles.tipDismiss}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Success Celebration */}
      {showSuccessCelebration && (
        <Modal transparent visible={showSuccessCelebration}>
          <View style={styles.celebrationOverlay}>
            <Animated.View 
              style={[
                styles.celebrationCard,
                {
                  transform: [{
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  }],
                  opacity: celebrationAnim,
                },
              ]}
            >
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationTitle}>
                {state?.settings.language === 'en' ? 'Congratulations!' : 'Félicitations !'}
              </Text>
              <Text style={styles.celebrationMessage}>
                {state?.settings.language === 'en' 
                  ? 'Your first listing is now live! Buyers can now see and contact you about this item.' 
                  : 'Votre première annonce est maintenant en ligne ! Les acheteurs peuvent maintenant voir et vous contacter à propos de cet article.'}
              </Text>
              <View style={styles.celebrationBadge}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.celebrationBadgeText}>
                  {state?.settings.language === 'en' ? 'First Listing Posted' : 'Première annonce publiée'}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Overview Card
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  overviewSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },

  // Steps List
  stepsList: {
    gap: 16,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // Estimated Time
  estimatedTime: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },

  // Overview Button
  overviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  overviewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Photo Prompt
  photoPrompt: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promptText: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  promptMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  promptDismiss: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // Category Tip
  categoryTip: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  tipDismiss: {
    fontSize: 18,
    color: '#86efac',
    fontWeight: '600',
  },

  // Success Celebration
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  celebrationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  celebrationMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  celebrationBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});

PostingGuidance.displayName = 'PostingGuidance';

export default PostingGuidance;
