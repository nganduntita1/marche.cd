/**
 * Example usage of GuidanceContentService
 * This file demonstrates how to use the guidance content service in your components
 */

import { GuidanceContentService } from './guidanceContent';

// ============================================================================
// EXAMPLE 1: Getting Tooltips
// ============================================================================

export function exampleGetTooltip() {
  // Get a tooltip in English
  const tooltipEN = GuidanceContentService.getTooltip('home_search', 'en');
  console.log('English Tooltip:', tooltipEN);
  // Output: { id: 'home_search', title: 'Search Items', message: '...', placement: 'bottom', ... }

  // Get the same tooltip in French
  const tooltipFR = GuidanceContentService.getTooltip('home_search', 'fr');
  console.log('French Tooltip:', tooltipFR);
  // Output: { id: 'home_search', title: 'Rechercher des articles', message: '...', placement: 'bottom', ... }

  // Handle non-existent tooltip
  const missing = GuidanceContentService.getTooltip('non_existent', 'en');
  if (!missing) {
    console.log('Tooltip not found');
  }
}

// ============================================================================
// EXAMPLE 2: Getting Tours
// ============================================================================

export function exampleGetTour() {
  // Get a tour in English
  const tour = GuidanceContentService.getTour('home_tour', 'en');
  
  if (tour) {
    console.log('Tour Name:', tour.name);
    console.log('Number of Steps:', tour.steps.length);
    
    // Iterate through tour steps
    tour.steps.forEach((step, index) => {
      console.log(`Step ${index + 1}:`, step.title);
      console.log('  Message:', step.message);
      console.log('  Placement:', step.placement);
    });
  }
}

// ============================================================================
// EXAMPLE 3: Getting Message Templates
// ============================================================================

export function exampleGetMessageTemplates() {
  // Get inquiry templates
  const inquiryTemplates = GuidanceContentService.getMessageTemplates('inquiry', 'en');
  console.log('Inquiry Templates:', inquiryTemplates);
  
  // Get all templates (all categories)
  const allTemplates = GuidanceContentService.getAllMessageTemplates('fr');
  console.log('Total Templates:', allTemplates.length); // Should be 12 (4 categories × 3 templates)
  
  // Filter templates by category
  const negotiationTemplates = allTemplates.filter(t => t.category === 'negotiation');
  console.log('Negotiation Templates:', negotiationTemplates);
}

// ============================================================================
// EXAMPLE 4: Using Message Templates with Variables
// ============================================================================

export function exampleTemplateVariables() {
  // Get a template with variables
  const templates = GuidanceContentService.getMessageTemplates('inquiry', 'en');
  const templateWithVars = templates.find(t => t.variables && t.variables.length > 0);
  
  if (templateWithVars) {
    console.log('Original Template:', templateWithVars.text);
    // Output: "Hello! I'm interested in {{item_name}}. Can you provide more details?"
    
    // Substitute variables
    const message = GuidanceContentService.substituteVariables(
      templateWithVars.text,
      { item_name: 'Samsung Galaxy S21' }
    );
    console.log('Substituted Message:', message);
    // Output: "Hello! I'm interested in Samsung Galaxy S21. Can you provide more details?"
    
    // Check if there are unsubstituted variables
    const hasVars = GuidanceContentService.hasUnsubstitutedVariables(message);
    console.log('Has unsubstituted variables:', hasVars); // false
  }
}

// ============================================================================
// EXAMPLE 5: Getting Safety Tips
// ============================================================================

export function exampleGetSafetyTips() {
  // Get a random safety tip for chat context
  const chatTip = GuidanceContentService.getSafetyTip('chat', 'en');
  console.log('Chat Safety Tip:', chatTip);
  
  // Get all safety tips for meeting context
  const meetingTips = GuidanceContentService.getAllSafetyTips('meeting', 'fr');
  console.log('All Meeting Tips:', meetingTips);
  
  // Display tips to user
  meetingTips.forEach((tip, index) => {
    console.log(`${index + 1}. ${tip}`);
  });
}

// ============================================================================
// EXAMPLE 6: Using in a React Component
// ============================================================================

/**
 * Example React component showing tooltip integration
 * 
 * import React, { useState, useEffect } from 'react';
 * import { View, Text, TouchableOpacity } from 'react-native';
 * import { GuidanceContentService } from '../services/guidanceContent';
 * import { useGuidance } from '../contexts/GuidanceContext';
 * 
 * export function HomeScreenWithGuidance() {
 *   const { state, shouldShowTooltip, markTooltipDismissed } = useGuidance();
 *   const [showSearchTooltip, setShowSearchTooltip] = useState(false);
 *   
 *   useEffect(() => {
 *     // Check if we should show the search tooltip
 *     if (shouldShowTooltip('home_search')) {
 *       setShowSearchTooltip(true);
 *     }
 *   }, []);
 *   
 *   const handleDismissTooltip = () => {
 *     setShowSearchTooltip(false);
 *     markTooltipDismissed('home_search');
 *   };
 *   
 *   // Get tooltip content in user's language
 *   const tooltip = GuidanceContentService.getTooltip('home_search', state.settings.language);
 *   
 *   return (
 *     <View>
 *       {showSearchTooltip && tooltip && (
 *         <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
 *           <Text style={{ fontWeight: 'bold' }}>{tooltip.icon} {tooltip.title}</Text>
 *           <Text>{tooltip.message}</Text>
 *           <TouchableOpacity onPress={handleDismissTooltip}>
 *             <Text>{tooltip.dismissLabel}</Text>
 *           </TouchableOpacity>
 *         </View>
 *       )}
 *       
 *       {/* Rest of your component *\/}
 *     </View>
 *   );
 * }
 */

// ============================================================================
// EXAMPLE 7: Using Message Templates in Chat
// ============================================================================

/**
 * Example React component showing message template integration
 * 
 * import React, { useState } from 'react';
 * import { View, Text, TouchableOpacity, FlatList } from 'react-native';
 * import { GuidanceContentService } from '../services/guidanceContent';
 * import { useGuidance } from '../contexts/GuidanceContext';
 * 
 * export function ChatWithTemplates() {
 *   const { state } = useGuidance();
 *   const [showTemplates, setShowTemplates] = useState(false);
 *   const [message, setMessage] = useState('');
 *   
 *   const handleSelectTemplate = (template: any) => {
 *     // If template has variables, you might want to show a form to fill them
 *     if (template.variables && template.variables.length > 0) {
 *       // Show variable input form
 *       // For now, just use the template as-is
 *       setMessage(template.text);
 *     } else {
 *       setMessage(template.text);
 *     }
 *     setShowTemplates(false);
 *   };
 *   
 *   // Get all templates in user's language
 *   const templates = GuidanceContentService.getAllMessageTemplates(state.settings.language);
 *   
 *   return (
 *     <View>
 *       <TouchableOpacity onPress={() => setShowTemplates(!showTemplates)}>
 *         <Text>Use Template</Text>
 *       </TouchableOpacity>
 *       
 *       {showTemplates && (
 *         <FlatList
 *           data={templates}
 *           keyExtractor={(item) => item.id}
 *           renderItem={({ item }) => (
 *             <TouchableOpacity onPress={() => handleSelectTemplate(item)}>
 *               <Text>{item.text}</Text>
 *             </TouchableOpacity>
 *           )}
 *         />
 *       )}
 *       
 *       {/* Message input field with current message *\/}
 *     </View>
 *   );
 * }
 */

// ============================================================================
// EXAMPLE 8: Utility Functions
// ============================================================================

export function exampleUtilityFunctions() {
  // Get all available tooltip IDs
  const tooltipIds = GuidanceContentService.getAllTooltipIds();
  console.log('Available Tooltips:', tooltipIds);
  
  // Get all available tour IDs
  const tourIds = GuidanceContentService.getAllTourIds();
  console.log('Available Tours:', tourIds);
  
  // These can be useful for:
  // - Debugging
  // - Admin panels
  // - Testing
  // - Documentation generation
}
