# 🔧 Fix EAS Build Errors

## Issues Found

1. ✅ Outdated EAS CLI
2. ⚠️ EAS Build service outage (temporary)
3. ❌ Package name mismatch
4. ❌ Missing `cli.appVersionSource` field

---

## Fix 1: Update EAS CLI

```bash
npm install -g eas-cli
```

Or if using yarn:
```bash
yarn global add eas-cli
```

Verify version:
```bash
eas --version
```

Should show: `16.27.0` or higher

---

## Fix 2: Add `cli.appVersionSource` to eas.json

The build requires this field. Update your `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Fix 3: Package Name Mismatch

The error says:
> "Specified value for "android.package" in app.json is ignored because an android project already exists"

This means the native Android code has the **old package name** (`com.marche.cd`).

### Option A: Keep Old Package (Recommended)

Revert the package name in `app.json` to match existing native code:

```json
{
  "android": {
    "package": "com.marche.cd"
  },
  "ios": {
    "bundleIdentifier": "com.marche.cd"
  }
}
```

### Option B: Update Native Code (Advanced)

If you really want the new package name, you need to:

1. Delete `android` folder (if exists)
2. Run `npx expo prebuild --clean`
3. This will regenerate with new package name

**⚠️ Warning:** This creates a completely new app. Users will need to uninstall old app.

---

## Fix 4: Check EAS Service Status

The build service is experiencing issues:
> "EAS Build is experiencing a partial outage"

Check status at: https://status.expo.dev

If there's an outage, wait for it to be resolved before building.

---

## Recommended Solution

### Step 1: Update EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Revert Package Name

Keep the old package name to avoid issues:

**In app.json:**
```json
{
  "android": {
    "package": "com.marche.cd"
  },
  "ios": {
    "bundleIdentifier": "com.marche.cd"
  }
}
```

### Step 3: Update eas.json

Add the required field:

```json
{
  "cli": {
    "version": ">= 5.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Step 4: Try Building Again

```bash
eas build --platform android --profile production
```

---

## Alternative: Build Locally

If EAS is having issues, you can build locally:

### Prerequisites:
- Android Studio installed
- Java JDK installed
- Android SDK configured

### Steps:

1. **Prebuild:**
```bash
npx expo prebuild
```

2. **Build APK:**
```bash
cd android
./gradlew assembleRelease
```

3. **Find APK:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Quick Fix Commands

```bash
# 1. Update EAS CLI
npm install -g eas-cli

# 2. Check service status
# Visit: https://status.expo.dev

# 3. Try building again
eas build --platform android --profile production

# 4. If still fails, check logs
eas build:list
```

---

## Troubleshooting

### Error: "Build command failed"

**Possible causes:**
- EAS service outage (check status.expo.dev)
- Package name mismatch
- Missing configuration
- Network issues

**Solutions:**
1. Wait for service to recover
2. Revert package name to old one
3. Update eas.json with required fields
4. Try again

### Error: "Package name mismatch"

**Solution:** Keep old package name `com.marche.cd` in app.json

### Error: "Outdated CLI"

**Solution:** 
```bash
npm install -g eas-cli
```

---

## Summary

**Immediate fixes:**

1. ✅ Update EAS CLI: `npm install -g eas-cli`
2. ✅ Revert package name to `com.marche.cd`
3. ✅ Add `cli.appVersionSource` to eas.json
4. ⏳ Wait for EAS service recovery (if needed)
5. 🔄 Try building again

**The package name change caused the issue. Reverting to the old package name will fix it.**
