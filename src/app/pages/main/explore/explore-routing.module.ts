import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore.component';
import { ViewPropertyComponent } from './view-property/view-property.component';
import { BookInspectionComponent } from './book-inspection/book-inspection.component';

const routes: Routes = [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
      },
      {
        path: '',
        component: ExploreComponent
      },
      {
        path: 'view/:id',
        component: ViewPropertyComponent
      },
      {
        path: 'book/:id',
        component: BookInspectionComponent
      }
    ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExploreRoutingModule { }
