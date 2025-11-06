import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NoAuthGuard } from '../../core/guards/no-auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent,
		canActivate: [NoAuthGuard],
	},
	{
		path: 'forgot-password',
		component: ForgotPasswordComponent,
		canActivate: [NoAuthGuard],
	},
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AuthRoutingModule {}
