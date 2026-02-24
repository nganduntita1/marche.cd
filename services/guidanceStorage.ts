import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuidanceState } from '../types/guidance';
import Constants from 'expo-constants';
import { measurePerformanceAsync } from './performanceMonitor';

const STORAGE_KEY = '@marche_cd:guidance_state';
const CURRENT_VERSION = '2.0.0';

// Version history for migration tracking
const VERSION_HISTORY = ['1.0.0', '2.0.0'] as const;
type SupportedVersion = typeof VERSION_HISTORY[number];

// Default initial state
const getDefaultState = (): GuidanceState => ({
  version: CURRENT_VERSION,
  installId: generateInstallId(),
  completedTours: [],
  dismissedTooltips: [],
  viewedScreens: {},
  completedActions: [],
  completedAchievements: [],
  achievementDates: {},
  milestones: {
    registrationDate: null,
    firstListingViewDate: null,
    firstMessageSentDate: null,
    firstListingPostedDate: null,
    firstSaleDate: null,
    firstFavoriteDate: null,
    firstRatingDate: null,
    onboardingCompletedDate: null,
  },
  features: {
    hasSeenLandingPage: false,
    hasCompletedAuth: false,
    hasCompletedProfile: false,
    hasViewedFirstListing: false,
    hasPostedFirstListing: false,
    hasSentFirstMessage: false,
    hasUsedSearch: false,
    hasUsedFilters: false,
    hasSavedFavorite: false,
    hasReceivedRating: false,
  },
  profileCompleteness: 0,
  settings: {
    guidanceLevel: 'full',
    language: 'en',
    showAnimations: true,
  },
  sessionCount: 0,
  lastActiveDate: new Date().toISOString(),
  appVersion: Constants.expoConfig?.version || '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Generate a unique install ID
function generateInstallId(): string {
  return `install_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export class GuidanceStorageService {
  /**
   * Load guidance state from AsyncStorage (with performance monitoring)
   */
  static async loadState(): Promise<GuidanceState> {
    return measurePerformanceAsync('state_load', async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (!stored) {
          // First time - create and save default state
          const defaultState = getDefaultState();
          await this.saveState(defaultState);
          return defaultState;
        }
        
        const parsed = JSON.parse(stored) as GuidanceState;
        
        // Check if migration is needed
        if (parsed.version !== CURRENT_VERSION) {
          const migrated = await this.migrateState(parsed.version, CURRENT_VERSION, parsed);
          await this.saveState(migrated);
          return migrated;
        }
        
        // Increment session count and update last active date
        const updated = {
          ...parsed,
          sessionCount: parsed.sessionCount + 1,
          lastActiveDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await this.saveState(updated);
        return updated;
      } catch (error) {
        console.error('Error loading guidance state:', error);
        // Return default state on error
        return getDefaultState();
      }
    });
  }

  /**
   * Save complete guidance state to AsyncStorage (with performance monitoring)
   */
  static async saveState(state: GuidanceState): Promise<void> {
    return measurePerformanceAsync('state_save', async () => {
      try {
        const updated = {
          ...state,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving guidance state:', error);
        throw error;
      }
    });
  }

  /**
   * Update partial guidance state
   */
  static async updatePartialState(updates: Partial<GuidanceState>): Promise<void> {
    try {
      const current = await this.loadState();
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.saveState(updated);
    } catch (error) {
      console.error('Error updating partial state:', error);
      throw error;
    }
  }

  /**
   * Batch update multiple state changes atomically
   * Optimized to reduce I/O operations
   */
  static async batchUpdate(updates: Array<Partial<GuidanceState>>): Promise<void> {
    if (updates.length === 0) return;
    
    try {
      const startTime = performance.now();
      const current = await this.loadState();
      
      // Apply all updates in a single pass
      let updated = { ...current };
      for (const update of updates) {
        updated = { ...updated, ...update };
      }
      
      updated.updatedAt = new Date().toISOString();
      await this.saveState(updated);
      
      const duration = performance.now() - startTime;
      if (duration > 100) {
        console.warn(`Batch update of ${updates.length} items took ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  /**
   * Optimized multi-key update that minimizes storage operations
   */
  static async updateMultipleKeys(updates: Partial<GuidanceState>): Promise<void> {
    try {
      const current = await this.loadState();
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.saveState(updated);
    } catch (error) {
      console.error('Error updating multiple keys:', error);
      throw error;
    }
  }

  /**
   * Migrate state from old version to new version
   * Applies all necessary migrations in sequence
   */
  static async migrateState(
    oldVersion: string,
    newVersion: string,
    oldState: any
  ): Promise<GuidanceState> {
    console.log(`Migrating guidance state from ${oldVersion} to ${newVersion}`);
    
    // Validate versions
    if (!this.isValidVersion(oldVersion)) {
      console.warn(`Unknown old version ${oldVersion}, using default state`);
      return getDefaultState();
    }
    
    if (!this.isValidVersion(newVersion)) {
      console.error(`Invalid target version ${newVersion}`);
      throw new Error(`Invalid target version: ${newVersion}`);
    }
    
    // If versions are the same, no migration needed
    if (oldVersion === newVersion) {
      return oldState as GuidanceState;
    }
    
    // Get migration path
    const migrationPath = this.getMigrationPath(oldVersion, newVersion);
    
    if (migrationPath.length === 0) {
      console.warn(`No migration path from ${oldVersion} to ${newVersion}`);
      return this.mergeWithDefaults(oldState, newVersion);
    }
    
    // Apply migrations in sequence
    let currentState = oldState;
    for (let i = 0; i < migrationPath.length - 1; i++) {
      const fromVersion = migrationPath[i];
      const toVersion = migrationPath[i + 1];
      
      console.log(`Applying migration: ${fromVersion} -> ${toVersion}`);
      currentState = await this.applyMigration(fromVersion, toVersion, currentState);
    }
    
    // Ensure all fields exist by merging with defaults
    const migratedState = this.mergeWithDefaults(currentState, newVersion);
    
    console.log(`Migration complete: ${oldVersion} -> ${newVersion}`);
    return migratedState;
  }

  /**
   * Check if a version string is valid
   */
  private static isValidVersion(version: string): boolean {
    return VERSION_HISTORY.includes(version as SupportedVersion);
  }

  /**
   * Get the migration path from one version to another
   */
  private static getMigrationPath(fromVersion: string, toVersion: string): string[] {
    const fromIndex = VERSION_HISTORY.indexOf(fromVersion as SupportedVersion);
    const toIndex = VERSION_HISTORY.indexOf(toVersion as SupportedVersion);
    
    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }
    
    if (fromIndex > toIndex) {
      // Downgrade not supported
      console.error('Downgrade not supported');
      return [];
    }
    
    // Return the path of versions to migrate through
    return VERSION_HISTORY.slice(fromIndex, toIndex + 1);
  }

  /**
   * Apply a specific migration from one version to the next
   */
  private static async applyMigration(
    fromVersion: string,
    toVersion: string,
    state: any
  ): Promise<any> {
    const migrationKey = `${fromVersion}_to_${toVersion}`;
    
    switch (migrationKey) {
      case '1.0.0_to_2.0.0':
        return this.migrate_1_0_0_to_2_0_0(state);
      
      default:
        console.warn(`No specific migration for ${migrationKey}, using default merge`);
        return state;
    }
  }

  /**
   * Migration from v1.0.0 to v2.0.0
   * Changes:
   * - Added completedAchievements array
   * - Added achievementDates object
   * - Added new milestone fields (firstFavoriteDate, firstRatingDate, onboardingCompletedDate)
   */
  private static migrate_1_0_0_to_2_0_0(oldState: any): any {
    console.log('Applying migration 1.0.0 -> 2.0.0');
    
    const newState = {
      ...oldState,
      version: '2.0.0',
    };
    
    // Add completedAchievements if missing
    if (!newState.completedAchievements) {
      newState.completedAchievements = [];
    }
    
    // Add achievementDates if missing
    if (!newState.achievementDates) {
      newState.achievementDates = {};
    }
    
    // Update milestones object with new fields
    if (newState.milestones) {
      newState.milestones = {
        ...newState.milestones,
        firstFavoriteDate: newState.milestones.firstFavoriteDate || null,
        firstRatingDate: newState.milestones.firstRatingDate || null,
        onboardingCompletedDate: newState.milestones.onboardingCompletedDate || null,
      };
    }
    
    // Migrate old achievement data if it exists in a different format
    // (This is a placeholder for any legacy achievement tracking)
    if (oldState.achievements && Array.isArray(oldState.achievements)) {
      newState.completedAchievements = oldState.achievements;
      delete newState.achievements;
    }
    
    newState.updatedAt = new Date().toISOString();
    
    return newState;
  }

  /**
   * Merge state with default values to ensure all fields exist
   * This provides backward compatibility for any missing fields
   */
  private static mergeWithDefaults(state: any, targetVersion: string): GuidanceState {
    const defaultState = getDefaultState();
    
    // Deep merge for nested objects
    const mergedState: GuidanceState = {
      ...defaultState,
      ...state,
      version: targetVersion,
      
      // Deep merge for milestones
      milestones: {
        ...defaultState.milestones,
        ...(state.milestones || {}),
      },
      
      // Deep merge for features
      features: {
        ...defaultState.features,
        ...(state.features || {}),
      },
      
      // Deep merge for settings
      settings: {
        ...defaultState.settings,
        ...(state.settings || {}),
      },
      
      // Ensure arrays exist
      completedTours: state.completedTours || [],
      dismissedTooltips: state.dismissedTooltips || [],
      completedActions: state.completedActions || [],
      completedAchievements: state.completedAchievements || [],
      
      // Ensure objects exist
      viewedScreens: state.viewedScreens || {},
      achievementDates: state.achievementDates || {},
      
      updatedAt: new Date().toISOString(),
    };
    
    return mergedState;
  }

  /**
   * Get the current version of stored state without loading it
   */
  static async getStoredVersion(): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return parsed.version || null;
    } catch (error) {
      console.error('Error reading stored version:', error);
      return null;
    }
  }

  /**
   * Check if migration is needed
   */
  static async needsMigration(): Promise<boolean> {
    const storedVersion = await this.getStoredVersion();
    if (!storedVersion) return false;
    
    return storedVersion !== CURRENT_VERSION;
  }

  /**
   * Clear all guidance state
   */
  static async clearState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing guidance state:', error);
      throw error;
    }
  }

  /**
   * Reset a specific tour
   */
  static async resetTour(tourId: string): Promise<void> {
    try {
      const current = await this.loadState();
      const updated = {
        ...current,
        completedTours: current.completedTours.filter(id => id !== tourId),
        updatedAt: new Date().toISOString(),
      };
      await this.saveState(updated);
    } catch (error) {
      console.error('Error resetting tour:', error);
      throw error;
    }
  }
}
