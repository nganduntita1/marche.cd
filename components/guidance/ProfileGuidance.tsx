// Profile Management Guidance Component
// Provides guidance for profile completion, improvement suggestions, and tooltips

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Star, MapPin, Phone, Mail, CheckCircle, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Tooltip } from './Tooltip';

// ============================================================================
// PROFILE COMPLETENESS CALCULATOR
// ============================================================================

export interface ProfileCompletenessResult {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  suggestions: ProfileSuggestion[];
}

export interface ProfileSuggestion {
  id: string;
  field: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action?: () => void;
}

/**
 * Calculate profile completeness percentage
 * Returns a value between 0 and 100
 */
export const calculateProfileCompleteness = (
  user: any,
  ratingCount?: number
): ProfileCompletenessResult => {
  const fields = {
    name: { weight: 20, value: user?.name },
    phone: { weight: 15, value: user?.phone },
    location: { weight: 15, value: user?.location },
    profile_picture: { weight: 25, value: user?.profile_picture },
    email: { weight: 10, value: user?.email && !user.email.includes('@marchecd.com') },
    // Rating count indicates user has completed transactions
    rating_count: { weight: 15, value: (ratingCount || 0) > 0 },
  };

  let totalWeight = 0;
  let completedWeight = 0;
  const completedFields: string[] = [];
  const missingFields: string[] = [];

  Object.entries(fields).forEach(([fieldName, field]) => {
    totalWeight += field.weight;
    if (field.value) {
      completedWeight += field.weight;
      completedFields.push(fieldName);
    } else {
      missingFields.push(fieldName);
    }
  });

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Generate suggestions based on missing fields
  const suggestions = generateProfileSuggestions(missingFields, user);

  return {
    percentage,
    completedFields,
    missingFields,
    suggestions,
  };
};

/**
 * Generate improvement suggestions based on missing fields
 */
const generateProfileSuggestions = (
  missingFields: string[],
  user: any
): ProfileSuggestion[] => {
  const suggestions: ProfileSuggestion[] = [];

  if (missingFields.includes('profile_picture')) {
    suggestions.push({
      id: 'add_profile_picture',
      field: 'profile_picture',
      title: 'Ajoutez une photo de profil',
      description: 'Les profils avec photo reçoivent 3x plus de réponses',
      priority: 'high',
      icon: '📸',
    });
  }

  if (missingFields.includes('name')) {
    suggestions.push({
      id: 'add_name',
      field: 'name',
      title: 'Ajoutez votre nom',
      description: 'Votre nom aide à établir la confiance avec les autres utilisateurs',
      priority: 'high',
      icon: '👤',
    });
  }

  if (missingFields.includes('phone')) {
    suggestions.push({
      id: 'add_phone',
      field: 'phone',
      title: 'Ajoutez votre numéro de téléphone',
      description: 'Essentiel pour que les acheteurs puissent vous contacter',
      priority: 'high',
      icon: '📞',
    });
  }

  if (missingFields.includes('location')) {
    suggestions.push({
      id: 'add_location',
      field: 'location',
      title: 'Ajoutez votre ville',
      description: 'Aide les acheteurs à trouver des articles près d\'eux',
      priority: 'medium',
      icon: '📍',
    });
  }

  if (missingFields.includes('email')) {
    suggestions.push({
      id: 'add_email',
      field: 'email',
      title: 'Ajoutez votre email personnel',
      description: 'Recevez des notifications importantes par email',
      priority: 'low',
      icon: '✉️',
    });
  }

  if (missingFields.includes('rating_count')) {
    suggestions.push({
      id: 'complete_transaction',
      field: 'rating_count',
      title: 'Complétez votre première transaction',
      description: 'Les évaluations augmentent la confiance des acheteurs',
      priority: 'medium',
      icon: '⭐',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
};

// ============================================================================
// PROGRESS TRACKER COMPONENT
// ============================================================================

interface ProgressTrackerProps {
  percentage: number;
  showDetails?: boolean;
  onPress?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  percentage,
  showDetails = false,
  onPress,
}) => {
  const getProgressColor = () => {
    if (percentage >= 80) return '#22c55e'; // Green
    if (percentage >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getProgressMessage = () => {
    if (percentage >= 80) return 'Excellent profil !';
    if (percentage >= 50) return 'Bon début !';
    return 'Complétez votre profil';
  };

  return (
    <TouchableOpacity
      style={styles.progressTracker}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Profil complété</Text>
        <Text style={[styles.progressPercentage, { color: getProgressColor() }]}>
          {percentage}%
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      
      {showDetails && (
        <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// PROFILE IMPROVEMENT SUGGESTIONS COMPONENT
// ============================================================================

interface ProfileSuggestionsProps {
  suggestions: ProfileSuggestion[];
  onSuggestionPress?: (suggestion: ProfileSuggestion) => void;
}

export const ProfileSuggestions: React.FC<ProfileSuggestionsProps> = ({
  suggestions,
  onSuggestionPress,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  return (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Améliorez votre profil</Text>
      
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion.id}
          style={styles.suggestionCard}
          onPress={() => onSuggestionPress?.(suggestion)}
          activeOpacity={0.7}
        >
          <View style={styles.suggestionIcon}>
            <Text style={styles.suggestionIconText}>{suggestion.icon}</Text>
          </View>
          
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionDescription}>
              {suggestion.description}
            </Text>
          </View>
          
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(suggestion.priority) },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================================
// PROFILE PHOTO TIPS COMPONENT
// ============================================================================

interface ProfilePhotoTipsProps {
  visible: boolean;
  onDismiss: () => void;
}

export const ProfilePhotoTips: React.FC<ProfilePhotoTipsProps> = ({
  visible,
  onDismiss,
}) => {
  const tips = [
    {
      icon: '💡',
      title: 'Bon éclairage',
      description: 'Prenez la photo en plein jour ou dans un endroit bien éclairé',
    },
    {
      icon: '😊',
      title: 'Visage clair',
      description: 'Assurez-vous que votre visage est clairement visible',
    },
    {
      icon: '🎯',
      title: 'Photo récente',
      description: 'Utilisez une photo récente qui vous ressemble',
    },
    {
      icon: '👔',
      title: 'Apparence professionnelle',
      description: 'Une apparence soignée inspire confiance',
    },
    {
      icon: '🚫',
      title: 'Évitez',
      description: 'Pas de photos de groupe, floues ou avec des lunettes de soleil',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📸 Conseils pour votre photo</Text>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.modalButton} onPress={onDismiss}>
            <Text style={styles.modalButtonText}>Compris</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// RATINGS EXPLANATION COMPONENT
// ============================================================================

interface RatingsExplanationProps {
  visible: boolean;
  onDismiss: () => void;
  userRating?: number;
  ratingCount?: number;
}

export const RatingsExplanation: React.FC<RatingsExplanationProps> = ({
  visible,
  onDismiss,
  userRating = 0,
  ratingCount = 0,
}) => {
  const getRatingMessage = () => {
    if (ratingCount === 0) {
      return 'Vous n\'avez pas encore d\'évaluations. Complétez votre première transaction pour recevoir votre première note !';
    }
    if (userRating >= 4.5) {
      return 'Excellent ! Vous avez une très bonne réputation. Continuez comme ça !';
    }
    if (userRating >= 3.5) {
      return 'Bon travail ! Continuez à fournir un excellent service pour améliorer votre note.';
    }
    return 'Votre note peut être améliorée. Soyez ponctuel, honnête et professionnel dans vos transactions.';
  };

  const ratingTips = [
    {
      icon: '⏰',
      title: 'Soyez ponctuel',
      description: 'Respectez les horaires de rendez-vous convenus',
    },
    {
      icon: '💬',
      title: 'Communiquez clairement',
      description: 'Répondez rapidement et soyez transparent',
    },
    {
      icon: '📸',
      title: 'Photos précises',
      description: 'Montrez l\'état réel de vos articles',
    },
    {
      icon: '🤝',
      title: 'Soyez professionnel',
      description: 'Traitez les autres avec respect et courtoisie',
    },
    {
      icon: '✅',
      title: 'Honnêteté',
      description: 'Décrivez vos articles de manière honnête et complète',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⭐ Système d'évaluation</Text>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {ratingCount > 0 && (
              <View style={styles.currentRatingCard}>
                <View style={styles.ratingDisplay}>
                  <Star size={32} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingValue}>{userRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.ratingCount}>
                  Basé sur {ratingCount} évaluation{ratingCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            <Text style={styles.ratingMessage}>{getRatingMessage()}</Text>
            
            <Text style={styles.tipsTitle}>Comment améliorer votre note :</Text>
            
            {ratingTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Les évaluations sont laissées par les acheteurs et vendeurs après chaque transaction.
                Une bonne note augmente la confiance et aide à vendre plus rapidement !
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.modalButton} onPress={onDismiss}>
            <Text style={styles.modalButtonText}>Compris</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN PROFILE GUIDANCE COMPONENT
// ============================================================================

interface ProfileGuidanceProps {
  onEditProfile?: () => void;
  userRating?: number;
  ratingCount?: number;
}

export const ProfileGuidance: React.FC<ProfileGuidanceProps> = ({
  onEditProfile,
  userRating = 0,
  ratingCount = 0,
}) => {
  const { user } = useAuth();
  const { state, shouldShowTooltip, markTooltipDismissed, incrementScreenView } = useGuidance();
  
  const [completeness, setCompleteness] = useState<ProfileCompletenessResult>({
    percentage: 0,
    completedFields: [],
    missingFields: [],
    suggestions: [],
  });
  
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const [showRatingsExplanation, setShowRatingsExplanation] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    // Track screen view
    incrementScreenView('profile');
    
    // Calculate profile completeness
    if (user) {
      const result = calculateProfileCompleteness(user, ratingCount);
      setCompleteness(result);
    }
  }, [user, ratingCount]);

  // Show profile completeness tooltip on first visit
  useEffect(() => {
    if (shouldShowTooltip('profile_completeness') && completeness.percentage < 80) {
      setActiveTooltip('profile_completeness');
    }
  }, [completeness.percentage]);

  const handleTooltipDismiss = (tooltipId: string) => {
    markTooltipDismissed(tooltipId);
    setActiveTooltip(null);
  };

  const handleSuggestionPress = (suggestion: ProfileSuggestion) => {
    if (suggestion.field === 'profile_picture') {
      setShowPhotoTips(true);
    } else if (onEditProfile) {
      onEditProfile();
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Tracker */}
      {completeness.percentage < 100 && (
        <ProgressTracker
          percentage={completeness.percentage}
          showDetails
          onPress={() => {
            if (shouldShowTooltip('profile_progress_info')) {
              setActiveTooltip('profile_progress_info');
            }
          }}
        />
      )}
      
      {/* Profile Improvement Suggestions */}
      {completeness.suggestions.length > 0 && (
        <ProfileSuggestions
          suggestions={completeness.suggestions}
          onSuggestionPress={handleSuggestionPress}
        />
      )}
      
      {/* Profile Photo Tips Modal */}
      <ProfilePhotoTips
        visible={showPhotoTips}
        onDismiss={() => setShowPhotoTips(false)}
      />
      
      {/* Ratings Explanation Modal */}
      <RatingsExplanation
        visible={showRatingsExplanation}
        onDismiss={() => setShowRatingsExplanation(false)}
        userRating={userRating}
        ratingCount={ratingCount}
      />
      
      {/* Tooltips */}
      {activeTooltip === 'profile_completeness' && (
        <Tooltip
          content={{
            id: 'profile_completeness',
            title: 'Complétez votre profil',
            message: 'Un profil complet inspire confiance et vous aide à vendre plus rapidement. Visez au moins 80% !',
            placement: 'bottom',
            icon: '✨',
            dismissLabel: 'Compris',
          }}
          visible={true}
          onDismiss={() => handleTooltipDismiss('profile_completeness')}
        />
      )}
      
      {activeTooltip === 'profile_progress_info' && (
        <Tooltip
          content={{
            id: 'profile_progress_info',
            title: 'Votre progression',
            message: 'Chaque champ complété augmente votre score. Les profils à 100% reçoivent 5x plus de réponses !',
            placement: 'bottom',
            icon: '📊',
            dismissLabel: 'OK',
          }}
          visible={true}
          onDismiss={() => handleTooltipDismiss('profile_progress_info')}
        />
      )}
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
  
  // Progress Tracker Styles
  progressTracker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  
  // Suggestions Styles
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIconText: {
    fontSize: 24,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Tip Card Styles
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  
  // Rating Styles
  currentRatingCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  ratingCount: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  ratingMessage: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 18,
  },
});

export default ProfileGuidance;
