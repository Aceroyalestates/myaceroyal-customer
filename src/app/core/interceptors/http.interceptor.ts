import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';
import { ErrorModalService } from '../services/error-modal.service';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError, timer, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_LOADING, SKIP_ERROR_HANDLING } from '../services/http.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);
  const errorModalService = inject(ErrorModalService);
  
  // Check if we should skip loading or error handling for this request
  const skipLoading = req.context.get(SKIP_LOADING);
  const skipErrorHandling = req.context.get(SKIP_ERROR_HANDLING);
  
  const token = authService.getToken();
  let clonedReq = req;

  console.log({ token, req });

  // Add authentication token if available and not already present
  if (token && !req.headers.has('Authorization')) {
    clonedReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Add Content-Type for JSON requests if not already set and not FormData
  if (shouldAddContentType(req)) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Show loader for appropriate requests
  if (!skipLoading && shouldShowLoader(req)) {
    const loadingMessage = getLoadingMessage(req);
    loaderService.show(loadingMessage);
  }

  // Log request in development
  if (!environment.production) {
    console.log(`🌐 HTTP ${req.method}:`, req.url, {
      headers: req.headers.keys().reduce((acc, key) => {
        acc[key] = req.headers.get(key);
        return acc;
      }, {} as Record<string, string | null>),
      body: req.body
    });
  }
  // Execute the request and handle response/errors
  return next(clonedReq).pipe(
    tap((event) => {
      if (!environment.production) {
        console.log(`✅ HTTP ${req.method} Success:`, req.url, event);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Skip error handling if requested
      if (skipErrorHandling) {
        return throwError(() => error);
      }

      const status = error.status;
      const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
      const errorStatusText = error.statusText || 'Unknown status';

      // Log error for debugging
      if (!environment.production) {
        console.error(`❌ HTTP ${req.method} Error:`, req.url, {
          status,
          message: errorMessage,
          statusText: errorStatusText,
          error
        });
      }

      // Handle different types of errors
      if (isInvalidJsonResponse(error)) {
        errorModalService.showError(
          'Invalid Response',
          'The server returned an unexpected response format. Please contact support.',
          'INVALID_RESPONSE'
        );
        return throwError(() => new Error('Invalid response format'));
      }

      // Handle authentication errors (401/403)
      if (isAuthError(status)) {
        handleAuthError(authService, errorModalService, errorMessage);
        return throwError(() => error);
      }

      // Handle server errors (4xx/5xx) but not auth errors
      if (isServerError(status) && !isAuthError(status)) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(status, errorMessage);
        errorModalService.showServerError(status, userFriendlyMessage);
      }

      return throwError(() => error);
    }),
    finalize(() => {
      // Hide loader if it was shown for this request
      if (!skipLoading && shouldShowLoader(req)) {
        loaderService.hide();
      }
    })
  );
};

/**
 * Helper functions for cleaner code
 */

function shouldAddContentType(req: HttpRequest<any>): boolean {
  return (
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') &&
    !(req.body instanceof FormData) &&
    !req.headers.has('Content-Type')
  );
}

function shouldShowLoader(req: HttpRequest<any>): boolean {
  // Show loader for non-GET requests and certain GET requests
  return req.method !== 'GET' || req.url.includes('/upload') || req.url.includes('/download');
}

function getLoadingMessage(req: HttpRequest<any>): string {
  switch (req.method) {
    case 'POST':
      return 'Creating...';
    case 'PUT':
    case 'PATCH':
      return 'Updating...';
    case 'DELETE':
      return 'Deleting...';
    default:
      return 'Processing...';
  }
}

function isInvalidJsonResponse(error: HttpErrorResponse): boolean {
  return (
    error instanceof SyntaxError ||
    error.error?.text?.includes('<!doctype html>')
  );
}

function isAuthError(status: number): boolean {
  return status === 401 || status === 403;
}

function isServerError(status: number): boolean {
  return status >= 400 && status < 600;
}

function getUserFriendlyErrorMessage(status: number, originalMessage: string): string {
  const baseMessage = environment.production ? 
    'An error occurred. Please try again later.' : 
    originalMessage;

  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return baseMessage;
  }
}

function handleAuthError(
  authService: AuthService, 
  errorModalService: ErrorModalService, 
  errorMessage: string
): void {
  console.error('Authentication error:', errorMessage);

  errorModalService.showAuthError(
    'Your session has expired. Please log in again.'
  );

  // Delay logout to allow user to read the error message
  timer(3000).pipe(
    switchMap(() => {
      authService.logout();
      return [];
    })
  ).subscribe();
}
