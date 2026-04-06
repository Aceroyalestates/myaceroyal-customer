import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private httpService: HttpService) { }

    getNotifications(): Observable<any> {
        return this.httpService.get<any>('notifications');
    }
    
    getNotificationSummary(): Observable<any> {
        return this.httpService.get<any>('notifications/summary')
    }

    markAsRead(notificationId: string): Observable<any> {
        return this.httpService.patch<any>(`notifications/${notificationId}/read`, {});
    }

    markAllAsRead(): Observable<any> {
        return this.httpService.patch<any>('notifications/mark-all-read', {});
    }

    deleteNotification(notificationId: string): Observable<any> {
        return this.httpService.delete<any>(`notifications/${notificationId}`);
    }   
}
