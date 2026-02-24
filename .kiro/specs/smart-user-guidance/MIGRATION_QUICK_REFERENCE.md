# State Migration Quick Reference

## Current Status

- **Current Version:** 2.0.0
- **Previous Version:** 1.0.0
- **Migration Status:** ✅ Implemented and tested

## Quick Facts

- ✅ Automatic migration on app load
- ✅ All user data preserved
- ✅ Backward compatible
- ✅ Performance optimized (<50ms)
- ✅ Error handling included
- ❌ Downgrade not supported

## Version Changes

### v2.0.0 (Current)

**Added:**
- `completedAchievements: string[]`
- `achievementDates: Record<string, string>`
- `milestones.firstFavoriteDate`
- `milestones.firstRatingDate`
- `milestones.onboardingCompletedDate`

**Migrated:**
- Old `achievements` array → `completedAchievements`

**Preserved:**
- All tours, tooltips, actions
- All milestones and features
- All settings and preferences
- Session count and timestamps

## API Quick Reference

```typescript
// Check if migration needed
const needsMigration = await GuidanceStorageService.needsMigration();

// Get stored version
const version = await GuidanceStorageService.getStoredVersion();

// Load state (auto-migrates if needed)
const state = await GuidanceStorageService.loadState();
```

## Adding a New Migration (Checklist)

- [ ] Update `CURRENT_VERSION` constant
- [ ] Add version to `VERSION_HISTORY`
- [ ] Update `GuidanceState` type
- [ ] Update `getDefaultState()` function
- [ ] Create `migrate_X_X_X_to_Y_Y_Y()` function
- [ ] Register migration in `applyMigration()` switch
- [ ] Write tests
- [ ] Update documentation
- [ ] Test with real user data

## Common Patterns

### Adding a New Field

```typescript
// In migration function
if (!newState.newField) {
  newState.newField = 'default_value';
}
```

### Renaming a Field

```typescript
// In migration function
if (oldState.oldName && !newState.newName) {
  newState.newName = oldState.oldName;
  delete newState.oldName;
}
```

### Converting Data Format

```typescript
// In migration function
if (oldState.oldFormat && Array.isArray(oldState.oldFormat)) {
  newState.newFormat = oldState.oldFormat.map(item => ({
    id: item,
    date: new Date().toISOString(),
  }));
  delete newState.oldFormat;
}
```

### Adding Nested Fields

```typescript
// In migration function
if (newState.milestones) {
  newState.milestones = {
    ...newState.milestones,
    newMilestone: newState.milestones.newMilestone || null,
  };
}
```

## Testing Commands

```bash
# Run migration tests (when Jest is configured)
npm test -- services/__tests__/guidanceStorage.migration.test.ts

# Run manual test script
npx ts-node services/__tests__/migration-manual-test.ts

# Type check
npm run typecheck
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration not running | Check version numbers in constants |
| Data missing | Verify migration function preserves fields |
| Performance slow | Check for expensive operations in migration |
| Type errors | Update GuidanceState interface |
| Tests failing | Check test data matches schema |

## Performance Targets

- State load: < 50ms
- State save: < 100ms
- Migration: < 100ms
- Memory: < 1MB

## Files to Update

When adding a migration:

1. `services/guidanceStorage.ts` - Migration logic
2. `types/guidance.ts` - Type definitions
3. `services/__tests__/guidanceStorage.migration.test.ts` - Tests
4. `.kiro/specs/smart-user-guidance/STATE_MIGRATION_GUIDE.md` - Documentation

## Example Migration Function

```typescript
/**
 * Migration from v2.0.0 to v3.0.0
 * Changes:
 * - Added newFeature field
 * - Renamed oldField to newField
 */
private static migrate_2_0_0_to_3_0_0(oldState: any): any {
  console.log('Applying migration 2.0.0 -> 3.0.0');
  
  const newState = {
    ...oldState,
    version: '3.0.0',
  };
  
  // Add new fields with defaults
  if (!newState.newFeature) {
    newState.newFeature = {
      enabled: false,
      data: [],
    };
  }
  
  // Rename fields
  if (oldState.oldField && !newState.newField) {
    newState.newField = oldState.oldField;
    delete newState.oldField;
  }
  
  newState.updatedAt = new Date().toISOString();
  
  return newState;
}
```

## Best Practices

1. ✅ Always preserve user data
2. ✅ Provide default values for new fields
3. ✅ Log migration events
4. ✅ Test with incomplete data
5. ✅ Handle errors gracefully
6. ✅ Document all changes
7. ❌ Never delete user progress
8. ❌ Don't support downgrades
9. ❌ Avoid expensive operations
10. ❌ Don't throw errors in migrations

## Support

- **Documentation:** `.kiro/specs/smart-user-guidance/STATE_MIGRATION_GUIDE.md`
- **Tests:** `services/__tests__/guidanceStorage.migration.test.ts`
- **Manual Test:** `services/__tests__/migration-manual-test.ts`
- **Type Definitions:** `types/guidance.ts`
- **Implementation:** `services/guidanceStorage.ts`
