# Message Template System

## Overview

The Message Template System provides pre-written message templates for common scenarios in the marketplace, helping users communicate effectively with sellers and buyers. This system is part of the Smart User Guidance feature and supports both English and French.

## Components

### MessageTemplatePicker

A modal component that displays categorized message templates and allows users to select and customize them.

**Props:**
- `visible` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed
- `onSelect` (function): Callback when a template is selected, receives the final message text
- `language` ('en' | 'fr', optional): Display language, defaults to 'fr'
- `context` (Record<string, string>, optional): Variables for template substitution

## Template Categories

The system organizes templates into four categories:

### 1. Inquiry (Demande)
Templates for asking about item availability and details.

**Examples:**
- "Hello! Is this item still available?"
- "Hi! Can you tell me more about the condition of this item?"
- "Hello! I'm interested in {{item_name}}. Can you provide more details?"

### 2. Negotiation (Négociation)
Templates for price discussions and offers.

**Examples:**
- "What is your best price for this item?"
- "Would you accept {{offer_price}} for this item?"
- "I'm interested in buying multiple items. Can we discuss a bundle price?"

### 3. Meeting (Rendez-vous)
Templates for arranging meetings and exchanges.

**Examples:**
- "Can we meet at a public place? I suggest {{location}} at {{time}}."
- "When would be a good time for us to meet?"
- "Great! I confirm our meeting at {{location}} on {{date}} at {{time}}."

### 4. Thanks (Remerciements)
Templates for expressing gratitude.

**Examples:**
- "Thank you for the quick response!"
- "Thank you! Looking forward to completing this transaction."
- "Thanks for the information. I'll think about it and get back to you."

## Variable Substitution

Templates can include variables in the format `{{variable_name}}`. When a template with variables is selected, the user can edit the message before sending.

**Supported Variables:**
- `item_name`: Name of the listing
- `offer_price`: Price being offered
- `location`: Meeting location
- `time`: Meeting time
- `date`: Meeting date

**Example:**
```typescript
const context = {
  item_name: 'Samsung Galaxy S21',
  offer_price: '500 USD',
  location: 'Centre Ville',
  time: '14h00',
  date: '15 janvier',
};

<MessageTemplatePicker
  visible={true}
  onClose={() => {}}
  onSelect={(message) => console.log(message)}
  language="fr"
  context={context}
/>
```

## Usage

### Basic Usage

```tsx
import MessageTemplatePicker from '@/components/MessageTemplatePicker';

function ChatScreen() {
  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text>Use Template</Text>
      </TouchableOpacity>

      <MessageTemplatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(text) => {
          setMessage(text);
          setShowPicker(false);
        }}
        language="fr"
      />
    </>
  );
}
```

### With Context Variables

```tsx
const listing = { title: 'iPhone 13 Pro' };
const myOffer = 450;

<MessageTemplatePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={setMessage}
  language="fr"
  context={{
    item_name: listing.title,
    offer_price: `${myOffer} USD`,
  }}
/>
```

### Integration with GuidanceContext

```tsx
import { useGuidance } from '@/contexts/GuidanceContext';

function ChatScreen() {
  const { state } = useGuidance();
  const [showPicker, setShowPicker] = useState(false);

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

## Content Management

Message templates are defined in `services/guidanceContent.ts` in the `MESSAGE_TEMPLATES` constant. To add new templates:

1. Add the template to the appropriate category
2. Provide both English and French versions
3. Mark any variables in the `variables` array
4. Use the `{{variable_name}}` format in the text

**Example:**
```typescript
{
  id: 'template_custom',
  category: 'inquiry',
  text: 'Hello! I saw your {{item_name}} listing. Is it still available?',
  variables: ['item_name'],
}
```

## Styling

The component uses the app's design system:
- Colors from `@/constants/Colors`
- Typography from `@/constants/Typography`
- Consistent with other modal components (SafetyTipsModal, ShareModal, etc.)

## Accessibility

- Screen reader compatible
- Clear visual hierarchy
- Touch targets meet minimum size requirements (44x44pt)
- High contrast text and backgrounds

## Requirements Validation

This implementation satisfies:
- **Requirement 5.2**: Message templates for common scenarios
- **Requirement 5.3**: Template variable substitution
- Template categories: inquiry, negotiation, meeting, thanks
- Multilingual support (English/French)

## Future Enhancements

Potential improvements:
1. User-created custom templates
2. Template usage analytics
3. Smart template suggestions based on context
4. Template favorites/pinning
5. Template search functionality
6. More granular categories
7. Template sharing between users
