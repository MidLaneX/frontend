import { authApi } from '../api/endpoints/auth';
import type { AuthResponse, RefreshTokenResponse } from '../api/endpoints/auth';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userEmail: string;
  role: string;
  expiresAt: number; // Calculated expiration timestamp
}

const TOKEN_STORAGE_KEY = 'auth_tokens';
const REFRESH_THRESHOLD = 10; // Refresh token 10 seconds before expiry (for testing with 60s tokens)

// Get device info for refresh requests
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  return `${platform} - ${userAgent}`;
};

export class TokenManager {
  private static instance: TokenManager;
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<void> | null = null;

  private constructor() {
    this.loadTokens();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Load tokens from localStorage
  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        this.tokenData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      this.clearTokens();
    }
  }

  // Save tokens to localStorage
  private saveTokens(data: AuthResponse | RefreshTokenResponse): void {
    // Convert snake_case response to camelCase for internal storage
    const tokenData: TokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      userEmail: data.user_email,
      role: data.role,
      expiresAt: Date.now() + (data.expires_in * 1000), // Convert seconds to milliseconds
    };
    
    this.tokenData = tokenData;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    
    // Log token info for testing
    console.log('Tokens saved:', {
      expiresIn: data.expires_in,
      expiresAt: new Date(tokenData.expiresAt).toLocaleTimeString(),
      refreshThreshold: REFRESH_THRESHOLD
    });
  }

  // Clear all tokens
  public clearTokens(): void {
    this.tokenData = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('authToken'); // Clear legacy token if exists
  }

  // Get current access token
  public getAccessToken(): string | null {
    return this.tokenData?.accessToken || null;
  }

  // Get current refresh token
  public getRefreshToken(): string | null {
    return this.tokenData?.refreshToken || null;
  }

  // Get user email
  public getUserEmail(): string | null {
    return this.tokenData?.userEmail || null;
  }

  // Get user role
  public getUserRole(): string | null {
    return this.tokenData?.role || null;
  }

  // Check if tokens exist
  public hasTokens(): boolean {
    return !!this.tokenData?.accessToken && !!this.tokenData?.refreshToken;
  }

  // Check if access token is expired or about to expire
  public isTokenExpired(): boolean {
    if (!this.tokenData) return true;
    
    const now = Date.now();
    const expiresAt = this.tokenData.expiresAt;
    const threshold = REFRESH_THRESHOLD * 1000; // Convert to milliseconds
    
    const willExpireSoon = now >= (expiresAt - threshold);
    
    // Log token status for testing
    if (willExpireSoon) {
      console.log('Token will expire soon:', {
        now: new Date(now).toLocaleTimeString(),
        expiresAt: new Date(expiresAt).toLocaleTimeString(),
        timeLeft: Math.floor((expiresAt - now) / 1000) + 's',
        threshold: REFRESH_THRESHOLD + 's'
      });
    }
    
    return willExpireSoon;
  }

  // Set tokens from login/signup response
  public setTokens(data: AuthResponse): void {
    this.saveTokens(data);
    console.log(data);
  }

  // Refresh access token
  public async refreshAccessToken(): Promise<boolean> {
    console.log('Attempting to refresh access token...');
    
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      try {
        await this.refreshPromise;
        return this.hasTokens() && !this.isTokenExpired();
      } catch {
        return false;
      }
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('No refresh token available');
      this.clearTokens();
      return false;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      await this.refreshPromise;
      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<void> {
    try {
      const response = await authApi.refreshToken({
        refreshToken,
        deviceInfo: getDeviceInfo(),
      });

      this.saveTokens(response);
    } catch (error) {
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  public async getValidAccessToken(): Promise<string | null> {
    if (!this.hasTokens()) {
      return null;
    }

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.getAccessToken();
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.hasTokens() && !this.isTokenExpired();
  }

  // Migrate from old token format (if exists)
  public migrateFromLegacyToken(): boolean {
    const legacyToken = localStorage.getItem('authToken');
    if (legacyToken && !this.hasTokens()) {
      // We can't migrate without refresh token, so just clear the legacy token
      localStorage.removeItem('authToken');
      return false;
    }
    return this.hasTokens();
  }
}

export const tokenManager = TokenManager.getInstance();
