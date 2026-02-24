# MessageTemplatePicker Integration Guide

## Quick Start

### Step 1: Import the Component

```tsx
import MessageTemplatePicker from '@/components/MessageTemplatePicker';
import { useState } from 'react';
```

### Step 2: Add State Management

```tsx
const [showTemplatePicker, setShowTemplatePicker] = useState(false);
const [messageText, setMessageText] = useState('');
```

### Step 3: Add Template Button

Add a button near your message input to trigger the picker:

```tsx
<TouchableOpacity 
  onPress={() => setShowTemplatePicker(true)}
  style={styles.templateButton}
>
  <Text>📝 Use Template</Text>
</TouchableOpacity>
```

### Step 4: Add the Picker Component

```tsx
<MessageTemplatePicker
  visible={showTemplatePicker}
  onClose={() => setShowTemplatePicker(false)}
  onSelect={(message) => {
    setMessageText(message);
    setShowTemplatePicker(false);
  }}
  language="fr"
/>
```

## Integration Examples

### Example 1: Basic Chat Screen Integration

```tsx
// app/chat/[id].tsx
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import MessageTemplatePicker from '@/components/MessageTemplatePicker';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      {/* Message Input */}
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
      />
      
      {/* Template Button */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text>📝 Templates</Text>
      </TouchableOpacity>
      
      {/* Template Picker */}
      <MessageTemplatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={setMessage}
        language="fr"
      />
    </View>
  );
}
```

### Example 2: With Context Variables

```tsx
// Pass listing information for variable substitution
const listing = {
  id: '123',
  title: 'Samsung Galaxy S21',
  price: 500,
};

<MessageTemplatePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={setMessage}
  language="fr"
  context={{
    item_name: listing.title,
    offer_price: `${listing.price - 50} USD`,
  }}
/>
```

### Example 3: With i18n Integration

```tsx
import { useTranslation } from 'react-i18next';

export default function ChatScreen() {
  const { i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <MessageTemplatePicker
      visible={showPicker}
      onClose={() => setShowPicker(false)}
      onSelect={setMessage}
      language={i18n.language as 'en' | 'fr'}
    />
  );
}
```

### Example 4: With GuidanceContext

```tsx
import { useGuidance } from '@/contexts/GuidanceContext';

export default function ChatScreen() {
  const { state, markActionCompleted } = useGuidance();
  const [showPicker, setShowPicker] = useState(false);
  
  // Show picker on first message
  useEffect(() => {
    if (!state.features.hasSentFirstMessage) {
      setShowPicker(true);
    }
  }, []);
  
  const handleTemplateSelect = (message: string) => {
    setMessageText(message);
    markActionCompleted('first_template_used');
    setShowPicker(false);
  };
  
  return (
    <MessageTemplatePicker
      visible={showPicker}
      onClose={() => setShowPicker(false)}
      onSelect={handleTemplateSelect}
      language={state.settings.language}
    />
  );
}
```

### Example 5: With First-Time Guidance

```tsx
import { useEffect } from 'react';
import { useGuidance } from '@/contexts/GuidanceContext';

export default function ChatScreen() {
  const { state } = useGuidance();
  const [showPicker, setShowPicker] = useState(false);
  const [hasShownGuidance, setHasShownGuidance] = useState(false);
  
  // Auto-show on first chat
  useEffect(() => {
    if (!state.features.hasSentFirstMessage && !hasShownGuidance) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setShowPicker(true);
        setHasShownGuidance(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.features.hasSentFirstMessage, hasShownGuidance]);
  
  return (
    <MessageTemplatePicker
      visible={showPicker}
      onClose={() => setShowPicker(false)}
      onSelect={setMessage}
      language={state.settings.language}
    />
  );
}
```

## Styling the Template Button

### Option 1: Icon Button

```tsx
import { MessageCircle } from 'lucide-react-native';

<TouchableOpacity 
  onPress={() => setShowPicker(true)}
  style={styles.iconButton}
>
  <MessageCircle size={24} color={Colors.primary} />
</TouchableOpacity>

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
  },
});
```

### Option 2: Text Button

```tsx
<TouchableOpacity 
  onPress={() => setShowPicker(true)}
  style={styles.textButton}
>
  <Text style={styles.buttonText}>📝 Use Template</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  textButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

### Option 3: Floating Action Button

```tsx
<TouchableOpacity 
  onPress={() => setShowPicker(true)}
  style={styles.fab}
>
  <MessageCircle size={24} color="#fff" />
</TouchableOpacity>

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
```

## Complete Chat Screen Example

```tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageCircle, Send } from 'lucide-react-native';
import MessageTemplatePicker from '@/components/MessageTemplatePicker';
import { useGuidance } from '@/contexts/GuidanceContext';
import Colors from '@/constants/Colors';

export default function ChatScreen({ listing }) {
  const { state } = useGuidance();
  const [message, setMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // Context for variable substitution
  const templateContext = {
    item_name: listing?.title || '',
    offer_price: listing?.price ? `${listing.price * 0.9} USD` : '',
  };

  const handleSend = () => {
    if (message.trim()) {
      // Send message logic here
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Messages List */}
      <View style={styles.messagesList}>
        {/* Your messages here */}
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Template Button */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.templateButton}
        >
          <MessageCircle size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Message Input */}
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled,
          ]}
          disabled={!message.trim()}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Template Picker */}
      <MessageTemplatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(text) => {
          setMessage(text);
          setShowPicker(false);
        }}
        language={state.settings.language}
        context={templateContext}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  templateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray50,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
```

## Tips and Best Practices

### 1. Show Templates on First Message
```tsx
useEffect(() => {
  if (!state.features.hasSentFirstMessage) {
    setTimeout(() => setShowPicker(true), 1000);
  }
}, []);
```

### 2. Pre-fill Common Variables
```tsx
const context = {
  item_name: listing.title,
  offer_price: `${Math.round(listing.price * 0.9)} USD`,
  location: 'Centre Ville', // User's preferred location
  time: '14h00', // Default meeting time
  date: new Date().toLocaleDateString('fr-FR'),
};
```

### 3. Track Template Usage
```tsx
const handleTemplateSelect = (message: string) => {
  setMessage(message);
  // Track in analytics
  analytics.track('template_used', {
    category: getCurrentCategory(),
    hasVariables: message.includes('{{'),
  });
};
```

### 4. Provide Visual Feedback
```tsx
const [justUsedTemplate, setJustUsedTemplate] = useState(false);

const handleTemplateSelect = (message: string) => {
  setMessage(message);
  setJustUsedTemplate(true);
  setTimeout(() => setJustUsedTemplate(false), 2000);
};

// Show a subtle indicator
{justUsedTemplate && (
  <Text style={styles.hint}>✨ Template applied! Edit as needed.</Text>
)}
```

### 5. Handle Empty Context Gracefully
```tsx
const context = {
  item_name: listing?.title || 'this item',
  offer_price: listing?.price ? `${listing.price} USD` : 'your offer',
};
```

## Troubleshooting

### Templates Not Showing
- Check that `visible` prop is true
- Verify language is 'en' or 'fr'
- Check console for errors

### Variables Not Substituting
- Ensure context object keys match variable names
- Variables use format: `{{variable_name}}`
- Check that context is passed to component

### Styling Issues
- Import Colors and Typography constants
- Check that parent container has proper dimensions
- Verify modal overlay is not blocked

## Support

For more information, see:
- `components/MessageTemplatePicker.README.md` - Full documentation
- `components/MessageTemplatePicker.example.tsx` - Usage examples
- `services/guidanceContent.ts` - Template definitions
