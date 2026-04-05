import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aerointel.app',
  appName: 'AeroIntel',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;