# Safety & Trust Guidance - Quick Reference

## Import

```typescript
import { SafetyTrustGuidance } from '@/components/guidance';
```

## Quick Usage Examples

### 1. Contact Info Detection in Chat

```typescript
<SafetyTrustGuidance messageText={currentMessage} />
```

### 2. Meeting Safety Tips

```typescript
<SafetyTrustGuidance
  hasMeetingArrangement={true}
  meetingContext="daytime" // or "evening" or "night"
/>
```

### 3. First Transaction

```typescript
<SafetyTrustGuidance
  isFirstTransaction={true}
  onFirstTransactionComplete={() => router.push('/rate')}
/>
```

### 4. Low Rating Feedback

```typescript
<SafetyTrustGuidance
  userRating={2.5}
  showLowRatingGuidance={true}
/>
```

### 5. Report Confirmation

```typescript
<SafetyTrustGuidance
  reportSubmitted={true}
  onReportAcknowledged={() => router.back()}
/>
```

## Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `messageText` | `string?` | Message to scan for contact info |
| `onContactInfoDetected` | `() => void?` | Callback when contact info found |
| `hasMeetingArrangement` | `boolean?` | Whether meeting is arranged |
| `meetingContext` | `'daytime' \| 'evening' \| 'night'?` | Time of meeting |
| `isFirstTransaction` | `boolean?` | Is this user's first transaction |
| `onFirstTransactionComplete` | `() => void?` | Callback after first transaction |
| `userRating` | `number?` | User's current rating |
| `showLowRatingGuidance` | `boolean?` | Show low rating feedback |
| `reportSubmitted` | `boolean?` | Report was submitted |
| `onReportAcknowledged` | `() => void?` | Callback after report acknowledged |

## Meeting Context Guide

```typescript
const getMeetingContext = (hour: number) => {
  if (hour >= 20 || hour < 6) return 'night';    // 8pm-6am: High risk
  if (hour >= 17) return 'evening';               // 5pm-8pm: Caution
  return 'daytime';                               // 6am-5pm: Safer
};
```

## Contact Info Patterns Detected

- **Phone**: `+243 XXX XXX XXX`, `0XXXXXXXXX`
- **Email**: `user@example.com`
- **Address**: Avenue, rue, commune, quartier, city names

## State Keys

- `safety_contact_info_warning`
- `safety_meeting_tips`
- `safety_first_transaction`
- `safety_low_rating_feedback`
- `safety_report_confirmation`

## Color Coding

- 🟢 Green: Safe (daytime, confirmations)
- 🟡 Yellow: Caution (contact info, evening)
- 🔴 Red: High risk (night meetings)
- 🔵 Blue: Info (ratings, tips)

## Languages Supported

- French (fr) - Primary
- English (en) - Secondary

## Requirements Covered

- ✅ 12.1: Contact info detection
- ✅ 12.2: Meeting safety tips
- ✅ 12.3: First transaction guidance
- ✅ 12.4: Low rating feedback
- ✅ 12.5: Report confirmation
