import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c58e3403aac24acbb98496e3ec2af7ed',
  appName: 'Momster',
  webDir: 'dist',
  
  // For development - comment out for production builds
  // server: {
  //   url: 'https://c58e3403-aac2-4acb-b984-96e3ec2af7ed.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  
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
