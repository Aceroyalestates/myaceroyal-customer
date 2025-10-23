import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from 'src/app/core/services/auth.service';
import { UsersService } from 'src/app/core/services/users.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-password',
  imports: [
    SharedModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    CommonModule
  ],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})
export class PasswordComponent {

  isLoading = false;
  passwordForm: FormGroup;

  // controls to toggle visibility of password inputs
  showOld = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private notificationService: NzNotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    })
  }

  toggleShow(field: 'old' | 'new' | 'confirm') {
    if (field === 'old') this.showOld = !this.showOld;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }

  submit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { new_password, confirm_password } = this.passwordForm.value;
    if (new_password !== confirm_password) {
      this.passwordForm.get('confirm_password')?.setErrors({ mismatch: true });
      this.notificationService.error('', 'New password and confirmation do not match');
      return;
    }

    this.isLoading = true;
    const payload = {
      old_password: this.passwordForm.value.old_password,
      new_password: this.passwordForm.value.new_password
    };

    this.userService.changeUserPassword(payload).subscribe({
      next: (response: any) => {
        this.notificationService.success('', response?.message || 'Password changed successfully');
        this.isLoading = false;
        this.authService.logout();
        // optionally navigate to login if desired:
        // this.router.navigateByUrl('auth/login');
      },
      error: (error: any) => {
        console.error(error);
        this.isLoading = false;
        const msg = error?.error?.message ?? 'Error occurred';
        this.notificationService.error('', msg);
      }
    })
  }

}
