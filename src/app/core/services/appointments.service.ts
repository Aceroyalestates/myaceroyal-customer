import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { AppointmentsResponse } from '../models/properties';

const PAGE_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(private httpService: HttpService) { }
    getAppointments(
        page: number = 1,
        limit: number = PAGE_SIZE,
        filters?: any
    ): Observable<AppointmentsResponse> {
        const params = {
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
        };
        return this.httpService.get<AppointmentsResponse>('users/me/appointments', { params });
    }

}