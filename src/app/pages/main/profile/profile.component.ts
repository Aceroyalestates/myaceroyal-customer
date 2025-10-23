import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ImageService } from 'src/app/core/services/image.service';
import { UsersService } from 'src/app/core/services/users.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    NzModalModule, 
    ReactiveFormsModule,
    NzSelectModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  user: any = null;
  isLoading = false;
  editModalVisible = false;

  profileForm: FormGroup;

  constructor(
    private userservice: UsersService,
    private imageService: ImageService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.userservice.getUserProfile().subscribe({
      next: (response) => {
        this.user = response.user;
        // patch form with returned values when available
        console.log({ user: this.user });
        this.profileForm.patchValue({
          full_name: this.user.full_name,
          phone_number: this.user.phone_number,
          gender: this.user.gender,
          date_of_birth: this.user.date_of_birth,
          address: this.user.address,
        });
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      }
    });
  }

 

  // trigger native file picker
  openAvatarFilePicker() {
    this.avatarInput?.nativeElement?.click();
  }

  onAvatarFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // validate file type and size (<= 1MB)
    if (!file.type.startsWith('image/')) {
      // show a user-friendly error - replace with notification service if available
      alert('Please select an image file');
      input.value = '';
      return;
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      alert('Image must be 1MB or smaller');
      input.value = '';
      return;
    }

    this.uploadAvatar(file);
  }

  uploadAvatar(file: File) {
    this.isLoading = true;
    this.imageService.uploadImage(file).subscribe({
      next: (res) => {
        // handle different response shapes: string url or { url }
        const url = res.data.file.secure_url;
        if (!url) {
          console.error('No URL returned from image upload', res);
          alert('Failed to upload image');
          this.isLoading = false;
          return;
        }

        // call API to update user avatar
        this.userservice.updateUserAvatar({ avatar: url }).subscribe({
          next: (r: any) => {
            // assume response contains updated user
            this.user = r.user ?? { ...this.user, avatar: url };
            this.isLoading = false;
            // clear file input
            if (this.avatarInput) this.avatarInput.nativeElement.value = '';
          },
          error: (err: any) => {
            console.error('Error updating avatar', err);
            alert('Failed to set avatar');
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Image upload error', err);
        alert('Image upload failed');
        this.isLoading = false;
      }
    });
  }

  openEditModal() {
    // this.patchFormWithUser();
    this.editModalVisible = true;
  }

  closeEditModal() {
    this.editModalVisible = false;
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const payload = this.profileForm.value;
    console.log({payload});
    this.isLoading = true;
    this.userservice.updateUserProfile(payload).subscribe({
      next: (res: any) => {
        // update local user
        this.user = res.user ?? { ...this.user, ...payload };
        this.isLoading = false;
        this.editModalVisible = false;
      },
      error: (err: any) => {
        console.error('Error updating profile', err);
        alert('Failed to update profile');
        this.isLoading = false;
      }
    });
  }

}
