import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'is.dsk.keyra',
  appName: 'Keyra',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true,
    }
  },
  server: {
    hostname: 'localhost'
  }
};

export default config;
