# Android APK Download From GitHub

This project builds a downloadable Android APK from GitHub Actions and publishes it to a permanent URL.

## Permanent download link (same URL every version)

`https://github.com/nganduntita1/marche.cd/releases/download/android-latest/marche-cd.apk`

## One-time setup

1. Go to repository settings: `Settings -> Secrets and variables -> Actions`.
2. Create a new repository secret:
- Name: `EXPO_TOKEN`
- Value: your Expo access token from `https://expo.dev/accounts/[your-account]/settings/access-tokens`

## Build APK

You can trigger a build in two ways:

1. Push to `main`.
2. Run manually from `Actions -> Android APK Build -> Run workflow`.

## Download APK

Users should download from the permanent link above.

You can also download from Actions artifacts if needed:

1. Open the completed workflow run.
2. In the `Artifacts` section, download `marche-cd-android-apk`.
3. Extract the artifact, then install `marche-cd.apk` on Android.

## Create a new version

For each new app version:

1. Update app version in `app.json` (for user-visible version):
- `expo.version` (example: `1.0.1`)
2. Commit and push to `main`.
3. GitHub Actions builds APK and updates the `android-latest` release asset automatically.
4. The same download URL keeps serving the newest APK.

`eas.json` is already configured with `autoIncrement: true` for the `apk` profile, so Android `versionCode` is incremented automatically by EAS.

## Local alternative

If you prefer building from terminal:

```bash
eas build --platform android --profile apk
eas build:download --platform android --latest --path marche-cd.apk
```
