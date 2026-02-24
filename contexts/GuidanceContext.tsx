import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GuidanceState, GuidanceContextType, TooltipContent, MessageTemplate, QuickAction, TriggerCondition, Achievement, ProgressStep } from '../types/guidance';
import { GuidanceStorageService } from '../services/guidanceStorage';
import { GuidanceContentService } from '../services/guidanceContent';
import { TriggerEvaluationEngine } from '../services/triggerEvaluation';
import { AchievementService } from '../services/achievementService';
import i18n from '../lib/i18n';

const GUIDANCE_DISABLED = true;

// Debounce utility for state updates
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

export const useGuidance = () => {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within a GuidanceProvider');
  }
  return context;
};

interface GuidanceProviderProps {
  children: React.ReactNode;
}

export const GuidanceProvider: React.FC<GuidanceProviderProps> = ({ children }) => {
  const [state, setState] = useState<GuidanceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Batch update queue for performance
  const updateQueueRef = useRef<Array<Partial<GuidanceState>>>([]);
  const isFlushing = useRef(false);

  // Performance monitoring
  const performanceMetrics = useRef({
    stateUpdates: 0,
    storageWrites: 0,
    renderCount: 0,
    lastUpdateTime: Date.now(),
  });

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      const startTime = performance.now();
      try {
        const loadedState = await GuidanceStorageService.loadState();
        setState(loadedState);
        const loadTime = performance.now() - startTime;
        
        // Log performance if it exceeds threshold (50ms)
        if (loadTime > 50) {
          console.warn(`Guidance state load took ${loadTime.toFixed(2)}ms (target: <50ms)`);
        }
      } catch (error) {
        console.error('Failed to load guidance state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialState();
  }, []);

  // Debounced state save function (300ms delay)
  const debouncedSaveState = useRef(
    debounce(async (stateToSave: GuidanceState) => {
      const startTime = performance.now();
      try {
        await GuidanceStorageService.saveState(stateToSave);
        performanceMetrics.current.storageWrites++;
        
        const saveTime = performance.now() - startTime;
        if (saveTime > 100) {
          console.warn(`Guidance state save took ${saveTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Failed to save guidance state:', error);
      }
    }, 300)
  ).current;

  // Flush batch updates
  const flushBatchUpdates = useCallback(async () => {
    if (isFlushing.current || updateQueueRef.current.length === 0 || !state) {
      return;
    }

    isFlushing.current = true;
    const updates = [...updateQueueRef.current];
    updateQueueRef.current = [];

    try {
      // Merge all updates
      let mergedState = { ...state };
      for (const update of updates) {
        mergedState = { ...mergedState, ...update };
      }
      
      mergedState.updatedAt = new Date().toISOString();
      setState(mergedState);
      debouncedSaveState(mergedState);
    } finally {
      isFlushing.current = false;
    }
  }, [state, debouncedSaveState]);

  // Queue a state update for batching
  const queueStateUpdate = useCallback((update: Partial<GuidanceState>) => {
    updateQueueRef.current.push(update);
    performanceMetrics.current.stateUpdates++;
    
    // Flush after a short delay to batch multiple updates
    setTimeout(() => flushBatchUpdates(), 50);
  }, [flushBatchUpdates]);

  // Mark a tour as completed (optimized with batching)
  const markTourCompleted = useCallback(async (tourId: string) => {
    if (!state) return;

    const completedTours = state.completedTours.includes(tourId)
      ? state.completedTours
      : [...state.completedTours, tourId];

    queueStateUpdate({ completedTours });
  }, [state, queueStateUpdate]);

  // Mark a tooltip as dismissed (optimized with batching)
  const markTooltipDismissed = useCallback(async (tooltipId: string) => {
    if (!state) return;

    const dismissedTooltips = state.dismissedTooltips.includes(tooltipId)
      ? state.dismissedTooltips
      : [...state.dismissedTooltips, tooltipId];

    queueStateUpdate({ dismissedTooltips });
  }, [state, queueStateUpdate]);

  // Mark an action as completed (optimized with batching)
  const markActionCompleted = useCallback(async (actionId: string) => {
    if (!state) return;

    const completedActions = state.completedActions.includes(actionId)
      ? state.completedActions
      : [...state.completedActions, actionId];

    queueStateUpdate({ completedActions });
  }, [state, queueStateUpdate]);

  // Increment screen view count (optimized with batching)
  const incrementScreenView = useCallback(async (screenName: string) => {
    if (!state) return;

    const currentCount = state.viewedScreens[screenName] || 0;
    queueStateUpdate({
      viewedScreens: {
        ...state.viewedScreens,
        [screenName]: currentCount + 1,
      },
    });
  }, [state, queueStateUpdate]);

  // Memoized critical tour list
  const criticalTours = useMemo(() => ['safety_tour', 'security_tour'], []);

  // Check if a tour should be shown (memoized)
  const shouldShowTour = useCallback((tourId: string): boolean => {
    if (GUIDANCE_DISABLED) return false;
    if (!state) return false;
    if (state.settings.guidanceLevel === 'off') return false;
    
    // Minimal level: only show critical tours (safety-related)
    if (state.settings.guidanceLevel === 'minimal') {
      if (!criticalTours.includes(tourId)) return false;
    }
    
    return !state.completedTours.includes(tourId);
  }, [state, criticalTours]);

  // Check if a tooltip should be shown (memoized)
  const shouldShowTooltip = useCallback((tooltipId: string): boolean => {
    if (GUIDANCE_DISABLED) return false;
    if (!state) return false;
    if (state.settings.guidanceLevel === 'off') return false;
    
    // Minimal level: only show critical tooltips (safety warnings, errors)
    if (state.settings.guidanceLevel === 'minimal') {
      const criticalTooltips = tooltipId.includes('safety') || 
                               tooltipId.includes('error') || 
                               tooltipId.includes('warning');
      if (!criticalTooltips) return false;
    }
    
    return !state.dismissedTooltips.includes(tooltipId);
  }, [state]);

  // Check if a prompt should be shown (memoized)
  const shouldShowPrompt = useCallback((promptId: string, context?: any): boolean => {
    if (GUIDANCE_DISABLED) return false;
    if (!state) return false;
    if (state.settings.guidanceLevel === 'off') return false;
    
    // Minimal level: only show critical prompts (safety, errors)
    if (state.settings.guidanceLevel === 'minimal') {
      const isCritical = promptId.includes('safety') || 
                        promptId.includes('error') || 
                        promptId.includes('warning') ||
                        context?.isCritical === true;
      if (!isCritical) return false;
    }
    
    // Check if prompt was recently dismissed
    const recentlyDismissed = state.dismissedTooltips.includes(promptId);
    if (recentlyDismissed) return false;
    
    // Additional context-based logic can be added here
    return true;
  }, [state]);

  // Evaluate a trigger condition
  const evaluateTrigger = useCallback((
    condition: TriggerCondition,
    context?: any
  ): boolean => {
    if (GUIDANCE_DISABLED) return false;
    if (!state) return false;
    return TriggerEvaluationEngine.shouldTrigger(condition, state, context);
  }, [state]);

  // Content cache for lazy loading
  const contentCache = useRef<{
    tooltips: Map<string, TooltipContent>;
    templates: Map<string, MessageTemplate[]>;
    tours: Map<string, any>;
  }>({
    tooltips: new Map(),
    templates: new Map(),
    tours: new Map(),
  });

  // Get tooltip content (with caching for lazy loading)
  const getTooltipContent = useCallback((tooltipId: string): TooltipContent | null => {
    if (GUIDANCE_DISABLED) return null;
    if (!state) return null;
    
    const language = state.settings.language;
    const cacheKey = `${tooltipId}_${language}`;
    
    // Check cache first
    if (contentCache.current.tooltips.has(cacheKey)) {
      return contentCache.current.tooltips.get(cacheKey)!;
    }
    
    // Load and cache
    const content = GuidanceContentService.getTooltip(tooltipId, language);
    if (content) {
      contentCache.current.tooltips.set(cacheKey, content);
    }
    
    return content;
  }, [state]);

  // Get message templates (with caching)
  const getMessageTemplates = useCallback((context: string): MessageTemplate[] => {
    if (GUIDANCE_DISABLED) return [];
    if (!state) return [];
    
    const language = state.settings.language;
    const cacheKey = `${context}_${language}`;
    
    // Check cache first
    if (contentCache.current.templates.has(cacheKey)) {
      return contentCache.current.templates.get(cacheKey)!;
    }
    
    // Load and cache
    let templates: MessageTemplate[];
    if (['inquiry', 'negotiation', 'meeting', 'thanks'].includes(context)) {
      templates = GuidanceContentService.getMessageTemplates(
        context as 'inquiry' | 'negotiation' | 'meeting' | 'thanks',
        language
      );
    } else {
      templates = GuidanceContentService.getAllMessageTemplates(language);
    }
    
    contentCache.current.templates.set(cacheKey, templates);
    return templates;
  }, [state]);

  // Get quick actions (memoized)
  const getQuickActions = useCallback((screenName: string, context?: any): QuickAction[] => {
    if (GUIDANCE_DISABLED) return [];
    if (!state) return [];
    const language = state.settings.language;
    return GuidanceContentService.getQuickActions(screenName, context, language);
  }, [state]);

  // Set guidance level (optimized with batching)
  const setGuidanceLevel = useCallback(async (level: 'full' | 'minimal' | 'off') => {
    if (!state) return;

    queueStateUpdate({
      settings: {
        ...state.settings,
        guidanceLevel: level,
      },
    });
  }, [state, queueStateUpdate]);

  // Set animations preference (optimized with batching)
  const setShowAnimations = useCallback(async (showAnimations: boolean) => {
    if (!state) return;

    queueStateUpdate({
      settings: {
        ...state.settings,
        showAnimations,
      },
    });
  }, [state, queueStateUpdate]);

  // Reset guidance (all or specific tour)
  const resetGuidance = useCallback(async (tourId?: string) => {
    if (!state) return;

    if (tourId) {
      // Reset specific tour
      await GuidanceStorageService.resetTour(tourId);
      const updated = {
        ...state,
        completedTours: state.completedTours.filter(id => id !== tourId),
      };
      setState(updated);
    } else {
      // Reset all guidance
      await GuidanceStorageService.clearState();
      const newState = await GuidanceStorageService.loadState();
      setState(newState);
    }
  }, [state]);

  // Get achievements (memoized for performance)
  const achievements = useMemo((): Achievement[] => {
    if (!state) return [];
    const language = state.settings.language;
    return AchievementService.getAchievements(state, language);
  }, [state]);

  const getAchievements = useCallback((): Achievement[] => {
    return achievements;
  }, [achievements]);

  // Get onboarding progress (memoized for performance)
  const onboardingProgress = useMemo((): ProgressStep[] => {
    if (!state) return [];
    const language = state.settings.language;
    return AchievementService.getOnboardingProgress(state, language);
  }, [state]);

  const getOnboardingProgress = useCallback((): ProgressStep[] => {
    return onboardingProgress;
  }, [onboardingProgress]);

  // Mark achievement as completed (optimized with batching)
  const markAchievementCompleted = useCallback(async (achievementId: string) => {
    if (!state) return;

    const completedAchievements = state.completedAchievements.includes(achievementId)
      ? state.completedAchievements
      : [...state.completedAchievements, achievementId];

    const achievementDates = {
      ...state.achievementDates,
      [achievementId]: new Date().toISOString(),
    };

    queueStateUpdate({
      completedAchievements,
      achievementDates,
    });
  }, [state, queueStateUpdate]);

  // Get onboarding completion percentage (memoized for performance)
  const onboardingCompletionPercentage = useMemo((): number => {
    if (!state) return 0;
    return AchievementService.getOnboardingCompletionPercentage(state);
  }, [state]);

  const getOnboardingCompletionPercentage = useCallback((): number => {
    return onboardingCompletionPercentage;
  }, [onboardingCompletionPercentage]);

  // Check and trigger milestone (optimized with batching)
  const checkAndTriggerMilestone = useCallback(async (milestoneType: string, context?: any): Promise<boolean> => {
    if (!state) return false;

    // Check for new achievements
    const newAchievements = AchievementService.checkMilestones(state);
    
    if (newAchievements.length > 0) {
      // Mark all new achievements as completed
      const completedAchievements = [...state.completedAchievements, ...newAchievements];
      const achievementDates = { ...state.achievementDates };
      const now = new Date().toISOString();
      
      newAchievements.forEach(id => {
        achievementDates[id] = now;
      });

      // Update milestones if onboarding is complete
      const milestones = { ...state.milestones };
      if (AchievementService.isOnboardingComplete(state) && !milestones.onboardingCompletedDate) {
        milestones.onboardingCompletedDate = now;
      }

      queueStateUpdate({
        completedAchievements,
        achievementDates,
        milestones,
      });
      
      return true;
    }

    return false;
  }, [state, queueStateUpdate]);

  // Track render count for performance monitoring
  useEffect(() => {
    performanceMetrics.current.renderCount++;
  });

  // Log performance metrics periodically (every 50 renders)
  useEffect(() => {
    if (performanceMetrics.current.renderCount % 50 === 0 && performanceMetrics.current.renderCount > 0) {
      const timeSinceLastUpdate = Date.now() - performanceMetrics.current.lastUpdateTime;
      console.log('Guidance Performance Metrics:', {
        renders: performanceMetrics.current.renderCount,
        stateUpdates: performanceMetrics.current.stateUpdates,
        storageWrites: performanceMetrics.current.storageWrites,
        timeSinceLastUpdate: `${timeSinceLastUpdate}ms`,
        cacheSize: {
          tooltips: contentCache.current.tooltips.size,
          templates: contentCache.current.templates.size,
          tours: contentCache.current.tours.size,
        },
      });
    }
  });

  // Clear content cache when language changes
  useEffect(() => {
    if (state) {
      contentCache.current.tooltips.clear();
      contentCache.current.templates.clear();
      contentCache.current.tours.clear();
    }
  }, [state?.settings.language]);

  // Don't render children until state is loaded
  if (isLoading || !state) {
    return null;
  }

  const value: GuidanceContextType = {
    state,
    markTourCompleted,
    markTooltipDismissed,
    markActionCompleted,
    incrementScreenView,
    shouldShowTour,
    shouldShowTooltip,
    shouldShowPrompt,
    evaluateTrigger,
    getTooltipContent,
    getMessageTemplates,
    getQuickActions,
    getAchievements,
    getOnboardingProgress,
    markAchievementCompleted,
    getOnboardingCompletionPercentage,
    checkAndTriggerMilestone,
    setGuidanceLevel,
    setShowAnimations,
    resetGuidance,
  };

  return (
    <GuidanceContext.Provider value={value}>
      {children}
    </GuidanceContext.Provider>
  );
};
