import { Component, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnDef } from '@tanstack/table-core';
import { INSPECTION_SCHEDULES } from 'src/app/core/constants';
import { Appointment } from 'src/app/core/models/properties';
import { AppointmentService } from 'src/app/core/services/appointments.service';
import { InspectionSchedule } from 'src/app/core/types/general';
import { TableAction, TableColumn } from 'src/app/shared/components/table/table.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-inspection',
  imports: [SharedModule],
  templateUrl: './inspection.component.html',
  styleUrl: './inspection.component.css'
})
export class InspectionComponent {
inspectionSchedules: InspectionSchedule[] = INSPECTION_SCHEDULES;
  getRowLink = (row: InspectionSchedule) => `/inspection-schedule/${row.id}`;
  isLoading = false;
  columns: TableColumn[] = [
    {
      key: 'property',
      title: 'Property',
      sortable: true,
      type: 'text',
    },
    {
      key: 'action',
      title: 'Activity',
      sortable: false,
      type: 'text',
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      type: 'text',
    },
  ];
  actions: TableAction[] = [
      {
        key: 'view',
        label: 'View',
        icon: 'eye',
        color: 'red',
        tooltip: 'View details',
      },
    ];

  selected = signal<InspectionSchedule[]>([]);
  appointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    // Optional effect to react to selected schedule changes
    effect(() => {
      console.log('Selected schedule from table:', this.selected());
    });
  }

  ngOnInit(): void {
    this.getAppointments();
  }

  handleSelectedData(selected: InspectionSchedule[]) {
    this.selected.set(selected);
    console.log(this.selected());
  }

   onTableAction(event: { action: string; row: InspectionSchedule }) {
      console.log('Table action:', event.action, 'Row:', event.row);
      switch (event.action) {
        case 'view':
          // this.viewUser(event.row);
          break;
      }
    }

    onRowClick(row: InspectionSchedule) {
      console.log('Row clicked:', row);
        // Navigate to user details
        // window.location.href = `/main/user-management/view/${row.id}/${row.property}`;
      }

      getAppointments() {
        console.log('Fetching appointments...');
        this.isLoading = true;
        this.appointmentService.getAppointments().subscribe({
          next: (response) => {
            console.log('Fetched appointments:', response);
            this.appointments = response.data;
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error fetching appointments:', error);
          },
        });
      }

      // bookInspection() {
      //   this.router.navigateByUrl(`main/explore/book/${this.property?.id}`);
      // }
}
