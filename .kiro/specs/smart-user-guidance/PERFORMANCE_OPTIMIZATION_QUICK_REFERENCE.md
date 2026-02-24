# Performance Optimization - Quick Reference Guide

## Overview
This guide provides quick reference for the performance optimizations implemented in Task 20.

## Key Features

### 1. Automatic Optimizations (No Code Changes Needed)
These optimizations work automatically:

- ✅ **Lazy Loading**: Content loads on-demand
- ✅ **Debouncing**: State saves are automatically debounced (300ms)
- ✅ **Batching**: Multiple state updates are batched automatically
- ✅ **Memoization**: Computed values are cached
- ✅ **Performance Monitoring**: All operations are tracked

### 2. Performance Monitoring

#### View Performance Summary
```typescript
import { performanceMonitor } from './services/performanceMonitor';

// Log complete performance summary
performanceMonitor.logSummary();
```

#### Get Specific Operation Report
```typescript
const report = performanceMonitor.getReport('state_load');

console.log('Performance Report:');
console.log(`  Average: ${report.averageDuration.toFixed(2)}ms`);
console.log(`  P95: ${report.p95Duration.toFixed(2)}ms`);
console.log(`  Max: ${report.maxDuration.toFixed(2)}ms`);
console.log(`  Violations: ${report.violations}`);
```

#### Monitor Custom Operations
```typescript
import { measurePerformanceAsync } from './services/performanceMonitor';

// Async operation
const result = await measurePerformanceAsync('my_operation', async () => {
  return await someAsyncFunction();
});

// Sync operation
import { measurePerformance } from './services/performanceMonitor';

const result = measurePerformance('my_sync_operation', () => {
  return someExpensiveCalculation();
});
```

#### Manual Timing
```typescript
import { performanceMonitor } from './services/performanceMonitor';

const endTiming = performanceMonitor.startTiming('custom_operation');

// Your code here

endTiming(); // Records the metric
```

### 3. Performance Thresholds

Default thresholds (automatically monitored):

| Operation | Threshold | Requirement |
|-----------|-----------|-------------|
| `tooltip_render` | 100ms | 18.1 |
| `tour_render` | 100ms | 18.1 |
| `state_load` | 50ms | 18.2 |
| `state_save` | 100ms | 18.4 |
| `content_load` | 50ms | - |

#### Set Custom Threshold
```typescript
performanceMonitor.setThreshold('my_operation', 200); // 200ms threshold
```

### 4. Cache Management

#### Content Cache
The content cache is managed automatically:
- Caches tooltips, templates, and tours
- Clears automatically on language change
- No manual management needed

#### View Cache Statistics
Cache stats are logged with performance metrics:
```typescript
performanceMonitor.logSummary();
// Includes cache size information
```

### 5. State Update Optimization

#### Using Guidance Context
All state updates are automatically optimized:

```typescript
const { markTourCompleted, markTooltipDismissed } = useGuidance();

// These are automatically batched and debounced
await markTourCompleted('home_tour');
await markTooltipDismissed('search_tooltip');
await markActionCompleted('first_listing_view');
// All three updates will be batched into a single save
```

#### Batch Updates Manually (Advanced)
```typescript
import { GuidanceStorageService } from './services/guidanceStorage';

// Batch multiple updates
await GuidanceStorageService.batchUpdate([
  { completedTours: ['tour1', 'tour2'] },
  { dismissedTooltips: ['tooltip1'] },
  { sessionCount: 5 },
]);
```

## Performance Best Practices

### DO ✅
- Use the guidance context hooks for state updates
- Let the system handle batching and debouncing
- Monitor performance regularly with `logSummary()`
- Set appropriate thresholds for custom operations
- Use `measurePerformanceAsync` for expensive operations

### DON'T ❌
- Don't bypass the context to update state directly
- Don't call `saveState` directly (use context methods)
- Don't disable debouncing (it's optimized)
- Don't clear the content cache manually
- Don't ignore performance warnings in console

## Monitoring in Production

### Periodic Performance Checks
```typescript
// In your app initialization or settings screen
useEffect(() => {
  const interval = setInterval(() => {
    performanceMonitor.logSummary();
  }, 60000); // Every minute

  return () => clearInterval(interval);
}, []);
```

### Performance Dashboard (Future)
```typescript
// Example component for performance dashboard
function PerformanceDashboard() {
  const reports = performanceMonitor.getAllReports();
  
  return (
    <View>
      {Array.from(reports.entries()).map(([name, report]) => (
        <View key={name}>
          <Text>{name}</Text>
          <Text>Avg: {report.averageDuration.toFixed(2)}ms</Text>
          <Text>P95: {report.p95Duration.toFixed(2)}ms</Text>
        </View>
      ))}
    </View>
  );
}
```

## Troubleshooting

### Performance Warnings
If you see warnings like:
```
Performance threshold exceeded for state_save: 150ms (threshold: 100ms)
```

**Possible causes:**
1. Device is under heavy load
2. State object is very large
3. AsyncStorage is slow on device

**Solutions:**
1. Check if state can be reduced
2. Verify batching is working
3. Consider increasing threshold if appropriate

### High Memory Usage
If cache grows too large:

```typescript
// Cache is automatically limited to 100 items per type
// But you can monitor size:
performanceMonitor.logSummary(); // Shows cache sizes
```

### Slow State Loads
If state loads exceed 50ms:

**Check:**
1. State object size (should be <100KB)
2. Device storage speed
3. Number of completed tours/tooltips

**Solutions:**
1. Implement state cleanup for old data
2. Consider state compression
3. Archive old achievements

## Performance Metrics Interpretation

### Good Performance ✅
```
state_load:
  Average: 25ms
  P95: 40ms
  Violations: 0
```

### Acceptable Performance ⚠️
```
state_load:
  Average: 45ms
  P95: 55ms
  Violations: 5 (5%)
```

### Poor Performance ❌
```
state_load:
  Average: 80ms
  P95: 120ms
  Violations: 25 (25%)
```

## Quick Debugging

### Check if Batching is Working
```typescript
// In GuidanceContext, check metrics
console.log('State updates:', performanceMetrics.current.stateUpdates);
console.log('Storage writes:', performanceMetrics.current.storageWrites);

// Ratio should be ~10:1 or higher (10 updates per 1 write)
```

### Check if Debouncing is Working
```typescript
// Rapidly trigger updates
for (let i = 0; i < 10; i++) {
  await markActionCompleted(`action_${i}`);
}

// Should result in only 1-2 storage writes (check logs)
```

### Check if Memoization is Working
```typescript
// In component using guidance
const achievements = getAchievements();

// Re-render component multiple times
// Achievements should not be recalculated unless state changes
```

## Summary

The performance optimization system provides:
- ✅ Automatic optimization of all state operations
- ✅ Comprehensive monitoring and reporting
- ✅ Configurable thresholds and warnings
- ✅ Easy integration with existing code
- ✅ No breaking changes to existing APIs

For most use cases, no code changes are needed - the optimizations work automatically!
