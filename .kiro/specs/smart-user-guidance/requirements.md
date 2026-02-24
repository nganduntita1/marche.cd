# Requirements Document

## Introduction

The Smart User Guidance System is a comprehensive onboarding and contextual help feature designed to assist users with lower technical literacy through their entire journey in the Marché CD marketplace application. The system provides step-by-step guidance starting from the landing page, through authentication, and across all major app features, using intelligent prompts, tooltips, message templates, and contextual suggestions without requiring expensive AI API calls.

## Glossary

- **Guidance System**: The collection of UI components and logic that provides contextual help to users
- **Onboarding Flow**: The initial user experience from landing page through first successful listing interaction
- **Tooltip**: A small informational popup that appears near UI elements to explain their purpose
- **Smart Suggestion**: A context-aware prompt or action recommendation based on user state
- **Message Template**: Pre-written message text that users can select and customize for common scenarios
- **Progress Tracker**: A visual indicator showing users how far they are in completing key tasks
- **Contextual Prompt**: A timely suggestion that appears based on user actions or inactions
- **Guided Tour**: An interactive walkthrough that highlights UI elements in sequence
- **Help Overlay**: A semi-transparent layer that dims the screen except for the focused element
- **User State**: The current status of user progress including completed actions and profile completeness
- **AsyncStorage**: Local device storage for persisting user guidance state
- **Quick Action**: A suggested next step presented as a tappable button or card

## Requirements

### Requirement 1: Landing Page Guidance

**User Story:** As a first-time visitor, I want clear guidance on how to get started with the app, so that I understand what the app does and how to download it.

#### Acceptance Criteria

1. WHEN a user visits the landing page for the first time, THEN the Guidance System SHALL display an animated welcome message explaining the app's purpose
2. WHEN the welcome message is displayed, THEN the Guidance System SHALL highlight the download button with a pulsing visual indicator
3. WHEN a user taps the download button, THEN the Guidance System SHALL show a tooltip explaining what will happen next
4. WHERE the platform is web, WHEN a user views the landing page, THEN the Guidance System SHALL display step-by-step instructions for downloading the mobile app
5. WHEN a user has viewed the landing page guidance, THEN the Guidance System SHALL store this state in AsyncStorage to prevent repetition

### Requirement 2: Authentication Guidance

**User Story:** As a new user, I want help understanding the registration and login process, so that I can successfully create an account without confusion.

#### Acceptance Criteria

1. WHEN a user reaches the registration screen for the first time, THEN the Guidance System SHALL display a guided tour highlighting the phone number field, verification process, and submit button in sequence
2. WHEN a user focuses on the phone number input field, THEN the Guidance System SHALL display a tooltip explaining the required format with an example
3. WHEN a user submits their phone number, THEN the Guidance System SHALL show a message explaining that they will receive a verification code
4. WHEN a user reaches the verification code screen, THEN the Guidance System SHALL display instructions on where to find the code and how to enter it
5. WHEN a user completes phone verification, THEN the Guidance System SHALL show a congratulatory message and explain the profile completion step
6. WHEN a user reaches the complete profile screen, THEN the Guidance System SHALL highlight each required field with tooltips explaining why the information is needed
7. IF a user attempts to skip required profile fields, THEN the Guidance System SHALL display a gentle reminder explaining the importance of profile completion

### Requirement 3: Home Screen First-Time Experience

**User Story:** As a newly registered user, I want guidance on navigating the home screen and understanding available actions, so that I know how to browse listings and use the app effectively.

#### Acceptance Criteria

1. WHEN a user reaches the home screen for the first time, THEN the Guidance System SHALL display a welcome overlay with a brief tour of the main navigation tabs
2. WHEN the home screen tour begins, THEN the Guidance System SHALL highlight the search bar, location selector, and category filters in sequence with explanatory tooltips
3. WHEN a user views a listing card for the first time, THEN the Guidance System SHALL display a tooltip explaining the key information displayed and how to interact with it
4. WHEN a user has not interacted with any listings after 10 seconds, THEN the Guidance System SHALL display a prompt suggesting "Tap any item to see more details"
5. WHEN a user completes the home screen tour, THEN the Guidance System SHALL store this completion state in AsyncStorage

### Requirement 4: Listing Detail Guidance

**User Story:** As a user viewing a listing, I want help understanding all available actions and information, so that I can make informed decisions and know how to contact sellers.

#### Acceptance Criteria

1. WHEN a user opens a listing detail page for the first time, THEN the Guidance System SHALL highlight the contact seller button with a tooltip explaining its purpose
2. WHEN a user views listing images, THEN the Guidance System SHALL display a subtle hint about swiping to see more photos
3. WHEN a user has viewed a listing for 5 seconds without taking action, THEN the Guidance System SHALL display Quick Actions suggesting "Message Seller" or "Save to Favorites"
4. WHEN a user taps the favorite button for the first time, THEN the Guidance System SHALL show a confirmation message and explain where to find saved items
5. WHEN a user views the seller's profile section, THEN the Guidance System SHALL display a tooltip explaining the rating system and safety tips

### Requirement 5: Messaging Guidance

**User Story:** As a user initiating contact with a seller, I want help composing appropriate messages and understanding chat features, so that I can communicate effectively and safely.

#### Acceptance Criteria

1. WHEN a user opens a chat conversation for the first time, THEN the Guidance System SHALL display a welcome message with safety tips and communication guidelines
2. WHEN a user focuses on the message input field for the first time, THEN the Guidance System SHALL display Message Templates for common scenarios including "Is this still available?", "What is your best price?", and "Where can we meet?"
3. WHEN a user selects a Message Template, THEN the Guidance System SHALL populate the input field with the template text and allow editing before sending
4. WHEN a conversation reaches 5 messages, THEN the Guidance System SHALL display a contextual prompt suggesting next steps such as "Agree on a meeting place" or "Discuss payment method"
5. WHEN a user receives a message containing a phone number or address, THEN the Guidance System SHALL display a safety reminder about meeting in public places
6. WHEN a user has not responded to a message for 24 hours, THEN the Guidance System SHALL send a notification reminder with suggested quick replies

### Requirement 6: Posting Guidance

**User Story:** As a user creating a listing, I want step-by-step guidance through the posting process, so that I can create complete and attractive listings without errors.

#### Acceptance Criteria

1. WHEN a user taps the post button for the first time, THEN the Guidance System SHALL display an overview of the posting process with estimated time to complete
2. WHEN a user reaches the photo upload section, THEN the Guidance System SHALL display tips for taking good product photos with examples
3. WHEN a user has uploaded fewer than 3 photos, THEN the Guidance System SHALL display a prompt suggesting "Add more photos to attract buyers"
4. WHEN a user focuses on the title field, THEN the Guidance System SHALL show a tooltip with examples of good titles and character count
5. WHEN a user focuses on the description field, THEN the Guidance System SHALL display a template with suggested sections including condition, features, and reason for selling
6. WHEN a user focuses on the price field, THEN the Guidance System SHALL show a tooltip explaining the currency format and suggesting to check similar listings
7. WHEN a user selects a category, THEN the Guidance System SHALL display relevant tips specific to that category
8. WHEN a user reaches the location selection, THEN the Guidance System SHALL explain why location helps buyers find items and how to set it
9. WHEN a user attempts to publish an incomplete listing, THEN the Guidance System SHALL highlight missing required fields with explanatory messages
10. WHEN a user successfully publishes their first listing, THEN the Guidance System SHALL display a congratulatory message and explain what happens next

### Requirement 7: Profile Management Guidance

**User Story:** As a user managing my profile, I want guidance on completing my profile and understanding profile features, so that I can build trust with other users.

#### Acceptance Criteria

1. WHEN a user opens their profile for the first time, THEN the Guidance System SHALL display a Progress Tracker showing profile completeness percentage
2. WHEN the profile is less than 80% complete, THEN the Guidance System SHALL display specific suggestions for improvement including "Add profile photo", "Write bio", or "Verify phone number"
3. WHEN a user taps the edit profile button, THEN the Guidance System SHALL highlight fields that improve trustworthiness with explanatory tooltips
4. WHEN a user adds a profile photo for the first time, THEN the Guidance System SHALL display tips for choosing an appropriate photo
5. WHEN a user views their ratings section, THEN the Guidance System SHALL explain how ratings work and how to improve their reputation

### Requirement 8: Search and Filter Guidance

**User Story:** As a user searching for items, I want help using search and filter features effectively, so that I can find exactly what I need quickly.

#### Acceptance Criteria

1. WHEN a user taps the search bar for the first time, THEN the Guidance System SHALL display a tooltip with search tips and example queries
2. WHEN a user performs a search with no results, THEN the Guidance System SHALL suggest alternative search terms or broader categories
3. WHEN a user opens the filter panel for the first time, THEN the Guidance System SHALL highlight key filters with explanations of how they work
4. WHEN a user applies location filters, THEN the Guidance System SHALL display a tooltip explaining the distance radius and how it affects results
5. WHEN a user applies price filters, THEN the Guidance System SHALL show the current price range and number of matching items in real-time

### Requirement 9: Favorites and Saved Items Guidance

**User Story:** As a user managing saved items, I want guidance on using the favorites feature, so that I can organize and track items I'm interested in.

#### Acceptance Criteria

1. WHEN a user opens the favorites screen for the first time, THEN the Guidance System SHALL explain how favorites work and how to add items
2. WHEN the favorites list is empty, THEN the Guidance System SHALL display a helpful empty state with suggestions to browse and save items
3. WHEN a user has saved items that have been marked as sold, THEN the Guidance System SHALL display a notification suggesting to remove them
4. WHEN a user has saved items with price drops, THEN the Guidance System SHALL highlight these items with a special indicator

### Requirement 10: Notifications Guidance

**User Story:** As a user receiving notifications, I want help understanding notification types and managing notification settings, so that I stay informed without being overwhelmed.

#### Acceptance Criteria

1. WHEN a user receives their first notification, THEN the Guidance System SHALL display an explanation of what triggered it and how to respond
2. WHEN a user opens the notifications screen for the first time, THEN the Guidance System SHALL explain the different notification types with icons
3. WHEN a user has unread notifications for more than 48 hours, THEN the Guidance System SHALL display a gentle reminder to check them
4. WHEN a user opens notification settings for the first time, THEN the Guidance System SHALL explain each notification type and recommend optimal settings

### Requirement 11: Seller Dashboard Guidance

**User Story:** As a seller managing my listings, I want guidance on using the seller dashboard and understanding seller features, so that I can effectively manage my sales.

#### Acceptance Criteria

1. WHEN a user opens the seller dashboard for the first time, THEN the Guidance System SHALL display a tour of key features including active listings, messages, and promotion options
2. WHEN a user has an active listing with no views after 24 hours, THEN the Guidance System SHALL suggest improvements such as better photos, price adjustment, or promotion
3. WHEN a user receives an inquiry about a listing, THEN the Guidance System SHALL display a prompt with suggested response templates
4. WHEN a user marks an item as sold for the first time, THEN the Guidance System SHALL explain the rating process and prompt them to select a buyer
5. WHEN a user views promotion options, THEN the Guidance System SHALL explain each promotion type with expected benefits and costs

### Requirement 12: Safety and Trust Guidance

**User Story:** As a user engaging in transactions, I want proactive safety reminders and trust-building guidance, so that I can transact safely and build a good reputation.

#### Acceptance Criteria

1. WHEN a user is about to share personal contact information in chat, THEN the Guidance System SHALL display a safety reminder about meeting in public places
2. WHEN a user arranges a meeting time in chat, THEN the Guidance System SHALL suggest safety tips specific to the meeting context
3. WHEN a user completes their first transaction, THEN the Guidance System SHALL explain the importance of leaving honest ratings
4. WHEN a user receives a low rating, THEN the Guidance System SHALL provide constructive guidance on improving future transactions
5. WHEN a user reports suspicious activity, THEN the Guidance System SHALL acknowledge the report and explain what happens next

### Requirement 13: Contextual Help System

**User Story:** As a user needing help at any point, I want easy access to contextual help and support, so that I can resolve issues without leaving the app.

#### Acceptance Criteria

1. WHEN a user taps a help icon on any screen, THEN the Guidance System SHALL display context-specific help content relevant to the current screen
2. WHEN a user performs an action that fails, THEN the Guidance System SHALL display a clear error message with suggested solutions
3. WHEN a user appears stuck on a screen for more than 30 seconds without interaction, THEN the Guidance System SHALL offer assistance with a "Need help?" prompt
4. WHEN a user accesses the help center, THEN the Guidance System SHALL display frequently asked questions organized by topic with search functionality
5. WHEN a user searches for help, THEN the Guidance System SHALL provide relevant articles and video tutorials in French

### Requirement 14: Progress Tracking and Gamification

**User Story:** As a user learning the app, I want to see my progress and achievements, so that I feel motivated to explore all features and complete my profile.

#### Acceptance Criteria

1. WHEN a user completes a key action for the first time, THEN the Guidance System SHALL display a celebratory animation and mark the achievement
2. WHEN a user opens the app, THEN the Guidance System SHALL display a progress indicator showing completed onboarding steps
3. WHEN a user completes all onboarding steps, THEN the Guidance System SHALL display a congratulatory message and unlock advanced features
4. WHEN a user reaches milestones such as first listing, first sale, or 5-star rating, THEN the Guidance System SHALL acknowledge the achievement
5. WHEN a user views their achievements, THEN the Guidance System SHALL display a list of completed and upcoming milestones with rewards

### Requirement 15: Guidance State Management

**User Story:** As a returning user, I want the guidance system to remember what I've already learned, so that I don't see repetitive tips and can focus on new features.

#### Acceptance Criteria

1. WHEN a user completes a guided tour or dismisses a tooltip, THEN the Guidance System SHALL store this state in AsyncStorage
2. WHEN a user reopens the app, THEN the Guidance System SHALL load their guidance state and only show new or relevant tips
3. WHEN a user explicitly requests to replay a tutorial, THEN the Guidance System SHALL reset the relevant guidance state and show the tour again
4. WHEN a user has completed all guidance for a feature, THEN the Guidance System SHALL mark that feature as mastered
5. WHEN the app is updated with new features, THEN the Guidance System SHALL detect new functionality and offer guidance for those features only

### Requirement 16: Multilingual Guidance Support

**User Story:** As a French-speaking user, I want all guidance content in French, so that I can understand instructions clearly in my preferred language.

#### Acceptance Criteria

1. WHEN the app language is set to French, THEN the Guidance System SHALL display all tooltips, prompts, and messages in French
2. WHEN the app language is set to English, THEN the Guidance System SHALL display all guidance content in English
3. WHEN a user changes the app language, THEN the Guidance System SHALL immediately update all visible guidance content to the new language
4. WHEN guidance content includes examples or templates, THEN the Guidance System SHALL provide culturally appropriate examples for the selected language
5. WHEN the Guidance System displays message templates, THEN the Guidance System SHALL provide templates in both formal and informal French styles

### Requirement 17: Accessibility and Customization

**User Story:** As a user with specific needs, I want to customize the guidance experience, so that it works best for my learning style and preferences.

#### Acceptance Criteria

1. WHEN a user opens guidance settings, THEN the Guidance System SHALL provide options to adjust guidance frequency including "Full Guidance", "Minimal Tips", or "Off"
2. WHEN a user selects "Minimal Tips", THEN the Guidance System SHALL only show critical safety warnings and error explanations
3. WHEN a user selects "Off", THEN the Guidance System SHALL hide all proactive guidance but keep help icons accessible
4. WHEN a user enables accessibility features, THEN the Guidance System SHALL ensure all tooltips and prompts are screen-reader compatible
5. WHEN a user has guidance disabled, THEN the Guidance System SHALL still track their progress for analytics purposes

### Requirement 18: Performance and Resource Management

**User Story:** As a user with limited device resources, I want the guidance system to work smoothly without slowing down the app, so that I have a responsive experience.

#### Acceptance Criteria

1. WHEN the Guidance System displays tooltips or overlays, THEN the system SHALL render them within 100 milliseconds
2. WHEN the Guidance System loads guidance state from AsyncStorage, THEN the system SHALL complete the operation within 50 milliseconds
3. WHEN the Guidance System displays animations, THEN the system SHALL maintain 60 frames per second on devices from the last 5 years
4. WHEN the Guidance System stores state updates, THEN the system SHALL batch writes to AsyncStorage to minimize I/O operations
5. WHEN the app is under memory pressure, THEN the Guidance System SHALL gracefully reduce animation complexity while maintaining functionality
