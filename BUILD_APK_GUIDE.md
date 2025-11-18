# Guide de Build APK pour Android 📱

## Problème Résolu

**Avant:** `eas build --platform android --profile production` créait un fichier AAB (Android App Bundle)  
**Après:** Configuration mise à jour pour créer des fichiers APK

## Différence AAB vs APK

### AAB (Android App Bundle)
- ✅ Format requis pour Google Play Store
- ✅ Taille optimisée (Google génère des APK spécifiques par appareil)
- ❌ Ne peut pas être installé directement
- ❌ Ne peut pas être distribué en dehors du Play Store

### APK (Android Package)
- ✅ Peut être installé directement sur les appareils
- ✅ Peut être distribué via votre site web
- ✅ Parfait pour les téléchargements directs
- ❌ Taille plus grande (contient toutes les ressources)

## Configuration Mise à Jour

### eas.json
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "apk": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Commandes de Build

### Option 1: Build Production APK
```bash
eas build --platform android --profile production
```
Crée un APK de production signé, prêt pour la distribution.

### Option 2: Build Preview APK
```bash
eas build --platform android --profile preview
```
Crée un APK de prévisualisation pour les tests.

### Option 3: Build avec Profil APK Dédié
```bash
eas build --platform android --profile apk
```
Utilise le profil spécifique "apk".

## Processus Complet

### 1. Lancer le Build
```bash
eas build --platform android --profile production
```

### 2. Attendre la Compilation
- Le build se fait sur les serveurs Expo
- Durée: 10-20 minutes généralement
- Vous recevrez un email quand c'est terminé

### 3. Télécharger l'APK
Deux méthodes:

**A. Via le Terminal**
```bash
eas build:download --platform android --profile production
```

**B. Via le Dashboard**
1. Aller sur https://expo.dev
2. Sélectionner votre projet
3. Aller dans "Builds"
4. Cliquer sur le build récent
5. Télécharger l'APK

### 4. Vérifier le Fichier
```bash
ls -lh *.apk
```
Vous devriez voir un fichier comme:
```
marche-cd-1.0.0-abc123.apk
```

## Héberger l'APK

### Option 1: GitHub Releases (Recommandé)
```bash
# 1. Créer une release sur GitHub
gh release create v1.0.0 marche-cd-1.0.0.apk

# 2. Obtenir l'URL de téléchargement
# Format: https://github.com/username/repo/releases/download/v1.0.0/marche-cd-1.0.0.apk
```

### Option 2: Vercel/Netlify
```bash
# 1. Créer un dossier public
mkdir -p public/downloads

# 2. Copier l'APK
cp marche-cd-1.0.0.apk public/downloads/

# 3. Déployer
vercel --prod
```

URL: `https://your-domain.vercel.app/downloads/marche-cd-1.0.0.apk`

### Option 3: Cloud Storage
- **AWS S3**: Créer un bucket public
- **Google Cloud Storage**: Bucket avec accès public
- **Cloudflare R2**: Alternative gratuite

## Mettre à Jour la Landing Page

### 1. Obtenir l'URL de l'APK
Exemple: `https://github.com/username/marche-cd/releases/download/v1.0.0/marche-cd.apk`

### 2. Mettre à Jour app/landing.tsx
```typescript
const handleDownloadAPK = () => {
  const apkUrl = 'https://github.com/username/marche-cd/releases/download/v1.0.0/marche-cd.apk';
  Linking.openURL(apkUrl);
};
```

### 3. Tester le Téléchargement
```bash
# Tester l'URL
curl -I https://your-apk-url.apk

# Devrait retourner 200 OK
```

## Tester l'APK

### Sur un Appareil Physique

1. **Activer les Sources Inconnues**
   - Paramètres → Sécurité
   - Activer "Sources inconnues" ou "Installer des apps inconnues"

2. **Transférer l'APK**
   ```bash
   adb install marche-cd-1.0.0.apk
   ```
   
   Ou envoyer par email/WhatsApp et ouvrir sur le téléphone

3. **Installer**
   - Ouvrir le fichier APK
   - Cliquer sur "Installer"
   - Accepter les permissions

### Sur un Émulateur

```bash
# Démarrer l'émulateur
emulator -avd Pixel_5_API_31

# Installer l'APK
adb install marche-cd-1.0.0.apk

# Lancer l'app
adb shell am start -n com.marche.cd/.MainActivity
```

## Versions et Mises à Jour

### Incrémenter la Version

**app.json**
```json
{
  "expo": {
    "version": "1.0.1",  // Incrémenter ici
    "android": {
      "versionCode": 2   // Incrémenter aussi (doit être > précédent)
    }
  }
}
```

### Build Nouvelle Version
```bash
# 1. Mettre à jour app.json
# 2. Rebuild
eas build --platform android --profile production

# 3. Télécharger
eas build:download --platform android --profile production

# 4. Publier nouvelle release
gh release create v1.0.1 marche-cd-1.0.1.apk
```

## Signature de l'APK

### Vérifier la Signature
```bash
# Installer apksigner (Android SDK)
apksigner verify --print-certs marche-cd-1.0.0.apk
```

### Informations de Signature
EAS gère automatiquement:
- ✅ Génération du keystore
- ✅ Signature de l'APK
- ✅ Stockage sécurisé des clés

## Taille de l'APK

### Vérifier la Taille
```bash
ls -lh marche-cd-1.0.0.apk
```

### Optimiser la Taille
Si l'APK est trop gros (>50MB):

**eas.json**
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "enableProguardInReleaseBuilds": true
      }
    }
  }
}
```

## Dépannage

### Erreur: "App not installed"
```bash
# Désinstaller l'ancienne version
adb uninstall com.marche.cd

# Réinstaller
adb install marche-cd-1.0.0.apk
```

### Erreur: "Parse error"
- L'APK est corrompu
- Retélécharger depuis EAS
- Vérifier l'intégrité du fichier

### Build Échoue
```bash
# Voir les logs détaillés
eas build --platform android --profile production --local

# Nettoyer le cache
eas build:cancel
```

## Checklist de Distribution

- [ ] Build APK avec `eas build --platform android --profile production`
- [ ] Télécharger l'APK depuis EAS
- [ ] Tester l'installation sur un appareil
- [ ] Héberger l'APK (GitHub/Vercel/Cloud)
- [ ] Mettre à jour l'URL dans `app/landing.tsx`
- [ ] Tester le téléchargement depuis la landing page
- [ ] Documenter l'URL pour les utilisateurs

## Commandes Rapides

```bash
# Build APK
eas build -p android --profile production

# Télécharger
eas build:download -p android --profile production

# Vérifier
ls -lh *.apk

# Installer sur appareil connecté
adb install marche-cd-*.apk

# Voir les builds
eas build:list
```

## Résultat

Vous avez maintenant un fichier APK que vous pouvez:
- ✅ Distribuer via votre landing page
- ✅ Installer directement sur les appareils Android
- ✅ Partager par email, WhatsApp, etc.
- ✅ Héberger sur votre propre serveur

Pas besoin du Google Play Store pour la distribution! 🎉
