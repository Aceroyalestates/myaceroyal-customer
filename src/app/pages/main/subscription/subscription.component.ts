import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PaymentService } from 'src/app/core/services/payment.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ImageService } from 'src/app/core/services/image.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ImageUploadApiResponse } from 'src/app/core/models/images';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NzFormModule, 
    NzInputModule, 
    NzSelectModule, 
    NzButtonModule, 
    NzStepsModule, 
    NzDatePickerModule, 
    NzCheckboxModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzUploadModule,
  ],
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent implements OnInit {
  step = 0;
  isSubmitting = false;
  isLoading = false;

  form!: FormGroup;
  selectedFile: File | null = null;

  titles = [
    'Personal Details',
    'Next Of Kin',
    'Employment Details',
    'Payment Details',
    'Realtor\'s Details',
    'Permissions',
    'Terms & Condition',
    'Summary'
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private notification: NzNotificationService,
    private imageService: ImageService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    // build nested FormGroups for per-step validation
    this.form = this.fb.group({
      personal: this.fb.group({
        title: ['', Validators.required],
        first_name: ['', Validators.required],
        middle_name: [''],
        last_name: ['', Validators.required],
        date_of_birth: [null, Validators.required],
        gender: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        alternate_phone: [''],
        nationality: ['', Validators.required],
        address_line_1: ['', Validators.required],
        address_line_2: [''],
        marital_status: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postal_code: ['', Validators.required],
        country: ['', Validators.required],
        passport_photo_url: [''],
        identity_type: ['', Validators.required],
        identity_number: ['', Validators.required],
        identity_upload_url: ['']
      }),

      next_of_kin: this.fb.group({
        next_of_kin_name: ['', Validators.required],
        next_of_kin_phone: ['', Validators.required],
        next_of_kin_address: ['', Validators.required],
        next_of_kin_relationship: ['', Validators.required],
        emergency_contact_name: ['', Validators.required],
        emergency_contact_relationship: ['', Validators.required],
        emergency_contact_phone: ['', Validators.required]
      }),

      employment: this.fb.group({
        employer_name: ['', Validators.required],
        occupation: ['', Validators.required],
        employer_address: ['', Validators.required],
        monthly_income: ['', Validators.required],
        proof_of_income_url: ['']
      }),

      payment: this.fb.group({
        property_id: ['', Validators.required],
        units: ['', Validators.required],
        payment_plan: ['', Validators.required],
        special_requirements: [''],
        date_of_payment: [null],
        source_of_fund: [''],
        bank_statement_url: ['']
      }),

      others: this.fb.group({
        how_did_you_hear: [''],
        referral_source: ['']
      }),

      permissions: this.fb.group({
        realtor_consent: [false],
        marketing_consent: [false]
      }),

      terms: this.fb.group({
        accept_declaration: [false, Validators.requiredTrue],
        accepted_privacy_policy: [false, Validators.requiredTrue]
      })
    });
  }

  private stepGroupName(index: number) {
    switch (index) {
      case 0:
        return 'personal';
      case 1:
        return 'next_of_kin';
      case 2:
        return 'employment';
      case 3:
        return 'payment';
      case 4:
        return 'others';
      case 5:
        return 'permissions';
      case 6:
        return 'terms';
      case 7:
        return null; // summary
      default:
        return null;
    }
  }

  private validateCurrentStep(): boolean {
    const groupName = this.stepGroupName(this.step);
    console.log({ groupName });
    if (!groupName) return true;
    const group = this.form.get(groupName) as FormGroup;
    console.log({ group });
    if (!group) return true;
    group.markAllAsTouched();
    group.updateValueAndValidity();
    return group.valid;
  }

  // helper to get a control from a named child FormGroup
  getCtrl(groupName: string, controlName: string) {
    const g = this.form.get(groupName) as FormGroup;
    return g ? g.get(controlName) : null;
  }

  // helper to map common validation errors to messages
  getError(groupName: string, controlName: string): string | null {
    const ctrl = this.getCtrl(groupName, controlName);
    if (!ctrl || !ctrl.errors) return null;
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['email']) return 'Please enter a valid email address';
    if (ctrl.errors['requiredTrue']) return 'You must accept this';
    return null;
  }

  next() {
    // validate only the current step group
    if (!this.validateCurrentStep()) return;
    if (this.step < this.titles.length - 1) this.step++;
  }

  prev() {
    if (this.step > 0) this.step--;
  }

  validateControls(list: string[]) {
    let ok = true;
    list.forEach((c) => {
      const control = this.form.get(c);
      control?.markAsDirty();
      control?.updateValueAndValidity();
      if (control?.invalid) ok = false;
    });
    return ok;
  }

  submit() {
    if (this.form.invalid) {
      this.notification.error('Form incomplete', 'Please complete required fields');
      return;
    }

    this.isSubmitting = true;
    // flatten nested groups into a single payload object
    const fv = this.form.value as any;
    const payload = {
      ...(fv.personal || {}),
      ...(fv.next_of_kin || {}),
      ...(fv.employment || {}),
      ...(fv.payment || {}),
      ...(fv.others || {}),
      ...(fv.permissions || {}),
      ...(fv.terms || {})
    };
    this.paymentService.submitPurchaseForm(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.notification.success('Success', 'Purchase form submitted');
        this.step = this.titles.length - 1;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.notification.error('Error', 'Failed to submit form');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type;

      // Define allowed file types
      const isImage = fileType.startsWith('image/');
      // const isPdf = fileType === 'application/pdf';

      // Validation 1: Check file type
      if (!isImage) {
        this.message.error('Invalid file type. Please select an Image (JPEG/PNG).');
        input.value = ''; // Clear the input
        this.selectedFile = null;
        return;
      }

      // Validation 2: Check file size (e.g., max 1MB for both)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
          this.message.error('File size exceeds the limit (1MB max).');
          input.value = '';
          this.selectedFile = null;
          return;
      }
      
      // File is valid
      this.selectedFile = file;
      // this.message.success(`File selected: ${file.name}`);
      this.upload();
      
      // Proceed with upload or other processing...
    } else {
      this.selectedFile = null;
      this.message.info('No file selected.');
    }
  }

  upload(): string | void {
      if (!this.selectedFile) {
        this.message.error('Please select a file to upload as proof of payment.');
        return;
      }
      this.isLoading = true;
  
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (uploadRes: ImageUploadApiResponse) => {
          console.log('Image uploaded successfully:', uploadRes);
          const url = uploadRes.data.file.secure_url;
          if (!url) {
            this.message.error('Failed to get uploaded image URL.');
            this.isLoading = false;
            return;
          }
          this.message.success('Proof of payment uploaded successfully.');
          this.isLoading = false;
          return url;
          
        },
        error: (err: any) => {
          console.error('Image upload error', err);
          this.message.error('Image upload failed');
          this.isLoading = false;
        }
      });
    }
}
