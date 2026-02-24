/**
 * Tests for Guidance Storage Migration
 * 
 * These tests verify that state migration works correctly across versions,
 * preserving user data while adding new fields.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuidanceStorageService } from '../guidanceStorage';
import { GuidanceState } from '../../types/guidance';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock performance monitoring
jest.mock('../performanceMonitor', () => ({
  measurePerformanceAsync: jest.fn((name, fn) => fn()),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
  },
}));

describe('GuidanceStorageService - Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Version Detection', () => {
    it('should detect when migration is needed', async () => {
      const oldState = {
        version: '1.0.0',
        installId: 'test_install',
        completedTours: ['tour1'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldState));

      const needsMigration = await GuidanceStorageService.needsMigration();
      expect(needsMigration).toBe(true);
    });

    it('should detect when migration is not needed', async () => {
      const currentState = {
        version: '2.0.0',
        installId: 'test_install',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(currentState));

      const needsMigration = await GuidanceStorageService.needsMigration();
      expect(needsMigration).toBe(false);
    });

    it('should return false when no state exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const needsMigration = await GuidanceStorageService.needsMigration();
      expect(needsMigration).toBe(false);
    });

    it('should get stored version correctly', async () => {
      const state = {
        version: '1.0.0',
        installId: 'test_install',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(state));

      const version = await GuidanceStorageService.getStoredVersion();
      expect(version).toBe('1.0.0');
    });
  });

  describe('Migration from v1.0.0 to v2.0.0', () => {
    it('should add completedAchievements array', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
        completedTours: ['tour1', 'tour2'],
        dismissedTooltips: ['tooltip1'],
        viewedScreens: { home: 5 },
        completedActions: ['action1'],
        milestones: {
          registrationDate: '2024-01-01T00:00:00.000Z',
          firstListingViewDate: null,
          firstMessageSentDate: null,
          firstListingPostedDate: null,
          firstSaleDate: null,
        },
        features: {
          hasSeenLandingPage: true,
          hasCompletedAuth: true,
          hasCompletedProfile: false,
          hasViewedFirstListing: false,
          hasPostedFirstListing: false,
          hasSentFirstMessage: false,
          hasUsedSearch: false,
          hasUsedFilters: false,
          hasSavedFavorite: false,
          hasReceivedRating: false,
        },
        profileCompleteness: 50,
        settings: {
          guidanceLevel: 'full',
          language: 'en',
          showAnimations: true,
        },
        sessionCount: 10,
        lastActiveDate: '2024-01-15T00:00:00.000Z',
        appVersion: '1.0.0',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      const migratedState = await GuidanceStorageService.loadState();

      // Should have new fields
      expect(migratedState.completedAchievements).toBeDefined();
      expect(Array.isArray(migratedState.completedAchievements)).toBe(true);
      expect(migratedState.achievementDates).toBeDefined();
      expect(typeof migratedState.achievementDates).toBe('object');

      // Should preserve old data
      expect(migratedState.completedTours).toEqual(['tour1', 'tour2']);
      expect(migratedState.dismissedTooltips).toEqual(['tooltip1']);
      expect(migratedState.viewedScreens).toEqual({ home: 5 });
      expect(migratedState.profileCompleteness).toBe(50);
      expect(migratedState.settings.guidanceLevel).toBe('full');

      // Should update version
      expect(migratedState.version).toBe('2.0.0');
    });

    it('should add new milestone fields', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
        milestones: {
          registrationDate: '2024-01-01T00:00:00.000Z',
          firstListingViewDate: '2024-01-02T00:00:00.000Z',
          firstMessageSentDate: null,
          firstListingPostedDate: null,
          firstSaleDate: null,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      const migratedState = await GuidanceStorageService.loadState();

      // Should have new milestone fields
      expect(migratedState.milestones.firstFavoriteDate).toBeDefined();
      expect(migratedState.milestones.firstRatingDate).toBeDefined();
      expect(migratedState.milestones.onboardingCompletedDate).toBeDefined();

      // Should preserve old milestone data
      expect(migratedState.milestones.registrationDate).toBe('2024-01-01T00:00:00.000Z');
      expect(migratedState.milestones.firstListingViewDate).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should migrate legacy achievements format', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
        achievements: ['achievement1', 'achievement2'], // Old format
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      const migratedState = await GuidanceStorageService.loadState();

      // Should convert to new format
      expect(migratedState.completedAchievements).toEqual(['achievement1', 'achievement2']);
      expect((migratedState as any).achievements).toBeUndefined();
    });

    it('should preserve all user progress data during migration', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install_123',
        completedTours: ['landing_tour', 'auth_tour', 'home_tour'],
        dismissedTooltips: ['search_tip', 'filter_tip', 'post_tip'],
        viewedScreens: {
          home: 25,
          listing: 10,
          profile: 5,
          messages: 15,
        },
        completedActions: [
          'first_listing_view',
          'first_message_sent',
          'first_listing_posted',
        ],
        milestones: {
          registrationDate: '2024-01-01T10:00:00.000Z',
          firstListingViewDate: '2024-01-01T10:30:00.000Z',
          firstMessageSentDate: '2024-01-02T14:00:00.000Z',
          firstListingPostedDate: '2024-01-03T09:00:00.000Z',
          firstSaleDate: '2024-01-10T16:00:00.000Z',
        },
        features: {
          hasSeenLandingPage: true,
          hasCompletedAuth: true,
          hasCompletedProfile: true,
          hasViewedFirstListing: true,
          hasPostedFirstListing: true,
          hasSentFirstMessage: true,
          hasUsedSearch: true,
          hasUsedFilters: true,
          hasSavedFavorite: true,
          hasReceivedRating: true,
        },
        profileCompleteness: 85,
        settings: {
          guidanceLevel: 'minimal',
          language: 'fr',
          showAnimations: false,
        },
        sessionCount: 42,
        lastActiveDate: '2024-01-20T12:00:00.000Z',
        appVersion: '1.0.0',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-20T12:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      const migratedState = await GuidanceStorageService.loadState();

      // Verify all data is preserved
      expect(migratedState.installId).toBe('test_install_123');
      expect(migratedState.completedTours).toEqual(['landing_tour', 'auth_tour', 'home_tour']);
      expect(migratedState.dismissedTooltips).toEqual(['search_tip', 'filter_tip', 'post_tip']);
      expect(migratedState.viewedScreens).toEqual({
        home: 25,
        listing: 10,
        profile: 5,
        messages: 15,
      });
      expect(migratedState.completedActions).toEqual([
        'first_listing_view',
        'first_message_sent',
        'first_listing_posted',
      ]);
      expect(migratedState.milestones.registrationDate).toBe('2024-01-01T10:00:00.000Z');
      expect(migratedState.milestones.firstSaleDate).toBe('2024-01-10T16:00:00.000Z');
      expect(migratedState.profileCompleteness).toBe(85);
      expect(migratedState.settings.guidanceLevel).toBe('minimal');
      expect(migratedState.settings.language).toBe('fr');
      expect(migratedState.settings.showAnimations).toBe(false);
      expect(migratedState.sessionCount).toBe(43); // Incremented by loadState
      expect(migratedState.createdAt).toBe('2024-01-01T10:00:00.000Z');

      // Verify new fields are added
      expect(migratedState.completedAchievements).toBeDefined();
      expect(migratedState.achievementDates).toBeDefined();
      expect(migratedState.milestones.firstFavoriteDate).toBeDefined();
      expect(migratedState.milestones.firstRatingDate).toBeDefined();
      expect(migratedState.milestones.onboardingCompletedDate).toBeDefined();

      // Verify version is updated
      expect(migratedState.version).toBe('2.0.0');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle missing fields gracefully', async () => {
      const incompleteState = {
        version: '1.0.0',
        installId: 'test_install',
        // Missing many fields
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(incompleteState));

      const migratedState = await GuidanceStorageService.loadState();

      // Should have all required fields with defaults
      expect(migratedState.completedTours).toEqual([]);
      expect(migratedState.dismissedTooltips).toEqual([]);
      expect(migratedState.viewedScreens).toEqual({});
      expect(migratedState.completedActions).toEqual([]);
      expect(migratedState.milestones).toBeDefined();
      expect(migratedState.features).toBeDefined();
      expect(migratedState.settings).toBeDefined();
    });

    it('should handle corrupted state gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const state = await GuidanceStorageService.loadState();

      // Should return default state
      expect(state.version).toBe('2.0.0');
      expect(state.completedTours).toEqual([]);
    });

    it('should handle unknown version gracefully', async () => {
      const unknownVersionState = {
        version: '99.0.0',
        installId: 'test_install',
        completedTours: ['tour1'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(unknownVersionState));

      const state = await GuidanceStorageService.loadState();

      // Should return default state for unknown version
      expect(state.version).toBe('2.0.0');
    });

    it('should preserve custom data during migration', async () => {
      const stateWithCustomData = {
        version: '1.0.0',
        installId: 'test_install',
        completedTours: ['tour1'],
        customField: 'custom_value', // Custom field not in schema
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stateWithCustomData));

      const migratedState = await GuidanceStorageService.loadState();

      // Custom fields should be preserved (though not in type)
      expect((migratedState as any).customField).toBe('custom_value');
    });
  });

  describe('Migration Persistence', () => {
    it('should save migrated state to storage', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
        completedTours: ['tour1'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      await GuidanceStorageService.loadState();

      // Should have saved the migrated state
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedState = JSON.parse(savedData);
      
      expect(savedState.version).toBe('2.0.0');
      expect(savedState.completedAchievements).toBeDefined();
    });

    it('should only migrate once per load', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));

      await GuidanceStorageService.loadState();

      // Clear mocks
      jest.clearAllMocks();

      // Load again with migrated state
      const migratedState = {
        version: '2.0.0',
        installId: 'test_install',
        completedAchievements: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(migratedState));

      await GuidanceStorageService.loadState();

      // Should not trigger migration again
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedState = JSON.parse(savedData);
      
      expect(savedState.version).toBe('2.0.0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty state object', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{}');

      const state = await GuidanceStorageService.loadState();

      expect(state.version).toBe('2.0.0');
      expect(state.installId).toBeDefined();
    });

    it('should handle null values in state', async () => {
      const stateWithNulls = {
        version: '1.0.0',
        installId: 'test_install',
        completedTours: null,
        dismissedTooltips: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stateWithNulls));

      const state = await GuidanceStorageService.loadState();

      expect(state.completedTours).toEqual([]);
      expect(state.dismissedTooltips).toEqual([]);
    });

    it('should handle storage errors during migration', async () => {
      const v1State = {
        version: '1.0.0',
        installId: 'test_install',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(v1State));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      // Should not throw, but log error
      const state = await GuidanceStorageService.loadState();

      expect(state.version).toBe('2.0.0');
    });
  });
});
