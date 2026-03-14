# Android APK Download From GitHub

This project can build a downloadable Android APK from GitHub Actions.

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

1. Open the completed workflow run.
2. In the `Artifacts` section, download `marche-cd-android-apk`.
3. Extract the artifact, then install `marche-cd.apk` on Android.

## Local alternative

If you prefer building from terminal:

```bash
eas build --platform android --profile apk
eas build:download --platform android --latest --path marche-cd.apk
```
