import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ErrorModalService } from 'src/app/core/services/error-modal.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  showPassword = false;
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
        this.resetPasswordForm.patchValue({ email: this.email });
      }
    });
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.resetPasswordForm.get('email')?.value.trim(),
      token: this.resetPasswordForm.get('token')?.value.trim(),
      password: this.resetPasswordForm.get('password')?.value,
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          response.message || 'Password reset successful. You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1200);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorModalService.showNetworkError();
        this.errorMessage =
          error?.error?.message || 'Reset password failed. Please try again.';
        console.error('Reset password error:', error);
      },
    });
  }

  onTokenInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
    this.resetPasswordForm.get('token')?.setValue(digitsOnly, { emitEvent: false });
    input.value = digitsOnly;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return !!(control?.hasError(errorType) && control.touched);
  }

  private markFormTouched(): void {
    Object.values(this.resetPasswordForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  toggleTheme(): void {
    this.theme = this.themeService.toggleTheme();
  }
}
