# State Migration Visual Example

## Real-World Migration Scenario

This document shows a real-world example of how state migration works when a user updates the app.

## Scenario

**User:** Marie, a seller on Marché CD
**Timeline:** 
- January 1, 2024: Installs app v1.0.0
- January 15, 2024: Uses app regularly
- January 20, 2024: Updates to app v2.0.0

## Step-by-Step Migration

### Step 1: User's State Before Update (v1.0.0)

Marie has been using the app for 2 weeks. Her guidance state looks like this:

```json
{
  "version": "1.0.0",
  "installId": "install_1704096000_abc123",
  
  "completedTours": [
    "landing_tour",
    "auth_tour",
    "home_tour",
    "listing_detail_tour",
    "posting_tour"
  ],
  
  "dismissedTooltips": [
    "search_tooltip",
    "filter_tooltip",
    "favorite_tooltip",
    "message_tooltip"
  ],
  
  "viewedScreens": {
    "home": 45,
    "listing": 23,
    "messages": 12,
    "profile": 8,
    "post": 5
  },
  
  "completedActions": [
    "first_listing_view",
    "first_message_sent",
    "first_listing_posted",
    "first_favorite_saved"
  ],
  
  "milestones": {
    "registrationDate": "2024-01-01T10:00:00.000Z",
    "firstListingViewDate": "2024-01-01T10:30:00.000Z",
    "firstMessageSentDate": "2024-01-02T14:00:00.000Z",
    "firstListingPostedDate": "2024-01-03T09:00:00.000Z",
    "firstSaleDate": "2024-01-10T16:00:00.000Z"
  },
  
  "features": {
    "hasSeenLandingPage": true,
    "hasCompletedAuth": true,
    "hasCompletedProfile": true,
    "hasViewedFirstListing": true,
    "hasPostedFirstListing": true,
    "hasSentFirstMessage": true,
    "hasUsedSearch": true,
    "hasUsedFilters": true,
    "hasSavedFavorite": true,
    "hasReceivedRating": true
  },
  
  "profileCompleteness": 85,
  
  "settings": {
    "guidanceLevel": "minimal",
    "language": "fr",
    "showAnimations": true
  },
  
  "sessionCount": 42,
  "lastActiveDate": "2024-01-15T18:30:00.000Z",
  "appVersion": "1.0.0",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-15T18:30:00.000Z"
}
```

### Step 2: User Updates App

Marie updates the app from the App Store. The new version (2.0.0) includes:
- Achievement system
- Gamification features
- New milestone tracking

### Step 3: First Launch After Update

When Marie opens the updated app:

```
┌─────────────────────────────────────────┐
│  App Launch (v2.0.0)                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  GuidanceContext initializes            │
│  Calls: GuidanceStorageService.loadState()│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Load state from AsyncStorage           │
│  Found: version "1.0.0"                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Version Check                          │
│  Stored: "1.0.0"                        │
│  Current: "2.0.0"                       │
│  Result: Migration needed! ⚠️           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Get Migration Path                     │
│  Path: ["1.0.0", "2.0.0"]              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Apply Migration: 1.0.0 → 2.0.0        │
│  Function: migrate_1_0_0_to_2_0_0()    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Migration Steps:                       │
│  1. Add completedAchievements: []       │
│  2. Add achievementDates: {}            │
│  3. Add milestones.firstFavoriteDate    │
│  4. Add milestones.firstRatingDate      │
│  5. Add milestones.onboardingCompletedDate│
│  6. Update version to "2.0.0"           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Merge with Defaults                    │
│  Ensure all fields exist                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Save Migrated State                    │
│  Write to AsyncStorage                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Return Migrated State                  │
│  App continues normally ✅              │
└─────────────────────────────────────────┘
```

### Step 4: Marie's State After Migration (v2.0.0)

```json
{
  "version": "2.0.0",  // ← Updated
  "installId": "install_1704096000_abc123",  // ← Preserved
  
  "completedTours": [  // ← Preserved
    "landing_tour",
    "auth_tour",
    "home_tour",
    "listing_detail_tour",
    "posting_tour"
  ],
  
  "dismissedTooltips": [  // ← Preserved
    "search_tooltip",
    "filter_tooltip",
    "favorite_tooltip",
    "message_tooltip"
  ],
  
  "viewedScreens": {  // ← Preserved
    "home": 45,
    "listing": 23,
    "messages": 12,
    "profile": 8,
    "post": 5
  },
  
  "completedActions": [  // ← Preserved
    "first_listing_view",
    "first_message_sent",
    "first_listing_posted",
    "first_favorite_saved"
  ],
  
  "completedAchievements": [],  // ← NEW: Added by migration
  "achievementDates": {},  // ← NEW: Added by migration
  
  "milestones": {
    "registrationDate": "2024-01-01T10:00:00.000Z",  // ← Preserved
    "firstListingViewDate": "2024-01-01T10:30:00.000Z",  // ← Preserved
    "firstMessageSentDate": "2024-01-02T14:00:00.000Z",  // ← Preserved
    "firstListingPostedDate": "2024-01-03T09:00:00.000Z",  // ← Preserved
    "firstSaleDate": "2024-01-10T16:00:00.000Z",  // ← Preserved
    "firstFavoriteDate": null,  // ← NEW: Added by migration
    "firstRatingDate": null,  // ← NEW: Added by migration
    "onboardingCompletedDate": null  // ← NEW: Added by migration
  },
  
  "features": {  // ← All preserved
    "hasSeenLandingPage": true,
    "hasCompletedAuth": true,
    "hasCompletedProfile": true,
    "hasViewedFirstListing": true,
    "hasPostedFirstListing": true,
    "hasSentFirstMessage": true,
    "hasUsedSearch": true,
    "hasUsedFilters": true,
    "hasSavedFavorite": true,
    "hasReceivedRating": true
  },
  
  "profileCompleteness": 85,  // ← Preserved
  
  "settings": {  // ← All preserved
    "guidanceLevel": "minimal",
    "language": "fr",
    "showAnimations": true
  },
  
  "sessionCount": 43,  // ← Incremented (42 + 1)
  "lastActiveDate": "2024-01-20T09:00:00.000Z",  // ← Updated to current time
  "appVersion": "2.0.0",  // ← Updated
  "createdAt": "2024-01-01T10:00:00.000Z",  // ← Preserved
  "updatedAt": "2024-01-20T09:00:00.000Z"  // ← Updated to current time
}
```

## What Marie Experiences

### User Experience

1. **Seamless Update**: Marie doesn't notice anything different
2. **No Data Loss**: All her progress is preserved
3. **New Features Available**: Achievement system is now active
4. **Settings Maintained**: Her preference for minimal guidance in French is kept
5. **Instant Access**: No loading screens or delays

### Behind the Scenes

```
Time: 0ms     - App starts
Time: 15ms    - State loaded from storage
Time: 18ms    - Version mismatch detected
Time: 20ms    - Migration path calculated
Time: 25ms    - Migration applied
Time: 30ms    - State merged with defaults
Time: 35ms    - Migrated state saved
Time: 40ms    - App ready
Total: 40ms   ✅ Under 50ms target
```

## Edge Cases Handled

### Case 1: Incomplete State

If Marie's state was missing some fields:

```json
{
  "version": "1.0.0",
  "installId": "install_123",
  "completedTours": ["tour1"]
  // Missing many fields!
}
```

**Result:** Migration fills in all missing fields with defaults:

```json
{
  "version": "2.0.0",
  "installId": "install_123",
  "completedTours": ["tour1"],
  "dismissedTooltips": [],  // ← Added
  "viewedScreens": {},  // ← Added
  "completedActions": [],  // ← Added
  // ... all other fields added with defaults
}
```

### Case 2: Legacy Format

If Marie had achievements in the old format:

```json
{
  "version": "1.0.0",
  "achievements": ["achievement1", "achievement2"]  // Old format
}
```

**Result:** Migration converts to new format:

```json
{
  "version": "2.0.0",
  "completedAchievements": ["achievement1", "achievement2"],  // New format
  "achievementDates": {}
  // "achievements" field removed
}
```

### Case 3: Corrupted State

If the stored state is corrupted:

```json
"invalid json{{{
```

**Result:** Migration returns default state:

```json
{
  "version": "2.0.0",
  "installId": "install_new_123",
  "completedTours": [],
  // ... all fields with defaults
}
```

## Performance Metrics

Based on Marie's state:

| Operation | Time | Target | Status |
|-----------|------|--------|--------|
| Load from storage | 15ms | <50ms | ✅ Pass |
| Version check | 3ms | <10ms | ✅ Pass |
| Migration | 5ms | <100ms | ✅ Pass |
| Merge defaults | 5ms | <50ms | ✅ Pass |
| Save to storage | 12ms | <100ms | ✅ Pass |
| **Total** | **40ms** | **<200ms** | ✅ Pass |

## Console Output

What developers see in the console:

```
[GuidanceStorage] Loading guidance state...
[GuidanceStorage] Stored version: 1.0.0, Current version: 2.0.0
[GuidanceStorage] Migrating guidance state from 1.0.0 to 2.0.0
[GuidanceStorage] Applying migration: 1.0.0 -> 2.0.0
[GuidanceStorage] Migration complete: 1.0.0 -> 2.0.0
[GuidanceStorage] State saved successfully
[GuidanceStorage] State load took 40.23ms (target: <50ms) ✅
```

## Summary

✅ **All user data preserved**
- 5 completed tours
- 4 dismissed tooltips
- 5 screen view counts
- 4 completed actions
- 5 milestone dates
- 10 feature flags
- Profile completeness (85%)
- All settings (minimal, French, animations)
- 42 sessions
- Install ID
- Creation date

✅ **New features added**
- Achievement tracking system
- Achievement dates
- 3 new milestone fields

✅ **Performance maintained**
- Total migration time: 40ms
- Under 50ms target
- No user-visible delay

✅ **Error handling**
- Handles incomplete state
- Handles corrupted data
- Handles legacy formats
- Graceful degradation

## Next Steps for Marie

After the migration, Marie can:
1. Continue using the app normally
2. Earn achievements as she uses features
3. Track her progress with the new gamification system
4. See her onboarding completion status
5. All without losing any of her existing progress!
