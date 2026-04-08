import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Appointment, AppointmentSearchParams } from 'src/app/core/models/properties';
import { AppointmentService } from 'src/app/core/services/appointments.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

interface InspectionPropertyOption {
  id: string;
  name: string;
  subtitle: string;
}

@Component({
  selector: 'app-inspection',
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
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
  isBookInspectionModalOpen = false;
  isLoadingProperties = false;
  showFilters = false;
  appointments: Appointment[] = [];
  availableProperties: InspectionPropertyOption[] = [];
  selectedPropertyId = '';
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
    private paymentService: PaymentService,
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
    this.showFilters = false;
  }

  resetFilters(): void {
    this.filters = {
      appointment_type: 'inspection',
      sortBy: 'appointment_date',
      sortOrder: 'DESC',
    };
    this.page = 1;
    this.getAppointments(1, this.limit);
    this.showFilters = false;
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
    this.isBookInspectionModalOpen = true;
    this.selectedPropertyId = '';
    this.loadAvailableProperties();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  closeBookInspectionModal(): void {
    this.isBookInspectionModalOpen = false;
    this.selectedPropertyId = '';
  }

  confirmBookInspection(): void {
    if (!this.selectedPropertyId) {
      return;
    }

    const propertyId = this.selectedPropertyId;
    this.closeBookInspectionModal();
    this.router.navigate(['/main/explore/book', propertyId]);
  }

  private loadAvailableProperties(): void {
    if (this.availableProperties.length > 0) {
      return;
    }

    this.isLoadingProperties = true;
    this.paymentService.getPurchases(1, 100).subscribe({
      next: (response) => {
        const purchases = response?.data ?? [];
        const seen = new Set<string>();

        this.availableProperties = purchases.reduce((items: InspectionPropertyOption[], purchase: any) => {
          const property = purchase?.unit?.property;
          if (!property?.id || seen.has(property.id)) {
            return items;
          }

          seen.add(property.id);
          items.push({
            id: property.id,
            name: property.name || 'Property',
            subtitle: property.location || property.address || '',
          });

          return items;
        }, []);

        this.isLoadingProperties = false;
      },
      error: (error) => {
        console.error('Error loading available properties for inspection booking:', error);
        this.availableProperties = [];
        this.isLoadingProperties = false;
      }
    });
  }
}
