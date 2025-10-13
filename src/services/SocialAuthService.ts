import { ENV } from "../config/env";

export interface SocialAuthResponse {
  accessToken: string;
  provider: "google" | "facebook";
  email: string;
  name: string;
  profilePicture?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface FacebookAuthResponse {
  authResponse: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
  status: string;
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
    FB?: {
      init: (config: any) => void;
      login: (
        callback: (response: FacebookAuthResponse) => void,
        options?: any,
      ) => void;
      api: (path: string, callback: (response: any) => void) => void;
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
  initializeGoogle(
    onCredentialResponse: (response: GoogleCredentialResponse) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!ENV.GOOGLE_CLIENT_ID) {
        reject(new Error("Google Client ID not configured"));
        return;
      }

      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.configureGoogle(onCredentialResponse);
          resolve();
        };
        script.onerror = () =>
          reject(new Error("Failed to load Google Identity Services"));
        document.head.appendChild(script);
      } else {
        this.configureGoogle(onCredentialResponse);
        resolve();
      }
    });
  }

  private configureGoogle(
    onCredentialResponse: (response: GoogleCredentialResponse) => void,
  ) {
    window.google?.accounts.id.initialize({
      client_id: ENV.GOOGLE_CLIENT_ID,
      callback: onCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  // Render Google Sign-In button
  renderGoogleButton(
    elementId: string,
    theme: "outline" | "filled_blue" | "filled_black" = "outline",
  ) {
    const element = document.getElementById(elementId);
    if (!element || !window.google) return;

    window.google.accounts.id.renderButton(element, {
      theme,
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "rectangular",
    });
  }

  // Initialize Facebook SDK
  initializeFacebook(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!ENV.FACEBOOK_APP_ID) {
        reject(new Error("Facebook App ID not configured"));
        return;
      }

      // Load Facebook SDK script if not already loaded
      if (!window.FB) {
        const script = document.createElement("script");
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.FB?.init({
            appId: ENV.FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: "v18.0",
          });
          resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Facebook SDK"));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  // Facebook login
  loginWithFacebook(): Promise<SocialAuthResponse> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error("Facebook SDK not initialized"));
        return;
      }

      window.FB.login(
        (response: FacebookAuthResponse) => {
          if (response.authResponse) {
            // Get user profile information
            window.FB?.api("/me?fields=name,email,picture", (userInfo: any) => {
              resolve({
                accessToken: response.authResponse.accessToken,
                provider: "facebook",
                email: userInfo.email,
                name: userInfo.name,
                profilePicture: userInfo.picture?.data?.url,
              });
            });
          } else {
            reject(new Error("Facebook login was cancelled or failed"));
          }
        },
        { scope: "email,public_profile" },
      );
    });
  }

  // Decode Google JWT token (simplified version)
  decodeGoogleCredential(credential: string): Promise<SocialAuthResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Split the JWT token
        const parts = credential.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid JWT token");
        }

        // Decode the payload (base64url)
        const payload = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );

        resolve({
          accessToken: credential,
          provider: "google",
          email: payload.email,
          name: payload.name,
          profilePicture: payload.picture,
        });
      } catch (error) {
        reject(new Error("Failed to decode Google credential"));
      }
    });
  }
}

export const socialAuthService = SocialAuthService.getInstance();
