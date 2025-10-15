import { ENV } from '../config/env';

export interface SocialAuthResponse {
  accessToken: string;
  provider: 'google';
  email: string;
  name: string;
  profilePicture?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}



declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export class SocialAuthService {
  private static instance: SocialAuthService;

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  // Initialize Google Identity Services
  initializeGoogle(onCredentialResponse: (response: GoogleCredentialResponse) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!ENV.GOOGLE_CLIENT_ID) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.configureGoogle(onCredentialResponse);
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      } else {
        this.configureGoogle(onCredentialResponse);
        resolve();
      }
    });
  }

  private configureGoogle(onCredentialResponse: (response: GoogleCredentialResponse) => void) {
    window.google?.accounts.id.initialize({
      client_id: ENV.GOOGLE_CLIENT_ID,
      callback: onCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  // Render Google Sign-In button
  renderGoogleButton(elementId: string, theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline') {
    const element = document.getElementById(elementId);
    if (!element || !window.google) return;

    window.google.accounts.id.renderButton(element, {
      theme,
      size: 'large',
      width: '100%',
      text: 'continue_with',
      shape: 'rectangular',
    });
  }





  // Decode Google JWT token (simplified version)
  decodeGoogleCredential(credential: string): Promise<SocialAuthResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Split the JWT token
        const parts = credential.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT token');
        }

        // Decode the payload (base64url)
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        resolve({
          accessToken: credential,
          provider: 'google',
          email: payload.email,
          name: payload.name,
          profilePicture: payload.picture,
        });
      } catch (error) {
        reject(new Error('Failed to decode Google credential'));
      }
    });
  }
}

export const socialAuthService = SocialAuthService.getInstance();
