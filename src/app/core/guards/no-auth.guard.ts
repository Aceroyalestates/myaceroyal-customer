import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		// If user is already authenticated, redirect to dashboard
		if (this.authService.isAuthenticated()) {
			return this.router.createUrlTree(['/main/dashboard']);
		}

		// Allow access to auth pages if not authenticated
		return true;
	}
}
