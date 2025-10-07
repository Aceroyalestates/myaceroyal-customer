import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.checkAuthentication();
	}

	canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.checkAuthentication();
	}

	private checkAuthentication(): boolean | UrlTree {
		// Check if user is authenticated
		if (this.authService.isAuthenticated()) {
			// Additional check for token expiration could be added here
			// For now, we'll rely on the basic token check
			return true;
		}

		// Clear any stale authentication data
		this.authService.logout();

		// Redirect to unauthorized page if not authenticated
		return this.router.createUrlTree(['/unauthorized']);
	}
}
