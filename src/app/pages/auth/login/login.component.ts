import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ErrorModalService } from '../../../core/services/error-modal.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
	loginForm!: FormGroup;
	isLoading = false;
	showPassword = false;
	errorMessage = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private errorModalService: ErrorModalService
	) { }

	ngOnInit(): void {
		this.initForm();
	}

	private initForm(): void {
		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
			password: ['', [Validators.required, Validators.minLength(6)]],
		});
	}

	onSubmit(): void {
		if (this.loginForm.valid) {
			this.isLoading = true;
			this.errorMessage = '';

			const credentials = {
				email: this.loginForm.get('email')?.value,
				password: this.loginForm.get('password')?.value,
			};

			this.authService.login(credentials).subscribe({
				next: (response) => {
					this.isLoading = false;
					console.log("This is the response: ", response);
					// if (response.can_access) {
						this.authService.setToken(response.token);
						this.authService.setUser(response.user);
						// Navigate to main dashboard on successful login
						this.router.navigate(['/main/explore']);
					// }
				},
				error: (error) => {
					this.isLoading = false;
					this.errorModalService.showNetworkError();
					this.errorMessage = 'Login failed. Please try again.';
					console.error('Login error:', error);
				},
			});
		} else {
			this.markFormGroupTouched();
		}
	}

	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	private markFormGroupTouched(): void {
		Object.keys(this.loginForm.controls).forEach(key => {
			const control = this.loginForm.get(key);
			control?.markAsTouched();
		});
	}

	hasError(controlName: string, errorType: string): boolean {
		const control = this.loginForm.get(controlName);
		return control ? control.hasError(errorType) && control.touched : false;
	}

	getFieldError(fieldName: string): string {
		const field = this.loginForm.get(fieldName);
		if (field?.invalid && field?.touched) {
			if (field.errors?.['required']) {
				return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
			}
			if (field.errors?.['minlength']) {
				const requiredLength = field.errors['minlength'].requiredLength;
				return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
			}
		}
		return '';
	}

	onForgotPassword(): void {
		// TODO: Implement forgot password functionality
		console.log('Forgot password clicked');
	}
}

