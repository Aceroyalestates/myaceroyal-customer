import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, of, BehaviorSubject, tap } from 'rxjs';
import { HttpService } from './http.service';
import { TokenService } from './token.service';

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface IUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  avatar: string;
  role_id: number;
  is_verified: boolean;
  gender: string;
  date_of_birth: string;
  referral_code: string;
  role: {
    id: number;
    name: string;
    label: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ILoginResponse {
  success: boolean;
  can_access: boolean;
  message: string;
  token: string;
  refresh_token?: string;
  user: IUser;
}

export interface IRefreshTokenResponse {
  token: string;
  refresh_token?: string;
}

export interface IforgotPasswordPayload {
  email: string;
}

export interface IRegisterResponse {
  message: string;
}

export interface IVerifyEmailPayload {
  email: string;
  token: string;
}

export interface IVerifyEmailResponse {
  message: string;
}

export interface IResendVerificationPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  token: string;
  password: string;
}

export interface IMessageResponse {
  message: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private httpService: HttpService, 
    private router: Router,
    private tokenService: TokenService
  ) {
    // Initialize authentication state
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuthState(): void {
    const user = this.tokenService.getUser();
    const isValid = this.tokenService.isTokenValid();
    
    if (user && isValid) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.logout();
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasCompleteAuthData();
  }

  /**
   * Get current user data
   */
  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with credentials
   */
  login(credentials: ILoginCredentials): Observable<ILoginResponse> {
    return this.httpService
      .post<ILoginResponse>('auth/login', credentials)
      .pipe(
        tap((response) => {
          if (response.token && response.user) {
            this.setAuthData(response.token, response.user, response.refresh_token);
          }
        }),
        map((response) => response)
      );
  }

  register(payload: IRegisterPayload): Observable<IRegisterResponse> {
    return this.httpService.post<IRegisterResponse>('auth/register', payload);
  }

  verifyEmail(payload: IVerifyEmailPayload): Observable<IVerifyEmailResponse> {
    return this.httpService.post<IVerifyEmailResponse>('auth/verify-email', payload);
  }

  resendVerification(payload: IResendVerificationPayload): Observable<IMessageResponse> {
    return this.httpService.post<IMessageResponse>('auth/resend-verification', payload);
  }

  resetPassword(payload: IResetPasswordPayload): Observable<IMessageResponse> {
    return this.httpService.post<IMessageResponse>('auth/reset-password', payload);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<IRefreshTokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.httpService
      .post<IRefreshTokenResponse>('auth/refresh', { refresh_token: refreshToken })
      .pipe(
        tap((response) => {
          if (response.token) {
            this.tokenService.setToken(response.token);
            if (response.refresh_token) {
              this.tokenService.setRefreshToken(response.refresh_token);
            }
          }
        })
      );
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, user: IUser, refreshToken?: string): void {
    this.tokenService.setToken(token);
    this.tokenService.setUser(user);
    
    if (refreshToken) {
      this.tokenService.setRefreshToken(refreshToken);
    }

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Set authentication token (deprecated - use login instead)
   * @deprecated Use login method instead
   */
  setToken(token: string): void {
    console.warn('setToken is deprecated. Use login method instead.');
    this.tokenService.setToken(token);
  }

  /**
   * Set user data (deprecated - use login instead)
   * @deprecated Use login method instead
   */
  setUser(user: any): void {
    console.warn('setUser is deprecated. Use login method instead.');
    this.tokenService.setUser(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Logout user and clear all authentication data
   */
  logout(): void {
    const hasToken = !!this.tokenService.getToken();

    if (hasToken) {
      this.httpService
        .post<IMessageResponse>('auth/logout', {}, {
          skipLoading: true,
          skipErrorHandling: true,
        })
        .subscribe({
          next: () => {},
          error: () => {},
        });
    }

    this.clearAuthState();
  }

  private clearAuthState(): void {
    this.tokenService.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleId: number): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role_id === roleId;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roleIds: number[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? roleIds.includes(currentUser.role_id) : false;
  }

  /**
   * Get user's role ID from token (fallback if user data not available)
   */
  getUserRole(): number | null {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return currentUser.role_id;
    }
    return this.tokenService.getUserRoleFromToken();
  }

  /**
   * Check if token is expiring soon and needs refresh
   */
  shouldRefreshToken(): boolean {
    return this.tokenService.isTokenExpiringSoon();
  }

  forgotPassword(payload: IforgotPasswordPayload): Observable<IMessageResponse> {
    return this.httpService.post<IMessageResponse>('auth/forgot-password', payload);
  }
}
