import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div class="flex gap-2">
        <select
          [value]="selectedCountryCode"
          [disabled]="disabled"
          [class]="countryCodeClasses"
          (change)="onCountryCodeChange($event)"
        >
          <option *ngFor="let code of countryCodes" [value]="code">{{ code }}</option>
        </select>
        <input
          [type]="type"
          [placeholder]="placeholder"
          [value]="phoneValue"
          [disabled]="disabled"
          [class]="phoneInputClasses"
          (input)="onPhoneInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
      </div>
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Enter phone number';
  @Input() type: string = 'tel';
  @Input() errorMessage: string = '';
  @Input() control: FormControl | null = null;
  @Input() countryCodes: string[] = ['+234', '+1', '+44', '+33', '+49'];

  selectedCountryCode: string = '+234';
  phoneValue: string = '';
  disabled: boolean = false;
  hasError: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get countryCodeClasses(): string {
    const baseClasses = 'px-3 py-3 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20';
    const stateClasses = this.hasError 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-red-500';
    const disabledClasses = this.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    
    return `${baseClasses} ${stateClasses} ${disabledClasses}`.trim();
  }

  get phoneInputClasses(): string {
    const baseClasses = 'flex-1 px-4 py-3 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20';
    const stateClasses = this.hasError 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-red-500';
    const disabledClasses = this.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    
    return `${baseClasses} ${stateClasses} ${disabledClasses}`.trim();
  }

  onCountryCodeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCountryCode = target.value;
    this.updateValue();
  }

  onPhoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.phoneValue = target.value;
    this.updateValue();
    this.checkError();
  }

  onBlur(): void {
    this.onTouched();
    this.checkError();
  }

  onFocus(): void {
    this.hasError = false;
  }

  private updateValue(): void {
    const fullValue = `${this.selectedCountryCode} ${this.phoneValue}`.trim();
    this.onChange(fullValue);
  }

  private checkError(): void {
    if (this.control) {
      this.hasError = this.control.touched && this.control.invalid;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        this.selectedCountryCode = parts[0];
        this.phoneValue = parts.slice(1).join(' ');
      } else {
        this.phoneValue = value;
      }
    } else {
      this.phoneValue = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
