import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from '../../../../core/services/properties.service';
import { AppointmentCreateRequest } from '../../../../core/models/properties';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-book-inspection',
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzSpinModule,
    NzIconModule,
  ],
  templateUrl: './book-inspection.component.html',
  styleUrl: './book-inspection.component.css',
})
export class BookInspectionComponent implements OnInit, OnDestroy {
  private fb = inject(NonNullableFormBuilder);
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertiesService = inject(PropertiesService);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);

  propertyId: string | null = null;
  loading = false;
  validatingRealtor = false;
  validatedRealtor: any = null;
  realtorError: string | null = null;
  propertyName = '';
  legacyPhaseTwoInspectionOnly = false;

  formBasic = this.fb.group({
    full_name: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phone_number: this.fb.control('', [
      Validators.required,
      Validators.pattern(/^\+?\d{10,15}$/),
    ]),
    appointment_date: this.fb.control('', [Validators.required]),
    coming_with_realtor: this.fb.control<'no' | 'yes'>('no', [Validators.required]),
    realtor_tag: this.fb.control(''),
    special_requirements: this.fb.control('', []),
  });

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (!this.propertyId) {
      this.message.error('Property ID not found');
      this.router.navigate(['/main/explore']);
      return;
    }

    this.loadPropertyContext();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.formBasic.patchValue({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
      });
    }

    this.formBasic.controls.coming_with_realtor.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === 'yes') {
          this.formBasic.controls.realtor_tag.setValidators([Validators.required]);
        } else {
          this.formBasic.controls.realtor_tag.clearValidators();
          this.formBasic.controls.realtor_tag.setValue('');
          this.validatedRealtor = null;
          this.realtorError = null;
        }

        this.formBasic.controls.realtor_tag.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setDefaultDate(): void {
    const defaultDate = this.formatDateString(this.getNextAllowedInspectionDate());

    this.formBasic.patchValue({ appointment_date: defaultDate });
  }

  get minDate(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  }

  disabledDate = (current: Date): boolean => {
    const candidate = new Date(current);
    candidate.setHours(0, 0, 0, 0);

    const minimum = new Date();
    minimum.setHours(0, 0, 0, 0);
    minimum.setDate(minimum.getDate() + 1);

    if (candidate < minimum) {
      return true;
    }

    const day = candidate.getDay();

    if (this.legacyPhaseTwoInspectionOnly) {
      return day !== 3;
    }

    return ![2, 4, 6].includes(day);
  };

  get inspectionDateGuidance(): string {
    return this.legacyPhaseTwoInspectionOnly
      ? 'Only Wednesdays are available for this property. Book at least 24 hours ahead.'
      : 'Inspections are available on Tuesdays, Thursdays, and Saturdays only. Book at least 24 hours ahead.';
  }

  private loadPropertyContext(): void {
    if (!this.propertyId) {
      return;
    }

    this.propertiesService.getPropertyById(this.propertyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (property) => {
          this.propertyName = property.name || '';
          const normalizedName = this.propertyName.toLowerCase();
          this.legacyPhaseTwoInspectionOnly =
            normalizedName.includes('legacy') && normalizedName.includes('phase 2');

          this.setDefaultDate();
        },
        error: (error) => {
          console.error('Error loading property context for inspection:', error);
          this.setDefaultDate();
        }
      });
  }

  private getNextAllowedInspectionDate(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);

    while (this.disabledDate(date)) {
      date.setDate(date.getDate() + 1);
    }

    return date;
  }

  private formatDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getPhoneErrorMessage(): string {
    const phoneControl = this.formBasic.get('phone_number');
    if (phoneControl?.hasError('required')) {
      return 'Please enter phone number';
    }
    if (phoneControl?.hasError('pattern')) {
      return 'Enter a valid phone number';
    }
    return '';
  }

  onDateChange(date: Date | null): void {
    if (date) {
      const dateString = this.formatDateString(date);
      this.formBasic.patchValue({ appointment_date: dateString });
    }
  }

  validateRealtorTag(): void {
    const referralCode = this.formBasic.controls.realtor_tag.value.trim();

    if (!referralCode) {
      this.realtorError = 'Please enter a realtor tag.';
      this.validatedRealtor = null;
      return;
    }

    this.validatingRealtor = true;
    this.realtorError = null;
    this.validatedRealtor = null;

    this.paymentService.getRealtorByRefCode(referralCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.validatedRealtor = response?.data || response;
          this.validatingRealtor = false;
        },
        error: (error) => {
          console.error('Error validating realtor tag:', error);
          this.validatingRealtor = false;
          this.validatedRealtor = null;
          this.realtorError = 'No realtor found for this tag.';
        }
      });
  }

  submitFormBasic(): void {
    // Prevent double submission
    if (this.loading) {
      console.log('Form submission already in progress, ignoring duplicate submission');
      return;
    }

    console.log('Form submission started');
    console.log('Form valid:', this.formBasic.valid);
    console.log('Form value:', this.formBasic.value);
    console.log('Property ID:', this.propertyId);
    
    if (this.formBasic.value.coming_with_realtor === 'yes' && !this.validatedRealtor) {
      this.message.error('Please validate the realtor tag before booking.');
      return;
    }

    if (this.formBasic.valid && this.propertyId) {
      this.loading = true;

      const appointmentData: AppointmentCreateRequest = {
        full_name: this.formBasic.value.full_name!,
        email: this.formBasic.value.email!,
        phone_number: this.formBasic.value.phone_number!,
        property_id: this.propertyId,
        appointment_date: this.formBasic.value.appointment_date!,
        appointment_type: 'inspection',
        special_requirements: this.formBasic.value.special_requirements || undefined
      };

      // Realtor tag will be added here once backend supports it.

      this.propertiesService.createAppointment(appointmentData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (appointment) => {
            this.loading = false;
            this.message.success('Appointment booked successfully!');
            console.log('Appointment created successfully:', appointment);
            this.router.navigate(['/main/inspection-schedule']);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating appointment:', error);
            this.message.error('Failed to book appointment. Please try again.');
          }
        });
    } else {
      console.log('Form is invalid or property ID missing');
      console.log('Form errors:', this.getFormErrors());
      
      Object.values(this.formBasic.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.formBasic.controls).forEach(key => {
      const control = this.formBasic.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
