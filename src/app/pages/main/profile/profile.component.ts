import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NIGERIA_STATE_LGAS, NIGERIA_STATES } from 'src/app/core/constants/nigeria-state-lgas';
import { UpdateUserRequest, User } from 'src/app/core/models/users';
import { AuthService } from 'src/app/core/services/auth.service';
import { ImageService } from 'src/app/core/services/image.service';
import { UsersService } from 'src/app/core/services/users.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  readonly defaultAvatar = 'https://cdn.vectorstock.com/i/1000v/51/05/male-profile-avatar-with-brown-hair-vector-12055105.jpg';
  readonly nationalityOptions = ['Nigerian', 'Non Nigerian'];
  readonly genderOptions = ['male', 'female', 'other'];
  readonly states = NIGERIA_STATES;

  user: User | null = null;
  isProfileLoading = false;
  isSavingProfile = false;
  isAvatarLoading = false;
  editModalVisible = false;
  availableLgas: string[] = [];

  profileForm: FormGroup;

  constructor(
    private readonly userService: UsersService,
    private readonly imageService: ImageService,
    private readonly fb: FormBuilder,
    private readonly notification: NzNotificationService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
      gender: [''],
      date_of_birth: [''],
      nationality: [''],
      state: [''],
      local_government: [''],
      address: [''],
      bank_verification_number: ['', [Validators.pattern(/^\d{11}$/)]],
      national_identity_number: ['', [Validators.pattern(/^\d{11}$/)]],
      referral_code: [''],
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.profileForm.get('state')?.valueChanges.subscribe((state) => {
      this.availableLgas = state ? (NIGERIA_STATE_LGAS[state] ?? []) : [];
      const currentLga = this.profileForm.get('local_government')?.value;
      if (currentLga && !this.availableLgas.includes(currentLga)) {
        this.profileForm.patchValue({ local_government: '' }, { emitEvent: false });
      }
    });
  }

  get avatarUrl(): string {
    return this.user?.avatar || this.defaultAvatar;
  }

  get canDeleteAvatar(): boolean {
    return !!this.user?.avatar && !this.isAvatarLoading;
  }

  getUser(): void {
    this.isProfileLoading = true;
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.user = response.user;
        this.patchFormWithUser();
        this.isProfileLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.notification.error('', 'Failed to load your profile.');
        this.isProfileLoading = false;
      },
    });
  }

  patchFormWithUser(): void {
    if (!this.user) {
      return;
    }

    this.availableLgas = this.user.state ? (NIGERIA_STATE_LGAS[this.user.state] ?? []) : [];

    this.profileForm.patchValue(
      {
        full_name: this.user.full_name ?? '',
        phone_number: this.user.phone_number ?? '',
        gender: this.user.gender ?? '',
        date_of_birth: this.user.date_of_birth ?? '',
        nationality: this.user.nationality ?? '',
        state: this.user.state ?? '',
        local_government: this.user.local_government ?? '',
        address: this.user.address ?? '',
        bank_verification_number: this.user.bank_verification_number ?? '',
        national_identity_number: this.user.national_identity_number ?? '',
        referral_code: this.user.referral_code ?? '',
      },
      { emitEvent: false },
    );
  }

  openAvatarFilePicker(): void {
    this.avatarInput?.nativeElement?.click();
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.notification.error('', 'Please select a valid image file.');
      input.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.notification.error('', 'Profile picture must be 2MB or smaller.');
      input.value = '';
      return;
    }

    this.uploadAvatar(file);
  }

  uploadAvatar(file: File): void {
    this.isAvatarLoading = true;
    this.imageService.uploadImage(file).subscribe({
      next: (response) => {
        const url = response?.data?.file?.secure_url;
        if (!url) {
          this.notification.error('', 'Image upload failed.');
          this.isAvatarLoading = false;
          return;
        }

        this.userService.updateUserAvatar({ avatar: url }).subscribe({
          next: (res) => {
            this.user = res.user ?? (this.user ? { ...this.user, avatar: url } : null);
            if (this.user) {
              this.authService.setUser(this.user as any);
            }
            this.notification.success('', 'Profile picture updated.');
            this.isAvatarLoading = false;
            if (this.avatarInput) {
              this.avatarInput.nativeElement.value = '';
            }
          },
          error: (error) => {
            console.error('Error updating avatar:', error);
            this.notification.error('', 'Failed to update profile picture.');
            this.isAvatarLoading = false;
          },
        });
      },
      error: (error) => {
        console.error('Image upload error:', error);
        this.notification.error('', 'Image upload failed.');
        this.isAvatarLoading = false;
      },
    });
  }

  deleteAvatar(): void {
    this.isAvatarLoading = true;
    this.userService.deleteUserAvatar().subscribe({
      next: (response) => {
        this.user = response.user ?? (this.user ? { ...this.user, avatar: null } : null);
        if (this.user) {
          this.authService.setUser(this.user as any);
        }
        this.notification.success('', 'Profile picture removed.');
        this.isAvatarLoading = false;
      },
      error: (error) => {
        console.error('Error deleting avatar:', error);
        this.notification.error('', 'Failed to remove profile picture.');
        this.isAvatarLoading = false;
      },
    });
  }

  openEditModal(): void {
    this.patchFormWithUser();
    this.editModalVisible = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal(): void {
    this.editModalVisible = false;
    document.body.style.overflow = '';
  }

  goToPassword(): void {
    this.router.navigate(['/main/password']);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const payload: UpdateUserRequest = {
      full_name: raw.full_name?.trim(),
      phone_number: raw.phone_number?.trim(),
      gender: raw.gender || undefined,
      date_of_birth: raw.date_of_birth || undefined,
      nationality: raw.nationality || undefined,
      state: raw.state || undefined,
      local_government: raw.local_government || undefined,
      address: raw.address?.trim() || undefined,
      bank_verification_number: raw.bank_verification_number?.trim() || undefined,
      national_identity_number: raw.national_identity_number?.trim() || undefined,
      referral_code: raw.referral_code?.trim() || undefined,
    };

    if (payload.nationality !== 'Nigerian') {
      payload.state = undefined;
      payload.local_government = undefined;
    }

    this.isSavingProfile = true;
    this.userService.updateUserProfile(payload).subscribe({
      next: (res) => {
        this.user = res.user ?? (this.user ? { ...this.user, ...payload } as User : null);
        if (this.user) {
          this.authService.setUser(this.user as any);
        }
        this.notification.success('', res.message || 'Profile updated successfully.');
        this.isSavingProfile = false;
        this.editModalVisible = false;
        document.body.style.overflow = '';
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notification.error('', error?.error?.message || 'Failed to update profile.');
        this.isSavingProfile = false;
      },
    });
  }

  displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : 'N/A';
  }
}
