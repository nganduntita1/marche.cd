import { GuidanceState, TriggerCondition } from '../types/guidance';

/**
 * TriggerEvaluationEngine
 * 
 * Evaluates trigger conditions to determine when guidance should be shown.
 * Supports first-visit, nth-visit, time-based, action-based, and state-based triggers.
 */
export class TriggerEvaluationEngine {
  /**
   * Main evaluation method - determines if a trigger condition is met
   */
  static shouldTrigger(
    condition: TriggerCondition,
    state: GuidanceState,
    context?: any
  ): boolean {
    switch (condition.type) {
      case 'first_visit':
        return this.evaluateFirstVisit(condition.params, state);
      
      case 'nth_visit':
        return this.evaluateNthVisit(condition.params, state);
      
      case 'time_based':
        return this.evaluateTimeBased(condition.params, state, context);
      
      case 'action_based':
        return this.evaluateActionBased(condition.params, state, context);
      
      case 'state_based':
        return this.evaluateStateBased(condition.params, state);
      
      default:
        console.warn(`Unknown trigger type: ${condition.type}`);
        return false;
    }
  }

  /**
   * First Visit Detection
   * Checks if this is the first time a user has visited a specific screen
   * 
   * Params:
   * - screenName: string - The name of the screen to check
   */
  private static evaluateFirstVisit(
    params: Record<string, any>,
    state: GuidanceState
  ): boolean {
    const { screenName } = params;
    
    if (!screenName) {
      console.warn('First visit trigger missing screenName parameter');
      return false;
    }
    
    return this.isFirstVisit(screenName, state);
  }

  /**
   * Nth Visit Detection
   * Checks if the user has visited a screen exactly N times
   * 
   * Params:
   * - screenName: string - The name of the screen to check
   * - visitCount: number - The exact visit count to match
   */
  private static evaluateNthVisit(
    params: Record<string, any>,
    state: GuidanceState
  ): boolean {
    const { screenName, visitCount } = params;
    
    if (!screenName || visitCount === undefined) {
      console.warn('Nth visit trigger missing required parameters');
      return false;
    }
    
    const currentCount = state.viewedScreens[screenName] || 0;
    return currentCount === visitCount;
  }

  /**
   * Time-Based Trigger Evaluation
   * Checks if a certain amount of time has passed since an event
   * 
   * Params:
   * - duration: number - Duration in milliseconds
   * - event: string - The event to measure from (e.g., 'screen_enter', 'last_interaction')
   * 
   * Context:
   * - screenEnterTime: number - Timestamp when screen was entered
   * - lastInteractionTime: number - Timestamp of last user interaction
   */
  private static evaluateTimeBased(
    params: Record<string, any>,
    state: GuidanceState,
    context?: any
  ): boolean {
    const { duration, event } = params;
    
    if (duration === undefined || !event) {
      console.warn('Time-based trigger missing required parameters');
      return false;
    }
    
    if (!context) {
      return false;
    }
    
    const now = Date.now();
    
    switch (event) {
      case 'screen_enter':
        if (context.screenEnterTime) {
          return now - context.screenEnterTime >= duration;
        }
        return false;
      
      case 'last_interaction':
        if (context.lastInteractionTime) {
          return now - context.lastInteractionTime >= duration;
        }
        return false;
      
      case 'last_active':
        if (state.lastActiveDate) {
          const lastActive = new Date(state.lastActiveDate).getTime();
          return now - lastActive >= duration;
        }
        return false;
      
      default:
        console.warn(`Unknown time-based event: ${event}`);
        return false;
    }
  }

  /**
   * Action-Based Trigger Evaluation
   * Checks if specific actions have been completed or conditions met
   * 
   * Params:
   * - action: string - The action to check (e.g., 'message_count', 'photo_count')
   * - threshold: number - The threshold value to compare against
   * - operator: string - Comparison operator ('eq', 'gt', 'gte', 'lt', 'lte')
   * 
   * Context:
   * - Varies based on action type (e.g., messageCount, photoCount)
   */
  private static evaluateActionBased(
    params: Record<string, any>,
    state: GuidanceState,
    context?: any
  ): boolean {
    const { action, threshold, operator = 'gte' } = params;
    
    if (!action || threshold === undefined) {
      console.warn('Action-based trigger missing required parameters');
      return false;
    }
    
    let actualValue: number;
    
    // Determine the actual value based on the action type
    switch (action) {
      case 'message_count':
        actualValue = context?.messageCount || 0;
        break;
      
      case 'photo_count':
        actualValue = context?.photoCount || 0;
        break;
      
      case 'completed_actions':
        actualValue = state.completedActions.length;
        break;
      
      case 'profile_completeness':
        actualValue = state.profileCompleteness;
        break;
      
      default:
        // Check if it's a custom context value
        if (context && action in context) {
          actualValue = context[action];
        } else {
          console.warn(`Unknown action type: ${action}`);
          return false;
        }
    }
    
    // Compare using the specified operator
    return this.compareValues(actualValue, threshold, operator);
  }

  /**
   * State-Based Trigger Evaluation
   * Checks if the guidance state meets certain conditions
   * 
   * Params:
   * - feature: string - The feature flag to check (e.g., 'hasCompletedAuth')
   * - value: boolean - The expected value
   * - milestone: string - The milestone to check (e.g., 'firstListingPostedDate')
   * - exists: boolean - Whether the milestone should exist
   */
  private static evaluateStateBased(
    params: Record<string, any>,
    state: GuidanceState
  ): boolean {
    // Check feature flags
    if (params.feature !== undefined) {
      const { feature, value = true } = params;
      
      if (feature in state.features) {
        return state.features[feature as keyof typeof state.features] === value;
      }
      
      console.warn(`Unknown feature flag: ${feature}`);
      return false;
    }
    
    // Check milestones
    if (params.milestone !== undefined) {
      const { milestone, exists = true } = params;
      
      if (milestone in state.milestones) {
        const milestoneValue = state.milestones[milestone as keyof typeof state.milestones];
        return exists ? milestoneValue !== null : milestoneValue === null;
      }
      
      console.warn(`Unknown milestone: ${milestone}`);
      return false;
    }
    
    // Check completed actions
    if (params.actionCompleted !== undefined) {
      const { actionCompleted } = params;
      return state.completedActions.includes(actionCompleted);
    }
    
    // Check completed tours
    if (params.tourCompleted !== undefined) {
      const { tourCompleted } = params;
      return state.completedTours.includes(tourCompleted);
    }
    
    console.warn('State-based trigger missing valid parameters');
    return false;
  }

  /**
   * Helper: Check if this is the first visit to a screen
   */
  static isFirstVisit(screenName: string, state: GuidanceState): boolean {
    const viewCount = state.viewedScreens[screenName] || 0;
    return viewCount === 0;
  }

  /**
   * Helper: Check if user has been inactive for a duration
   */
  static hasBeenInactive(duration: number, state: GuidanceState, context?: any): boolean {
    if (context?.lastInteractionTime) {
      const now = Date.now();
      return now - context.lastInteractionTime >= duration;
    }
    return false;
  }

  /**
   * Helper: Check if an action has been completed
   */
  static hasCompletedAction(actionId: string, state: GuidanceState): boolean {
    return state.completedActions.includes(actionId);
  }

  /**
   * Helper: Check if a state requirement is met
   */
  static meetsStateRequirement(requirement: any, state: GuidanceState): boolean {
    if (typeof requirement === 'function') {
      return requirement(state);
    }
    
    // If requirement is an object with conditions
    if (typeof requirement === 'object') {
      return this.evaluateStateBased(requirement, state);
    }
    
    return false;
  }

  /**
   * Helper: Compare two values using an operator
   */
  private static compareValues(
    actual: number,
    expected: number,
    operator: string
  ): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;
      case 'gt':
        return actual > expected;
      case 'gte':
        return actual >= expected;
      case 'lt':
        return actual < expected;
      case 'lte':
        return actual <= expected;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
}
