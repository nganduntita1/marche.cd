// Search and Filter Guidance Component
// Provides contextual guidance for search and filter features
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Tooltip } from './Tooltip';
import { ContextualPrompt } from './ContextualPrompt';
import { GuidedTour } from './GuidedTour';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface SearchFilterGuidanceProps {
  // Search state
  searchQuery: string;
  hasSearchResults: boolean;
  resultsCount: number;
  
  // Filter state
  isFilterPanelOpen: boolean;
  selectedCategory: string | null;
  priceRange: { min: string; max: string };
  searchRadius: number | null;
  
  // Refs for targeting tooltips
  searchInputRef?: React.RefObject<any>;
  filterButtonRef?: React.RefObject<any>;
  priceFilterRef?: React.RefObject<any>;
  locationFilterRef?: React.RefObject<any>;
  
  // Callbacks
  onSearchFocus?: () => void;
  onFilterOpen?: () => void;
}

export const SearchFilterGuidance: React.FC<SearchFilterGuidanceProps> = ({
  searchQuery,
  hasSearchResults,
  resultsCount,
  isFilterPanelOpen,
  selectedCategory,
  priceRange,
  searchRadius,
  searchInputRef,
  filterButtonRef,
  priceFilterRef,
  locationFilterRef,
  onSearchFocus,
  onFilterOpen,
}) => {
  const guidance = useGuidance();
  const { i18n } = useTranslation();
  const isFrench = (i18n.resolvedLanguage || i18n.language || 'fr').toLowerCase().startsWith('fr');
  
  // Tooltip visibility states
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [showFilterPanelTour, setShowFilterPanelTour] = useState(false);
  const [showLocationFilterTooltip, setShowLocationFilterTooltip] = useState(false);
  const [showNoResultsPrompt, setShowNoResultsPrompt] = useState(false);
  const [showPriceFeedback, setShowPriceFeedback] = useState(false);
  
  // Track if user has interacted with search
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  
  // Price feedback animation
  const priceFeedbackOpacity = useRef(new Animated.Value(0)).current;
  
  // Initialize search guidance on mount
  useEffect(() => {
    const initializeGuidance = async () => {
      // Show search tooltip if user hasn't seen it
      if (guidance.shouldShowTooltip('search_bar_tips')) {
        setTimeout(() => {
          setShowSearchTooltip(true);
        }, 1000);
      }
    };
    
    initializeGuidance();
  }, []);
  
  // Handle search query changes
  useEffect(() => {
    if (searchQuery && searchQuery !== lastSearchQuery) {
      setHasSearched(true);
      setLastSearchQuery(searchQuery);
      
      // Hide search tooltip when user starts searching
      if (showSearchTooltip) {
        setShowSearchTooltip(false);
        guidance.markTooltipDismissed('search_bar_tips');
      }
    }
  }, [searchQuery]);
  
  // Handle no results scenario (Requirement 8.2)
  useEffect(() => {
    if (hasSearched && searchQuery && !hasSearchResults) {
      // Show no results prompt after a short delay
      const timer = setTimeout(() => {
        if (guidance.shouldShowPrompt('search_no_results')) {
          setShowNoResultsPrompt(true);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setShowNoResultsPrompt(false);
    }
  }, [hasSearched, searchQuery, hasSearchResults]);
  
  // Handle filter panel opening (Requirement 8.3)
  useEffect(() => {
    if (isFilterPanelOpen && guidance.shouldShowTour('filter_panel_tour')) {
      // Show filter panel tour when opened for the first time
      setTimeout(() => {
        setShowFilterPanelTour(true);
      }, 300);
    }
  }, [isFilterPanelOpen]);
  
  // Handle location filter tooltip (Requirement 8.4)
  useEffect(() => {
    if (isFilterPanelOpen && guidance.shouldShowTooltip('location_filter_explanation')) {
      setTimeout(() => {
        setShowLocationFilterTooltip(true);
      }, 1000);
    }
  }, [isFilterPanelOpen]);
  
  // Real-time price filter feedback (Requirement 8.5)
  useEffect(() => {
    if (priceRange.min || priceRange.max) {
      setShowPriceFeedback(true);
      
      // Animate feedback appearance
      Animated.sequence([
        Animated.timing(priceFeedbackOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(priceFeedbackOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPriceFeedback(false);
      });
    }
  }, [priceRange.min, priceRange.max]);
  
  // Get search tooltip content
  const getSearchTooltipContent = () => {
    return {
      id: 'search_bar_tips',
      title: isFrench ? 'Conseils de recherche' : 'Search Tips',
      message: isFrench
        ? 'Recherchez par nom d\'article, marque, ou catégorie. Essayez "Samsung", "meubles", ou "vélo" !'
        : 'Search by item name, brand, or category. Try "Samsung", "furniture", or "bike"!',
      placement: 'bottom' as const,
      icon: '🔍',
      dismissLabel: isFrench ? 'Compris' : 'Got it',
    };
  };
  
  // Get no results suggestions
  const getNoResultsSuggestions = () => {
    const suggestions = isFrench ? [
      'Essayez des mots-clés plus généraux',
      'Vérifiez l\'orthographe',
      'Supprimez les filtres actifs',
      'Élargissez votre rayon de recherche',
    ] : [
      'Try more general keywords',
      'Check your spelling',
      'Remove active filters',
      'Expand your search radius',
    ];
    
    return suggestions;
  };
  
  // Get filter panel tour
  const getFilterPanelTour = () => {
    return {
      id: 'filter_panel_tour',
      name: isFrench ? 'Visite du panneau de filtres' : 'Filter Panel Tour',
      steps: [
        {
          id: 'filter_step_1',
          title: isFrench ? 'Filtres de recherche 🎯' : 'Search Filters 🎯',
          message: isFrench
            ? 'Utilisez ces filtres pour affiner votre recherche et trouver exactement ce que vous cherchez !'
            : 'Use these filters to refine your search and find exactly what you\'re looking for!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: isFrench ? 'Montrez-moi' : 'Show me',
          skipLabel: isFrench ? 'Passer' : 'Skip',
        },
        {
          id: 'filter_step_2',
          title: isFrench ? 'Fourchette de prix' : 'Price Range',
          message: isFrench
            ? 'Définissez un prix minimum et maximum pour voir uniquement les articles dans votre budget.'
            : 'Set a minimum and maximum price to see only items within your budget.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: isFrench ? 'Suivant' : 'Next',
        },
        {
          id: 'filter_step_3',
          title: isFrench ? 'Trier les résultats' : 'Sort Results',
          message: isFrench
            ? 'Triez par prix (croissant/décroissant) ou par date pour voir les annonces les plus récentes.'
            : 'Sort by price (low/high) or by date to see the newest listings first.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: isFrench ? 'Compris' : 'Got it',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'filter_panel' },
      },
    };
  };
  
  // Get location filter tooltip
  const getLocationFilterTooltip = () => {
    return {
      id: 'location_filter_explanation',
      title: isFrench ? 'Filtre de distance' : 'Distance Filter',
      message: isFrench
        ? 'Choisissez un rayon de recherche pour voir les articles à proximité. Plus le rayon est petit, plus les résultats sont proches !'
        : 'Choose a search radius to see items nearby. The smaller the radius, the closer the results!',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: isFrench ? 'Compris' : 'Got it',
    };
  };
  
  // Get price feedback message
  const getPriceFeedbackMessage = () => {
    const min = priceRange.min ? `$${priceRange.min}` : 'Min';
    const max = priceRange.max ? `$${priceRange.max}` : 'Max';
    
    if (priceRange.min && priceRange.max) {
      return isFrench
        ? `Affichage des articles entre ${min} et ${max} • ${resultsCount} résultat${resultsCount !== 1 ? 's' : ''}`
        : `Showing items between ${min} and ${max} • ${resultsCount} result${resultsCount !== 1 ? 's' : ''}`;
    } else if (priceRange.min) {
      return isFrench
        ? `Affichage des articles à partir de ${min} • ${resultsCount} résultat${resultsCount !== 1 ? 's' : ''}`
        : `Showing items from ${min} • ${resultsCount} result${resultsCount !== 1 ? 's' : ''}`;
    } else if (priceRange.max) {
      return isFrench
        ? `Affichage des articles jusqu'à ${max} • ${resultsCount} résultat${resultsCount !== 1 ? 's' : ''}`
        : `Showing items up to ${max} • ${resultsCount} result${resultsCount !== 1 ? 's' : ''}`;
    }
    
    return '';
  };
  
  return (
    <View style={styles.container}>
      {/* Search Bar Tooltip (Requirement 8.1) */}
      {showSearchTooltip && searchInputRef && (
        <Tooltip
          content={getSearchTooltipContent()}
          targetRef={searchInputRef}
          visible={showSearchTooltip}
          onDismiss={async () => {
            await guidance.markTooltipDismissed('search_bar_tips');
            setShowSearchTooltip(false);
          }}
          onAction={async () => {
            await guidance.markTooltipDismissed('search_bar_tips');
            setShowSearchTooltip(false);
            onSearchFocus?.();
          }}
        />
      )}
      
      {/* No Results Prompt (Requirement 8.2) */}
      {showNoResultsPrompt && (
        <ContextualPrompt
          message={
            isFrench
              ? `Aucun résultat pour "${searchQuery}". Essayez ces suggestions :`
              : `No results for "${searchQuery}". Try these suggestions:`
          }
          actions={getNoResultsSuggestions().map((suggestion, index) => ({
            label: suggestion,
            onPress: async () => {
              // Handle suggestion action based on index
              if (index === 2) {
                // Remove filters suggestion
                // This would be handled by parent component
              } else if (index === 3) {
                // Expand radius suggestion
                // This would be handled by parent component
              }
              await guidance.markTooltipDismissed('search_no_results');
              setShowNoResultsPrompt(false);
            },
          }))}
          visible={showNoResultsPrompt}
          onDismiss={async () => {
            await guidance.markTooltipDismissed('search_no_results');
            setShowNoResultsPrompt(false);
          }}
          icon="search-outline"
        />
      )}
      
      {/* Filter Panel Tour (Requirement 8.3) */}
      {showFilterPanelTour && (
        <GuidedTour
          tour={getFilterPanelTour()}
          visible={showFilterPanelTour}
          onComplete={async () => {
            await guidance.markTourCompleted('filter_panel_tour');
            setShowFilterPanelTour(false);
            
            // Show location filter tooltip after tour
            if (guidance.shouldShowTooltip('location_filter_explanation')) {
              setTimeout(() => {
                setShowLocationFilterTooltip(true);
              }, 500);
            }
          }}
          onSkip={async () => {
            await guidance.markTourCompleted('filter_panel_tour');
            setShowFilterPanelTour(false);
          }}
        />
      )}
      
      {/* Location Filter Tooltip (Requirement 8.4) */}
      {showLocationFilterTooltip && locationFilterRef && (
        <Tooltip
          content={getLocationFilterTooltip()}
          targetRef={locationFilterRef}
          visible={showLocationFilterTooltip}
          onDismiss={async () => {
            await guidance.markTooltipDismissed('location_filter_explanation');
            setShowLocationFilterTooltip(false);
          }}
        />
      )}
      
      {/* Real-time Price Filter Feedback (Requirement 8.5) */}
      {showPriceFeedback && (
        <Animated.View
          style={[
            styles.priceFeedback,
            { opacity: priceFeedbackOpacity },
          ]}
        >
          <View style={styles.priceFeedbackContent}>
            <Ionicons name="pricetag" size={16} color={Colors.primary} />
            <Text style={styles.priceFeedbackText}>
              {getPriceFeedbackMessage()}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  priceFeedback: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  priceFeedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  priceFeedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default SearchFilterGuidance;
