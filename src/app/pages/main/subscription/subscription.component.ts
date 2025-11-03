import { CommonModule, Location } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';
import { differenceInCalendarDays } from 'date-fns';
import { NationalityService } from 'src/app/core/services/nationality.service';

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
//http://localhost:4200/main/subscription/2f37b1e8-00ac-46a4-a769-2c4fccf144f8
  form!: FormGroup;
  selectedFile: File | null = null;
  purchaseId: string | null = null;
  purchaseFormData: any = null;
  nationalities: any[] = [{id: 1, name: 'Nigeria'}];
  states: any[] = [];

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

  today = new Date();

    disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, this.today) > 0;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private notification: NzNotificationService,
    private imageService: ImageService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private location: Location,
    private nationalityService: NationalityService
  ) {}

  ngOnInit(): void {
    this.purchaseId = this.route.snapshot.paramMap.get('id');

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

    // load server data after form exists
    this.getPurchaseForm();

    // this.getNationalityList();
  }

  back() {
    this.location.back();
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
    console.log('valid: ', this.validateCurrentStep());
    if (!this.validateCurrentStep()) return;
    if (this.step < this.titles.length - 1) {
      const groupName = this.stepGroupName(this.step);
      console.log({ groupName });
      // if we have a named group and a purchaseId, save this step to the backend first
      if (groupName && this.purchaseId) {
        const group = this.form.get(groupName) as FormGroup;
        const payload = { ...(group?.value || {}) };
        console.log({ payload });
        this.isLoading = true;
        this.paymentService.updatePurchaseForm(this.purchaseFormData.id, payload).subscribe({
          next: () => {
            this.isLoading = false;
            this.message.success('Step saved');
            this.step++;
          },
          error: (err: any) => {
            this.isLoading = false;
            console.error('Failed to save step', err);
            this.message.error('Failed to save step. Please try again.');
          }
        });
      } else {
        // no purchase id or no group to save, just advance
        this.step++;
      }
    }
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

  // Dynamically set a nested FormControl by providing the child group name and control name
  setFormControlValue(groupName: string, controlName: string, value: any): void {
    const g = this.form.get(groupName) as FormGroup;
    if (!g) {
      const ctrl = this.form.get([...(groupName ? [groupName] : []), controlName].filter(Boolean) as any);
      if (ctrl) {
        ctrl.setValue(value);
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity();
      }
      return;
    }

    const ctrl = g.get(controlName);
    if (!ctrl) return;
    ctrl.setValue(value);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity();
  }

  setFormValueByPath(path: string, value: any): void {
    if (!path) return;
    const parts = path.split('.');
    const ctrl = this.form.get(parts as any);
    if (!ctrl) return;
    ctrl.setValue(value);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type;
      const isImage = fileType.startsWith('image/');
      if (!isImage) {
        this.message.error('Invalid file type. Please select an Image (JPEG/PNG).');
        input.value = '';
        this.selectedFile = null;
        return;
      }

      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        this.message.error('File size exceeds the limit (1MB max).');
        input.value = '';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.upload();
    } else {
      this.selectedFile = null;
      this.message.info('No file selected.');
    }
  }

  upload(): void {
    if (!this.selectedFile) {
      this.message.error('Please select a file to upload as proof of payment.');
      return;
    }
    this.isLoading = true;

    const loadingRef = this.message.loading('Uploading...', { nzDuration: 0 });
    const loadingId = String((loadingRef as any).messageId);

    this.imageService.uploadImage(this.selectedFile).subscribe({
      next: (uploadRes: ImageUploadApiResponse) => {
        const url = uploadRes?.data?.file?.secure_url;
        if (!url) {
          this.message.error('Failed to get uploaded image URL.');
          if (loadingId) this.message.remove(loadingId as string);
          this.isLoading = false;
          return;
        }

        // set uploaded URL into payment.bank_statement_url dynamically
        this.setFormControlValue('payment', 'bank_statement_url', url);

        if (loadingId) this.message.remove(loadingId as string);
        this.message.success('Proof of payment uploaded successfully.');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Image upload error', err);
        if (loadingId) this.message.remove(loadingId as string);
        this.message.error('Image upload failed');
        this.isLoading = false;
      }
    });
  }

  getPurchaseForm() {
    if (!this.purchaseId) {
      this.message.error('No purchase ID provided.');
      return;
    }
    this.isLoading = true;

    this.paymentService.getPurchaseFormByPurchaseId(this.purchaseId).subscribe({
      next: (res: any) => {
        this.purchaseFormData = res.data;
        this.isLoading = false;

        const d = this.purchaseFormData || {};

        this.form.patchValue({
          personal: {
            title: d.title ?? '',
            first_name: d.first_name ?? '',
            middle_name: d.middle_name ?? '',
            last_name: d.last_name ?? '',
            date_of_birth: d.date_of_birth ? new Date(d.date_of_birth) : null,
            gender: d.gender ?? '',
            email: d.email ?? '',
            phone: d.phone ?? '',
            alternate_phone: d.alternate_phone ?? '',
            nationality: d.nationality ?? '',
            address_line_1: d.address_line_1 ?? '',
            address_line_2: d.address_line_2 ?? '',
            marital_status: d.marital_status ?? '',
            city: d.city ?? '',
            state: d.state ?? '',
            postal_code: d.postal_code ?? '',
            country: d.country ?? '',
            passport_photo_url: d.passport_photo_url ?? d.avatar ?? '',
            identity_type: d.means_of_identity ?? '',
            identity_number: d.identity_number ?? '',
            identity_upload_url: d.identity_upload_url ?? ''
          },

          next_of_kin: {
            next_of_kin_name: d.nok_first_name ?? '',
            next_of_kin_phone: d.nok_phone ?? '',
            next_of_kin_address: d.nok_address ?? '',
            next_of_kin_relationship: d.nok_relationship ?? '',
            emergency_contact_name: d.nok_first_name ?? '',
            emergency_contact_relationship: d.nok_relationship ?? '',
            emergency_contact_phone: d.nok_phone ?? ''
          },

          employment: {
            employer_name: d.employer_name ?? '',
            occupation: d.employer_designation ?? d.occupation ?? '',
            employer_address: d.employer_address ?? '',
            monthly_income: d.monthly_income ?? d.amount_paid ?? '',
            proof_of_income_url: d.proof_of_income_url ?? ''
          },

          payment: {
            property_id: d.purchase?.unit?.property?.name ?? d.property_id ?? '',
            units: d.purchase?.quantity ?? d.quantity ?? '',
            payment_plan: d.purchase?.payment_method ?? d.payment_plan ?? '',
            special_requirements: d.special_requirements ?? '',
            date_of_payment: d.payment_date ? new Date(d.payment_date) : null,
            source_of_fund: d.source_of_funds ?? d.source_of_fund ?? '',
            bank_statement_url: d.payment_receipt_url ?? ''
          },

          others: {
            how_did_you_hear: d.how_did_you_hear ?? '',
            referral_source: d.realtor_name ?? d.realtor_email ?? ''
          },

          permissions: {
            realtor_consent: !!d.realtor_consent,
            marketing_consent: !!d.marketing_consent
          },

          terms: {
            accept_declaration: !!d.accepted_terms,
            accepted_privacy_policy: !!d.accepted_privacy_policy
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(err);
        this.message.error('Failed to load purchase form');
      }
    });
  }

  updatePurchaseForm(payload: any) {
    if (!this.purchaseId) {
      this.message.error('No purchase ID provided.');
      return;
    }
    this.isLoading = true;

    this.paymentService.updatePurchaseForm(this.purchaseId, payload).subscribe({
      next: (res: any) => {
        this.message.success('Purchase form updated successfully.');
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(err);
        this.message.error('Failed to update purchase form');
      }
    });
  }

  getNationalityList() {
    this.nationalityService.getNationalities().subscribe({
      next: (res: any) => {
        this.nationalities = res.data || [];
      },
      error: (err: any) => {
        console.error('Failed to load nationalities', err);
      }
    });
  }

  getStatesByNationalityId(nationalityId: string) {
    this.nationalityService.getStatesByNationalityId(nationalityId).subscribe({
      next: (res: any) => {
        console.log({ statesRes: res });
        this.states = res.data.states || [];
      },
      error: (err: any) => {
        console.error('Failed to load states', err);
      }
    });
  }

  selectedNation(value: any): void {
    console.log({value});
    this.getStatesByNationalityId(value);
  }

}
