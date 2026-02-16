import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.momster.community',
  appName: 'Momster - Κοινότητα Μαμάδων',
  webDir: 'dist',
  
  android: {
    allowMixedContent: false,
    backgroundColor: '#F8E9EE',
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'momster',
    }
  },
  
  ios: {
    backgroundColor: '#F8E9EE',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Momster'
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F8E9EE',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F8E9EE'
    }
  }
};

export default config;
