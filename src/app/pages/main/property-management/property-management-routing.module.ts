import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyManagementComponent } from './property-management.component';
import { AddPropertyComponent } from './add-property/add-property.component';
import { EditPropertyComponent } from './edit-property/edit-property.component';
import { PropertyPaymentComponent } from './property-payment/property-payment.component';

const routes: Routes = [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
      },
      {
        path: '',
        component: PropertyManagementComponent
      },
      {
        path: 'view/:id',
        component: PropertyPaymentComponent
      },
      {
        path: 'add',
        component: AddPropertyComponent
      },
      {
        path: 'edit/:id',
        component: EditPropertyComponent
      }
    ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyManagementRoutingModule { }
