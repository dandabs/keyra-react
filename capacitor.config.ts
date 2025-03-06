import type { CapacitorConfig } from '@capacitor/cli';

let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true,
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  server: {
    hostname: 'localhost'
  },
};

switch (process.env.NODE_ENV) {
  case 'production':
    config = {
      ...baseConfig,
      appId: 'is.dsk.keyra',
      appName: 'Keyra',
      ios: {
        scheme: 'App'
      },
      android: {
        flavor: "prod",
        buildOptions: {
          keystorePath: '/Users/dandabs/keyra-release.jks',
          keystoreAlias: 'keyra-release',
          keystorePassword: 'Nuud3l1',
          keystoreAliasPassword: 'Nuud3l1'
        }
      }
    }
    break;
  default:
    config = {
      ...baseConfig,
      appId: 'is.dsk.keyra-dev',
      appName: 'Keyra DEV',
      ios: {
        scheme: 'App DEV'
      },
      android: {
        flavor: "dev",
        buildOptions: {
          keystorePath: '/Users/dandabs/keyra-release.jks',
          keystoreAlias: 'keyra-release',
          keystorePassword: 'Nuud3l1',
          keystoreAliasPassword: 'Nuud3l1'
        }
      }
    }
    break;
}

export default config;
