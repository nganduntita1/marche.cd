/**
 * MessageTemplatePicker Usage Example
 * 
 * This file demonstrates how to use the MessageTemplatePicker component
 * in your chat or messaging screens.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import MessageTemplatePicker from './MessageTemplatePicker';
import Colors from '@/constants/Colors';

export default function MessageTemplatePickerExample() {
  const [showPicker, setShowPicker] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');

  // Example context for variable substitution
  const context = {
    item_name: 'Samsung Galaxy S21',
    offer_price: '500 USD',
    location: 'Centre Ville',
    time: '14h00',
    date: '15 janvier',
  };

  const handleTemplateSelect = (message: string) => {
    setMessageText(message);
  };

  return (
    <View style={styles.container}>
      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder={language === 'fr' ? 'Votre message...' : 'Your message...'}
          multiline
          numberOfLines={3}
        />
        
        {/* Template Button */}
        <TouchableOpacity
          style={styles.templateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.templateButtonText}>
            {language === 'fr' ? '📝 Modèles' : '📝 Templates'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Toggle (for demo) */}
      <TouchableOpacity
        style={styles.languageToggle}
        onPress={() => setLanguage(language === 'en' ? 'fr' : 'en')}
      >
        <Text style={styles.languageText}>
          Language: {language === 'en' ? 'English' : 'Français'}
        </Text>
      </TouchableOpacity>

      {/* Message Template Picker */}
      <MessageTemplatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleTemplateSelect}
        language={language}
        context={context}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  templateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  templateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageToggle: {
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

/**
 * INTEGRATION EXAMPLES:
 * 
 * 1. Basic Usage (no variables):
 * ```tsx
 * <MessageTemplatePicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onSelect={(message) => setMessageText(message)}
 *   language="fr"
 * />
 * ```
 * 
 * 2. With Context Variables:
 * ```tsx
 * const context = {
 *   item_name: listing.title,
 *   offer_price: `${myOffer} USD`,
 * };
 * 
 * <MessageTemplatePicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onSelect={(message) => setMessageText(message)}
 *   language={currentLanguage}
 *   context={context}
 * />
 * ```
 * 
 * 3. In Chat Screen (app/chat/[id].tsx):
 * ```tsx
 * // Add state
 * const [showTemplatePicker, setShowTemplatePicker] = useState(false);
 * 
 * // Add button near message input
 * <TouchableOpacity onPress={() => setShowTemplatePicker(true)}>
 *   <Text>📝 Templates</Text>
 * </TouchableOpacity>
 * 
 * // Add picker component
 * <MessageTemplatePicker
 *   visible={showTemplatePicker}
 *   onClose={() => setShowTemplatePicker(false)}
 *   onSelect={(message) => setNewMessage(message)}
 *   language={i18n.language as 'en' | 'fr'}
 *   context={{
 *     item_name: listing?.title || '',
 *   }}
 * />
 * ```
 * 
 * 4. With GuidanceContext:
 * ```tsx
 * import { useGuidance } from '@/contexts/GuidanceContext';
 * 
 * const { state } = useGuidance();
 * const language = state.settings.language;
 * 
 * <MessageTemplatePicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onSelect={handleTemplateSelect}
 *   language={language}
 * />
 * ```
 */
