import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorModalService, IErrorModalData } from '../../../core/services/error-modal.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-error-modal',
	templateUrl: './error-modal.component.html',
	styleUrls: ['./error-modal.component.css'],
	standalone: true,
	imports: [CommonModule],
})
export class ErrorModalComponent implements OnInit, OnDestroy {
	modalData: IErrorModalData = {
		isVisible: false,
		title: '',
		message: '',
		errorCode: '',
		showRetry: false,
	};

	private subscription: Subscription = new Subscription();

	constructor(private errorModalService: ErrorModalService) {}

	ngOnInit(): void {
		this.subscription = this.errorModalService.errorModalState$.subscribe(
			(state) => {
				this.modalData = { ...state };
			},
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	closeModal(): void {
		this.errorModalService.hideError();
	}

	retry(): void {
		// Emit retry event or handle retry logic
		this.closeModal();
		// You can add retry logic here or emit an event
	}
}
