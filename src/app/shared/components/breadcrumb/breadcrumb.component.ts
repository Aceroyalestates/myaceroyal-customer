import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, CommonModule, SharedModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  @Input() items: { label: string; url?: string }[] = [];
}
