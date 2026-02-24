# Seller Dashboard Guidance - Quick Reference

## Component Usage

### Basic Integration

```typescript
import { SellerDashboardGuidance } from '@/components/guidance';

<SellerDashboardGuidance
  totalListings={stats.totalListings}
  activeListings={stats.activeListings}
  lowViewListings={lowViewListings}
  onPromotePress={(listingId) => {
    // Handle promotion
    router.push(`/listing/${listingId}`);
  }}
  onEditPress={(listingId) => {
    // Handle edit
    router.push(`/edit-listing/${listingId}`);
  }}
  onMarkAsSoldPress={(listingId) => {
    // Handle mark as sold
    router.push(`/listing/${listingId}`);
  }}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `totalListings` | `number` | Yes | Total number of listings |
| `activeListings` | `number` | Yes | Number of active listings |
| `lowViewListings` | `Array<{id, title, views, daysActive}>` | No | Listings with low views |
| `onPromotePress` | `(listingId: string) => void` | No | Callback for promote action |
| `onEditPress` | `(listingId: string) => void` | No | Callback for edit action |
| `onMarkAsSoldPress` | `(listingId: string) => void` | No | Callback for mark as sold |

## Features

### 1. Dashboard Tour
- **Trigger**: First visit to seller dashboard
- **Content**: Overview of dashboard features
- **Languages**: French, English
- **Dismissible**: Yes

### 2. Low-View Suggestions
- **Trigger**: Listings with < 10 views after 24 hours
- **Actions**: Edit, Promote
- **Suggestions**: Photos, Price, Description, Promotion

### 3. Response Templates
- **Access**: Quick action card
- **Templates**: 6 pre-written responses
- **Categories**: Inquiry, Negotiation, Availability, Meeting

### 4. Mark as Sold Guidance
- **Trigger**: User-initiated
- **Content**: Step-by-step process explanation
- **Emphasis**: Rating importance

### 5. Promotion Options
- **Access**: Quick action card
- **Options**: Featured (500 FC), Boost (300 FC), Local (400 FC)
- **Details**: Duration, benefits, costs

## Response Templates

### Available Templates

1. **Item Available** (✅)
   - Category: Inquiry
   - Use: Confirm availability

2. **Price Firm** (💰)
   - Category: Negotiation
   - Use: Decline price negotiation

3. **Open to Offers** (🤝)
   - Category: Negotiation
   - Use: Accept price negotiation

4. **Arrange Meeting** (📍)
   - Category: Meeting
   - Use: Schedule in-person meeting

5. **Schedule Viewing** (📅)
   - Category: Availability
   - Use: Arrange item viewing

6. **More Details** (📝)
   - Category: Inquiry
   - Use: Offer additional information

## Low-View Listing Criteria

A listing is flagged as "low-view" when:
- Status: Active
- Views: < 10
- Days Active: ≥ 1

## Promotion Tiers

### Featured Listing ⭐
- **Duration**: 7 days
- **Benefit**: 5x more views
- **Cost**: 500 FC
- **Placement**: Top of search results

### Boost 🚀
- **Duration**: 3 days
- **Benefit**: 3x more views
- **Cost**: 300 FC
- **Placement**: Category visibility

### Local Highlight 📍
- **Duration**: 5 days
- **Benefit**: 4x more local views
- **Cost**: 400 FC
- **Placement**: Local buyer prominence

## Customization

### Adjusting Low-View Threshold

```typescript
// In SellerDashboardGuidance component
const needsAttention = lowViewListings.filter(
  (listing) => listing.views < 10 && listing.daysActive >= 1
);

// Change 10 to your desired threshold
```

### Adding Custom Response Templates

```typescript
const customTemplate: ResponseTemplate = {
  id: 'custom_template',
  category: 'inquiry',
  title: 'Custom Response',
  text: 'Your custom message here',
  icon: '🎯',
};
```

### Modifying Promotion Costs

```typescript
// In PromotionExplanation component
const promotionOptions = [
  {
    icon: '⭐',
    title: 'Featured Listing',
    cost: '500 FC', // Change this value
    // ...
  },
];
```

## Localization

### Adding New Language

1. Update language type in component
2. Add translations to all content objects
3. Update language detection logic

```typescript
const language = state?.settings.language || 'fr';

const content = {
  en: 'English text',
  fr: 'Texte français',
  // Add new language here
};
```

## Styling

All styles are defined in the component's StyleSheet. Key style groups:

- `modalOverlay` - Modal background
- `tourCard` - Tour modal container
- `lowViewContainer` - Low-view warning card
- `templatesCard` - Response templates modal
- `promotionCard` - Promotion options modal
- `quickActions` - Quick action cards

## Events Tracked

The component tracks:
- Screen views (`seller_dashboard`)
- Tour completion (`seller_dashboard_tour`)
- Template selections (via callback)
- Action button clicks (via callbacks)

## Best Practices

1. **Always provide callbacks** for user actions
2. **Keep low-view threshold reasonable** (10 views is recommended)
3. **Update promotion costs** to match your pricing
4. **Test in both languages** before deployment
5. **Monitor guidance effectiveness** through analytics

## Troubleshooting

### Tour not showing
- Check if `shouldShowTour('seller_dashboard_tour')` returns true
- Verify GuidanceContext is properly initialized
- Clear guidance state to reset

### Low-view suggestions not appearing
- Verify `lowViewListings` prop is passed correctly
- Check listing data includes required fields
- Ensure threshold criteria are met

### Templates not displaying
- Check modal visibility state
- Verify language setting is correct
- Ensure template data is properly formatted

## Related Components

- `GuidanceContext` - State management
- `ProfileGuidance` - Similar guidance pattern
- `PostingGuidance` - Similar guidance pattern
- `MessagingGuidance` - Response template pattern

## Support

For issues or questions:
1. Check component documentation
2. Review GuidanceContext implementation
3. Test with different user states
4. Verify prop data structure
