# Guidance Content Service

## Overview

The Guidance Content Service manages all guidance content for the Marché.cd app, including:
- Tooltips
- Guided tours
- Message templates
- Safety tips
- Quick actions

All content is available in both English and French, with automatic language switching based on user preferences.

## Usage

### Getting Tooltips

```typescript
import { GuidanceContentService } from '../services/guidanceContent';

// Get a tooltip in the current language
const tooltip = GuidanceContentService.getTooltip('home_search', 'en');
// Returns: { id, title, message, placement, icon, dismissLabel }
```

### Getting Tours

```typescript
// Get a tour in the current language
const tour = GuidanceContentService.getTour('home_tour', 'fr');
// Returns: { id, name, steps[], triggerCondition }
```

### Getting Message Templates

```typescript
// Get templates for a specific category
const inquiryTemplates = GuidanceContentService.getMessageTemplates('inquiry', 'en');

// Get all templates
const allTemplates = GuidanceContentService.getAllMessageTemplates('fr');
```

### Getting Safety Tips

```typescript
// Get a random safety tip for a context
const tip = GuidanceContentService.getSafetyTip('chat', 'en');

// Get all safety tips for a context
const allTips = GuidanceContentService.getAllSafetyTips('meeting', 'fr');
```

### Substituting Variables in Templates

```typescript
const template = "Hello! I'm interested in {{item_name}}. Can you provide more details?";
const variables = { item_name: "Samsung Galaxy S21" };

const message = GuidanceContentService.substituteVariables(template, variables);
// Returns: "Hello! I'm interested in Samsung Galaxy S21. Can you provide more details?"
```

## Content Structure

### Tooltips

Each tooltip has:
- `id`: Unique identifier
- `title`: Short title
- `message`: Detailed explanation
- `placement`: Where to show ('top', 'bottom', 'left', 'right')
- `icon`: Optional emoji icon
- `actionLabel`: Optional action button text
- `dismissLabel`: Optional dismiss button text

### Tours

Each tour has:
- `id`: Unique identifier
- `name`: Tour name
- `steps`: Array of tour steps
- `triggerCondition`: When to show the tour

Each tour step has:
- `id`: Step identifier
- `title`: Step title
- `message`: Step message
- `placement`: Where to show
- `showOverlay`: Whether to dim background
- `nextLabel`: Next button text
- `skipLabel`: Optional skip button text

### Message Templates

Each template has:
- `id`: Unique identifier
- `category`: 'inquiry', 'negotiation', 'meeting', or 'thanks'
- `text`: Template text (may contain {{variables}})
- `variables`: Optional array of variable names

### Safety Tips

Safety tips are organized by context:
- `chat`: Tips for messaging
- `meeting`: Tips for in-person meetings
- `payment`: Tips for transactions

## Adding New Content

### Adding a New Tooltip

1. Open `services/guidanceContent.ts`
2. Add to the `TOOLTIPS` object:

```typescript
new_tooltip_id: {
  en: {
    id: 'new_tooltip_id',
    title: 'English Title',
    message: 'English message',
    placement: 'bottom' as const,
    icon: '🎯',
    dismissLabel: 'Got it',
  },
  fr: {
    id: 'new_tooltip_id',
    title: 'Titre français',
    message: 'Message français',
    placement: 'bottom' as const,
    icon: '🎯',
    dismissLabel: 'Compris',
  },
},
```

### Adding a New Tour

1. Open `services/guidanceContent.ts`
2. Add to the `TOURS` object with steps for both languages

### Adding Message Templates

1. Open `services/guidanceContent.ts`
2. Add to the appropriate category in `MESSAGE_TEMPLATES`

## Integration with GuidanceContext

The GuidanceContext automatically uses the content service:

```typescript
const { getTooltipContent, getMessageTemplates } = useGuidance();

// Get tooltip (language is handled automatically)
const tooltip = getTooltipContent('home_search');

// Get templates (language is handled automatically)
const templates = getMessageTemplates('inquiry');
```

## Best Practices

1. **Keep messages concise**: Users should understand quickly
2. **Use emojis sparingly**: They should enhance, not distract
3. **Test both languages**: Ensure translations are accurate
4. **Consider context**: Tooltips should be relevant to the current screen
5. **Use variables**: Make templates flexible with {{variable}} syntax

## Content Guidelines

### Tone
- Friendly and encouraging
- Clear and simple language
- Avoid technical jargon
- Use active voice

### French Translations
- Use appropriate formality level
- Consider cultural context
- Verify with native speakers
- Use proper accents and characters

### Safety Tips
- Be direct and specific
- Focus on actionable advice
- Prioritize user safety
- Update based on user feedback
