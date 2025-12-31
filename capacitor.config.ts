import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.advancekeep.app',
  appName: 'AdvanceKeep',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '246582604160-30o3v97op0ti7ko79e0dli1sfrukv6uo.apps.googleusercontent.com', // Firebase Web Client ID (from google-services.json oauth_client with client_type 3)
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
