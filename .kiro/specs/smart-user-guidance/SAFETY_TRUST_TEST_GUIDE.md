# Safety & Trust Guidance - Testing Guide

## Manual Testing Checklist

### 1. Contact Info Detection Testing

#### Test Cases

**TC1.1: DRC Phone Number Detection**
- [ ] Input: `Mon numéro est +243 812 345 678`
- [ ] Expected: Safety warning modal appears
- [ ] Verify: Shield icon, yellow background
- [ ] Verify: French safety tips displayed

**TC1.2: Local Phone Format**
- [ ] Input: `Appelez-moi au 0812345678`
- [ ] Expected: Safety warning modal appears
- [ ] Verify: Same warning as TC1.1

**TC1.3: Email Detection**
- [ ] Input: `Contactez-moi à user@example.com`
- [ ] Expected: Safety warning modal appears
- [ ] Verify: Email pattern detected

**TC1.4: Address Detection**
- [ ] Input: `Je suis à l'avenue Kasa-Vubu`
- [ ] Expected: Safety warning modal appears
- [ ] Verify: French address terms detected

**TC1.5: City Name Detection**
- [ ] Input: `Je suis à Kinshasa`
- [ ] Expected: Safety warning modal appears
- [ ] Verify: Major city names detected

**TC1.6: No Contact Info**
- [ ] Input: `Bonjour, comment allez-vous?`
- [ ] Expected: No modal appears
- [ ] Verify: Normal chat continues

**TC1.7: Dismissal Persistence**
- [ ] Dismiss warning modal
- [ ] Send another message with contact info
- [ ] Expected: Modal does NOT appear again
- [ ] Verify: State persisted correctly

---

### 2. Meeting Safety Tips Testing

#### Test Cases

**TC2.1: Daytime Meeting (10am)**
- [ ] Set `meetingContext="daytime"`
- [ ] Set `hasMeetingArrangement={true}`
- [ ] Expected: Green modal with positive tone
- [ ] Verify: Checklist of safety measures
- [ ] Verify: "Compris" button

**TC2.2: Evening Meeting (6pm)**
- [ ] Set `meetingContext="evening"`
- [ ] Set `hasMeetingArrangement={true}`
- [ ] Expected: Yellow modal with caution
- [ ] Verify: Extra precautions listed
- [ ] Verify: "Je serai prudent(e)" button

**TC2.3: Night Meeting (10pm)**
- [ ] Set `meetingContext="night"`
- [ ] Set `hasMeetingArrangement={true}`
- [ ] Expected: Red modal with strong warning
- [ ] Verify: Recommendation to reschedule
- [ ] Verify: High-risk indicators (🚨)

**TC2.4: No Meeting Arranged**
- [ ] Set `hasMeetingArrangement={false}`
- [ ] Expected: No modal appears
- [ ] Verify: Component renders without errors

**TC2.5: Context Switching**
- [ ] Start with daytime context
- [ ] Change to night context
- [ ] Expected: Modal updates appropriately
- [ ] Verify: Color and content change

---

### 3. First Transaction Testing

#### Test Cases

**TC3.1: First Transaction Completion**
- [ ] Set `isFirstTransaction={true}`
- [ ] Expected: Celebration modal appears
- [ ] Verify: Green background, CheckCircle icon
- [ ] Verify: Congratulatory message
- [ ] Verify: Two buttons visible

**TC3.2: "Leave Rating" Button**
- [ ] Click "Laisser une évaluation"
- [ ] Expected: `onFirstTransactionComplete` called
- [ ] Verify: Modal dismisses
- [ ] Verify: State marked as completed

**TC3.3: "Maybe Later" Button**
- [ ] Click "Peut-être plus tard"
- [ ] Expected: Modal dismisses
- [ ] Verify: State saved
- [ ] Verify: Can be shown again later

**TC3.4: Not First Transaction**
- [ ] Set `isFirstTransaction={false}`
- [ ] Expected: No modal appears
- [ ] Verify: Component silent

**TC3.5: Callback Execution**
- [ ] Provide `onFirstTransactionComplete` callback
- [ ] Complete first transaction
- [ ] Expected: Callback executes
- [ ] Verify: Navigation or action occurs

---

### 4. Low Rating Feedback Testing

#### Test Cases

**TC4.1: Rating Below 3 Stars**
- [ ] Set `userRating={2.5}`
- [ ] Set `showLowRatingGuidance={true}`
- [ ] Expected: Blue modal with supportive message
- [ ] Verify: Star icon displayed
- [ ] Verify: Improvement tips listed

**TC4.2: Rating of 1 Star**
- [ ] Set `userRating={1.0}`
- [ ] Set `showLowRatingGuidance={true}`
- [ ] Expected: Same supportive modal
- [ ] Verify: No judgmental language
- [ ] Verify: Actionable advice provided

**TC4.3: Rating of 3 Stars or Above**
- [ ] Set `userRating={3.0}`
- [ ] Set `showLowRatingGuidance={true}`
- [ ] Expected: No modal appears
- [ ] Verify: Threshold is < 3

**TC4.4: Dismissal**
- [ ] Show low rating modal
- [ ] Click "Je ferai mieux"
- [ ] Expected: Modal dismisses
- [ ] Verify: State persisted
- [ ] Verify: Won't show again

**TC4.5: No Rating**
- [ ] Set `userRating={undefined}`
- [ ] Set `showLowRatingGuidance={true}`
- [ ] Expected: No modal appears
- [ ] Verify: Handles undefined gracefully

---

### 5. Report Confirmation Testing

#### Test Cases

**TC5.1: Report Submitted**
- [ ] Set `reportSubmitted={true}`
- [ ] Expected: Green confirmation modal
- [ ] Verify: CheckCircle icon
- [ ] Verify: Process explanation clear
- [ ] Verify: 24-hour timeline mentioned

**TC5.2: Acknowledgment Callback**
- [ ] Provide `onReportAcknowledged` callback
- [ ] Click "Compris"
- [ ] Expected: Callback executes
- [ ] Verify: Modal dismisses
- [ ] Verify: Navigation occurs

**TC5.3: No Report**
- [ ] Set `reportSubmitted={false}`
- [ ] Expected: No modal appears
- [ ] Verify: Component silent

**TC5.4: Multiple Reports**
- [ ] Submit first report
- [ ] Dismiss modal
- [ ] Submit second report
- [ ] Expected: Modal appears again
- [ ] Verify: Each report acknowledged

---

### 6. Language Testing

#### Test Cases

**TC6.1: French Language**
- [ ] Set language to French in GuidanceContext
- [ ] Trigger any modal
- [ ] Expected: All text in French
- [ ] Verify: Proper French grammar
- [ ] Verify: Cultural appropriateness

**TC6.2: English Language**
- [ ] Set language to English in GuidanceContext
- [ ] Trigger any modal
- [ ] Expected: All text in English
- [ ] Verify: Clear, simple English
- [ ] Verify: Professional tone

**TC6.3: Language Switching**
- [ ] Open modal in French
- [ ] Switch language to English
- [ ] Expected: Content updates immediately
- [ ] Verify: No layout issues

---

### 7. Integration Testing

#### Test Cases

**TC7.1: With GuidanceContext**
- [ ] Wrap component in GuidanceProvider
- [ ] Trigger various modals
- [ ] Expected: All features work
- [ ] Verify: State persists correctly

**TC7.2: Guidance Level: Off**
- [ ] Set guidance level to "off"
- [ ] Trigger any modal
- [ ] Expected: No modals appear
- [ ] Verify: Respects user preference

**TC7.3: Guidance Level: Minimal**
- [ ] Set guidance level to "minimal"
- [ ] Trigger safety warnings
- [ ] Expected: Critical warnings still show
- [ ] Verify: Non-critical hidden

**TC7.4: Multiple Triggers Simultaneously**
- [ ] Trigger contact info + meeting safety
- [ ] Expected: One modal at a time
- [ ] Verify: No conflicts or crashes

---

### 8. UI/UX Testing

#### Test Cases

**TC8.1: Modal Appearance**
- [ ] Trigger any modal
- [ ] Verify: Smooth fade-in animation
- [ ] Verify: Centered on screen
- [ ] Verify: Overlay dims background

**TC8.2: Close Button**
- [ ] Click X button (top-right)
- [ ] Expected: Modal dismisses
- [ ] Verify: State saved
- [ ] Verify: Smooth fade-out

**TC8.3: Scrollable Content**
- [ ] Open modal with long content
- [ ] Verify: Content scrolls smoothly
- [ ] Verify: Buttons remain visible
- [ ] Verify: No layout overflow

**TC8.4: Touch Targets**
- [ ] Test on mobile device
- [ ] Verify: All buttons easily tappable
- [ ] Verify: Minimum 44pt touch targets
- [ ] Verify: No accidental taps

**TC8.5: Responsive Design**
- [ ] Test on phone (< 768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify: Appropriate sizing for each

---

### 9. Edge Cases Testing

#### Test Cases

**TC9.1: Rapid Triggering**
- [ ] Trigger same modal multiple times quickly
- [ ] Expected: Handles gracefully
- [ ] Verify: No duplicate modals
- [ ] Verify: No state corruption

**TC9.2: App Backgrounding**
- [ ] Open modal
- [ ] Background app
- [ ] Return to app
- [ ] Expected: Modal still visible or dismissed
- [ ] Verify: No crashes

**TC9.3: Network Issues**
- [ ] Trigger modal
- [ ] Disconnect network
- [ ] Dismiss modal
- [ ] Expected: State saves locally
- [ ] Verify: Works offline

**TC9.4: Empty/Null Props**
- [ ] Pass undefined/null for all props
- [ ] Expected: Component renders without errors
- [ ] Verify: No modals appear
- [ ] Verify: No console errors

**TC9.5: Very Long Text**
- [ ] Pass extremely long message text
- [ ] Expected: Detection still works
- [ ] Verify: Modal scrolls properly
- [ ] Verify: Performance acceptable

---

### 10. Accessibility Testing

#### Test Cases

**TC10.1: Screen Reader**
- [ ] Enable screen reader (TalkBack/VoiceOver)
- [ ] Trigger modal
- [ ] Expected: Title announced
- [ ] Verify: All text readable
- [ ] Verify: Buttons labeled clearly

**TC10.2: Keyboard Navigation**
- [ ] Use keyboard only
- [ ] Tab through elements
- [ ] Expected: Focus visible
- [ ] Verify: Can activate buttons
- [ ] Verify: Can dismiss with Escape

**TC10.3: High Contrast**
- [ ] Enable high contrast mode
- [ ] Trigger modals
- [ ] Expected: Text still readable
- [ ] Verify: Sufficient contrast ratios
- [ ] Verify: Icons visible

**TC10.4: Large Text**
- [ ] Enable large text accessibility setting
- [ ] Trigger modals
- [ ] Expected: Text scales appropriately
- [ ] Verify: No layout breaks
- [ ] Verify: Still readable

---

## Performance Testing

### Metrics to Measure

**Modal Render Time**
- Target: < 100ms
- Measure: Time from trigger to visible
- Tool: React DevTools Profiler

**Contact Detection Time**
- Target: < 10ms per message
- Measure: Regex execution time
- Tool: console.time/timeEnd

**State Persistence Time**
- Target: < 50ms
- Measure: AsyncStorage write time
- Tool: Performance API

**Memory Usage**
- Target: < 5MB additional
- Measure: Before/after component mount
- Tool: React Native Performance Monitor

### Performance Test Cases

**PT1: Rapid Message Scanning**
```typescript
// Send 100 messages quickly
for (let i = 0; i < 100; i++) {
  setMessage(`Test message ${i}`);
}
// Verify: No lag, no memory leak
```

**PT2: Modal Open/Close Cycles**
```typescript
// Open and close modal 50 times
for (let i = 0; i < 50; i++) {
  openModal();
  await delay(100);
  closeModal();
  await delay(100);
}
// Verify: Consistent performance
```

**PT3: Long-Running Session**
```typescript
// Keep component mounted for 1 hour
// Trigger modals periodically
// Verify: No memory growth
// Verify: Performance stable
```

---

## Automated Testing

### Unit Tests

```typescript
describe('SafetyTrustGuidance', () => {
  describe('Contact Info Detection', () => {
    it('detects DRC phone numbers', () => {
      // Test implementation
    });
    
    it('detects email addresses', () => {
      // Test implementation
    });
    
    it('detects French address terms', () => {
      // Test implementation
    });
  });
  
  describe('Meeting Context', () => {
    it('shows appropriate warning for night meetings', () => {
      // Test implementation
    });
  });
  
  describe('State Management', () => {
    it('persists dismissal state', () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

```typescript
describe('SafetyTrustGuidance Integration', () => {
  it('works with GuidanceContext', () => {
    // Test implementation
  });
  
  it('respects guidance level settings', () => {
    // Test implementation
  });
  
  it('handles language switching', () => {
    // Test implementation
  });
});
```

---

## Bug Report Template

```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Device: [iPhone 12, Samsung Galaxy S21, etc.]
- OS: [iOS 15, Android 12, etc.]
- App Version: [1.0.0]
- Language: [French/English]

### Screenshots
[Attach screenshots if applicable]

### Additional Context
[Any other relevant information]
```

---

## Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Device**: [Device info]
**Build**: [Version]

### Contact Info Detection
- TC1.1: ✅ Pass
- TC1.2: ✅ Pass
- TC1.3: ✅ Pass
- TC1.4: ✅ Pass
- TC1.5: ✅ Pass
- TC1.6: ✅ Pass
- TC1.7: ❌ Fail - [Issue description]

### Meeting Safety
- TC2.1: ✅ Pass
- TC2.2: ✅ Pass
- TC2.3: ✅ Pass
- TC2.4: ✅ Pass
- TC2.5: ✅ Pass

[Continue for all test cases...]

### Issues Found
1. [Issue 1 description]
2. [Issue 2 description]

### Overall Status
- Total Tests: 50
- Passed: 48
- Failed: 2
- Blocked: 0
- Pass Rate: 96%
```

---

## Regression Testing

After any code changes, re-run:

1. **Critical Path Tests**
   - Contact info detection (TC1.1-1.7)
   - Meeting safety (TC2.1-2.3)
   - First transaction (TC3.1-3.2)

2. **Integration Tests**
   - GuidanceContext integration (TC7.1)
   - Language switching (TC6.3)
   - State persistence (TC1.7)

3. **Performance Tests**
   - Modal render time
   - Contact detection speed
   - Memory usage

---

## Sign-Off Checklist

Before marking task as complete:

- [ ] All manual test cases passed
- [ ] No critical bugs found
- [ ] Performance metrics met
- [ ] Accessibility verified
- [ ] Both languages tested
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Integration verified
- [ ] Edge cases handled
- [ ] User acceptance obtained
