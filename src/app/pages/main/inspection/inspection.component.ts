import { Component, effect, signal } from '@angular/core';
import { ColumnDef } from '@tanstack/table-core';
import { INSPECTION_SCHEDULES } from 'src/app/core/constants';
import { InspectionSchedule } from 'src/app/core/types/general';
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
  columns: ColumnDef<InspectionSchedule>[] = [
    { accessorKey: 'id', header: 'S/N' },
    { accessorKey: 'property', header: 'Property' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'realtor', header: 'Realtor' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'action', header: 'Action' },
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
}
