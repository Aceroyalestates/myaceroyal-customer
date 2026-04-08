import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzNotificationService as NzNotifService } from 'ng-zorro-antd/notification';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NotificationService, NotificationSummaryData, NotificationType } from 'src/app/core/services/notification.service';

interface NotificationItem {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  action_link?: string | null;
  is_read: boolean;
  meta?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-notification',
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzSpinModule,
    NzPaginationModule,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  readonly typeOptions: Array<{ label: string; value: NotificationType | '' }> = [
    { label: 'All Types', value: '' },
    { label: 'Subscription Form', value: 'subscription_form' },
    { label: 'Upcoming Payment', value: 'upcoming_payment' },
    { label: 'Admin Alert', value: 'admin_alert' },
    { label: 'Other', value: 'other' },
  ];

  readonly readOptions: Array<{ label: string; value: '' | 'true' | 'false' }> = [
    { label: 'All Statuses', value: '' },
    { label: 'Unread', value: 'false' },
    { label: 'Read', value: 'true' },
  ];

  isLoading = false;
  isSummaryLoading = false;
  isMarkingAllRead = false;
  notifications: NotificationItem[] = [];
  loadingIds: Set<string> = new Set();
  summary: NotificationSummaryData = {
    total: 0,
    unread: 0,
    read: 0,
    typeBreakdown: {},
  };
  page = 1;
  limit = 10;
  total = 0;
  isReadFilter: '' | 'true' | 'false' = '';
  typeFilter: NotificationType | '' = '';

  constructor(
    private notificationService: NotificationService,
    private nzNotif: NzNotifService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.getNotifications();
  }

  getNotifications(page: number = this.page): void {
    this.isLoading = true;
    this.page = page;

    this.notificationService.getNotifications({
      page: this.page,
      limit: this.limit,
      is_read: this.parseReadFilter(),
      type: this.typeFilter,
    }).subscribe({
      next: (response: any) => {
        this.notifications = response.data || [];
        const pagination = response.pagination ?? {};
        this.page = pagination.current_page ?? pagination.page ?? this.page;
        this.limit = pagination.per_page ?? pagination.limit ?? this.limit;
        this.total = pagination.total_items ?? pagination.total ?? this.notifications.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.isLoading = false;
        this.nzNotif.error('Error', 'Failed to load notifications');
      }
    })
  }

  markAsRead(notificationId: string): void {
    if (!notificationId) return;
    this.loadingIds.add(notificationId);
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const n = this.notifications.find((x) => x.id === notificationId);
        if (n) n.is_read = true;
        this.loadingIds.delete(notificationId);
        this.loadSummary();
        if (this.isReadFilter === 'false') {
          this.getNotifications(this.page);
        }
        this.nzNotif.success('Updated', 'Notification marked as read');
      },
      error: (err: any) => {
        console.error(err);
        this.loadingIds.delete(notificationId);
        this.nzNotif.error('Error', 'Failed to mark notification as read');
      }
    });
  }

  deleteNotification(notificationId: string): void {
    if (!notificationId) return;
    this.loadingIds.add(notificationId);
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== notificationId);
        this.loadingIds.delete(notificationId);
        this.total = Math.max(0, this.total - 1);
        if (!this.notifications.length && this.page > 1) {
          this.page -= 1;
          this.getNotifications(this.page);
        }
        this.loadSummary();
        this.nzNotif.success('Deleted', 'Notification removed');
      },
      error: (err: any) => {
        console.error(err);
        this.loadingIds.delete(notificationId);
        this.nzNotif.error('Error', 'Failed to delete notification');
      }
    });
  }

  markAllAsRead(): void {
    if (!this.notifications?.length) return;
    this.isMarkingAllRead = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.isMarkingAllRead = false;
        this.loadSummary();
        if (this.isReadFilter === 'false') {
          this.getNotifications(1);
        }
        this.nzNotif.success('Updated', 'All notifications marked as read');
      },
      error: (err: any) => {
        console.error(err);
        this.isMarkingAllRead = false;
        this.nzNotif.error('Error', 'Failed to mark all notifications as read');
      }
    });
  }

  openAction(notification: any): void {
    if (!notification) return;
    if (notification.action_link) {
      // assume the action_link is a route path within the app
      this.router.navigateByUrl(notification.action_link).catch(err => console.error(err));
    }
  }

  isItemLoading(id: string): boolean {
    return this.loadingIds.has(id);
  }

  onFilterChange(): void {
    this.getNotifications(1);
  }

  refreshNotifications(): void {
    this.loadSummary();
    this.getNotifications(1);
  }

  get unreadNotifications(): number {
    return this.summary.unread;
  }

  get typeSummaryCards(): Array<{ label: string; value: number }> {
    return [
      { label: 'Subscription Forms', value: this.getTypeCount('subscription_form') },
      { label: 'Upcoming Payments', value: this.getTypeCount('upcoming_payment') },
      { label: 'Admin Alerts', value: this.getTypeCount('admin_alert') },
      { label: 'Other', value: this.getTypeCount('other') },
    ];
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'subscription_form':
        return 'Subscription Form';
      case 'upcoming_payment':
        return 'Upcoming Payment';
      case 'admin_alert':
        return 'Admin Alert';
      default:
        return 'Other';
    }
  }

  getTypeClass(type: string): string {
    return `notification-card__type notification-card__type--${type || 'other'}`;
  }

  hasMetaValue(notification: NotificationItem, key: string): boolean {
    const value = notification.meta?.[key];
    return value !== null && value !== undefined && value !== '';
  }

  getMetaValue(notification: NotificationItem, key: string): string | number | null {
    const value = notification.meta?.[key];
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return typeof value === 'number' || typeof value === 'string' ? value : String(value);
  }

  onPageIndexChange(page: number): void {
    this.getNotifications(page);
  }

  private loadSummary(): void {
    this.isSummaryLoading = true;
    this.notificationService.getNotificationSummary(true).subscribe({
      next: () => {
        this.summary = this.notificationService.getCurrentSummary();
        this.isSummaryLoading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.isSummaryLoading = false;
      }
    });
  }

  private parseReadFilter(): boolean | '' {
    if (this.isReadFilter === '') return '';
    return this.isReadFilter === 'true';
  }

  getTypeCount(type: NotificationType): number {
    return Number(this.summary.typeBreakdown?.[type] ?? 0);
  }
}
