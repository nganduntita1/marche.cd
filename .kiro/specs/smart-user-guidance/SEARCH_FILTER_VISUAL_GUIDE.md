# Search and Filter Guidance - Visual Guide

## Overview
This guide provides visual descriptions of how the search and filter guidance features appear to users.

---

## 1. Search Bar Tooltip (Requirement 8.1)

### Visual Description

```
┌─────────────────────────────────────────────┐
│  🏠 Marché.cd          ❤️  🔔              │
│                                             │
│  ┌────────────────────────────┐  ┌──────┐ │
│  │ 🔍 Rechercher              │  │ ⚙️   │ │
│  └────────────────────────────┘  └──────┘ │
│           ↓                                 │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Conseils de recherche            │   │
│  │                                     │   │
│  │ Recherchez par nom d'article,       │   │
│  │ marque, ou catégorie. Essayez       │   │
│  │ "Samsung", "meubles", ou "vélo" !   │   │
│  │                                     │   │
│  │              [Compris]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Tous] [Électronique] [Meubles] ...       │
└─────────────────────────────────────────────┘
```

### Key Features
- **Position:** Below search bar
- **Icon:** 🔍 (magnifying glass)
- **Background:** White with shadow
- **Animation:** Fade in from top
- **Timing:** Appears 1 second after home screen loads
- **Dismissal:** Auto-dismisses when user starts typing

---

## 2. No Results Suggestions (Requirement 8.2)

### Visual Description

```
┌─────────────────────────────────────────────┐
│  🏠 Marché.cd          ❤️  🔔              │
│                                             │
│  ┌────────────────────────────────┐  ┌──┐  │
│  │ 🔍 xyzabc123                   │  │⚙️│  │
│  └────────────────────────────────┘  └──┘  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Aucun résultat pour "xyzabc123" │   │
│  │                                     │   │
│  │ Essayez ces suggestions :           │   │
│  │                                     │   │
│  │ • Essayez des mots-clés plus        │   │
│  │   généraux                          │   │
│  │                                     │   │
│  │ • Vérifiez l'orthographe            │   │
│  │                                     │   │
│  │ • Supprimez les filtres actifs      │   │
│  │                                     │   │
│  │ • Élargissez votre rayon de         │   │
│  │   recherche                         │   │
│  │                                     │   │
│  │              [Fermer]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │     📦 Aucune annonce trouvée       │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Key Features
- **Position:** Center of screen, above empty state
- **Icon:** 🔍 (search icon)
- **Background:** White card with shadow
- **Animation:** Fade in after 1.5 second delay
- **Content:** 4 actionable suggestions
- **Dismissal:** Tap outside or close button

---

## 3. Filter Panel Tour (Requirement 8.3)

### Step 1: Introduction

```
┌─────────────────────────────────────────────┐
│                                             │
│         [Overlay - Semi-transparent]        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │     🎯 Filtres de recherche         │   │
│  │                                     │   │
│  │  Utilisez ces filtres pour affiner  │   │
│  │  votre recherche et trouver         │   │
│  │  exactement ce que vous cherchez !  │   │
│  │                                     │   │
│  │  [Passer]         [Montrez-moi]    │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         [Filter Panel Below - Dimmed]       │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 2: Price Range

```
┌─────────────────────────────────────────────┐
│  Filtres                                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Fourchette de prix ($)              │   │
│  │ ┌──────────┐   -   ┌──────────┐    │◄──┐
│  │ │   Min    │       │   Max    │    │   │
│  │ └──────────┘       └──────────┘    │   │
│  └─────────────────────────────────────┘   │
│           ↑                                 │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │     💰 Fourchette de prix           │   │
│  │                                     │   │
│  │  Définissez un prix minimum et      │   │
│  │  maximum pour voir uniquement les   │   │
│  │  articles dans votre budget.        │   │
│  │                                     │   │
│  │              [Suivant]              │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Step 3: Sort Options

```
┌─────────────────────────────────────────────┐
│  Filtres                                    │
│                                             │
│  Trier par                                  │
│  ┌─────────────────────────────────────┐   │
│  │ ✓ Plus récents                      │◄──┐
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │   Prix croissant                    │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │   Prix décroissant                  │   │
│  └─────────────────────────────────────┘   │
│           ↑                                 │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │     🔄 Trier les résultats          │   │
│  │                                     │   │
│  │  Triez par prix (croissant/         │   │
│  │  décroissant) ou par date pour voir │   │
│  │  les annonces les plus récentes.    │   │
│  │                                     │   │
│  │              [Compris]              │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Key Features
- **Overlay:** Semi-transparent dark background
- **Spotlight:** Highlighted area for current step
- **Progress:** 3 steps total
- **Navigation:** Next/Skip buttons
- **Animation:** Smooth transitions between steps

---

## 4. Location Filter Tooltip (Requirement 8.4)

### Visual Description

```
┌─────────────────────────────────────────────┐
│  Filtres                                    │
│                                             │
│  Fourchette de prix ($)                     │
│  ┌──────────┐   -   ┌──────────┐           │
│  │   Min    │       │   Max    │           │
│  └──────────┘       └──────────┘           │
│                                             │
│  Trier par                                  │
│  [Plus récents ▼]                           │
│                                             │
│  Rayon de recherche                         │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Dans un rayon de 10 km       ▼  │   │
│  └─────────────────────────────────────┘   │
│           ↓                                 │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 Filtre de distance               │   │
│  │                                     │   │
│  │ Choisissez un rayon de recherche    │   │
│  │ pour voir les articles à proximité. │   │
│  │ Plus le rayon est petit, plus les   │   │
│  │ résultats sont proches !            │   │
│  │                                     │   │
│  │              [Compris]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Réinitialiser]         [Appliquer]       │
└─────────────────────────────────────────────┘
```

### Key Features
- **Position:** Below location filter selector
- **Icon:** 📍 (location pin)
- **Background:** White with shadow
- **Timing:** Appears after filter tour completes
- **Content:** Explains radius relationship
- **Dismissal:** Tap dismiss button

---

## 5. Real-time Price Filter Feedback (Requirement 8.5)

### Visual Description - Price Range

```
┌─────────────────────────────────────────────┐
│  🏠 Marché.cd          ❤️  🔔              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💰 Affichage des articles entre     │   │
│  │    $100 et $500 • 42 résultats      │   │
│  └─────────────────────────────────────┘   │
│           ↓ (Fades out after 2s)            │
│                                             │
│  ┌────────────────────────────────┐  ┌──┐  │
│  │ 🔍 Rechercher                  │  │⚙️│  │
│  └────────────────────────────────┘  └──┘  │
│                                             │
│  [Tous] [Électronique] [Meubles] ...       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Listing 1  │  │   Listing 2  │        │
│  │   $150       │  │   $200       │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### Visual Description - Minimum Only

```
┌─────────────────────────────────────────────┐
│  🏠 Marché.cd          ❤️  🔔              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💰 Affichage des articles à partir  │   │
│  │    de $100 • 87 résultats           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Visual Description - Maximum Only

```
┌─────────────────────────────────────────────┐
│  🏠 Marché.cd          ❤️  🔔              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💰 Affichage des articles jusqu'à   │   │
│  │    $500 • 156 résultats             │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Key Features
- **Position:** Top of screen, below header
- **Icon:** 💰 (money bag / pricetag)
- **Background:** White card with shadow
- **Animation:** 
  - Fade in: 300ms
  - Display: 2000ms
  - Fade out: 300ms
- **Updates:** Real-time as filters change
- **Content:** Shows price range and result count
- **Non-blocking:** Doesn't interfere with scrolling

---

## Animation Sequences

### Search Tooltip Animation

```
Frame 1 (0ms):     Invisible, translateY: -20
Frame 2 (150ms):   Opacity: 0.5, translateY: -10
Frame 3 (300ms):   Opacity: 1, translateY: 0
```

### No Results Prompt Animation

```
Frame 1 (0ms):     Scale: 0.9, opacity: 0
Frame 2 (200ms):   Scale: 0.95, opacity: 0.5
Frame 3 (400ms):   Scale: 1, opacity: 1
```

### Price Feedback Animation

```
Appear:
Frame 1 (0ms):     Opacity: 0, translateY: -10
Frame 2 (150ms):   Opacity: 0.5, translateY: -5
Frame 3 (300ms):   Opacity: 1, translateY: 0

Hold:
Frame 4-X:         Opacity: 1, translateY: 0 (2000ms)

Disappear:
Frame X+1 (0ms):   Opacity: 1, translateY: 0
Frame X+2 (150ms): Opacity: 0.5, translateY: -5
Frame X+3 (300ms): Opacity: 0, translateY: -10
```

---

## Color Scheme

### Tooltips & Tours
- **Background:** #FFFFFF (white)
- **Text:** #1e293b (dark slate)
- **Icon Background:** #f0fdf4 (light green)
- **Icon Color:** Primary color
- **Shadow:** rgba(0, 0, 0, 0.1)
- **Border Radius:** 12px

### Buttons
- **Primary Button:** Primary color background, white text
- **Secondary Button:** #f8fafc background, #64748b text
- **Hover State:** Slightly darker shade

### Overlay
- **Background:** rgba(0, 0, 0, 0.5)
- **Spotlight:** Original color (no dimming)

### Feedback Banner
- **Background:** #FFFFFF (white)
- **Text:** #1e293b (dark slate)
- **Icon:** Primary color
- **Shadow:** rgba(0, 0, 0, 0.1)

---

## Responsive Behavior

### Mobile Portrait
- Tooltips: Full width minus 32px padding
- Tours: Center aligned, max 90% width
- Feedback: Full width minus 32px padding

### Mobile Landscape
- Tooltips: Max 400px width, centered
- Tours: Max 500px width, centered
- Feedback: Max 600px width, centered

### Tablet
- Tooltips: Max 400px width
- Tours: Max 600px width
- Feedback: Max 700px width

---

## Accessibility Features

### Visual Indicators
- **Focus Ring:** 2px solid primary color
- **High Contrast:** All text meets WCAG AA standards
- **Icon Size:** Minimum 24x24px touch targets
- **Button Size:** Minimum 44x44px touch targets

### Screen Reader Announcements
- Tooltip appears: "Search tips tooltip appeared"
- Tour step: "Step 1 of 3: Search Filters"
- Feedback: "Showing items between $100 and $500, 42 results"

---

## Dark Mode Support (Future)

### Planned Color Adjustments
- **Background:** #1e293b → #0f172a
- **Text:** #1e293b → #f8fafc
- **Shadow:** Lighter, more visible
- **Overlay:** rgba(0, 0, 0, 0.7)

---

## Summary

The search and filter guidance features use a consistent visual language:
- **Clean, modern design** with rounded corners and subtle shadows
- **Smooth animations** that feel natural and responsive
- **Clear hierarchy** with icons, titles, and body text
- **Non-intrusive** overlays that don't block critical functionality
- **Accessible** design meeting WCAG standards
- **Bilingual** support with proper text sizing for both languages

All visual elements are designed to guide users without overwhelming them, providing help exactly when and where it's needed.
