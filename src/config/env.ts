// Environment variables and configuration
export const ENV = {
  NODE_ENV: import.meta.env.MODE || "development",
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,

  // API Configuration for API gateway
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https:midlanex.duckdns.org/api',
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',

  // PROJECTS_SERVICE_URL: import.meta.env.VITE_PROJECTS_SERVICE_URL || 'http://localhost:8083/api',

  // Social Authentication
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // App Configuration
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === "true",
} as const;

// Development helpers
export const isDevelopment = ENV.DEV;
export const isProduction = ENV.PROD;

// Debug logger
export const debugLog = (...args: unknown[]) => {
  if (ENV.ENABLE_DEBUG || isDevelopment) {
    console.log('[DEBUG]', ...args);
  }
};
