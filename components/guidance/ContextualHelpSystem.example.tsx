// Example: How to integrate the Contextual Help System into your screens
// This demonstrates all the features of the contextual help system

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HelpButton,
  ContextualHelp,
  InactivityDetector,
  ErrorWithSolution,
} from './index';

export default function ExampleScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [showError, setShowError] = useState(false);

  // Example: Handle help button press
  const handleHelpPress = () => {
    setShowHelp(true);
  };

  // Example: Handle inactivity detection
  const handleInactivityHelp = () => {
    setShowHelp(true);
  };

  // Example: Handle error with retry
  const handleRetry = () => {
    console.log('Retrying action...');
    // Implement your retry logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Example Screen</Text>
        <Text style={styles.description}>
          This screen demonstrates the contextual help system integration.
        </Text>

        {/* Your screen content here */}
      </View>

      {/* 1. Help Button - Always visible floating action button */}
      <HelpButton
        screenName="example"
        onPress={handleHelpPress}
        visible={true}
      />

      {/* 2. Contextual Help Modal - Shows context-specific help */}
      <ContextualHelp
        screenName="home" // Change to match your screen: home, listing, chat, post, profile, etc.
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* 3. Inactivity Detector - Prompts user after 30 seconds of inactivity */}
      <InactivityDetector
        screenName="example"
        inactivityThreshold={30000} // 30 seconds (default)
        onHelpRequested={handleInactivityHelp}
        enabled={true}
      />

      {/* 4. Error With Solution - Shows errors with actionable solutions */}
      <ErrorWithSolution
        visible={showError}
        errorType="network" // network, upload, auth, validation, credits, permission, server, notfound
        errorMessage="Custom error message (optional)"
        onClose={() => setShowError(false)}
        onRetry={handleRetry}
        language="fr" // or "en"
      />
    </SafeAreaView>
  );
}

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

// Keep integration docs in project markdown files to avoid parser issues in TSX comments.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
});

