# Safety & Trust Guidance - Visual Guide

## Modal Designs

### 1. Contact Info Warning Modal 🛡️

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   🛡️ 40px   │  Yellow     │
│         │   Shield    │  Background │
│         └─────────────┘             │
│                                     │
│    Rappel de sécurité 🛡️           │
│                                     │
│  Nous avons remarqué des           │
│  informations de contact...        │
│                                     │
│  • Rencontrez-vous dans des        │
│    lieux publics                   │
│  • N'envoyez jamais d'argent       │
│  • Faites confiance à votre        │
│    instinct                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Je comprends            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: Contact info detected in message
**Color**: Yellow/Warning
**Icon**: Shield (40px)
**Dismissible**: Yes

---

### 2. Daytime Meeting Safety ☀️

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   📍 40px   │  Green      │
│         │   MapPin    │  Background │
│         └─────────────┘             │
│                                     │
│  Conseils de sécurité pour         │
│  la rencontre ☀️                    │
│                                     │
│  Super ! Vous organisez une        │
│  rencontre pendant la journée.     │
│                                     │
│  Liste de sécurité :               │
│  ✓ Lieu public fréquenté           │
│  ✓ Informez quelqu'un              │
│  ✓ Téléphone chargé                │
│  ✓ Inspectez l'article             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Compris              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: Meeting arranged during day (6am-5pm)
**Color**: Green/Success
**Icon**: MapPin (40px)
**Tone**: Positive reinforcement

---

### 3. Evening Meeting Caution ⚠️

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   📍 40px   │  Yellow     │
│         │   MapPin    │  Background │
│         └─────────────┘             │
│                                     │
│  Rencontre en soirée -             │
│  Prudence supplémentaire ⚠️         │
│                                     │
│  Vous vous rencontrez en soirée.   │
│  Veuillez prendre des précautions  │
│  supplémentaires :                 │
│                                     │
│  ⚠️ Endroits bien éclairés         │
│  ⚠️ Amenez quelqu'un               │
│  ⚠️ Partagez votre position        │
│  ⚠️ Reportez si pas sûr            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Je serai prudent(e)       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: Meeting arranged in evening (5pm-8pm)
**Color**: Yellow/Warning
**Icon**: MapPin (40px)
**Tone**: Cautionary

---

### 4. Night Meeting High Risk 🚨

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   📍 40px   │  Red        │
│         │   MapPin    │  Background │
│         └─────────────┘             │
│                                     │
│  Rencontre nocturne -              │
│  Risque élevé 🚨                    │
│                                     │
│  Se rencontrer la nuit comporte    │
│  des risques importants.           │
│                                     │
│  Nous recommandons fortement :     │
│  🚨 Reportez à la journée          │
│  🚨 Amenez plusieurs personnes     │
│  🚨 Établissements 24h/24          │
│  🚨 Position en direct             │
│                                     │
│  Demandez-vous si cette            │
│  transaction vaut le risque.       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Compris              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: Meeting arranged at night (8pm-6am)
**Color**: Red/Error
**Icon**: MapPin (40px)
**Tone**: Strong warning

---

### 5. First Transaction Celebration 🎉

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   ✅ 40px   │  Green      │
│         │CheckCircle  │  Background │
│         └─────────────┘             │
│                                     │
│  Votre première transaction ! 🎉   │
│                                     │
│  Félicitations pour avoir          │
│  complété votre première           │
│  transaction !                     │
│                                     │
│  Aidez à construire la confiance : │
│  ⭐ Évaluation honnête             │
│  ⭐ Mentionnez ce qui s'est bien   │
│     passé                          │
│  ⭐ Soyez constructif               │
│                                     │
│  ┌──────────┐  ┌──────────────┐    │
│  │Peut-être │  │  Laisser une │    │
│  │plus tard │  │  évaluation  │    │
│  └──────────┘  └──────────────┘    │
└─────────────────────────────────────┘
```

**Trigger**: First transaction completed
**Color**: Green/Success
**Icon**: CheckCircle (40px)
**Actions**: Two buttons (skip/rate)

---

### 6. Low Rating Feedback 💪

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   ⭐ 40px   │  Blue       │
│         │    Star     │  Background │
│         └─────────────┘             │
│                                     │
│  Améliorons-nous ensemble 💪        │
│                                     │
│  Nous avons remarqué que vous      │
│  avez reçu une note de 2 étoiles.  │
│  Ne vous inquiétez pas - tout le   │
│  monde peut s'améliorer !          │
│                                     │
│  Conseils pour de meilleures       │
│  notes :                           │
│  📸 Photos claires et précises     │
│  📝 Descriptions honnêtes          │
│  💬 Réponses rapides               │
│  🤝 Ponctualité                    │
│  😊 Amical et professionnel        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Je ferai mieux          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: User receives rating < 3 stars
**Color**: Blue/Info
**Icon**: Star (40px)
**Tone**: Supportive, constructive

---

### 7. Report Confirmation ✅

```
┌─────────────────────────────────────┐
│                                  [X]│
│         ┌─────────────┐             │
│         │   ✅ 40px   │  Green      │
│         │CheckCircle  │  Background │
│         └─────────────┘             │
│                                     │
│     Signalement reçu ✅             │
│                                     │
│  Merci d'avoir signalé une         │
│  activité suspecte.                │
│                                     │
│  Que se passe-t-il ensuite :       │
│  🔍 Examen dans les 24 heures      │
│  🛡️ Pris au sérieux                │
│  📧 Mise à jour par notification   │
│  🚫 Mesures appropriées            │
│  🤝 Communauté plus sûre           │
│                                     │
│  Vous pouvez continuer à utiliser  │
│  l'application normalement.        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Compris              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Trigger**: Suspicious activity report submitted
**Color**: Green/Success
**Icon**: CheckCircle (40px)
**Tone**: Reassuring, transparent

---

## Design Specifications

### Modal Container
- **Width**: 100% (max 420px)
- **Max Height**: 80% of screen
- **Padding**: 24px
- **Border Radius**: 20px
- **Background**: White (#FFFFFF)
- **Shadow**: 0px 4px 12px rgba(0,0,0,0.3)

### Icon Container
- **Size**: 80x80px
- **Border Radius**: 40px (circular)
- **Background**: Color + 15% opacity
- **Icon Size**: 40px
- **Centered**: Horizontally

### Typography
- **Title**: H3 style, centered, 16px margin bottom
- **Message**: Body style, left-aligned, 24px line height
- **Button Text**: Button style, white color

### Buttons
- **Height**: 48px (minimum)
- **Border Radius**: 12px
- **Padding**: 16px
- **Shadow**: 0px 4px 8px color+30% opacity
- **Text**: Centered, bold

### Close Button
- **Position**: Absolute top-right
- **Size**: 32x32px
- **Icon**: X (24px)
- **Color**: Text secondary

### Overlay
- **Background**: rgba(0,0,0,0.7)
- **Blur**: Optional backdrop blur
- **Padding**: 20px

## Color Palette

| Context | Background | Icon Color | Button Color |
|---------|-----------|------------|--------------|
| Contact Info | Yellow+15% | Warning | Warning |
| Daytime | Green+15% | Success | Success |
| Evening | Yellow+15% | Warning | Warning |
| Night | Red+15% | Error | Error |
| First Transaction | Green+15% | Success | Success |
| Low Rating | Blue+15% | Info | Info |
| Report | Green+15% | Success | Success |

## Responsive Behavior

### Mobile (< 768px)
- Full width with 20px margins
- Scrollable content area
- Touch-optimized buttons (44pt minimum)

### Tablet (768px - 1024px)
- Max width 420px
- Centered on screen
- Larger touch targets

### Desktop (> 1024px)
- Max width 420px
- Centered modal
- Hover states on buttons

## Animation

### Modal Entry
- Fade in overlay (300ms)
- Scale up card (200ms, ease-out)
- Slight bounce effect

### Modal Exit
- Fade out (200ms)
- Scale down slightly (150ms)

### Button Interactions
- Press: Scale 0.95
- Release: Scale 1.0
- Transition: 100ms

## Accessibility

### Screen Readers
- Modal announces title on open
- All text content readable
- Button labels descriptive

### Keyboard Navigation
- Tab through buttons
- Enter/Space to activate
- Escape to dismiss

### Visual
- High contrast ratios (4.5:1 minimum)
- Large text (16px minimum)
- Clear visual hierarchy
- Icons supplement text (not replace)

## States

### Loading
- Skeleton placeholder
- Shimmer effect
- No interaction

### Active
- Full opacity
- Interactive elements enabled
- Animations smooth

### Dismissed
- Fade out animation
- State saved to storage
- Won't show again (unless reset)

### Error
- Fallback to default content
- Log error silently
- Don't block user flow
