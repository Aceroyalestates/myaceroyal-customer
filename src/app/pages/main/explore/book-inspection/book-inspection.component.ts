import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from '../../../../core/services/properties.service';
import { AppointmentCreateRequest } from '../../../../core/models/properties';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-inspection',
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
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

  propertyId: string | null = null;
  loading = false;
  availableSlots: any[] = [];
  selectedDate: Date | null = null;

  // Client options
  clientOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  formBasic = this.fb.group({
    full_name: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phone_number: this.fb.control('', [
      Validators.required,
      Validators.pattern(/^0\d{10}$/),
      Validators.minLength(11),
      Validators.maxLength(11)
    ]),
    appointment_date: this.fb.control('', [Validators.required]),
    special_requirements: this.fb.control('', []),
  });

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (!this.propertyId) {
      this.message.error('Property ID not found');
      this.router.navigate(['/main/explore-property']);
      return;
    }
    
    // Set default date to tomorrow
    this.setDefaultDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setDefaultDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.selectedDate = tomorrow;
    
    this.formBasic.patchValue({
      appointment_date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format
    });
  }

  disabledDate = (current: Date): boolean => {
    // Disable dates before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current < today;
  };

  getPhoneErrorMessage(): string {
    const phoneControl = this.formBasic.get('phone_number');
    if (phoneControl?.hasError('required')) {
      return 'Please enter phone number';
    }
    if (phoneControl?.hasError('pattern')) {
      return 'Phone number must be in format 0XXXXXXXXXX (e.g., 09022334455)';
    }
    if (phoneControl?.hasError('minlength') || phoneControl?.hasError('maxlength')) {
      return 'Phone number must be exactly 11 digits';
    }
    return '';
  }

  onDateChange(date: Date | null): void {
    this.selectedDate = date;
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      this.formBasic.patchValue({ appointment_date: dateString });
      
      // Fetch available slots for the selected date
      this.loadAvailableSlots(dateString);
    }
  }

  private loadAvailableSlots(date: string): void {
    if (!this.propertyId) return;
    
    this.loading = true;
    this.propertiesService.getAvailableSlots(this.propertyId, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableSlots = response.data.available_slots;
          this.loading = false;
          console.log('Available slots:', this.availableSlots);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading available slots:', error);
          this.message.error('Failed to load available slots. Please try again.');
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
    
    if (this.formBasic.valid && this.propertyId) {
      this.loading = true;
  
      // Use phone number as entered (11-digit format)
      const phoneNumber = this.formBasic.value.phone_number!;

      const appointmentData: AppointmentCreateRequest = {
        full_name: this.formBasic.value.full_name!,
        email: this.formBasic.value.email!,
        phone_number: phoneNumber,
        property_id: this.propertyId,
        appointment_date: this.formBasic.value.appointment_date!,
        appointment_type: 'inspection',
        special_requirements: this.formBasic.value.special_requirements || undefined
      };

      this.propertiesService.createAppointment(appointmentData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (appointment) => {
            this.loading = false;
            this.message.success('Appointment booked successfully!');
            console.log('Appointment created successfully:', appointment);
            // Navigate back to property view or show success page
            this.router.navigate(['/main/explore-property/list',]);
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
