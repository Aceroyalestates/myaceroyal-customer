import { Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back',
  imports: [CommonModule,IconComponent],
  templateUrl: './back.component.html',
  styleUrl: './back.component.css'
})
export class BackComponent {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
