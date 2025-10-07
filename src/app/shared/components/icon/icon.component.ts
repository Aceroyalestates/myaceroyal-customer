import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class IconComponent implements OnInit {
  @Input({ required: true }) name!: string;
  @Input() size!: number;
  @Input() class?: string;
  @Input() type: 'fi' | 'google' | 'fa' = 'fi';
  @Input() options?: any;

  featherIcon = '';
  googleIcon = '';
  fontAwesomeIcon = '';

  ngOnInit(): void {
    this.onInit();
  }

  onInit() {
    switch (this.type) {
      case 'fi':
      case 'google':
      case 'fa':
    }
  }
}
