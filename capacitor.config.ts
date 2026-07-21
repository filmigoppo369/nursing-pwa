import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.montastic.nursing',
  appName: 'MONTASTIC',
  webDir: 'out',  // ✅ Point to 'out' folder (Next.js static export)
  server: {
    androidScheme: 'https'
  }
};

export default config;