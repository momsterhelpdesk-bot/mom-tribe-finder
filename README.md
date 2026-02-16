# Momster - Κοινότητα Μαμάδων

Social networking app for moms. Built with React, TypeScript, Vite, Tailwind CSS, and shadcn-ui.

## Development

```sh
npm install
npm run dev
```

## Android Build

```bash
npm run build
npx cap sync android
cd android
# Windows:
gradlew.bat bundleRelease
# Mac/Linux:
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`
