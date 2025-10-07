import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.css'],
	standalone: true,
	imports: [CommonModule],
})
export class LoaderComponent implements OnInit, OnDestroy {
	isLoading = false;
	message = '';
	private subscription: Subscription = new Subscription();

	constructor(private loaderService: LoaderService) {}

	ngOnInit(): void {
		this.subscription = this.loaderService.loaderState$.subscribe(
			(state) => {
				this.isLoading = state.isLoading;
				this.message = state.message || '';
			},
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
