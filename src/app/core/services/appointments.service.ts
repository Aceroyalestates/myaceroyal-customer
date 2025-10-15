import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import {
    Property,
    PropertyResponse,
    Appointment,
    AppointmentCreateRequest,
    AppointmentResponse,
    AppointmentsResponse,
    AvailableSlotsResponse,
    AppointmentSearchParams
} from '../models/properties';

const PAGE_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(private httpService: HttpService) { }
//  'https://myacero--myaceroyal-backend--bp8g7jxh9y8c.code.run/api/users/me/appointments?status=confirmed&appointment_type=inspection&start_date=2024-01-01&end_date=2024-12-31&page=1&limit=10&sortBy=appointment_date&sortOrder=DESC' \
//  'https://myacero--myaceroyal-backend--bp8g7jxh9y8c.code.run/
// api/users/me/appointments?status=confirmed&appointment_type=inspection&start_date=2024-01-01&end_date=2024-12-31&page=1&limit=10&sortBy=appointment_date&sortOrder=DESC' \

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