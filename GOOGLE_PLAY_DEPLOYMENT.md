# 🚀 Momster - Google Play Deployment Guide

## Προαπαιτούμενα

1. **Google Play Developer Account** (~25€ εφάπαξ)
2. **Android Studio** εγκατεστημένο
3. **JDK 17+** εγκατεστημένο
4. **Node.js 18+** εγκατεστημένο

---

## Βήμα 1: Κατέβασε το Project

```bash
# Clone από GitHub (πρέπει πρώτα να κάνεις Export to GitHub από το Lovable)
git clone https://github.com/YOUR_USERNAME/mom-tribe-finder.git
cd mom-tribe-finder

# Εγκατάσταση dependencies
npm install
```

---

## Βήμα 2: Build & Sync

```bash
# Build το project
npm run build

# Πρόσθεσε Android platform
npx cap add android

# Sync τις αλλαγές
npx cap sync android
```

---

## Βήμα 3: Δημιούργησε Release Keystore

⚠️ **ΣΗΜΑΝΤΙΚΟ**: Φύλαξε το keystore και τους κωδικούς σε ασφαλές μέρος! Χωρίς αυτά δεν μπορείς να κάνεις updates!

```bash
cd android

# Δημιουργία keystore
keytool -genkey -v -keystore release.keystore -alias momster -keyalg RSA -keysize 2048 -validity 10000

# Θα σε ρωτήσει:
# - Keystore password: (βάλε δυνατό password)
# - Όνομα, Organization, City, Country
# - Key password: (μπορεί να είναι ίδιο με keystore password)
```

---

## Βήμα 4: Ρύθμισε το Signing

Δημιούργησε αρχείο `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=momster
storeFile=../release.keystore
```

⚠️ **ΜΗΝ κάνεις commit** το `key.properties` στο Git!

---

## Βήμα 5: Ενημέρωσε το build.gradle

Άνοιξε `android/app/build.gradle` και πρόσθεσε πριν το `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Και μέσα στο `android {`:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## Βήμα 6: App Icons & Splash Screen

### Εικονίδια (απαραίτητα μεγέθη):
- `mipmap-mdpi`: 48x48
- `mipmap-hdpi`: 72x72
- `mipmap-xhdpi`: 96x96
- `mipmap-xxhdpi`: 144x144
- `mipmap-xxxhdpi`: 192x192

Τοποθέτησέ τα στο: `android/app/src/main/res/`

### Splash Screen:
- `drawable/splash.png`: 1920x1920 (θα κοπεί αυτόματα)
- Background color: #F8E9EE

**Tip**: Χρησιμοποίησε το [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

---

## Βήμα 7: Build Release APK/AAB

```bash
cd android

# Build AAB (Google Play απαιτεί AAB)
./gradlew bundleRelease

# Το αρχείο θα είναι στο:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## Βήμα 8: Upload στο Google Play Console

1. Πήγαινε στο [Google Play Console](https://play.google.com/console)
2. Δημιούργησε νέα εφαρμογή
3. Συμπλήρωσε:
   - **App name**: Momster
   - **Description**: Βρες μαμάδες κοντά σου...
   - **Category**: Social
   - **Content rating**: Everyone
4. **Store Listing**:
   - Screenshots (phone, tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)
5. Upload το `.aab` αρχείο
6. Κάνε Internal Testing πρώτα
7. Μετά Production release

---

## 📱 App Store Listing Content

### Τίτλος
```
Momster - Βρες Μαμάδες Κοντά Σου
```

### Σύντομη Περιγραφή (80 χαρακτήρες)
```
Γνώρισε μαμάδες στη γειτονιά σου, μοιράσου εμπειρίες, βρες φίλες! 🌸
```

### Πλήρης Περιγραφή
```
🌸 Το Momster είναι η εφαρμογή που φέρνει κοντά τις μαμάδες!

✨ Τι προσφέρει:
• Βρες μαμάδες κοντά σου με παρόμοια ενδιαφέροντα
• Magic Match - έξυπνο matching βάσει ηλικίας παιδιών
• Ανώνυμες ερωτήσεις στο "Ρώτα μια Μαμά"
• This or That - διασκεδαστικά polls
• Ασφαλές chat μόνο με αμοιβαία αποδοχή

💕 Για κάθε μαμά:
Είτε είσαι νέα μαμά, working mom, ή μαμά πολλών παιδιών, 
το Momster σε βοηθά να βρεις τη "φυλή" σου!

🔒 Ασφάλεια πρώτα:
• Επαληθευμένα προφίλ
• Moderation περιεχομένου
• Block & Report λειτουργίες

Κατέβασε τώρα και γίνε μέλος της κοινότητας! 🌸
```

---

## 🔄 Για Updates

Μετά από αλλαγές στο Lovable:

```bash
git pull
npm install
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

Μην ξεχάσεις να αυξήσεις το `versionCode` στο `android/app/build.gradle`!

---

## ❓ Συχνά Προβλήματα

### "App not installed"
- Απεγκατάστησε την παλιά έκδοση πρώτα

### "Keystore was tampered with"
- Ξαναδημιούργησε το keystore (θα χρειαστεί νέο app στο Play Store)

### Build αποτυγχάνει
- Τρέξε `npx cap sync` ξανά
- Καθάρισε: `cd android && ./gradlew clean`

---

## 📞 Support

Για βοήθεια επικοινώνησε: momster.helpdesk@gmail.com
