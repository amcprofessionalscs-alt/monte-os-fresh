import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextstep.os',
  appName: 'Next Step OS',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
