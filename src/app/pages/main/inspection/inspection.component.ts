import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Appointment, AppointmentSearchParams } from 'src/app/core/models/properties';
import { AppointmentService } from 'src/app/core/services/appointments.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-inspection',
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NzButtonModule,
    NzDatePickerModule,
    NzEmptyModule,
    NzInputModule,
    NzPaginationModule,
    NzSelectModule,
    NzSpinModule,
  ],
  templateUrl: './inspection.component.html',
  styleUrl: './inspection.component.css'
})
export class InspectionComponent {
  isLoading = false;
  appointments: Appointment[] = [];
  page = 1;
  limit = 10;
  total = 0;
  filters: AppointmentSearchParams = {
    appointment_type: 'inspection',
    sortBy: 'appointment_date',
    sortOrder: 'DESC',
  };
  statusOptions = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAppointments();
  }

  getAppointments(page: number = this.page, limit: number = this.limit) {
    this.isLoading = true;
    this.appointmentService.getAppointments(page, limit, this.filters).subscribe({
      next: (response) => {
        this.appointments = response.data ?? [];
        const pagination = (response.pagination ?? {}) as any;
        this.page = pagination.current_page ?? pagination.page ?? page;
        this.limit = pagination.per_page ?? pagination.limit ?? limit;
        this.total = pagination.total_items ?? pagination.total ?? this.appointments.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching appointments:', error);
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.getAppointments(1, this.limit);
  }

  resetFilters(): void {
    this.filters = {
      appointment_type: 'inspection',
      sortBy: 'appointment_date',
      sortOrder: 'DESC',
    };
    this.page = 1;
    this.getAppointments(1, this.limit);
  }

  onPageIndexChange(page: number): void {
    this.page = page;
    this.getAppointments(page, this.limit);
  }

  onPageSizeChange(limit: number): void {
    this.limit = limit;
    this.page = 1;
    this.getAppointments(1, limit);
  }

  formatAppointmentDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPropertyName(appointment: Appointment): string {
    return appointment.property?.name || 'Property Inspection';
  }

  getAppointmentTime(appointment: Appointment): string {
    if (appointment.appointment_time) {
      return appointment.time_period
        ? `${appointment.appointment_time} ${appointment.time_period}`
        : appointment.appointment_time;
    }
    return 'Time to be confirmed';
  }

  bookNewInspection(): void {
    this.router.navigate(['/main/explore']);
  }
}
