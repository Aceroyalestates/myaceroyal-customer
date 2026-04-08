import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { SharedModule } from '../../shared/shared.module';

interface NavItem {
  label: string;
  icon: string;
  link?: string;
  exact?: boolean;
  action?: 'logout' | 'toggleTheme';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    SharedModule,
    NzDividerModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  readonly defaultAvatar = 'https://cdn.vectorstock.com/i/1000v/51/05/male-profile-avatar-with-brown-hair-vector-12055105.jpg';
  isCollapsed = false;
  mobileMenuOpen = false;
  theme: 'light' | 'dark' = 'light';
  loggedInUser: any = null;
  firstName = '';
  unreadNotifications = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
    private readonly router: Router,
  ) {
    this.theme = this.themeService.getTheme();
    this.themeService.initTheme();
    this.syncCurrentUser(this.authService.getCurrentUser());
    this.authService.currentUser$.subscribe((user) => {
      this.syncCurrentUser(user);
    });
    this.notificationService.notificationSummary$.subscribe((summary) => {
      this.unreadNotifications = summary?.unread ?? 0;
    });
    this.notificationService.getNotificationSummary().subscribe({
      error: (error) => console.error(error),
    });
  }

  get navSections(): NavSection[] {
    return [
      {
        title: 'Main Menu',
        items: [
          {
            label: 'Explore Property',
            icon: 'map',
            link: '/main/explore',
            exact: true,
          },
        ],
      },
      {
        title: 'Property Menu',
        items: [
          {
            label: 'My Properties',
            icon: 'property',
            link: '/main/property-management',
          },
          {
            label: 'Payments',
            icon: 'purse',
            link: '/main/financial-transactions',
          },
          {
            label: 'Inspection Schedule',
            icon: 'clock',
            link: '/main/inspection-schedule',
          },
        ],
      },
      {
        title: 'Settings',
        items: [
          {
            label: 'Notifications',
            icon: 'bell',
            link: '/main/notifications',
          },
          {
            label: this.theme === 'dark' ? 'Light Mode' : 'Dark Mode',
            icon: this.theme === 'dark' ? 'sun' : 'moon',
            action: 'toggleTheme',
          },
          {
            label: 'FAQ',
            icon: 'help-circle',
            link: '/main/faq',
          },
          {
            label: 'Support',
            icon: 'phone-call',
            link: '/main/support',
          },
          {
            label: 'Sign Out',
            icon: 'exit',
            action: 'logout',
          },
        ],
      },
    ];
  }

  get headerAvatarUrl(): string {
    return this.loggedInUser?.avatar || this.defaultAvatar;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleTheme(): void {
    this.theme = this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onNavItemClick(item: NavItem): void {
    if (item.action === 'toggleTheme') {
      this.toggleTheme();
      return;
    }

    if (item.action === 'logout') {
      this.closeMobileMenu();
      this.logout();
      return;
    }

    this.closeMobileMenu();
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
  }

  trackBySection(_: number, section: NavSection): string {
    return section.title;
  }

  trackByItem(_: number, item: NavItem): string {
    return item.label;
  }

  private syncCurrentUser(user: any): void {
    this.loggedInUser = user;
    this.firstName = user?.full_name ? user.full_name.split(' ')[0] : '';
  }
}
