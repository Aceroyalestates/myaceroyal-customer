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
    NzCheckboxModule],
  templateUrl: './subscription.component.html'
})
export class SubscriptionComponent implements OnInit {
  step = 0;
  isSubmitting = false;

  form!: FormGroup;

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
    private notification: NzNotificationService
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
        nationality: ['', Validators.required]
      }),

      nok: this.fb.group({
        nok_first_name: ['', Validators.required],
        nok_last_name: ['', Validators.required],
        nok_phone: ['', Validators.required],
        nok_relationship: ['', Validators.required]
      }),

      employment: this.fb.group({
        employer: [''],
        designation: [''],
        employer_phone: ['']
      }),

      payment: this.fb.group({
        property_id: ['', Validators.required],
        units: [1, Validators.required],
        payment_plan: ['', Validators.required],
        date_of_payment: [null],
        source_of_fund: ['']
      }),

      realtor: this.fb.group({
        realtor_first_name: [''],
        realtor_last_name: ['']
      }),

      permissions: this.fb.group({
        realtor_consent: [false]
      }),

      terms: this.fb.group({
        accept_declaration: [false, Validators.requiredTrue]
      })
    });
  }

  private stepGroupName(index: number) {
    switch (index) {
      case 0:
        return 'personal';
      case 1:
        return 'nok';
      case 2:
        return 'employment';
      case 3:
        return 'payment';
      case 4:
        return 'realtor';
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
    const payload = this.form.value;
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
}
