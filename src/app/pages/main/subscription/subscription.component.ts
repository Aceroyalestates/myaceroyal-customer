import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap, tap } from 'rxjs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { COUNTRIES } from 'src/app/core/constants/countries';
import { NIGERIA_STATES } from 'src/app/core/constants/nigeria-state-lgas';
import { ImageUploadApiResponse } from 'src/app/core/models/images';
import { PurchaseFormPayload } from 'src/app/core/models/payment';
import { ImageService } from 'src/app/core/services/image.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzStepsModule,
    NzDatePickerModule,
    NzCheckboxModule
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  step = 0;
  isSubmitting = false;
  isLoading = false;
  isMobileView = false;
  purchaseId: string | null = null;
  purchaseFormData: any = null;
  purchaseContext: any = null;
  form!: FormGroup;
  readonly countries = [...COUNTRIES];
  readonly nigeriaStates = [...NIGERIA_STATES];

  readonly titles = [
    'Personal Details',
    'Address',
    'Employment',
    'Next Of Kin',
    'Identity Documents',
    'Preferences',
    'Permissions',
    'Summary'
  ];

  readonly titleOptions = ['Mr', 'Mrs', 'Ms', 'Dr'];
  readonly genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  readonly maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];
  readonly identityTypeOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    { value: 'driver_license', label: 'Driver License' },
    { value: 'voter_card', label: 'Voter Card' },
    { value: 'other', label: 'Other' }
  ];
  readonly hearAboutOptions = [
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'website', label: 'Website' },
    { value: 'realtor', label: 'Realtor' },
    { value: 'other', label: 'Other' }
  ];

  private readonly groupFieldMap: Record<string, Array<keyof PurchaseFormPayload>> = {
    personal: [
      'title',
      'first_name',
      'middle_name',
      'last_name',
      'date_of_birth',
      'gender',
      'marital_status',
      'nationality',
      'email',
      'phone',
      'alternate_phone'
    ],
    address: [
      'address_line_1',
      'address_line_2',
      'city',
      'state',
      'postal_code',
      'country'
    ],
    employment: [
      'occupation',
      'employer_name',
      'employer_address',
      'monthly_income',
      'proof_of_income_url',
      'bank_statement_url'
    ],
    next_of_kin: [
      'emergency_contact_name',
      'emergency_contact_relationship',
      'emergency_contact_phone',
      'next_of_kin_name',
      'next_of_kin_relationship',
      'next_of_kin_phone',
      'next_of_kin_address'
    ],
    identity: [
      'identity_type',
      'identity_number',
      'identity_upload_url',
      'passport_photo_url'
    ],
    preferences: [
      'how_did_you_hear',
      'referral_source',
      'special_requirements'
    ],
    permissions: [
      'accepted_terms',
      'accepted_privacy_policy',
      'marketing_consent'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private notification: NzNotificationService,
    private imageService: ImageService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateViewportState();
    this.buildForm();
    this.getCtrl('personal', 'nationality')?.valueChanges.subscribe((value) => {
      if (value) {
        this.onNationalityChange(value);
      }
    });
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    const routedPurchaseForm = history.state?.purchaseForm;

    if (routedPurchaseForm) {
      this.purchaseFormData = routedPurchaseForm;
      this.patchFormFromData(routedPurchaseForm);
      this.loadPurchaseContext();
    }

    if (!this.purchaseId) {
      this.notification.error('Missing purchase', 'No purchase reference was provided.');
      return;
    }

    this.getPurchaseForm();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportState();
  }

  private updateViewportState(): void {
    this.isMobileView = window.innerWidth <= 991;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      personal: this.fb.group({
        title: ['', Validators.required],
        first_name: ['', Validators.required],
        middle_name: [''],
        last_name: ['', Validators.required],
        date_of_birth: [null, Validators.required],
        gender: ['', Validators.required],
        marital_status: ['', Validators.required],
        nationality: ['Nigeria', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        alternate_phone: ['']
      }),
      address: this.fb.group({
        address_line_1: ['', Validators.required],
        address_line_2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postal_code: ['', Validators.required],
        country: ['Nigeria', Validators.required]
      }),
      employment: this.fb.group({
        occupation: ['', Validators.required],
        employer_name: [''],
        employer_address: [''],
        monthly_income: [''],
        proof_of_income_url: [''],
        bank_statement_url: ['']
      }),
      next_of_kin: this.fb.group({
        emergency_contact_name: ['', Validators.required],
        emergency_contact_relationship: ['', Validators.required],
        emergency_contact_phone: ['', Validators.required],
        next_of_kin_name: ['', Validators.required],
        next_of_kin_relationship: ['', Validators.required],
        next_of_kin_phone: ['', Validators.required],
        next_of_kin_address: ['', Validators.required]
      }),
      identity: this.fb.group({
        identity_type: ['', Validators.required],
        identity_number: ['', Validators.required],
        identity_upload_url: ['', Validators.required],
        passport_photo_url: ['', Validators.required]
      }),
      preferences: this.fb.group({
        how_did_you_hear: [''],
        referral_source: [''],
        special_requirements: ['']
      }),
      permissions: this.fb.group({
        accepted_terms: [false, Validators.requiredTrue],
        accepted_privacy_policy: [false, Validators.requiredTrue],
        marketing_consent: [false]
      })
    });

    this.updateStateValidation('Nigeria');
  }

  disabledBirthDate = (current: Date): boolean => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return !!current && current.getTime() > today.getTime();
  };

  back(): void {
    this.location.back();
  }

  private stepGroupName(index: number): string | null {
    switch (index) {
      case 0:
        return 'personal';
      case 1:
        return 'address';
      case 2:
        return 'employment';
      case 3:
        return 'next_of_kin';
      case 4:
        return 'identity';
      case 5:
        return 'preferences';
      case 6:
        return 'permissions';
      default:
        return null;
    }
  }

  getCtrl(groupName: string, controlName: string) {
    return (this.form.get(groupName) as FormGroup)?.get(controlName) ?? null;
  }

  getError(groupName: string, controlName: string): string | null {
    const ctrl = this.getCtrl(groupName, controlName);
    if (!ctrl || !ctrl.errors) return null;
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['requiredTrue']) return 'You must accept this to continue';
    if (ctrl.errors['email']) return 'Please enter a valid email address';
    return null;
  }

  next(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    const groupName = this.stepGroupName(this.step);
    if (!groupName) {
      return;
    }

    const payload = this.buildGroupPayload(groupName);
    this.saveDraft(payload, true);
  }

  prev(): void {
    if (this.step > 0) {
      this.step--;
    }
  }

  private validateCurrentStep(): boolean {
    const groupName = this.stepGroupName(this.step);
    if (!groupName) return true;
    const group = this.form.get(groupName) as FormGroup;
    if (!group) return true;
    group.markAllAsTouched();
    group.updateValueAndValidity();
    return group.valid;
  }

  private buildPayload(): PurchaseFormPayload {
    const value = this.form.getRawValue();
    return {
      title: value.personal.title,
      first_name: value.personal.first_name,
      middle_name: this.asOptionalString(value.personal.middle_name),
      last_name: value.personal.last_name,
      date_of_birth: this.formatDate(value.personal.date_of_birth),
      gender: value.personal.gender,
      marital_status: value.personal.marital_status,
        nationality: value.personal.nationality,
      email: value.personal.email,
      phone: value.personal.phone,
      alternate_phone: this.asOptionalString(value.personal.alternate_phone),
      address_line_1: value.address.address_line_1,
      address_line_2: this.asOptionalString(value.address.address_line_2),
      city: value.address.city,
        state: value.address.state,
      postal_code: value.address.postal_code,
      country: value.address.country,
      occupation: value.employment.occupation,
      employer_name: this.asOptionalString(value.employment.employer_name),
      employer_address: this.asOptionalString(value.employment.employer_address),
      monthly_income: value.employment.monthly_income ? Number(String(value.employment.monthly_income).replace(/,/g, '')) : undefined,
      emergency_contact_name: value.next_of_kin.emergency_contact_name,
      emergency_contact_relationship: value.next_of_kin.emergency_contact_relationship,
      emergency_contact_phone: value.next_of_kin.emergency_contact_phone,
      next_of_kin_name: value.next_of_kin.next_of_kin_name,
      next_of_kin_relationship: value.next_of_kin.next_of_kin_relationship,
      next_of_kin_phone: value.next_of_kin.next_of_kin_phone,
      next_of_kin_address: value.next_of_kin.next_of_kin_address,
      identity_type: value.identity.identity_type,
      identity_number: value.identity.identity_number,
      identity_upload_url: value.identity.identity_upload_url,
      passport_photo_url: value.identity.passport_photo_url,
      proof_of_income_url: this.asOptionalString(value.employment.proof_of_income_url),
      bank_statement_url: this.asOptionalString(value.employment.bank_statement_url),
      accepted_terms: !!value.permissions.accepted_terms,
      accepted_privacy_policy: !!value.permissions.accepted_privacy_policy,
      marketing_consent: !!value.permissions.marketing_consent,
      how_did_you_hear: this.asOptionalString(value.preferences.how_did_you_hear),
      referral_source: this.asOptionalString(value.preferences.referral_source),
      special_requirements: this.asOptionalString(value.preferences.special_requirements)
    };
  }

  private buildGroupPayload(groupName: string): Partial<PurchaseFormPayload> {
    const fullPayload = this.buildPayload();
    const payload: Partial<PurchaseFormPayload> = {};
    for (const key of this.groupFieldMap[groupName] || []) {
      const value = fullPayload[key];
      if (
        value !== undefined &&
        value !== null &&
        (typeof value === 'boolean' || value !== '')
      ) {
        payload[key] = value as never;
      }
    }
    return payload;
  }

  private saveDraft(payload: Partial<PurchaseFormPayload>, advanceOnSuccess = false): void {
    this.isLoading = true;
    const request$ = this.purchaseFormData?.id
      ? this.paymentService.updatePurchaseForm(this.purchaseFormData.id, payload)
      : this.paymentService.createPurchaseForm(payload);

    request$
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.purchaseFormData = res.data;
          this.message.success('Draft saved');
          if (advanceOnSuccess && this.step < this.titles.length - 1) {
            this.step++;
          }
        },
        error: (err) => {
          console.error('Failed to save draft', err);
          this.message.error('Failed to save your progress. Please try again.');
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Form incomplete', 'Please complete all required fields before submitting.');
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    const save$ = this.purchaseFormData?.id
      ? this.paymentService.updatePurchaseForm(this.purchaseFormData.id, payload)
      : this.paymentService.createPurchaseForm(payload);

    save$
      .pipe(
        tap((res) => {
          this.purchaseFormData = res.data;
        }),
        switchMap((res) => this.paymentService.submitPurchaseForm(res.data.id)),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: () => {
          this.notification.success('Submitted', 'Your subscription form has been submitted successfully.');
          this.router.navigate(['/main/property-management']);
        },
        error: (err) => {
          console.error(err);
          this.notification.error('Submission failed', 'We could not submit your form. Please try again.');
        }
      });
  }

  private formatDate(value: Date | string | null): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString().split('T')[0];
  }

  private asOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private loadPurchaseContext(): void {
    if (this.purchaseFormData?.purchase) {
      this.purchaseContext = this.purchaseFormData.purchase;
      return;
    }

    const purchaseId = this.purchaseFormData?.purchase_id || this.purchaseId;
    if (!purchaseId) return;
    this.paymentService.getPurchaseDetails(purchaseId).subscribe({
      next: (res: any) => {
        this.purchaseContext = res?.data ?? null;
      },
      error: (err: any) => {
        console.error('Failed to load purchase context', err);
      }
    });
  }

  getPurchaseForm(): void {
    if (!this.purchaseId) return;
    this.isLoading = true;

    this.paymentService
      .getPurchaseFormByPurchaseId(this.purchaseId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.purchaseFormData = res.data;
          this.patchFormFromData(res.data);
          this.loadPurchaseContext();
        },
        error: (err: any) => {
          if (err?.status !== 404) {
            console.error(err);
            this.message.error('Failed to load subscription form.');
          } else if (!this.purchaseFormData) {
            this.message.warning('No saved draft was found for this purchase yet.');
          }
        }
      });
  }

  private patchFormFromData(d: any): void {
    if (!d) return;
    const owner = d.owner || {};
    const property = d.property || {};
    const unit = d.unit || d.purchase?.unit || {};
    const purchase = d.purchase || {};

    this.form.patchValue({
      personal: {
        title: d.title ?? '',
        first_name: d.first_name ?? owner.full_name?.split(' ')?.[0] ?? '',
        middle_name: d.middle_name ?? '',
        last_name: d.last_name ?? owner.full_name?.split(' ')?.slice(1).join(' ') ?? '',
        date_of_birth: d.date_of_birth ? new Date(d.date_of_birth) : null,
        gender: d.gender ?? owner.gender ?? '',
        marital_status: d.marital_status ?? '',
        nationality: d.nationality ?? owner.nationality ?? 'Nigeria',
        email: d.email ?? owner.email ?? '',
        phone: d.phone ?? owner.phone_number ?? '',
        alternate_phone: d.alternate_phone ?? ''
      },
      address: {
        address_line_1: d.address_line_1 ?? d.residential_address ?? owner.address ?? '',
        address_line_2: d.address_line_2 ?? '',
        city: d.city ?? '',
        state: d.state ?? owner.state ?? '',
        postal_code: d.postal_code ?? '',
        country: d.country ?? d.nationality ?? owner.nationality ?? 'Nigeria'
      },
      employment: {
        occupation: d.occupation ?? d.employer_designation ?? '',
        employer_name: d.employer_name ?? '',
        employer_address: d.employer_address ?? '',
        monthly_income: d.monthly_income ? this.formatNumberInput(d.monthly_income) : '',
        proof_of_income_url: d.proof_of_income_url ?? '',
        bank_statement_url: d.bank_statement_url ?? d.payment_receipt_url ?? ''
      },
      next_of_kin: {
        emergency_contact_name: d.emergency_contact_name ?? d.nok_first_name ?? '',
        emergency_contact_relationship: d.emergency_contact_relationship ?? d.nok_relationship ?? '',
        emergency_contact_phone: d.emergency_contact_phone ?? d.nok_phone ?? '',
        next_of_kin_name: d.next_of_kin_name ?? d.nok_first_name ?? '',
        next_of_kin_relationship: d.next_of_kin_relationship ?? d.nok_relationship ?? '',
        next_of_kin_phone: d.next_of_kin_phone ?? d.nok_phone ?? '',
        next_of_kin_address: d.next_of_kin_address ?? d.nok_address ?? ''
      },
      identity: {
        identity_type: d.identity_type ?? d.means_of_identity ?? owner.means_of_identification ?? '',
        identity_number: d.identity_number ?? '',
        identity_upload_url: d.identity_upload_url ?? '',
        passport_photo_url: d.passport_photo_url ?? owner.avatar ?? ''
      },
      preferences: {
        how_did_you_hear: d.how_did_you_hear ?? '',
        referral_source: d.referral_source ?? d.referral_code ?? d.realtor_name ?? '',
        special_requirements: d.special_requirements ?? ''
      },
      permissions: {
        accepted_terms: !!d.accepted_terms,
        accepted_privacy_policy: !!d.accepted_privacy_policy,
        marketing_consent: !!d.marketing_consent
      }
    }, { emitEvent: false });

    const nationality = d.nationality ?? owner.nationality ?? 'Nigeria';
    if (nationality) {
      this.onNationalityChange(nationality, false);
    }
  }

  onPassportFileSelected(event: Event): void {
    this.handleFileSelection(event, 'passport');
  }

  onIdentityFileSelected(event: Event): void {
    this.handleFileSelection(event, 'identity');
  }

  onIncomeFileSelected(event: Event): void {
    this.handleFileSelection(event, 'income');
  }

  onBankFileSelected(event: Event): void {
    this.handleFileSelection(event, 'bank');
  }

  private handleFileSelection(event: Event, type: 'passport' | 'identity' | 'income' | 'bank'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const isPassport = type === 'passport';
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isAllowed = isPassport ? isImage : isImage || isPdf;

    if (!isAllowed) {
      this.message.error(isPassport ? 'Please upload an image file only.' : 'Please upload an image or PDF file.');
      input.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.message.error('File size exceeds the limit (10MB max).');
      input.value = '';
      return;
    }

    this.upload(file, type);
  }

  private upload(file: File, type: 'passport' | 'identity' | 'income' | 'bank'): void {
    const targetPathMap: Record<'passport' | 'identity' | 'income' | 'bank', string> = {
      passport: 'identity.passport_photo_url',
      identity: 'identity.identity_upload_url',
      income: 'employment.proof_of_income_url',
      bank: 'employment.bank_statement_url'
    };

    this.isLoading = true;
    const loadingRef = this.message.loading('Uploading...', { nzDuration: 0 });
    const loadingId = String((loadingRef as any).messageId);

    this.imageService.uploadImage(file).subscribe({
      next: (uploadRes: ImageUploadApiResponse) => {
        const url = uploadRes?.data?.file?.secure_url;
        if (!url) {
          this.message.error('Failed to upload file.');
          this.message.remove(loadingId);
          this.isLoading = false;
          return;
        }

        this.setFormValueByPath(targetPathMap[type], url);
        this.message.remove(loadingId);
        this.message.success('File uploaded successfully.');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Upload error', err);
        this.message.remove(loadingId);
        this.message.error('File upload failed.');
        this.isLoading = false;
      }
    });
  }

  private setFormValueByPath(path: string, value: any): void {
    const ctrl = this.form.get(path.split('.'));
    if (!ctrl) return;
    ctrl.setValue(value);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity();
  }

  onMonthlyIncomeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/[^\d]/g, '');
    const formatted = this.formatNumberInput(digitsOnly);
    this.getCtrl('employment', 'monthly_income')?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  private formatNumberInput(value: string | number): string {
    const digitsOnly = String(value ?? '').replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return '';
    }
    return Number(digitsOnly).toLocaleString('en-US');
  }

  onNationalityChange(value: string, resetState = true): void {
    this.getCtrl('address', 'country')?.setValue(value, { emitEvent: false });
    this.updateStateValidation(value);

    if (value !== 'Nigeria' || resetState) {
      this.getCtrl('address', 'state')?.setValue('', { emitEvent: false });
    }
  }

  private updateStateValidation(nationality: string): void {
    const stateControl = this.getCtrl('address', 'state');
    if (!stateControl) return;

    if (nationality === 'Nigeria') {
      stateControl.setValidators([Validators.required]);
    } else {
      stateControl.clearValidators();
    }

    stateControl.updateValueAndValidity({ emitEvent: false });
  }

  get showNigeriaStates(): boolean {
    return this.getCtrl('personal', 'nationality')?.value === 'Nigeria';
  }

  get purchaseSummary(): { label: string; value: string }[] {
    const purchase = this.purchaseFormData?.purchase;
    const property = this.purchaseFormData?.property;
    const unit = this.purchaseFormData?.unit;
    const context = this.purchaseContext;
    const propertyName = this.purchaseFormData?.property_title || property?.title || property?.name || purchase?.unit?.property?.name || context?.unit?.property?.name || 'Pending property';
    const unitName = unit?.unit_type?.name || purchase?.unit?.unit_type?.name || context?.unit?.unit_type?.name || unit?.name || purchase?.unit?.name || context?.unit?.name || 'Pending unit';
    const amount = this.purchaseFormData?.amount_paid || purchase?.total_price || context?.total_price || '-';
    const status = this.purchaseFormData?.form_status || context?.status || 'draft';

    return [
      { label: 'Property', value: String(propertyName) },
      { label: 'Unit', value: String(unitName) },
      { label: 'Purchase Amount', value: String(amount) },
      { label: 'Form Status', value: String(status) }
    ];
  }
}
