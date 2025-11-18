# Landing Page Preview

## 🎨 Design Overview

Your new landing page for Marché.cd features a modern, professional design with:

### Hero Section (Green Gradient)
```
┌─────────────────────────────────────────┐
│                                         │
│           Marché.cd                     │
│   Buy & Sell Anything, Anywhere         │
│           in Congo                      │
│                                         │
│   The easiest way to discover great    │
│   deals and sell items in your local   │
│   community                             │
│                                         │
│   ┌──────────────┐  ┌──────────────┐  │
│   │ 📱 Download  │  │ 📱 Coming    │  │
│   │   Android    │  │   Soon iOS   │  │
│   └──────────────┘  └──────────────┘  │
│                                         │
│        🌐 Use Web Version               │
│                                         │
└─────────────────────────────────────────┘
```

### Features Section (Light Gray Background)
```
┌─────────────────────────────────────────┐
│      Why Choose Marché.cd?              │
│                                         │
│  ┌──────────┐    ┌──────────┐         │
│  │ 📍 Loc.  │    │ 🛡️ Safe  │         │
│  │ Based    │    │ Secure   │         │
│  └──────────┘    └──────────┘         │
│                                         │
│  ┌──────────┐    ┌──────────┐         │
│  │ ⚡ Quick │    │ 👥 Ratings│         │
│  │ Actions  │    │ Reviews  │         │
│  └──────────┘    └──────────┘         │
└─────────────────────────────────────────┘
```

### How It Works Section
```
┌─────────────────────────────────────────┐
│         How It Works                    │
│                                         │
│            ① Download & Sign Up         │
│   Get the app and create your account   │
│                                         │
│            ② Browse or Post             │
│   Find great deals or list your items   │
│                                         │
│            ③ Connect & Trade            │
│   Chat with buyers/sellers and trade    │
└─────────────────────────────────────────┘
```

### Call-to-Action Section (Green Gradient)
```
┌─────────────────────────────────────────┐
│     Ready to Get Started?               │
│                                         │
│   Join thousands of users buying and    │
│   selling on Marché.cd                  │
│                                         │
│      [ Download Now ]                   │
└─────────────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────────────┐
│  © 2024 Marché.cd. All rights reserved. │
│                                         │
│  Privacy Policy • Terms • Help Center   │
└─────────────────────────────────────────┘
```

## 🎯 Key Features

1. **Responsive Design**: Works perfectly on mobile, tablet, and desktop
2. **Brand Colors**: Uses your green (#00b86b) primary color throughout
3. **Typography**: Montserrat for headings, Roboto for body text
4. **Interactive Elements**: All buttons and links are functional
5. **Smooth Navigation**: Routes to login page for web users
6. **Download Ready**: APK download button (just needs URL update)

## 📱 User Flow

1. **New User Arrives** → Sees hero section with app description
2. **Scrolls Down** → Learns about features and how it works
3. **Takes Action** → Either:
   - Downloads Android APK
   - Waits for iOS (coming soon)
   - Uses web version (login page)

## 🔧 Customization Points

All easily customizable in `app/index.tsx`:

- **APK URL**: Line 19 - Update with your actual download link
- **Hero Text**: Lines 63-69 - Customize messaging
- **Features**: Lines 21-36 - Add/remove/edit features
- **Colors**: Uses `constants/Colors.ts` - change once, updates everywhere
- **Typography**: Uses `constants/Typography.ts` - consistent fonts

## 🚀 Next Steps

1. Build your Android APK with EAS
2. Upload APK to hosting (Vercel, GitHub, etc.)
3. Update the download URL in the code
4. Deploy to web with `npm run build:web`
5. Share your landing page!

## 📊 Responsive Behavior

- **Mobile**: Single column layout, stacked buttons
- **Tablet**: Two-column feature grid
- **Desktop**: Full-width hero, multi-column features, side-by-side download buttons

The landing page automatically adapts to any screen size!
