import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';
import { ErrorModalService } from '../../../core/services/error-modal.service';

@Component({
	selector: 'app-loader-demo',
	templateUrl: './loader-demo.component.html',
	styleUrls: ['./loader-demo.component.css'],
	standalone: true,
	imports: [CommonModule],
})
export class LoaderDemoComponent {
	constructor(
		private loaderService: LoaderService,
		private errorModalService: ErrorModalService,
	) {}

	/**
	 * Shows a loader for 3 seconds
	 */
	showLoader(): void {
		this.loaderService.showForDuration(3000, 'Loading demo content...');
	}

	/**
	 * Shows a custom loader message
	 */
	showCustomLoader(): void {
		this.loaderService.show('Processing your request...');
		setTimeout(() => {
			this.loaderService.hide();
		}, 2000);
	}

	/**
	 * Shows a network error
	 */
	showNetworkError(): void {
		this.errorModalService.showNetworkError();
	}

	/**
	 * Shows a server error
	 */
	showServerError(): void {
		this.errorModalService.showServerError(500, 'Internal server error occurred');
	}

	/**
	 * Shows an authentication error
	 */
	showAuthError(): void {
		this.errorModalService.showAuthError('Invalid credentials provided');
	}

	/**
	 * Shows a custom error
	 */
	showCustomError(): void {
		this.errorModalService.showError(
			'Custom Error',
			'This is a custom error message with retry option',
			'CUSTOM_ERROR',
			true,
		);
	}
}
