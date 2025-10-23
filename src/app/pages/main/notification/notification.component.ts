import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzNotificationService as NzNotifService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  imports: [
    SharedModule,
    CommonModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzListModule,
    NzEmptyModule,
    NzIconModule,
    NzSpinModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  isLoading = false;
  notifications: any[] = [];
  loadingIds: Set<string> = new Set();

  constructor(
    private notificationService: NotificationService,
    private nzNotif: NzNotifService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getNotifications();
  }

  getNotifications(): void {
    this.isLoading = true;

    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        this.notifications = response.data || [];
        this.isLoading = false;
        this.notifications.push({
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "987fcdeb-51d2-4a8c-b456-426614174000",
      "type": "upcoming_payment",
      "title": "Payment Due Soon",
      "message": "Your payment installment #3 of ₦500,000 is due in 3 days.",
      "action_link": "/dashboard/schedules/123",
      "is_read": false,
      "meta": {
        "schedule_id": "456e7890-e89b-12d3-a456-426614174000",
        "amount_due": 500000,
        "priority": "medium"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    })
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
    this.isLoading = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.isLoading = false;
        this.nzNotif.success('Updated', 'All notifications marked as read');
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
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

}
