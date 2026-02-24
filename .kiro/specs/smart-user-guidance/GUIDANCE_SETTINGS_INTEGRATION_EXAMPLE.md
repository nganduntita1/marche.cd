# Guidance Settings - Integration Examples

## Example 1: Respecting Guidance Level in a Component

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Tooltip } from '@/components/guidance/Tooltip';

export function MyFeatureScreen() {
  const { state, shouldShowTooltip, markTooltipDismissed } = useGuidance();
  
  // Check if we should show the tooltip based on guidance level
  const showHelpTooltip = shouldShowTooltip('my_feature_help');
  
  return (
    <View>
      <Text>My Feature Content</Text>
      
      {showHelpTooltip && (
        <Tooltip
          content={{
            id: 'my_feature_help',
            title: 'Feature Help',
            message: 'This is how to use this feature...',
            placement: 'bottom',
          }}
          visible={true}
          onDismiss={() => markTooltipDismissed('my_feature_help')}
        />
      )}
    </View>
  );
}
```

## Example 2: Creating Critical Safety Guidance

```typescript
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';

export function ChatScreen() {
  const { shouldShowPrompt, markTooltipDismissed } = useGuidance();
  const [messageText, setMessageText] = useState('');
  
  // Check for phone numbers or addresses in message
  useEffect(() => {
    const hasContactInfo = /\d{10}|\d{3}-\d{3}-\d{4}/.test(messageText);
    
    if (hasContactInfo && shouldShowPrompt('safety_contact_info_warning')) {
      // This will show even in minimal mode because it includes 'safety'
      Alert.alert(
        'Safety Reminder',
        'Always meet in public places when sharing contact information.',
        [
          {
            text: 'Got it',
            onPress: () => markTooltipDismissed('safety_contact_info_warning'),
          },
        ]
      );
    }
  }, [messageText]);
  
  return (
    // ... chat UI
  );
}
```

## Example 3: Respecting Animation Preferences

```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';

export function AnimatedWelcome() {
  const { state } = useGuidance();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Respect user's animation preference
    const shouldAnimate = state?.settings.showAnimations ?? true;
    const duration = shouldAnimate ? 500 : 0;
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Welcome content */}
    </Animated.View>
  );
}
```

## Example 4: Conditional Guidance Based on Level

```typescript
import React from 'react';
import { View } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { GuidedTour } from '@/components/guidance/GuidedTour';
import { Tooltip } from '@/components/guidance/Tooltip';
import { HelpButton } from '@/components/guidance/HelpButton';

export function HomeScreen() {
  const { state, shouldShowTour } = useGuidance();
  const guidanceLevel = state?.settings.guidanceLevel;
  
  return (
    <View>
      {/* Full guidance: Show complete tour */}
      {guidanceLevel === 'full' && shouldShowTour('home_tour') && (
        <GuidedTour tourId="home_tour" />
      )}
      
      {/* Minimal guidance: Only show help button */}
      {guidanceLevel === 'minimal' && (
        <HelpButton screenName="home" />
      )}
      
      {/* Off: Help button still available */}
      {guidanceLevel === 'off' && (
        <HelpButton screenName="home" />
      )}
      
      {/* Main content */}
    </View>
  );
}
```

## Example 5: Checking Analytics Opt-in

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_OPT_IN_KEY = '@marche_cd:guidance_analytics_opt_in';

export async function trackGuidanceEvent(eventName: string, properties?: any) {
  // Check if user has opted in to analytics
  const optedIn = await AsyncStorage.getItem(ANALYTICS_OPT_IN_KEY);
  
  if (optedIn === 'true') {
    // Track the event (replace with your analytics service)
    console.log('Analytics Event:', eventName, properties);
    
    // Example with a real analytics service:
    // analytics.track(eventName, {
    //   ...properties,
    //   timestamp: new Date().toISOString(),
    // });
  }
}

// Usage
trackGuidanceEvent('tour_completed', { tourId: 'home_tour' });
trackGuidanceEvent('tooltip_dismissed', { tooltipId: 'search_help' });
```

## Example 6: Programmatically Changing Settings

```typescript
import React from 'react';
import { Button, Alert } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';

export function OnboardingComplete() {
  const { setGuidanceLevel } = useGuidance();
  
  const handleOnboardingComplete = async () => {
    // Ask user if they want to reduce guidance
    Alert.alert(
      'Onboarding Complete!',
      'Would you like to reduce guidance to minimal tips?',
      [
        {
          text: 'Keep Full Guidance',
          style: 'cancel',
        },
        {
          text: 'Switch to Minimal',
          onPress: async () => {
            await setGuidanceLevel('minimal');
            Alert.alert('Success', 'Guidance level updated to minimal tips.');
          },
        },
      ]
    );
  };
  
  return (
    <Button
      title="Complete Onboarding"
      onPress={handleOnboardingComplete}
    />
  );
}
```

## Example 7: Custom Guidance Component with Level Support

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGuidance } from '@/contexts/GuidanceContext';
import { Info } from 'lucide-react-native';

interface SmartHintProps {
  hintId: string;
  title: string;
  message: string;
  isCritical?: boolean;
}

export function SmartHint({ hintId, title, message, isCritical = false }: SmartHintProps) {
  const { state, shouldShowPrompt, markTooltipDismissed } = useGuidance();
  
  // Check if hint should be shown based on guidance level
  const shouldShow = shouldShowPrompt(
    isCritical ? `safety_${hintId}` : hintId,
    { isCritical }
  );
  
  if (!shouldShow) return null;
  
  return (
    <View style={[styles.container, isCritical && styles.critical]}>
      <Info size={20} color={isCritical ? '#ef4444' : '#3b82f6'} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={() => markTooltipDismissed(hintId)}>
        <Text style={styles.dismiss}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginVertical: 8,
  },
  critical: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#64748b',
  },
  dismiss: {
    fontSize: 18,
    color: '#94a3b8',
    marginLeft: 8,
  },
});
```

## Example 8: Guidance Settings Link in Profile

```typescript
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useGuidance } from '@/contexts/GuidanceContext';

export function ProfileScreen() {
  const router = useRouter();
  const { state } = useGuidance();
  
  const currentLevel = state?.settings.guidanceLevel || 'full';
  const levelLabels = {
    full: 'Full Guidance',
    minimal: 'Minimal Tips',
    off: 'Off',
  };
  
  return (
    <View>
      {/* Other profile content */}
      
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/guidance-settings')}
      >
        <Settings size={20} color="#10b981" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Guidance Settings</Text>
          <Text style={styles.settingSubtitle}>
            Current: {levelLabels[currentLevel]}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
```

## Example 9: Testing Guidance Levels

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGuidance } from '@/contexts/GuidanceContext';

describe('Guidance Level Filtering', () => {
  it('should show all tooltips in full mode', () => {
    const { result } = renderHook(() => useGuidance());
    
    act(() => {
      result.current.setGuidanceLevel('full');
    });
    
    expect(result.current.shouldShowTooltip('general_tip')).toBe(true);
    expect(result.current.shouldShowTooltip('safety_warning')).toBe(true);
  });
  
  it('should only show critical tooltips in minimal mode', () => {
    const { result } = renderHook(() => useGuidance());
    
    act(() => {
      result.current.setGuidanceLevel('minimal');
    });
    
    expect(result.current.shouldShowTooltip('general_tip')).toBe(false);
    expect(result.current.shouldShowTooltip('safety_warning')).toBe(true);
    expect(result.current.shouldShowTooltip('error_message')).toBe(true);
  });
  
  it('should not show any tooltips in off mode', () => {
    const { result } = renderHook(() => useGuidance());
    
    act(() => {
      result.current.setGuidanceLevel('off');
    });
    
    expect(result.current.shouldShowTooltip('general_tip')).toBe(false);
    expect(result.current.shouldShowTooltip('safety_warning')).toBe(false);
  });
});
```

## Example 10: Migration Helper

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Helper function to migrate users from old guidance system
 * to new guidance settings
 */
export async function migrateToGuidanceSettings() {
  try {
    // Check if user had old "disable_tips" setting
    const oldSetting = await AsyncStorage.getItem('disable_tips');
    
    if (oldSetting === 'true') {
      // User had tips disabled, set to minimal
      const guidanceState = await AsyncStorage.getItem('@marche_cd:guidance_state');
      if (guidanceState) {
        const state = JSON.parse(guidanceState);
        state.settings.guidanceLevel = 'minimal';
        await AsyncStorage.setItem('@marche_cd:guidance_state', JSON.stringify(state));
      }
      
      // Remove old setting
      await AsyncStorage.removeItem('disable_tips');
    }
    
    console.log('Guidance settings migration complete');
  } catch (error) {
    console.error('Error migrating guidance settings:', error);
  }
}

// Call this in your app initialization
// migrateToGuidanceSettings();
```

## Best Practices

### 1. Always Check Guidance Level
```typescript
// ✅ Good
if (shouldShowTooltip('my_tip')) {
  // Show tooltip
}

// ❌ Bad - bypasses user preference
<Tooltip visible={true} />
```

### 2. Mark Critical Content Appropriately
```typescript
// ✅ Good - will show in minimal mode
const tooltipId = 'safety_meeting_reminder';

// ❌ Bad - won't show in minimal mode
const tooltipId = 'meeting_reminder';
```

### 3. Respect Animation Preferences
```typescript
// ✅ Good
const duration = state?.settings.showAnimations ? 300 : 0;

// ❌ Bad - ignores user preference
const duration = 300;
```

### 4. Provide Help Icons in All Modes
```typescript
// ✅ Good - help always available
<HelpButton screenName="home" />

// ❌ Bad - no help when guidance is off
{guidanceLevel === 'full' && <HelpButton />}
```

### 5. Check Analytics Opt-in Before Tracking
```typescript
// ✅ Good
if (await isAnalyticsOptedIn()) {
  trackEvent('action');
}

// ❌ Bad - tracks without consent
trackEvent('action');
```

## Common Patterns

### Pattern 1: Progressive Disclosure
```typescript
// Show basic info in minimal mode, detailed in full mode
const message = guidanceLevel === 'full'
  ? 'Detailed explanation with examples...'
  : 'Brief safety tip';
```

### Pattern 2: Contextual Help
```typescript
// Always provide help button, adjust proactive guidance
<View>
  {guidanceLevel === 'full' && <ProactiveTip />}
  <HelpButton /> {/* Always available */}
</View>
```

### Pattern 3: Smart Defaults
```typescript
// Default to showing guidance, respect user choice
const shouldShow = state?.settings.guidanceLevel !== 'off' &&
                   !state?.dismissedTooltips.includes(id);
```

## Troubleshooting

### Issue: Guidance not respecting level
**Solution**: Ensure you're using `shouldShowTooltip/Tour/Prompt` methods

### Issue: Critical warnings not showing in minimal mode
**Solution**: Include 'safety', 'error', or 'warning' in the ID

### Issue: Settings not persisting
**Solution**: Check AsyncStorage permissions and error handling

### Issue: Screen reader not detected
**Solution**: Ensure AccessibilityInfo is imported and used correctly
