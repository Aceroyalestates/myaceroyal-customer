import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule, MatButton, MatSpinner],
    templateUrl: './button.component.html',
    styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() buttonStyles!: string;
  @Input() buttonText!: string;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() routerLink: boolean = false;
  @Input() isCancelButton: boolean = false;
  @Input() type: string = 'button';
  @Output() onButtonClick = new EventEmitter<any>();

  constructor(private router: Router) {}

  getButtonClass() {
    return this.buttonText.toLowerCase() === 'cancel' ||
      this.buttonText.toLowerCase() === 'decline' ||
      this.buttonText.toLowerCase() === 'reject'
      ? 'buttonStyles'
      : 'custom-button';
  }

  onBtnClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Always emit the click event regardless of button type
    this.onButtonClick.emit();
  }
}
