import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InspectionComponent } from './inspection.component';
import { BookInspectionComponent } from './book-inspection/book-inspection.component';

const routes: Routes = [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
      },
      {
        path: '',
        component: InspectionComponent
      },
      {
        path: ':id',
        component: BookInspectionComponent
      },
    ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InspectionRoutingModule { }
