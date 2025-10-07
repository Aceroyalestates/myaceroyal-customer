import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    SharedModule,
    NzMenuModule,
    NzDividerModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  isCollapsed = false;
  theme: 'light' | 'dark' = 'light';
  loggedInUser: any = null;
  firstName: string = '';

  constructor(private authService: AuthService, private themeService: ThemeService) {
    this.theme = this.themeService.getTheme();
    this.themeService.initTheme();
    this.loggedInUser = this.authService.getCurrentUser();
    this.firstName = this.loggedInUser ? this.loggedInUser.full_name.split(' ')[0] : '';
  }

  toggleTheme() {
    this.theme = this.themeService.toggleTheme();
  }

  onSearch(query: string) {
    console.log('Search query:', query);
    // filter table, trigger API search, etc.
  }

  logout() {
    this.authService.logout();
  }
}
