import { Component, effect, signal } from '@angular/core';
import { ColumnDef } from '@tanstack/table-core';
import { INSPECTION_SCHEDULES } from 'src/app/core/constants';
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
  loading = false;
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

  constructor() {
    // Optional effect to react to selected schedule changes
    effect(() => {
      console.log('Selected schedule from table:', this.selected());
    });
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
}
