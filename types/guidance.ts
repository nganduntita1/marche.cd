// Guidance System Type Definitions

export interface GuidanceState {
  // Version for migration support
  version: string;
  
  // User identification (for analytics, not auth)
  installId: string;
  
  // Progress tracking
  completedTours: string[];
  dismissedTooltips: string[];
  viewedScreens: Record<string, number>;
  completedActions: string[];
  
  // Achievements and gamification
  completedAchievements: string[];
  achievementDates: Record<string, string>; // achievementId -> completion date
  
  // Milestones
  milestones: {
    registrationDate: string | null;
    firstListingViewDate: string | null;
    firstMessageSentDate: string | null;
    firstListingPostedDate: string | null;
    firstSaleDate: string | null;
    firstFavoriteDate: string | null;
    firstRatingDate: string | null;
    onboardingCompletedDate: string | null;
  };
  
  // Feature-specific flags
  features: {
    hasSeenLandingPage: boolean;
    hasCompletedAuth: boolean;
    hasCompletedProfile: boolean;
    hasViewedFirstListing: boolean;
    hasPostedFirstListing: boolean;
    hasSentFirstMessage: boolean;
    hasUsedSearch: boolean;
    hasUsedFilters: boolean;
    hasSavedFavorite: boolean;
    hasReceivedRating: boolean;
  };
  
  // Profile completeness
  profileCompleteness: number;
  
  // Settings
  settings: {
    guidanceLevel: 'full' | 'minimal' | 'off';
    language: 'en' | 'fr';
    showAnimations: boolean;
  };
  
  // Session tracking
  sessionCount: number;
  lastActiveDate: string;
  appVersion: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TooltipContent {
  id: string;
  title: string;
  message: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: string;
  actionLabel?: string;
  dismissLabel?: string;
}

export interface TourStep {
  id: string;
  targetElement?: string;
  title: string;
  message: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightArea?: { x: number; y: number; width: number; height: number };
  showOverlay: boolean;
  nextLabel: string;
  skipLabel?: string;
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  triggerCondition: TriggerCondition;
}

export interface MessageTemplate {
  id: string;
  category: 'inquiry' | 'negotiation' | 'meeting' | 'thanks';
  text: string;
  variables?: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  priority: number;
}

export interface TriggerCondition {
  type: 'first_visit' | 'nth_visit' | 'time_based' | 'action_based' | 'state_based';
  params: Record<string, any>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'social' | 'seller' | 'buyer' | 'milestone';
  completed: boolean;
  completedAt?: string;
  progress?: number; // 0-100 for partial achievements
  maxProgress?: number;
  reward?: string; // Description of reward (e.g., "Unlocked advanced features")
}

export interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  optional?: boolean;
}

export interface GuidanceContextType {
  state: GuidanceState;
  
  // State management
  markTourCompleted: (tourId: string) => Promise<void>;
  markTooltipDismissed: (tooltipId: string) => Promise<void>;
  markActionCompleted: (actionId: string) => Promise<void>;
  incrementScreenView: (screenName: string) => Promise<void>;
  
  // Guidance queries
  shouldShowTour: (tourId: string) => boolean;
  shouldShowTooltip: (tooltipId: string) => boolean;
  shouldShowPrompt: (promptId: string, context?: any) => boolean;
  
  // Trigger evaluation
  evaluateTrigger: (condition: TriggerCondition, context?: any) => boolean;
  
  // Content retrieval
  getTooltipContent: (tooltipId: string) => TooltipContent | null;
  getMessageTemplates: (context: string) => MessageTemplate[];
  getQuickActions: (screenName: string, context?: any) => QuickAction[];
  
  // Progress tracking and gamification
  getAchievements: () => Achievement[];
  getOnboardingProgress: () => ProgressStep[];
  markAchievementCompleted: (achievementId: string) => Promise<void>;
  getOnboardingCompletionPercentage: () => number;
  checkAndTriggerMilestone: (milestoneType: string, context?: any) => Promise<boolean>;
  
  // Settings
  setGuidanceLevel: (level: 'full' | 'minimal' | 'off') => Promise<void>;
  setShowAnimations: (showAnimations: boolean) => Promise<void>;
  resetGuidance: (tourId?: string) => Promise<void>;
}
