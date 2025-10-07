import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ILoaderState {
	isLoading: boolean;
	message?: string;
}

@Injectable({
	providedIn: 'root',
})
export class LoaderService {
	private readonly _loaderState$ = new BehaviorSubject<ILoaderState>({
		isLoading: false,
	});

	public readonly loaderState$ = this._loaderState$.asObservable();

	/**
	 * Shows the loader with an optional message
	 * @param message - Optional loading message to display
	 */
	show(message?: string): void {
		this._loaderState$.next({
			isLoading: true,
			message,
		});
	}

	/**
	 * Shows the loader for a specific duration
	 * @param duration - Duration in milliseconds
	 * @param message - Optional loading message
	 */
	showForDuration(duration: number, message?: string): void {
		this.show(message);
		setTimeout(() => {
			this.hide();
		}, duration);
	}

	/**
	 * Hides the loader
	 */
	hide(): void {
		this._loaderState$.next({
			isLoading: false,
		});
	}

	/**
	 * Gets the current loader state
	 */
	getCurrentState(): ILoaderState {
		return this._loaderState$.value;
	}
}
``