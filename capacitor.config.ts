import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'dist',
  cordova: {
    preferences: {
      bluetooth_restore_state: 'true',
      accessBackgroundLocation: 'false',
    },
  },
};

export default config;
