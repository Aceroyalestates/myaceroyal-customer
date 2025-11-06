import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from 'src/app/core/services/auth.service';
import { ErrorModalService } from 'src/app/core/services/error-modal.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
	isLoading = false;
	errorMessage = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private errorModalService: ErrorModalService,
    private message: NzMessageService
	) { }

	ngOnInit(): void {
		this.initForm();
	}

	private initForm(): void {
		this.forgotPasswordForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
		});
	}

	onSubmit(): void {
		if (this.forgotPasswordForm.valid) {
			this.isLoading = true;
			this.errorMessage = '';

			const credentials = {
				email: this.forgotPasswordForm.get('email')?.value,
			};

			this.authService.forgotPassword(credentials).subscribe({
				next: (response) => {
					this.isLoading = false;
					console.log("This is the response: ", response);
						if (response.success) {
            // this.router.navigate(['/auth/login']);
            this.message.success(response.message || 'Password reset link sent to your email.');
          }
				},
				error: (error) => {
					this.isLoading = false;
					this.errorModalService.showNetworkError();
					this.errorMessage = 'Request failed. Please try again.';
					console.error('Forgot password error:', error);
          this.message.error(error?.originalError?.error?.message || 'An error occurred. Please try again.');
				},
			});
		} else {
			this.markFormGroupTouched();
		}
	}


	private markFormGroupTouched(): void {
		Object.keys(this.forgotPasswordForm.controls).forEach(key => {
			const control = this.forgotPasswordForm.get(key);
			control?.markAsTouched();
		});
	}

	hasError(controlName: string, errorType: string): boolean {
		const control = this.forgotPasswordForm.get(controlName);
		return control ? control.hasError(errorType) && control.touched : false;
	}

	getFieldError(fieldName: string): string {
		const field = this.forgotPasswordForm.get(fieldName);
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

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

}
