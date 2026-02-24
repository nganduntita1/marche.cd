# State Migration Guide

## Overview

The Guidance System includes a robust state migration system that ensures user data is preserved when the app is updated with new features or schema changes. This guide explains how the migration system works and how to add new migrations.

## Current Version

**Current Version:** 2.0.0

## Version History

| Version | Release Date | Changes |
|---------|--------------|---------|
| 1.0.0   | Initial      | Initial guidance state schema |
| 2.0.0   | Current      | Added achievements, gamification, and new milestone fields |

## How Migration Works

### Automatic Migration

When a user opens the app after an update:

1. **Version Detection**: The system checks the stored state version against the current version
2. **Migration Path**: If versions differ, the system determines the migration path
3. **Sequential Migration**: Migrations are applied in sequence (e.g., 1.0.0 → 1.1.0 → 2.0.0)
4. **Data Preservation**: All user progress data is preserved during migration
5. **Backward Compatibility**: Missing fields are filled with default values
6. **Persistence**: The migrated state is saved to storage

### Migration Flow

```
┌─────────────────────┐
│   Load State from   │
│    AsyncStorage     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Check Version      │
│  Stored vs Current  │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Same Version?│
    └──────┬───────┘
           │
     ┌─────┴─────┐
     │           │
    Yes          No
     │           │
     │           ▼
     │    ┌──────────────┐
     │    │ Get Migration│
     │    │     Path     │
     │    └──────┬───────┘
     │           │
     │           ▼
     │    ┌──────────────┐
     │    │Apply Migrations│
     │    │  Sequentially  │
     │    └──────┬───────┘
     │           │
     │           ▼
     │    ┌──────────────┐
     │    │ Merge with   │
     │    │   Defaults   │
     │    └──────┬───────┘
     │           │
     └─────┬─────┘
           │
           ▼
    ┌──────────────┐
    │ Save Migrated│
    │    State     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Return State │
    └──────────────┘
```

## Migration from v1.0.0 to v2.0.0

### Changes

**New Fields Added:**
- `completedAchievements: string[]` - Array of completed achievement IDs
- `achievementDates: Record<string, string>` - Map of achievement IDs to completion dates
- `milestones.firstFavoriteDate: string | null` - Date user first saved a favorite
- `milestones.firstRatingDate: string | null` - Date user first received a rating
- `milestones.onboardingCompletedDate: string | null` - Date onboarding was completed

**Legacy Format Conversion:**
- Old `achievements` array → New `completedAchievements` array

### Data Preservation

All existing user data is preserved:
- ✅ Completed tours
- ✅ Dismissed tooltips
- ✅ Screen view counts
- ✅ Completed actions
- ✅ Milestones
- ✅ Feature flags
- ✅ Profile completeness
- ✅ Settings (guidance level, language, animations)
- ✅ Session count
- ✅ Install ID
- ✅ Timestamps

### Example

**Before Migration (v1.0.0):**
```json
{
  "version": "1.0.0",
  "installId": "install_123",
  "completedTours": ["landing_tour", "auth_tour"],
  "milestones": {
    "registrationDate": "2024-01-01T00:00:00.000Z",
    "firstListingViewDate": "2024-01-02T00:00:00.000Z",
    "firstMessageSentDate": null,
    "firstListingPostedDate": null,
    "firstSaleDate": null
  }
}
```

**After Migration (v2.0.0):**
```json
{
  "version": "2.0.0",
  "installId": "install_123",
  "completedTours": ["landing_tour", "auth_tour"],
  "completedAchievements": [],
  "achievementDates": {},
  "milestones": {
    "registrationDate": "2024-01-01T00:00:00.000Z",
    "firstListingViewDate": "2024-01-02T00:00:00.000Z",
    "firstMessageSentDate": null,
    "firstListingPostedDate": null,
    "firstSaleDate": null,
    "firstFavoriteDate": null,
    "firstRatingDate": null,
    "onboardingCompletedDate": null
  }
}
```

## Adding a New Migration

When you need to add a new version with schema changes:

### Step 1: Update Version Constants

```typescript
// services/guidanceStorage.ts

const CURRENT_VERSION = '3.0.0'; // Update to new version

const VERSION_HISTORY = ['1.0.0', '2.0.0', '3.0.0'] as const; // Add new version
```

### Step 2: Update Type Definitions

```typescript
// types/guidance.ts

export interface GuidanceState {
  // ... existing fields ...
  
  // Add new fields
  newField: string;
  anotherNewField: number;
}
```

### Step 3: Update Default State

```typescript
// services/guidanceStorage.ts

const getDefaultState = (): GuidanceState => ({
  // ... existing defaults ...
  
  // Add defaults for new fields
  newField: 'default_value',
  anotherNewField: 0,
});
```

### Step 4: Create Migration Function

```typescript
// services/guidanceStorage.ts

/**
 * Migration from v2.0.0 to v3.0.0
 * Changes:
 * - Added newField
 * - Added anotherNewField
 * - Renamed oldField to renamedField
 */
private static migrate_2_0_0_to_3_0_0(oldState: any): any {
  console.log('Applying migration 2.0.0 -> 3.0.0');
  
  const newState = {
    ...oldState,
    version: '3.0.0',
  };
  
  // Add new fields
  if (!newState.newField) {
    newState.newField = 'default_value';
  }
  
  if (!newState.anotherNewField) {
    newState.anotherNewField = 0;
  }
  
  // Handle field renames
  if (oldState.oldField && !newState.renamedField) {
    newState.renamedField = oldState.oldField;
    delete newState.oldField;
  }
  
  newState.updatedAt = new Date().toISOString();
  
  return newState;
}
```

### Step 5: Register Migration

```typescript
// services/guidanceStorage.ts

private static async applyMigration(
  fromVersion: string,
  toVersion: string,
  state: any
): Promise<any> {
  const migrationKey = `${fromVersion}_to_${toVersion}`;
  
  switch (migrationKey) {
    case '1.0.0_to_2.0.0':
      return this.migrate_1_0_0_to_2_0_0(state);
    
    case '2.0.0_to_3.0.0': // Add new case
      return this.migrate_2_0_0_to_3_0_0(state);
    
    default:
      console.warn(`No specific migration for ${migrationKey}`);
      return state;
  }
}
```

### Step 6: Test Migration

Create tests in `services/__tests__/guidanceStorage.migration.test.ts`:

```typescript
describe('Migration from v2.0.0 to v3.0.0', () => {
  it('should add new fields', async () => {
    const v2State = {
      version: '2.0.0',
      installId: 'test_install',
      // ... existing fields ...
    };

    const migratedState = await GuidanceStorageService.loadState();

    expect(migratedState.newField).toBeDefined();
    expect(migratedState.anotherNewField).toBeDefined();
    expect(migratedState.version).toBe('3.0.0');
  });

  it('should preserve existing data', async () => {
    // Test that all old data is preserved
  });
});
```

## Best Practices

### 1. Always Preserve User Data

Never delete or lose user progress during migration. If a field is being removed, consider:
- Migrating the data to a new format
- Archiving the data in a different field
- Only removing truly obsolete data

### 2. Provide Default Values

Always provide sensible default values for new fields:
```typescript
// Good
newField: newState.newField || 'default_value'

// Bad
newField: newState.newField // Could be undefined
```

### 3. Handle Edge Cases

Consider these scenarios:
- Missing fields
- Null values
- Invalid data types
- Corrupted state
- Very old versions

### 4. Test Thoroughly

Test migrations with:
- Complete state objects
- Incomplete state objects
- Corrupted data
- Multiple version jumps (e.g., 1.0.0 → 3.0.0)

### 5. Log Migration Events

Always log migration events for debugging:
```typescript
console.log(`Migrating from ${oldVersion} to ${newVersion}`);
console.log('Migration complete');
```

### 6. Document Changes

Update this guide with:
- Version number
- Date
- List of changes
- Migration notes
- Breaking changes (if any)

## Backward Compatibility

The migration system ensures backward compatibility through:

### 1. Default Value Merging

Missing fields are automatically filled with defaults:
```typescript
const mergedState = {
  ...defaultState,
  ...oldState,
  version: newVersion,
};
```

### 2. Graceful Degradation

If migration fails:
- System logs the error
- Returns default state
- App continues to function
- User can still use the app

### 3. No Downgrade Support

Downgrading (e.g., 2.0.0 → 1.0.0) is not supported:
- Prevents data loss
- Simplifies migration logic
- Users should always update to latest version

## Troubleshooting

### Migration Not Triggering

**Problem:** State not migrating after update

**Solutions:**
1. Check version numbers are correct
2. Verify VERSION_HISTORY includes all versions
3. Check AsyncStorage has the old state
4. Look for errors in console logs

### Data Loss After Migration

**Problem:** User data missing after migration

**Solutions:**
1. Check migration function preserves all fields
2. Verify mergeWithDefaults includes all fields
3. Test migration with real user data
4. Check for typos in field names

### Migration Performance Issues

**Problem:** Migration takes too long

**Solutions:**
1. Optimize migration functions
2. Avoid expensive operations
3. Use batch updates
4. Consider lazy migration for large datasets

### Corrupted State

**Problem:** State becomes corrupted during migration

**Solutions:**
1. Add validation before migration
2. Use try-catch blocks
3. Implement rollback mechanism
4. Return default state on critical errors

## API Reference

### GuidanceStorageService.needsMigration()

Check if migration is needed without loading state.

```typescript
const needsMigration = await GuidanceStorageService.needsMigration();
// Returns: boolean
```

### GuidanceStorageService.getStoredVersion()

Get the version of stored state without loading it.

```typescript
const version = await GuidanceStorageService.getStoredVersion();
// Returns: string | null
```

### GuidanceStorageService.migrateState()

Manually trigger migration (usually called automatically).

```typescript
const migratedState = await GuidanceStorageService.migrateState(
  '1.0.0',  // fromVersion
  '2.0.0',  // toVersion
  oldState  // state to migrate
);
// Returns: GuidanceState
```

## Testing

### Manual Testing

1. Install app with old version
2. Use app to generate state data
3. Update app to new version
4. Verify data is preserved
5. Check new fields are added

### Automated Testing

Run migration tests:
```bash
npm test -- services/__tests__/guidanceStorage.migration.test.ts
```

### Test Checklist

- [ ] Version detection works
- [ ] Migration path is correct
- [ ] All user data is preserved
- [ ] New fields are added
- [ ] Default values are set
- [ ] Backward compatibility works
- [ ] Error handling works
- [ ] Performance is acceptable (<50ms)

## Future Considerations

### Planned Features

Future versions may include:
- Cloud backup before migration
- Migration rollback capability
- Migration analytics
- A/B testing for migrations
- Incremental migration for large datasets

### Schema Evolution

As the app grows, consider:
- Breaking changes policy
- Deprecation timeline
- Migration complexity limits
- State size optimization

## Support

For migration issues:
1. Check console logs for errors
2. Review this guide
3. Test with manual test script
4. Contact development team

## Changelog

### v2.0.0 (Current)
- Added achievements system
- Added gamification features
- Added new milestone tracking
- Improved backward compatibility

### v1.0.0 (Initial)
- Initial guidance state schema
- Basic progress tracking
- Settings management
