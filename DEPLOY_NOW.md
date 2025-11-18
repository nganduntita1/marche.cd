# 🚀 Quick Deploy Commands

## Deploy to Vercel (Web)

```bash
# 1. Commit your changes
git add .
git commit -m "Add reviews and ratings system"
git push origin main

# 2. Deploy to Vercel
npx vercel --prod
```

**Or use Vercel Dashboard:**
- Go to vercel.com
- Import your Git repo
- Click Deploy

---

## Build Android APK

```bash
# 1. Login to Expo (if not logged in)
eas login

# 2. Build APK
eas build --platform android --profile production

# 3. Wait for build to complete (~10-20 minutes)
# Download link will appear in terminal

# 4. Download and install APK on your device
```

---

## Before Deploying

### ✅ Pre-Deployment Checklist:

1. **Run database migration:**
   - Open Supabase SQL Editor
   - Run: `supabase/migrations/20240121000001_reviews_ratings_system_safe.sql`

2. **Test locally:**
   ```bash
   # Test web
   npx expo start --web
   
   # Test Android
   npx expo start --android
   ```

3. **Verify environment variables:**
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. **Update version (optional):**
   - Edit `app.json`
   - Increment `version` and `android.versionCode`

---

## After Deploying

### Test These Features:

- [ ] Login/Register
- [ ] Browse listings
- [ ] Create listing
- [ ] Mark as sold → Select buyer
- [ ] Notifications (bell icon with badge)
- [ ] Submit rating
- [ ] View ratings on profiles
- [ ] Chat/Messages
- [ ] Search and filters

---

## Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Expo Dashboard:** https://expo.dev
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.

---

## Summary

**Deploy Web:**
```bash
npx vercel --prod
```

**Build Android:**
```bash
eas build --platform android --profile production
```

That's it! 🎉
