/**
 * App Configuration Constants
 * 
 * Centralized configuration for the app
 */

// App URLs
export const APP_URL = 'https://marchecd.tech';
export const APP_NAME = 'Marche CD';

// Contact Information
export const CONTACT_EMAIL = 'support@marchecd.tech';
export const CONTACT_WHATSAPP = '+27 67 272 7343';

// Social Media (if any)
export const SOCIAL_MEDIA = {
  facebook: '',
  twitter: '',
  instagram: '',
};

// App Store Links (when published)
export const STORE_LINKS = {
  playStore: '',
  appStore: '',
  apkDownload: 'https://github.com/nganduntita1/marche.cd/releases/download/v1.0.0/marche-cd.apk',
};

// API Configuration (if needed)
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

// Feature Flags
export const FEATURES = {
  enablePushNotifications: true,
  enableLocationServices: true,
  enableChatPolling: true,
  enableAnalytics: false,
};

export default {
  APP_URL,
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_WHATSAPP,
  SOCIAL_MEDIA,
  STORE_LINKS,
  API_CONFIG,
  FEATURES,
};
