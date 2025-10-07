import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IErrorModalData {
	isVisible: boolean;
	title: string;
	message: string;
	errorCode?: string;
	showRetry?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class ErrorModalService {
	private readonly _errorModalState$ = new BehaviorSubject<IErrorModalData>({
		isVisible: false,
		title: '',
		message: '',
		errorCode: '',
		showRetry: false,
	});

	public readonly errorModalState$ = this._errorModalState$.asObservable();

	/**
	 * Shows an error modal with the specified details
	 * @param title - Error modal title
	 * @param message - Error message to display
	 * @param errorCode - Optional error code
	 * @param showRetry - Whether to show retry button
	 */
	showError(
		title: string,
		message: string,
		errorCode?: string,
		showRetry: boolean = false,
	): void {
		this._errorModalState$.next({
			isVisible: true,
			title,
			message,
			errorCode,
			showRetry,
		});
	}

	/**
	 * Shows a network error modal
	 * @param message - Custom error message
	 */
	showNetworkError(message?: string): void {
		this.showError(
			'Network Error',
			message || 'Unable to connect to the server. Please check your internet connection and try again.',
			'NETWORK_ERROR',
			true,
		);
	}

	/**
	 * Shows a server error modal
	 * @param statusCode - HTTP status code
	 * @param message - Custom error message
	 */
	showServerError(statusCode: number, message?: string): void {
		const defaultMessage = `Server error occurred (${statusCode}). Please try again later or contact support if the problem persists.`;
		this.showError(
			'Server Error',
			message || defaultMessage,
			`HTTP_${statusCode}`,
			true,
		);
	}

	/**
	 * Shows an authentication error modal
	 * @param message - Custom error message
	 */
	showAuthError(message?: string): void {
		this.showError(
			'Authentication Error',
			message || 'Your session has expired. Please log in again.',
			'AUTH_ERROR',
			false,
		);
	}

	/**
	 * Hides the error modal
	 */
	hideError(): void {
		this._errorModalState$.next({
			isVisible: false,
			title: '',
			message: '',
			errorCode: '',
			showRetry: false,
		});
	}

	/**
	 * Gets the current error modal state
	 */
	getCurrentState(): IErrorModalData {
		return this._errorModalState$.value;
	}
}
