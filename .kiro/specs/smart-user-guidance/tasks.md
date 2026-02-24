# Implementation Plan

- [x] 1. Set up core guidance infrastructure
  - Create GuidanceContext with state management
  - Implement GuidanceStorageService with AsyncStorage
  - Set up TypeScript interfaces and types
  - Add guidance state schema
  - _Requirements: 15.1, 15.2, 18.4_

- [ ]* 1.1 Write property test for state persistence
  - **Property 1: State Persistence Consistency**
  - **Validates: Requirements 15.1, 15.2**

- [ ]* 1.2 Write property test for tour completion idempotence
  - **Property 2: Tour Completion Idempotence**
  - **Validates: Requirements 15.1**

- [x] 2. Build guidance content service
  - Create GuidanceContentService for content management
  - Define content schema for tooltips, tours, and templates
  - Implement i18n integration for French/English
  - Create content definition files
  - _Requirements: 16.1, 16.2, 16.3_

- [ ]* 2.1 Write property test for language consistency
  - **Property 5: Language Consistency**
  - **Validates: Requirements 16.3**

- [x] 3. Implement trigger evaluation engine
  - Create TriggerEvaluationEngine for conditional logic
  - Implement first-visit detection
  - Add time-based trigger support
  - Add action-based trigger support
  - Add state-based trigger support
  - _Requirements: 3.4, 4.3, 5.4_

- [ ]* 3.1 Write property test for first visit detection
  - **Property 6: First Visit Detection Accuracy**
  - **Validates: Requirements 3.1, 4.1, 5.1**

- [ ]* 3.2 Write property test for trigger determinism
  - **Property 9: Trigger Condition Evaluation Determinism**
  - **Validates: Requirements 3.4, 4.3, 5.4**

- [x] 4. Create base UI components
  - Build Tooltip component with positioning logic
  - Build GuidedTour component with step navigation
  - Build ContextualPrompt component
  - Build HelpButton floating action button
  - Add animations using React Native Animated API
  - _Requirements: 1.2, 2.1, 3.2_

- [ ]* 4.1 Write property test for tour step sequence
  - **Property 11: Tour Step Sequence Integrity**
  - **Validates: Requirements 2.1, 3.2**

- [x] 5. Implement message template system
  - Create MessageTemplatePicker component
  - Define message templates for common scenarios
  - Implement template variable substitution
  - Add template categories (inquiry, negotiation, meeting, thanks)
  - _Requirements: 5.2, 5.3_

- [ ]* 5.1 Write property test for template variable substitution
  - **Property 8: Message Template Variable Substitution**
  - **Validates: Requirements 5.2, 5.3**

- [x] 6. Build landing page guidance
  - Add welcome message animation
  - Implement download button highlight
  - Create platform-specific instructions for web
  - Add state persistence for landing page completion
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 6.1 Write unit tests for landing page guidance
  - Test welcome message display
  - Test download button highlight
  - Test platform detection
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7. Implement authentication guidance
  - Create registration screen guided tour
  - Add phone number field tooltip
  - Add verification code screen instructions
  - Add profile completion guidance
  - Implement field-specific tooltips
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ]* 7.1 Write unit tests for auth guidance
  - Test registration tour flow
  - Test tooltip display on field focus
  - Test profile completion prompts
  - _Requirements: 2.1, 2.2, 2.6_

- [x] 8. Create home screen guidance
  - Build home screen welcome overlay
  - Implement navigation tabs tour
  - Add search bar, location selector, and filter tooltips
  - Create listing card interaction tooltip
  - Add inactivity prompt after 10 seconds
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 8.1 Write unit tests for home screen guidance
  - Test welcome overlay display
  - Test tour step progression
  - Test inactivity detection
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 9. Implement listing detail guidance
  - Add contact seller button tooltip
  - Create image swipe hint
  - Implement Quick Actions for idle users
  - Add favorite button confirmation
  - Create seller profile tooltip with safety tips
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9.1 Write unit tests for listing detail guidance
  - Test first-visit tooltip display
  - Test Quick Actions trigger
  - Test favorite confirmation
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 10. Build messaging guidance system
  - Add chat welcome message with safety tips
  - Implement message template display on input focus
  - Create conversation milestone prompts (5 messages)
  - Add contact information safety detector
  - Implement 24-hour response reminder
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 10.1 Write property test for safety tip triggers
  - **Property 13: Safety Tip Trigger Accuracy**
  - **Validates: Requirements 12.1, 12.2**

- [ ]* 10.2 Write unit tests for messaging guidance
  - Test welcome message display
  - Test template picker display
  - Test milestone prompts
  - Test reminder notifications
  - _Requirements: 5.1, 5.2, 5.4, 5.6_

- [x] 11. Create posting guidance
  - Add posting process overview
  - Implement photo upload tips
  - Create photo count prompt (< 3 photos)
  - Add field-specific tooltips (title, description, price)
  - Implement description template
  - Add category-specific tips
  - Create location selection explanation
  - Add incomplete listing validation feedback
  - Implement first listing success celebration
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [ ]* 11.1 Write unit tests for posting guidance
  - Test process overview display
  - Test photo count prompts
  - Test field tooltips
  - Test validation feedback
  - Test success celebration
  - _Requirements: 6.1, 6.3, 6.4, 6.9, 6.10_

- [x] 12. Implement profile management guidance
  - Create profile completeness calculator
  - Build Progress Tracker component
  - Add profile improvement suggestions
  - Implement edit profile field tooltips
  - Add profile photo tips
  - Create ratings explanation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 12.1 Write property test for profile completeness
  - **Property 7: Profile Completeness Calculation**
  - **Validates: Requirements 7.1, 7.2**

- [ ]* 12.2 Write unit tests for profile guidance
  - Test progress tracker display
  - Test improvement suggestions
  - Test field tooltips
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Build search and filter guidance
  - Add search bar tooltip with tips
  - Implement no results suggestions
  - Create filter panel tour
  - Add location filter explanation
  - Implement real-time price filter feedback
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 13.1 Write unit tests for search guidance
  - Test search tooltip display
  - Test no results handling
  - Test filter explanations
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 14. Create favorites and notifications guidance
  - Add favorites screen explanation
  - Implement empty state guidance
  - Create sold items notification
  - Add price drop highlighting
  - Implement first notification explanation
  - Create notification types tour
  - Add unread notification reminder
  - Create notification settings guidance
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_

- [ ]* 14.1 Write unit tests for favorites and notifications
  - Test empty state display
  - Test notification explanations
  - Test reminder triggers
  - _Requirements: 9.2, 10.1, 10.3_

- [x] 15. Implement seller dashboard guidance
  - Create seller dashboard tour
  - Add low-view listing suggestions
  - Implement inquiry response templates
  - Add mark-as-sold guidance
  - Create promotion options explanation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 15.1 Write unit tests for seller dashboard guidance
  - Test dashboard tour
  - Test suggestion triggers
  - Test response templates
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 16. Build safety and trust features
  - Implement contact info detection in chat
  - Add meeting arrangement safety tips
  - Create first transaction guidance
  - Add low rating constructive feedback
  - Implement suspicious activity report confirmation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 16.1 Write unit tests for safety features
  - Test contact info detection
  - Test safety tip display
  - Test rating guidance
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 17. Create contextual help system
  - Add help icon to all major screens
  - Implement context-specific help content
  - Create error message with solutions
  - Add inactivity detection (30 seconds)
  - Build help center with FAQ
  - Implement help search functionality
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 17.1 Write property test for contextual prompt relevance
  - **Property 12: Contextual Prompt Relevance**
  - **Validates: Requirements 13.3, 15.2**

- [ ]* 17.2 Write unit tests for help system
  - Test help icon display
  - Test context-specific content
  - Test inactivity detection
  - Test help search
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [x] 18. Implement progress tracking and gamification
  - Create achievement system
  - Add celebratory animations
  - Build progress indicator component
  - Implement onboarding completion detection
  - Create milestone acknowledgment
  - Build achievements display screen
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 18.1 Write unit tests for progress tracking
  - Test achievement marking
  - Test progress calculation
  - Test milestone detection
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 19. Build guidance settings and customization
  - Create guidance settings screen
  - Implement guidance level selector (full/minimal/off)
  - Add guidance level filtering logic
  - Implement tutorial replay functionality
  - Add accessibility support for screen readers
  - Create analytics tracking (with opt-in)
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ]* 19.1 Write property test for guidance level filtering
  - **Property 4: Guidance Level Filtering**
  - **Validates: Requirements 17.1, 17.2, 17.3**

- [ ]* 19.2 Write unit tests for settings
  - Test settings UI
  - Test level selection
  - Test tutorial replay
  - _Requirements: 17.1, 17.3, 15.3_

- [x] 20. Optimize performance
  - Implement lazy loading for guidance content
  - Add memoization for computed values
  - Implement debouncing for state updates
  - Optimize AsyncStorage batch operations
  - Add performance monitoring
  - _Requirements: 18.1, 18.4_

- [ ]* 20.1 Write property test for render performance
  - **Property 14: Performance Constraint Compliance**
  - **Validates: Requirements 18.1**

- [ ]* 20.2 Write property test for batch update atomicity
  - **Property 10: AsyncStorage Batch Update Atomicity**
  - **Validates: Requirements 18.4**

- [x] 21. Add state migration support
  - Implement version detection
  - Create migration functions for state schema changes
  - Add backward compatibility handling
  - Test migration from v1 to v2
  - _Requirements: 15.5_

- [ ]* 21.1 Write property test for state migration
  - **Property 15: State Migration Preservation**
  - **Validates: Requirements 15.4**

- [ ] 22. Integrate with existing app screens
  - Add GuidanceProvider to app root
  - Integrate guidance into landing page
  - Integrate guidance into auth screens
  - Integrate guidance into home screen
  - Integrate guidance into listing detail screen
  - Integrate guidance into chat screens
  - Integrate guidance into post screen
  - Integrate guidance into profile screen
  - Integrate guidance into seller dashboard
  - _Requirements: All_

- [ ]* 22.1 Write integration tests for screen flows
  - Test complete onboarding flow
  - Test guidance across navigation
  - Test guidance state persistence across sessions
  - _Requirements: 15.1, 15.2_

- [ ] 23. Add comprehensive error handling
  - Implement error boundaries for guidance components
  - Add storage error recovery
  - Add content error fallbacks
  - Implement graceful degradation
  - Add error logging
  - _Requirements: 18.5_

- [ ]* 23.1 Write unit tests for error handling
  - Test storage error recovery
  - Test content fallbacks
  - Test graceful degradation
  - _Requirements: 18.5_

- [ ] 24. Create guidance content for all scenarios
  - Write all tooltip content in English and French
  - Create all tour definitions
  - Define all message templates
  - Write all safety tips
  - Create all contextual prompts
  - Add all help center articles
  - _Requirements: 16.1, 16.2, 16.4, 16.5_

- [ ]* 24.1 Write unit tests for content completeness
  - Test all content has translations
  - Test template variable coverage
  - Test culturally appropriate examples
  - _Requirements: 16.1, 16.2, 16.4_

- [ ] 25. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - all guides were supposed to be written in french so make sure that they have all been changed to french
