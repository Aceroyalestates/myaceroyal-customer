import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule,],
    templateUrl: './input.component.html',
    styleUrl: './input.component.css'
})
export class InputComponent {

  @Input() control: FormControl = new FormControl();
  @Input() type: string = 'text';
  @Input() value: string = 'text';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() loading!: boolean;
  @Input() errorMessage: string = '';
  @Input() maxlength?: number;
  @Input() isSearchAccount?: boolean;
  @Input() numbersOnly: boolean = false;
  @Input() formatAsCurrency: boolean = false;


keyPress(event: KeyboardEvent) {
  if (this.numbersOnly) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode || event.keyCode);

    // Allow Backspace and Delete keys
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return;
    }

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}

handlePaste(event: ClipboardEvent) {
  if (this.numbersOnly) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const pattern = /^[0-9]+$/;
    if (!pattern.test(pastedText)) {
      event.preventDefault();
    }
  }
}


onInput(event: any) {
  if (this.formatAsCurrency) {
    const rawValue = event.target.value.replace(/,/g, '').replace(/\D/g, '');
    const formattedValue = this.formatNumberWithCommas(rawValue);

    // Set formatted display value
    event.target.value = formattedValue;

    // Update the FormControl with raw numeric value
    this.control.setValue(rawValue, { emitEvent: true });
  }
}

public formatNumberWithCommas(value: string): string {
  if (!value) return '';
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


}
