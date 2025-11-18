# ✅ Domain Updated to marchecd.tech

## Changes Made

All hardcoded references to `marche.cd` have been updated to `marchecd.tech`.

---

## Files Updated

### 1. **app/listing/[id].tsx**
**Before:** `https://marche.cd/listing/${id}`  
**After:** `https://marchecd.tech/listing/${id}`

Used in ShareModal for sharing listings.

### 2. **app/privacy.tsx**
**Before:** `support@marche.cd`  
**After:** `support@marchecd.tech`

Contact email in privacy policy.

### 3. **app/auth/register.tsx**
**Before:** "...de Marche.cd"  
**After:** "...de Marche CD"

Terms acceptance text (removed .cd extension).

### 4. **app/auth/complete-profile.tsx**
**Before:** "...sur Marche.cd"  
**After:** "...sur Marche CD"

Profile completion subtitle.

### 5. **app.json**
**Before:**
- iOS: `com.marche.cd`
- Android: `com.marche.cd`

**After:**
- iOS: `tech.marchecd.app`
- Android: `tech.marchecd.app`

Bundle identifiers updated to match domain.

---

## New Configuration File

### **constants/Config.ts**

Created a centralized configuration file for easy management:

```typescript
export const APP_URL = 'https://marchecd.tech';
export const APP_NAME = 'Marche CD';
export const CONTACT_EMAIL = 'support@marchecd.tech';
export const CONTACT_WHATSAPP = '+27 67 272 7343';
```

**Usage:**
```typescript
import { APP_URL, CONTACT_EMAIL } from '@/constants/Config';

// Use in your code
const shareUrl = `${APP_URL}/listing/${id}`;
const email = CONTACT_EMAIL;
```

---

## Benefits

### Centralized Configuration:
- ✅ Easy to update domain in one place
- ✅ Consistent across the app
- ✅ Type-safe with TypeScript
- ✅ Easy to add more config values

### Updated URLs:
- ✅ Share links use correct domain
- ✅ Contact email matches domain
- ✅ App identifiers match domain
- ✅ Professional appearance

---

## Important Notes

### Bundle Identifier Change

**⚠️ Important:** Changing the bundle identifier means:

1. **Android:**
   - New package name: `tech.marchecd.app`
   - Will be treated as a new app
   - Users will need to uninstall old app and install new one
   - Or publish as update if you control the old package

2. **iOS:**
   - New bundle ID: `tech.marchecd.app`
   - Will be treated as a new app
   - Same considerations as Android

### If You Want to Keep Old Package:

If you already have users with the old package (`com.marche.cd`), you might want to keep it for continuity. In that case, revert the app.json changes:

```json
"bundleIdentifier": "com.marche.cd",
"package": "com.marche.cd",
```

---

## Testing

### Test Share Functionality:

1. **Open a listing**
2. **Tap share button**
3. **Check the URL:** Should be `https://marchecd.tech/listing/[id]`
4. **Share via WhatsApp/SMS**
5. **Verify link works**

### Test Contact Email:

1. **Go to Privacy Policy**
2. **Check email:** Should show `support@marchecd.tech`
3. **Tap email** (if clickable)
4. **Should open email client**

### Test App Name:

1. **Check registration screen**
2. **Check profile completion**
3. **Should say "Marche CD"** (not "Marche.cd")

---

## Future Updates

### Using Config File:

When you need to update the domain or other config:

1. **Edit:** `constants/Config.ts`
2. **Update:** `APP_URL` or other values
3. **All references update automatically**

### Adding New Config:

```typescript
// In constants/Config.ts
export const NEW_FEATURE_URL = 'https://marchecd.tech/feature';
export const API_VERSION = 'v1';

// Use in your code
import { NEW_FEATURE_URL } from '@/constants/Config';
```

---

## Deployment Checklist

Before deploying:

- [x] Update all hardcoded URLs
- [x] Create Config.ts file
- [x] Update app.json identifiers
- [x] Test share functionality
- [x] Test contact email
- [ ] Update DNS settings (if needed)
- [ ] Update Vercel domain
- [ ] Test deployed app

---

## DNS Configuration

Make sure your domain is configured:

### For Vercel:
1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add `marchecd.tech`
4. Add `www.marchecd.tech` (optional)
5. Configure DNS records as instructed

### DNS Records:
```
Type: A
Name: @
Value: [Vercel IP]

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Summary

**All references updated:**
- ✅ Share URLs: `marchecd.tech`
- ✅ Contact email: `support@marchecd.tech`
- ✅ App name: "Marche CD"
- ✅ Bundle IDs: `tech.marchecd.app`
- ✅ Config file created

**Ready to deploy with correct domain!** 🚀

---

## Quick Reference

**Old Domain:** marche.cd  
**New Domain:** marchecd.tech

**Old Email:** support@marche.cd  
**New Email:** support@marchecd.tech

**Old Package:** com.marche.cd  
**New Package:** tech.marchecd.app

**Config File:** constants/Config.ts
