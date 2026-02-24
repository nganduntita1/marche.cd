// Achievement Service
// Manages achievement definitions, progress tracking, and milestone detection

import { Achievement, GuidanceState, ProgressStep } from '../types/guidance';

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Record<string, { en: Achievement; fr: Achievement }> = {
  // Onboarding Achievements
  welcome_aboard: {
    en: {
      id: 'welcome_aboard',
      title: 'Welcome Aboard! 🎉',
      description: 'Created your account and joined Marché.cd',
      icon: '👋',
      category: 'onboarding',
      completed: false,
    },
    fr: {
      id: 'welcome_aboard',
      title: 'Bienvenue à bord ! 🎉',
      description: 'Créé votre compte et rejoint Marché.cd',
      icon: '👋',
      category: 'onboarding',
      completed: false,
    },
  },

  profile_complete: {
    en: {
      id: 'profile_complete',
      title: 'Profile Master',
      description: 'Completed your profile with all details',
      icon: '✨',
      category: 'onboarding',
      completed: false,
      reward: 'Increased trust with buyers and sellers',
    },
    fr: {
      id: 'profile_complete',
      title: 'Maître du profil',
      description: 'Complété votre profil avec tous les détails',
      icon: '✨',
      category: 'onboarding',
      completed: false,
      reward: 'Confiance accrue avec les acheteurs et vendeurs',
    },
  },

  first_listing_view: {
    en: {
      id: 'first_listing_view',
      title: 'Window Shopping',
      description: 'Viewed your first listing',
      icon: '👀',
      category: 'buyer',
      completed: false,
    },
    fr: {
      id: 'first_listing_view',
      title: 'Lèche-vitrine',
      description: 'Consulté votre première annonce',
      icon: '👀',
      category: 'buyer',
      completed: false,
    },
  },

  first_message: {
    en: {
      id: 'first_message',
      title: 'Breaking the Ice',
      description: 'Sent your first message to a seller',
      icon: '💬',
      category: 'social',
      completed: false,
    },
    fr: {
      id: 'first_message',
      title: 'Briser la glace',
      description: 'Envoyé votre premier message à un vendeur',
      icon: '💬',
      category: 'social',
      completed: false,
    },
  },

  first_favorite: {
    en: {
      id: 'first_favorite',
      title: 'Wishlist Started',
      description: 'Saved your first item to favorites',
      icon: '❤️',
      category: 'buyer',
      completed: false,
    },
    fr: {
      id: 'first_favorite',
      title: 'Liste de souhaits commencée',
      description: 'Sauvegardé votre premier article en favoris',
      icon: '❤️',
      category: 'buyer',
      completed: false,
    },
  },

  first_listing_posted: {
    en: {
      id: 'first_listing_posted',
      title: 'First Sale! 🎊',
      description: 'Posted your first listing',
      icon: '📦',
      category: 'seller',
      completed: false,
      reward: 'You\'re now a seller on Marché.cd!',
    },
    fr: {
      id: 'first_listing_posted',
      title: 'Première vente ! 🎊',
      description: 'Publié votre première annonce',
      icon: '📦',
      category: 'seller',
      completed: false,
      reward: 'Vous êtes maintenant vendeur sur Marché.cd !',
    },
  },

  search_master: {
    en: {
      id: 'search_master',
      title: 'Search Master',
      description: 'Used search and filters to find items',
      icon: '🔍',
      category: 'buyer',
      completed: false,
    },
    fr: {
      id: 'search_master',
      title: 'Maître de la recherche',
      description: 'Utilisé la recherche et les filtres pour trouver des articles',
      icon: '🔍',
      category: 'buyer',
      completed: false,
    },
  },

  five_star_seller: {
    en: {
      id: 'five_star_seller',
      title: '5-Star Seller ⭐',
      description: 'Received your first 5-star rating',
      icon: '⭐',
      category: 'milestone',
      completed: false,
      reward: 'Boost in listing visibility',
    },
    fr: {
      id: 'five_star_seller',
      title: 'Vendeur 5 étoiles ⭐',
      description: 'Reçu votre première note de 5 étoiles',
      icon: '⭐',
      category: 'milestone',
      completed: false,
      reward: 'Augmentation de la visibilité des annonces',
    },
  },

  onboarding_complete: {
    en: {
      id: 'onboarding_complete',
      title: 'Marché.cd Expert! 🏆',
      description: 'Completed all onboarding steps',
      icon: '🏆',
      category: 'milestone',
      completed: false,
      reward: 'Unlocked all features',
    },
    fr: {
      id: 'onboarding_complete',
      title: 'Expert Marché.cd ! 🏆',
      description: 'Complété toutes les étapes d\'intégration',
      icon: '🏆',
      category: 'milestone',
      completed: false,
      reward: 'Toutes les fonctionnalités débloquées',
    },
  },

  social_butterfly: {
    en: {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Exchanged 10 messages with other users',
      icon: '🦋',
      category: 'social',
      completed: false,
      progress: 0,
      maxProgress: 10,
    },
    fr: {
      id: 'social_butterfly',
      title: 'Papillon social',
      description: 'Échangé 10 messages avec d\'autres utilisateurs',
      icon: '🦋',
      category: 'social',
      completed: false,
      progress: 0,
      maxProgress: 10,
    },
  },

  power_seller: {
    en: {
      id: 'power_seller',
      title: 'Power Seller',
      description: 'Posted 5 listings',
      icon: '💪',
      category: 'seller',
      completed: false,
      progress: 0,
      maxProgress: 5,
    },
    fr: {
      id: 'power_seller',
      title: 'Super vendeur',
      description: 'Publié 5 annonces',
      icon: '💪',
      category: 'seller',
      completed: false,
      progress: 0,
      maxProgress: 5,
    },
  },
};

// ============================================================================
// ONBOARDING STEPS DEFINITION
// ============================================================================

export const ONBOARDING_STEPS: Record<string, { en: ProgressStep; fr: ProgressStep }> = {
  create_account: {
    en: {
      id: 'create_account',
      label: 'Create Account',
      completed: false,
    },
    fr: {
      id: 'create_account',
      label: 'Créer un compte',
      completed: false,
    },
  },
  complete_profile: {
    en: {
      id: 'complete_profile',
      label: 'Complete Profile',
      completed: false,
    },
    fr: {
      id: 'complete_profile',
      label: 'Compléter le profil',
      completed: false,
    },
  },
  view_first_listing: {
    en: {
      id: 'view_first_listing',
      label: 'Browse Listings',
      completed: false,
    },
    fr: {
      id: 'view_first_listing',
      label: 'Parcourir les annonces',
      completed: false,
    },
  },
  send_first_message: {
    en: {
      id: 'send_first_message',
      label: 'Send a Message',
      completed: false,
      optional: true,
    },
    fr: {
      id: 'send_first_message',
      label: 'Envoyer un message',
      completed: false,
      optional: true,
    },
  },
  post_first_listing: {
    en: {
      id: 'post_first_listing',
      label: 'Post Your First Item',
      completed: false,
      optional: true,
    },
    fr: {
      id: 'post_first_listing',
      label: 'Publier votre premier article',
      completed: false,
      optional: true,
    },
  },
  save_favorite: {
    en: {
      id: 'save_favorite',
      label: 'Save a Favorite',
      completed: false,
      optional: true,
    },
    fr: {
      id: 'save_favorite',
      label: 'Sauvegarder un favori',
      completed: false,
      optional: true,
    },
  },
};

// ============================================================================
// ACHIEVEMENT SERVICE
// ============================================================================

export class AchievementService {
  /**
   * Get all achievements with their current completion status
   */
  static getAchievements(state: GuidanceState, language: 'en' | 'fr'): Achievement[] {
    const achievements: Achievement[] = [];

    for (const [key, value] of Object.entries(ACHIEVEMENTS)) {
      const achievement = { ...value[language] };
      achievement.completed = state.completedAchievements.includes(key);
      
      if (achievement.completed && state.achievementDates[key]) {
        achievement.completedAt = state.achievementDates[key];
      }

      // Update progress for progressive achievements
      if (key === 'social_butterfly') {
        // Count messages sent (from completed actions)
        const messageCount = state.completedActions.filter(a => a.startsWith('message_sent')).length;
        achievement.progress = Math.min(messageCount, 10);
      } else if (key === 'power_seller') {
        // Count listings posted
        const listingCount = state.completedActions.filter(a => a.startsWith('listing_posted')).length;
        achievement.progress = Math.min(listingCount, 5);
      }

      achievements.push(achievement);
    }

    return achievements;
  }

  /**
   * Get onboarding progress steps
   */
  static getOnboardingProgress(state: GuidanceState, language: 'en' | 'fr'): ProgressStep[] {
    const steps: ProgressStep[] = [];

    for (const [key, value] of Object.entries(ONBOARDING_STEPS)) {
      const step = { ...value[language] };
      
      // Determine completion based on state
      switch (key) {
        case 'create_account':
          step.completed = state.features.hasCompletedAuth;
          break;
        case 'complete_profile':
          step.completed = state.features.hasCompletedProfile;
          break;
        case 'view_first_listing':
          step.completed = state.features.hasViewedFirstListing;
          break;
        case 'send_first_message':
          step.completed = state.features.hasSentFirstMessage;
          break;
        case 'post_first_listing':
          step.completed = state.features.hasPostedFirstListing;
          break;
        case 'save_favorite':
          step.completed = state.features.hasSavedFavorite;
          break;
      }

      steps.push(step);
    }

    return steps;
  }

  /**
   * Calculate onboarding completion percentage
   */
  static getOnboardingCompletionPercentage(state: GuidanceState): number {
    const steps = this.getOnboardingProgress(state, 'en');
    const requiredSteps = steps.filter(s => !s.optional);
    const completedRequired = requiredSteps.filter(s => s.completed).length;
    
    if (requiredSteps.length === 0) return 100;
    
    return Math.round((completedRequired / requiredSteps.length) * 100);
  }

  /**
   * Check if onboarding is complete
   */
  static isOnboardingComplete(state: GuidanceState): boolean {
    return this.getOnboardingCompletionPercentage(state) === 100;
  }

  /**
   * Check and trigger milestone achievements based on state changes
   * Returns true if a new achievement was unlocked
   */
  static checkMilestones(state: GuidanceState): string[] {
    const newAchievements: string[] = [];

    // Check each achievement condition
    if (!state.completedAchievements.includes('welcome_aboard') && state.features.hasCompletedAuth) {
      newAchievements.push('welcome_aboard');
    }

    if (!state.completedAchievements.includes('profile_complete') && state.features.hasCompletedProfile) {
      newAchievements.push('profile_complete');
    }

    if (!state.completedAchievements.includes('first_listing_view') && state.features.hasViewedFirstListing) {
      newAchievements.push('first_listing_view');
    }

    if (!state.completedAchievements.includes('first_message') && state.features.hasSentFirstMessage) {
      newAchievements.push('first_message');
    }

    if (!state.completedAchievements.includes('first_favorite') && state.features.hasSavedFavorite) {
      newAchievements.push('first_favorite');
    }

    if (!state.completedAchievements.includes('first_listing_posted') && state.features.hasPostedFirstListing) {
      newAchievements.push('first_listing_posted');
    }

    if (!state.completedAchievements.includes('search_master') && 
        state.features.hasUsedSearch && state.features.hasUsedFilters) {
      newAchievements.push('search_master');
    }

    if (!state.completedAchievements.includes('five_star_seller') && state.features.hasReceivedRating) {
      newAchievements.push('five_star_seller');
    }

    if (!state.completedAchievements.includes('onboarding_complete') && this.isOnboardingComplete(state)) {
      newAchievements.push('onboarding_complete');
    }

    // Check progressive achievements
    const messageCount = state.completedActions.filter(a => a.startsWith('message_sent')).length;
    if (!state.completedAchievements.includes('social_butterfly') && messageCount >= 10) {
      newAchievements.push('social_butterfly');
    }

    const listingCount = state.completedActions.filter(a => a.startsWith('listing_posted')).length;
    if (!state.completedAchievements.includes('power_seller') && listingCount >= 5) {
      newAchievements.push('power_seller');
    }

    return newAchievements;
  }

  /**
   * Get achievement by ID
   */
  static getAchievement(achievementId: string, language: 'en' | 'fr'): Achievement | null {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return null;
    return { ...achievement[language] };
  }
}
