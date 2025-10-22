import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExploreComponent } from './explore/explore.component';
import { FaqComponent } from './faq/faq.component';
import { FinancialComponent } from './financial/financial.component';
import { NotificationComponent } from './notification/notification.component';
import { PasswordComponent } from './password/password.component';
import { ProfileComponent } from './profile/profile.component';
import { SupportComponent } from './support/support.component';
import { InspectionComponent } from './inspection/inspection.component';
import { SubscriptionComponent } from './subscription/subscription.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'explore',
      },
      // {
      //   path: 'dashboard',
      //   component: DashboardComponent,
      // },
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'financial-transactions',
        component: FinancialComponent,
      },
      {
        path: 'notifications',
        component: NotificationComponent,
      },
      {
        path: 'password-security',
        component: PasswordComponent,
      },
      {
        path: 'support',
        component: SupportComponent,
      },
      {
        path: 'my-profile',
        component: ProfileComponent,
      },
      {
        path: 'explore',
        loadChildren: () =>
          import('./explore/explore.module').then((m) => m.ExploreModule),
      },
      {
        path: 'inspection-schedule',
        loadChildren: () =>
          import('./inspection/inspection.module').then((m) => m.InspectionModule),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
      },
      {
        path: 'realtor-management',
        loadChildren: () =>
          import('./realtor-management/realtor-management.module').then(
            (m) => m.RealtorManagementModule
          ),
      },
      {
        path: 'admin-management',
        loadChildren: () =>
          import('./admin-management/admin-management.module').then(
            (m) => m.AdminManagementModule
          ),
      },
      {
        path: 'property-management',
        loadChildren: () => 
          import('./property-management/property-management.module').then(
            m => m.PropertyManagementModule),
      },
      {
        path: 'subscription/:id',
        component: SubscriptionComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
