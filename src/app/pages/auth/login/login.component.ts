import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
		ReactiveFormsModule,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorModalService } from '../../../core/services/error-modal.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterLink,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
	private readonly pendingSignupKey = 'myaceroyal_pending_signup';
	loginForm!: FormGroup;
	signupForm!: FormGroup;
	verificationForm!: FormGroup;
	isLoading = false;
	isSignupLoading = false;
	isVerificationLoading = false;
	isResendingVerification = false;
	showPassword = false;
	showSignupPassword = false;
	showConfirmPassword = false;
	authMode: 'login' | 'signup' = 'login';
	signupStep: 1 | 2 | 3 = 1;
	errorMessage = '';
	signupErrorMessage = '';
	successMessage = '';
	verificationEmail = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private errorModalService: ErrorModalService
	) { }

	ngOnInit(): void {
		this.resetToLoginView();
		this.initForm();
		this.initSignupForm();
		this.initVerificationForm();
		const navigation = this.router.getCurrentNavigation();
		const stateMessage = navigation?.extras.state?.['message'];
		if (typeof stateMessage === 'string' && stateMessage.trim()) {
			this.successMessage = stateMessage;
		}
	}

	private resetToLoginView(): void {
		this.authMode = 'login';
		this.signupStep = 1;
		this.signupErrorMessage = '';
		this.errorMessage = '';
		this.verificationEmail = '';
		this.isSignupLoading = false;
		this.isVerificationLoading = false;
		this.isResendingVerification = false;
	}

	private initForm(): void {
		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
			password: ['', [Validators.required, Validators.minLength(6)]],
		});
	}

	private initSignupForm(): void {
		this.signupForm = this.fb.group(
			{
				full_name: [
					'',
					[
						Validators.required,
						Validators.pattern(/^[A-Za-z\s-]+$/),
						Validators.minLength(2),
					],
				],
				email: ['', [Validators.required, Validators.email]],
				phone_number: [
					'',
					[
						Validators.required,
						Validators.pattern(/^\+?[0-9]{10,15}$/),
					],
				],
				password: ['', [Validators.required, Validators.minLength(8)]],
				confirm_password: ['', [Validators.required]],
			},
			{ validators: this.passwordsMatchValidator() },
		);
	}

	private initVerificationForm(): void {
		this.verificationForm = this.fb.group({
			token: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
		});
	}

	private passwordsMatchValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const password = control.get('password')?.value;
			const confirmPassword = control.get('confirm_password')?.value;

			if (!password || !confirmPassword) {
				return null;
			}

			return password === confirmPassword ? null : { passwordMismatch: true };
		};
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

	onSignupSubmit(): void {
		if (this.signupForm.valid) {
			this.isSignupLoading = true;
			this.signupErrorMessage = '';
			this.successMessage = '';

			const payload = {
				full_name: this.signupForm.get('full_name')?.value.trim(),
				email: this.signupForm.get('email')?.value.trim(),
				password: this.signupForm.get('password')?.value,
				phone_number: this.signupForm.get('phone_number')?.value.trim(),
			};

			this.authService.register(payload).subscribe({
				next: (response) => {
					this.isSignupLoading = false;
					this.verificationEmail = payload.email;
					sessionStorage.setItem(
						this.pendingSignupKey,
						JSON.stringify({
							email: payload.email,
							password: payload.password,
						}),
					);
					this.successMessage =
						response.message ||
						'Registration successful. Please check your email for the 6-digit OTP to verify your account.';
					this.signupStep = 3;
					this.verificationForm.reset({
						token: '',
					});
				},
				error: (error) => {
					this.isSignupLoading = false;
					this.errorModalService.showNetworkError();
					this.signupErrorMessage =
						error?.error?.message || 'Signup failed. Please try again.';
					console.error('Signup error:', error);
				},
			});
		} else {
			this.markSignupFormTouched();
		}
	}

	onVerifySignupOtp(): void {
		if (this.verificationForm.invalid) {
			Object.values(this.verificationForm.controls).forEach((control) => {
				control.markAsTouched();
			});
			return;
		}

		this.isVerificationLoading = true;
		this.signupErrorMessage = '';
		this.successMessage = '';

		const payload = {
			email: this.verificationEmail,
			token: this.verificationForm.get('token')?.value.trim(),
		};

		this.authService.verifyEmail(payload).subscribe({
			next: (response) => {
				this.successMessage = response.message || 'Email verification successful.';
				this.autoLoginAfterVerification();
			},
			error: (error) => {
				this.isVerificationLoading = false;
				this.errorModalService.showNetworkError();
				this.signupErrorMessage =
					error?.error?.message || 'Verification failed. Please try again.';
				console.error('Verify email error:', error);
			},
		});
	}

	resendSignupVerification(): void {
		if (!this.verificationEmail) {
			this.signupErrorMessage = 'Email address is missing for verification.';
			return;
		}

		this.isResendingVerification = true;
		this.signupErrorMessage = '';

		this.authService.resendVerification({ email: this.verificationEmail }).subscribe({
			next: (response) => {
				this.isResendingVerification = false;
				this.successMessage =
					response.message || 'A new verification code has been sent to your email.';
			},
			error: (error) => {
				this.isResendingVerification = false;
				this.errorModalService.showNetworkError();
				this.signupErrorMessage =
					error?.error?.message || 'Failed to resend verification code.';
				console.error('Resend verification error:', error);
			},
		});
	}

	nextSignupStep(): void {
		const stepOneControls = ['full_name', 'email', 'phone_number'];
		const invalidStepOne = stepOneControls.some((name) =>
			this.signupForm.get(name)?.invalid,
		);

		stepOneControls.forEach((name) => {
			this.signupForm.get(name)?.markAsTouched();
		});

		if (!invalidStepOne) {
			this.signupStep = 2;
			this.signupErrorMessage = '';
		}
	}

	previousSignupStep(): void {
		if (this.signupStep > 1) {
			this.signupStep = (this.signupStep - 1) as 1 | 2 | 3;
			this.signupErrorMessage = '';
		}
	}

	restartSignupFlow(): void {
		this.signupStep = 1;
		this.signupErrorMessage = '';
		this.successMessage = '';
		this.verificationForm.reset({
			token: '',
		});
		sessionStorage.removeItem(this.pendingSignupKey);
	}

	switchAuthMode(mode: 'login' | 'signup'): void {
		this.authMode = mode;
		this.errorMessage = '';
		this.signupErrorMessage = '';
		this.successMessage = mode === 'login' ? this.successMessage : '';
		if (mode === 'signup') {
			this.signupStep = 1;
			this.successMessage = '';
		}
	}

	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	toggleSignupPasswordVisibility(): void {
		this.showSignupPassword = !this.showSignupPassword;
	}

	toggleConfirmPasswordVisibility(): void {
		this.showConfirmPassword = !this.showConfirmPassword;
	}

	private markFormGroupTouched(): void {
		Object.keys(this.loginForm.controls).forEach(key => {
			const control = this.loginForm.get(key);
			control?.markAsTouched();
		});
	}

	private markSignupFormTouched(): void {
		Object.keys(this.signupForm.controls).forEach(key => {
			const control = this.signupForm.get(key);
			control?.markAsTouched();
		});
		this.signupForm.updateValueAndValidity();
	}

	hasError(controlName: string, errorType: string): boolean {
		const control = this.loginForm.get(controlName);
		return control ? control.hasError(errorType) && control.touched : false;
	}

	hasSignupError(controlName: string, errorType: string): boolean {
		const control = this.signupForm.get(controlName);
		return control ? control.hasError(errorType) && control.touched : false;
	}

	hasPasswordMismatch(): boolean {
		return !!(
			this.signupForm.hasError('passwordMismatch') &&
			this.signupForm.get('confirm_password')?.touched
		);
	}

	hasVerificationError(errorType: string): boolean {
		const control = this.verificationForm.get('token');
		return !!(control?.hasError(errorType) && control.touched);
	}

	get passwordStrength(): {
		label: 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
		score: number;
	} {
		const password = this.signupForm?.get('password')?.value ?? '';
		let score = 0;

		if (password.length >= 8) score += 1;
		if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
		if (/\d/.test(password)) score += 1;
		if (/[^A-Za-z0-9]/.test(password)) score += 1;

		if (score <= 1) return { label: 'Weak', score };
		if (score === 2) return { label: 'Fair', score };
		if (score === 3) return { label: 'Strong', score };
		return { label: 'Very Strong', score };
	}

	get passwordStrengthWidth(): string {
		return `${Math.max(this.passwordStrength.score, 1) * 25}%`;
	}

	get passwordStrengthClass(): string {
		switch (this.passwordStrength.label) {
			case 'Weak':
				return 'password-strength-fill--weak';
			case 'Fair':
				return 'password-strength-fill--fair';
			case 'Strong':
				return 'password-strength-fill--strong';
			default:
				return 'password-strength-fill--very-strong';
		}
	}

	onVerificationTokenInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
		this.verificationForm.get('token')?.setValue(digitsOnly, { emitEvent: false });
		input.value = digitsOnly;
	}

	private autoLoginAfterVerification(): void {
		const pendingSignup = sessionStorage.getItem(this.pendingSignupKey);

		if (!pendingSignup) {
			this.isVerificationLoading = false;
			this.router.navigate(['/auth/login']);
			return;
		}

		try {
			const credentials = JSON.parse(pendingSignup) as {
				email?: string;
				password?: string;
			};

			if (!credentials.email || !credentials.password) {
				sessionStorage.removeItem(this.pendingSignupKey);
				this.isVerificationLoading = false;
				this.router.navigate(['/auth/login']);
				return;
			}

			this.authService.login({
				email: credentials.email,
				password: credentials.password,
			}).subscribe({
				next: () => {
					sessionStorage.removeItem(this.pendingSignupKey);
					this.isVerificationLoading = false;
					this.router.navigate(['/main/explore']);
				},
				error: (loginError) => {
					console.error('Auto-login after verification failed:', loginError);
					sessionStorage.removeItem(this.pendingSignupKey);
					this.isVerificationLoading = false;
					this.router.navigate(['/auth/login'], {
						state: {
							message: 'Email verified successfully. Please log in to continue.',
						},
					});
				},
			});
		} catch {
			sessionStorage.removeItem(this.pendingSignupKey);
			this.isVerificationLoading = false;
			this.router.navigate(['/auth/login']);
		}
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
