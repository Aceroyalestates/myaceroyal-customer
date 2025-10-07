import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './pages/auth/unauthorized/unauthorized.component';
import { NotFoundComponent } from './pages/auth/not-found/not-found.component';
import { AuthGuard } from './core/guards';

export const routes: Routes = [
  {
		path: '',
		redirectTo: 'auth/login',
		pathMatch: 'full',
	},
  {
    path: 'main',
    loadChildren: () => import('../app/pages/main/main.module').then(m => m.MainModule),
    canActivate: [AuthGuard],
		canActivateChild: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/pages/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];
