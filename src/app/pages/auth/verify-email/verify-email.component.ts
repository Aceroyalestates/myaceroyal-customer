import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ErrorModalService } from 'src/app/core/services/error-modal.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  private readonly pendingSignupKey = 'myaceroyal_pending_signup';
  verifyForm!: FormGroup;
  isLoading = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  theme: 'light' | 'dark' = 'light';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private errorModalService: ErrorModalService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.theme = this.themeService.getTheme();
    this.initForm();
    const navigation = this.router.getCurrentNavigation();
    const stateMessage = navigation?.extras.state?.['message'];
    if (typeof stateMessage === 'string' && stateMessage.trim()) {
      this.successMessage = stateMessage;
    }
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email') ?? '';
      if (this.email) {
        this.verifyForm.patchValue({ email: this.email });
      }
    });
  }

  private initForm(): void {
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.markFormTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email: this.verifyForm.get('email')?.value.trim(),
      token: this.verifyForm.get('token')?.value.trim(),
    };

    this.authService.verifyEmail(payload).subscribe({
      next: (response) => {
        this.successMessage =
          response.message || 'Email verification successful.';

        const pendingSignup = sessionStorage.getItem(this.pendingSignupKey);
        if (!pendingSignup) {
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1200);
          return;
        }

        try {
          const credentials = JSON.parse(pendingSignup) as {
            email?: string;
            password?: string;
          };

          if (!credentials.email || !credentials.password) {
            sessionStorage.removeItem(this.pendingSignupKey);
            this.isLoading = false;
            this.router.navigate(['/auth/login']);
            return;
          }

          this.authService.login({
            email: credentials.email,
            password: credentials.password,
          }).subscribe({
            next: () => {
              sessionStorage.removeItem(this.pendingSignupKey);
              this.isLoading = false;
              this.router.navigate(['/main/explore']);
            },
            error: (loginError) => {
              console.error('Auto-login after verification failed:', loginError);
              sessionStorage.removeItem(this.pendingSignupKey);
              this.isLoading = false;
              this.router.navigate(['/auth/login'], {
                state: {
                  message:
                    'Email verified successfully. Please log in to continue.',
                },
              });
            },
          });
        } catch {
          sessionStorage.removeItem(this.pendingSignupKey);
          this.isLoading = false;
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorModalService.showNetworkError();
        this.errorMessage =
          error?.error?.message || 'Verification failed. Please try again.';
        console.error('Verify email error:', error);
      },
    });
  }

  resendCode(): void {
    const email = this.verifyForm.get('email')?.value?.trim();
    if (!email) {
      this.errorMessage = 'Enter your email before requesting a new code.';
      return;
    }

    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendVerification({ email }).subscribe({
      next: (response) => {
        this.isResending = false;
        this.successMessage =
          response.message || 'A new verification code has been sent to your email.';
      },
      error: (error) => {
        this.isResending = false;
        this.errorModalService.showNetworkError();
        this.errorMessage =
          error?.error?.message || 'Failed to resend verification code.';
        console.error('Resend verification error:', error);
      },
    });
  }

  private markFormTouched(): void {
    Object.values(this.verifyForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.verifyForm.get(controlName);
    return !!(control?.hasError(errorType) && control.touched);
  }

  onTokenInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
    this.verifyForm.get('token')?.setValue(digitsOnly, { emitEvent: false });
    input.value = digitsOnly;
  }

  toggleTheme(): void {
    this.theme = this.themeService.toggleTheme();
  }
}
