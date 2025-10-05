import { authApi } from '../api/endpoints/auth';
import type { AuthResponse, RefreshTokenResponse } from '../api/endpoints/auth';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userEmail: string;
  role: string;
  userId?: number;
  expiresAt: number;
}

const TOKEN_STORAGE_KEY = 'auth_tokens';
const REFRESH_THRESHOLD = 10;

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

  private saveTokens(data: AuthResponse | RefreshTokenResponse, userId?: number): void {
    const tokenData: TokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      userEmail: data.user_email,
      role: data.role,
      userId: userId || data.user_id || this.tokenData?.userId, // Extract user_id from response
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
    
    this.tokenData = tokenData;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
  }

  public clearTokens(): void {
    this.tokenData = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('authToken');
  }

  public getAccessToken(): string | null {
    return this.tokenData?.accessToken || null;
  }
 
  public getRefreshToken(): string | null {
    return this.tokenData?.refreshToken || null;
  }

  public getUserId(): number | null {
    return this.tokenData?.userId || null;
  }

  public setUserId(userId: number): void {
    if (this.tokenData) {
      this.tokenData.userId = userId;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(this.tokenData));
    }
  }

  public getUserEmail(): string | null {
    return this.tokenData?.userEmail || null;
  }

  public getUserRole(): string | null {
    return this.tokenData?.role || null;
  }

  public hasTokens(): boolean {
    return !!this.tokenData?.accessToken && !!this.tokenData?.refreshToken;
  }

  public isTokenExpired(): boolean {
    if (!this.tokenData) return true;
    
    const now = Date.now();
    const expiresAt = this.tokenData.expiresAt;
    const threshold = REFRESH_THRESHOLD * 1000;
    
    return now >= (expiresAt - threshold);
  }

  public setTokens(data: AuthResponse, userId?: number): void {
    this.saveTokens(data, userId);
  }

  public async refreshAccessToken(): Promise<boolean> {
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
      this.clearTokens();
      return false;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      await this.refreshPromise;
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<void> {
    const response = await authApi.refreshToken({
      refreshToken,
      deviceInfo: getDeviceInfo(),
    });
    this.saveTokens(response); // user_id will be extracted from response automatically
  }

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

  public isAuthenticated(): boolean {
    return this.hasTokens() && !this.isTokenExpired();
  }

  public migrateFromLegacyToken(): boolean {
    const legacyToken = localStorage.getItem('authToken');
    if (legacyToken && !this.hasTokens()) {
      localStorage.removeItem('authToken');
      return false;
    }
    return this.hasTokens();
  }
}

export const tokenManager = TokenManager.getInstance();
