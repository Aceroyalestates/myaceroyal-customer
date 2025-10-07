import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, timeout, retry } from 'rxjs';
import { environment } from '../../../environments/environment';

// HTTP Context tokens for controlling interceptor behavior
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  reportProgress?: boolean;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
  withCredentials?: boolean;
  skipLoading?: boolean;
  skipErrorHandling?: boolean;
  retryCount?: number;
  timeoutMs?: number;
  body?: any;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly apiUrl = environment.apiUrl;
  private readonly defaultTimeout = 30000; // 30 seconds
  private readonly defaultRetryCount = 1;

  constructor(private http: HttpClient) { }

  /**
   * Get default headers (without hardcoded token - let interceptor handle it)
   */
  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json'
    });
  }

  /**
   * Create HTTP context for controlling interceptor behavior
   */
  private createContext(options?: HttpOptions): HttpContext {
    const context = new HttpContext();

    if (options?.skipLoading) {
      context.set(SKIP_LOADING, true);
    }

    if (options?.skipErrorHandling) {
      context.set(SKIP_ERROR_HANDLING, true);
    }

    return context;
  }

  /**
   * Generic GET request with enhanced options
   * @param endpoint API endpoint
   * @param options Request options including params, headers, retry, timeout
   * @returns Observable of response type T
   */
  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const httpParams = options?.params instanceof HttpParams ?
      options.params :
      new HttpParams({ fromObject: options?.params || {} });

    const headers = options?.headers ?
      (options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers)) :
      this.getDefaultHeaders();

    const context = this.createContext(options);
    const timeoutMs = options?.timeoutMs || this.defaultTimeout;
    const retryCount = options?.retryCount || this.defaultRetryCount;

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      params: httpParams,
      headers,
      context,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      timeout(timeoutMs),
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST request with enhanced options
   * @param endpoint API endpoint
   * @param data Payload to send
   * @param options Request options including headers, retry, timeout
   * @returns Observable of response type T
   */
  post<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    let headers = options?.headers ?
      (options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers)) :
      this.getDefaultHeaders();

    // Handle FormData - don't set Content-Type to allow browser to handle it
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const context = this.createContext(options);
    const timeoutMs = options?.timeoutMs || this.defaultTimeout;
    const retryCount = options?.retryCount || 0; // No retry for POST by default

    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers,
      context,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      timeout(timeoutMs),
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Generic PUT request with enhanced options
   * @param endpoint API endpoint
   * @param data Payload to send
   * @param options Request options including headers, retry, timeout
   * @returns Observable of response type T
   */
  put<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    let headers = options?.headers ?
      (options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers)) :
      this.getDefaultHeaders();

    // Handle FormData - don't set Content-Type to allow browser to handle it
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const context = this.createContext(options);
    const timeoutMs = options?.timeoutMs || this.defaultTimeout;
    const retryCount = options?.retryCount || 0; // No retry for PUT by default

    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers,
      context,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      timeout(timeoutMs),
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Generic PATCH request with enhanced options
   * @param endpoint API endpoint
   * @param data Payload to send
   * @param options Request options including headers, retry, timeout
   * @returns Observable of response type T
   */
  patch<T>(endpoint: string, data: any, options?: HttpOptions): Observable<T> {
    let headers = options?.headers ?
      (options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers)) :
      this.getDefaultHeaders();

    // Handle FormData - don't set Content-Type to allow browser to handle it
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const context = this.createContext(options);
    const timeoutMs = options?.timeoutMs || this.defaultTimeout;
    const retryCount = options?.retryCount || 0; // No retry for PATCH by default

    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers,
      context,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      timeout(timeoutMs),
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Generic DELETE request with enhanced options
   * @param endpoint API endpoint
   * @param options Request options including headers, retry, timeout
   * @returns Observable of response type T
   */
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const headers = options?.headers
      ? (options.headers instanceof HttpHeaders
        ? options.headers
        : new HttpHeaders(options.headers))
      : this.getDefaultHeaders();

    const context = this.createContext(options);
    const timeoutMs = options?.timeoutMs || this.defaultTimeout;
    const retryCount = options?.retryCount || 0;

    return this.http.request<T>('DELETE', `${this.apiUrl}/${endpoint}`, {
      headers,
      context,
      body: options?.body,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials,
    }).pipe(
      timeout(timeoutMs),
      retry(retryCount),
      catchError(this.handleError)
    );
  }


  /**
   * Enhanced error handling with more detailed error information
   * @param error HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
      errorCode = 'NETWORK_ERROR';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request - Invalid data provided';
          errorCode = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorMessage = 'Forbidden - You do not have permission for this action';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'Resource not found';
          errorCode = 'NOT_FOUND';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
          break;
        case 500:
          errorMessage = 'Internal server error - Please try again later';
          errorCode = 'SERVER_ERROR';
          break;
        case 503:
          errorMessage = 'Service unavailable - Please try again later';
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status} - ${error.statusText}`;
          errorCode = 'HTTP_ERROR';
      }
    }

    // Log error for debugging (only in development)
    if (!environment.production) {
      console.error('HTTP Service Error:', {
        status: error.status,
        statusText: error.statusText,
        message: errorMessage,
        error: error.error,
        url: error.url
      });
    }

    // Return enhanced error object
    return throwError(() => ({
      message: errorMessage,
      code: errorCode,
      status: error.status,
      originalError: error
    }));
  }

  /**
   * Upload file with progress tracking
   * @param endpoint API endpoint
   * @param file File to upload
   * @param additionalData Additional form data
   * @param options Request options
   * @returns Observable with upload progress
   */
  uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: { [key: string]: any },
    options?: HttpOptions
  ): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data to form
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.post<T>(endpoint, formData, {
      ...options,
      reportProgress: true
    });
  }

  /**
   * Download file as blob
   * @param endpoint API endpoint
   * @param filename Optional filename for download
   * @param options Request options
   * @returns Observable of Blob
   */
  downloadFile(endpoint: string, filename?: string, options?: HttpOptions): Observable<Blob> {
    const downloadOptions: HttpOptions = {
      ...options,
      responseType: 'blob'
    };

    return this.get<Blob>(endpoint, downloadOptions);
  }
}
