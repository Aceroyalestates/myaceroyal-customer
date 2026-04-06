import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { AppointmentsResponse, AppointmentSearchParams } from '../models/properties';

const PAGE_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(private httpService: HttpService) { }
    getAppointments(
        page: number = 1,
        limit: number = PAGE_SIZE,
        filters: AppointmentSearchParams = {}
    ): Observable<AppointmentsResponse> {
        const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
        };

        if (filters.status) params['status'] = filters.status;
        if (filters.appointment_type) params['appointment_type'] = filters.appointment_type;
        if (filters.start_date) params['start_date'] = filters.start_date;
        if (filters.end_date) params['end_date'] = filters.end_date;
        if (filters.sortBy) params['sortBy'] = filters.sortBy;
        if (filters.sortOrder) params['sortOrder'] = filters.sortOrder;

        return this.httpService.get<AppointmentsResponse>('users/me/appointments', { params });
    }

}
