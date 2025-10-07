import { Injectable } from '@angular/core';

interface DecodedToken {
  exp: number;
  iat: number;
  id: string;
  role_id: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'user';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  /**
   * Stores the authentication token
   */
  setToken(token: string): void {
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Retrieves the authentication token
   */
  getToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Stores the refresh token
   */
  setRefreshToken(refreshToken: string): void {
    try {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Retrieves the refresh token
   */
  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Removes the authentication token
   */
  removeToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  /**
   * Removes the refresh token
   */
  removeRefreshToken(): void {
    try {
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  }

  /**
   * Checks if the token exists and is valid (not expired)
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return false;
      }

      // Check if token is expired (with 5 minute buffer)
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutes
      return decoded.exp > (currentTime + bufferTime);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Checks if token is about to expire (within 10 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const tenMinutes = 10 * 60;
      return decoded.exp <= (currentTime + tenMinutes);
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true;
    }
  }

  /**
   * Decodes JWT token payload
   */
  private decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(this.base64UrlDecode(payload));
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Base64 URL decode helper
   */
  private base64UrlDecode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Invalid base64url string');
    }
    return decodeURIComponent(escape(atob(output)));
  }

  /**
   * Gets token expiration time
   */
  getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Get token expiration error:', error);
      return null;
    }
  }

  /**
   * Gets user ID from token
   */
  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const decoded = this.decodeToken(token);
      return decoded?.id || null;
    } catch (error) {
      console.error('Get user ID from token error:', error);
      return null;
    }
  }

  /**
   * Gets user role from token
   */
  getUserRoleFromToken(): number | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const decoded = this.decodeToken(token);
      return decoded?.role_id || null;
    } catch (error) {
      console.error('Get user role from token error:', error);
      return null;
    }
  }

  /**
   * Stores user data with validation
   */
  setUser(user: any): void {
    try {
      if (user && typeof user === 'object') {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        console.warn('Invalid user data provided to setUser');
      }
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Retrieves user data with error handling
   */
  getUser(): any {
    try {
      const userStr = sessionStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Removes user data
   */
  removeUser(): void {
    try {
      sessionStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  }

  /**
   * Clears all authentication data
   */
  clearAuthData(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    
    // Clear any legacy items
    try {
      const legacyKeys = ['response', 'userId', 'role', 'tokenExpires'];
      legacyKeys.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key); // Also clear from localStorage if any
      });
    } catch (error) {
      console.error('Failed to clear legacy auth data:', error);
    }
  }

  /**
   * Checks if we have complete authentication data
   */
  hasCompleteAuthData(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && this.isTokenValid());
  }
}
