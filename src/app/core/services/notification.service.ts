import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { BehaviorSubject, finalize, Observable, of, shareReplay, tap } from 'rxjs';

export type NotificationType = 'subscription_form' | 'upcoming_payment' | 'admin_alert' | 'other';

export interface NotificationQueryParams {
    page?: number;
    limit?: number;
    is_read?: boolean | '';
    type?: NotificationType | '';
}

export interface NotificationSummaryData {
    total: number;
    unread: number;
    read: number;
    typeBreakdown: Record<string, number>;
}


@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private readonly notificationSummarySubject = new BehaviorSubject<NotificationSummaryData>({
        total: 0,
        unread: 0,
        read: 0,
        typeBreakdown: {},
    });
    private hasLoadedSummary = false;
    private summaryRequest$: Observable<any> | null = null;

    readonly notificationSummary$ = this.notificationSummarySubject.asObservable();

    constructor(private httpService: HttpService) { }

    getNotifications(params: NotificationQueryParams = {}): Observable<any> {
        const queryParams: Record<string, string> = {
            page: String(params.page ?? 1),
            limit: String(params.limit ?? 10),
        };

        if (params.is_read !== '' && params.is_read !== undefined) {
            queryParams['is_read'] = String(params.is_read);
        }

        if (params.type) {
            queryParams['type'] = params.type;
        }

        return this.httpService.get<any>('notifications', {
            params: queryParams,
        });
    }
    
    getNotificationSummary(forceRefresh: boolean = false): Observable<any> {
        if (!forceRefresh && this.hasLoadedSummary) {
            return of({
                success: true,
                data: this.notificationSummarySubject.value,
            });
        }

        if (!forceRefresh && this.summaryRequest$) {
            return this.summaryRequest$;
        }

        const request$ = this.httpService.get<any>('notifications/summary').pipe(
            tap((response) => {
                this.notificationSummarySubject.next(this.normalizeSummary(response));
                this.hasLoadedSummary = true;
            }),
            finalize(() => {
                this.summaryRequest$ = null;
            }),
            shareReplay(1)
        );

        this.summaryRequest$ = request$;
        return request$;
    }

    getCurrentSummary(): NotificationSummaryData {
        return this.notificationSummarySubject.value;
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

    private normalizeSummary(response: any): NotificationSummaryData {
        const data = response?.data ?? response ?? {};
        const readStatus = data.readStatus
            ?? data.read_status
            ?? data.readStatusDistribution
            ?? data.byReadStatus
            ?? {};
        const rawTypeBreakdown = data.typeBreakdown
            ?? data.by_type
            ?? data.typeDistribution
            ?? data.byType
            ?? data.types
            ?? {};

        const typeBreakdown = Object.entries(rawTypeBreakdown).reduce<Record<string, number>>((acc, [key, value]) => {
            acc[key] = this.toNumber(value);
            return acc;
        }, {});

        const unread = this.toNumber(
            data.unread
            ?? data.unreadCount
            ?? data.unread_count
            ?? readStatus.unread
            ?? readStatus.false
        );

        const read = this.toNumber(
            data.read
            ?? data.readCount
            ?? data.read_count
            ?? readStatus.read
            ?? readStatus.true
        );

        const total = this.toNumber(
            data.total
            ?? data.totalNotifications
            ?? data.total_notifications
            ?? data.totals?.notifications
            ?? data.totals?.total
            ?? (read + unread)
        );

        return {
            total,
            unread,
            read,
            typeBreakdown,
        };
    }

    private toNumber(value: unknown): number {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
}
