import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div class="relative">
        <input
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        <ng-content select="[slot=icon]"></ng-content>
      </div>
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() errorMessage: string = '';
  @Input() control: FormControl | null = null;

  value: string = '';
  disabled: boolean = false;
  hasError: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-3 border rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20';
    const stateClasses = this.hasError 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-red-500';
    const disabledClasses = this.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    
    return `${baseClasses} ${stateClasses} ${disabledClasses}`.trim();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.checkError();
  }

  onBlur(): void {
    this.onTouched();
    this.checkError();
  }

  onFocus(): void {
    this.hasError = false;
  }

  private checkError(): void {
    if (this.control) {
      this.hasError = this.control.touched && this.control.invalid;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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
