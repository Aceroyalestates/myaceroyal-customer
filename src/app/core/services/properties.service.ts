import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import {
	    Property,
	    PropertyResponse,
      PropertyFilters,
      PropertyTypesResponse,
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
export class PropertiesService {
    constructor(private httpService: HttpService) { }

    getProperties(
        page: number = 1,
        limit: number = PAGE_SIZE,
        filters: PropertyFilters = {}
    ): Observable<PropertyResponse> {
        const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
        };

        if (typeof filters.type === 'number') {
            params['type'] = filters.type.toString();
        }

        if (filters.location?.trim()) {
            params['location'] = filters.location.trim();
        }

        if (typeof filters.min_price === 'number') {
            params['min_price'] = filters.min_price.toString();
        }

        if (typeof filters.max_price === 'number') {
            params['max_price'] = filters.max_price.toString();
        }

        if (filters.search?.trim()) {
            params['search'] = filters.search.trim();
        }

        return this.httpService.get<PropertyResponse>('properties', { params });
    }

    getPropertyBySlug(slug: string): Observable<Property> {
        return this.httpService
            .get<{ data: Property }>(`properties/${slug}`)
            .pipe(map((response) => response.data));
    }

    getPropertyTypes(
        page: number = 1,
        limit: number = 100,
        search: string = '',
        includeDeleted: boolean = false
    ): Observable<PropertyTypesResponse> {
        const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
            includeDeleted: includeDeleted.toString(),
        };

        if (search.trim()) {
            params['search'] = search.trim();
        }

        return this.httpService.get<PropertyTypesResponse>('property-types', { params });
    }

    getPropertyById(id: string): Observable<Property> {
        return this.httpService
            .get<{ data: Property }>(`properties/id/${id}`)
            .pipe(map((response) => response.data));
    }

    createProperty(property: Partial<Property>): Observable<Property> {
        return this.httpService
            .post<{ data: Property }>('properties', property)
            .pipe(map((response) => response.data));
    }

    updateProperty(id: string, property: Partial<Property>): Observable<Property> {
        return this.httpService
            .put<{ data: Property }>(`properties/${id}`, property)
            .pipe(map((response) => response.data));
    }

    patchProperty(id: string, property: Partial<Property>): Observable<Property> {
        return this.httpService
            .patch<{ data: Property }>(`properties/${id}`, property)
            .pipe(map((response) => response.data));
    }

    deleteProperty(id: string): Observable<void> {
        return this.httpService.delete<void>(`properties/${id}`);
    }

    // Appointment-related methods

    /**
     * Create a new appointment
     * @param appointmentData - The appointment data to create
     * @returns Observable<Appointment>
     */
    createAppointment(appointmentData: AppointmentCreateRequest): Observable<Appointment> {
        console.log('PropertiesService: Creating appointment with data:', appointmentData);
        return this.httpService
            .post<AppointmentResponse>('appointments', appointmentData)
            .pipe(map((response) => {
                console.log('PropertiesService: Appointment creation response:', response);
                return response.data;
            }));
    }

    /**
     * Get appointment by identifier (ID or slug)
     * @param identifier - The appointment ID or slug
     * @returns Observable<Appointment>
     */
    getAppointmentById(identifier: string): Observable<Appointment> {
        return this.httpService
            .get<AppointmentResponse>(`appointments/${identifier}`)
            .pipe(map((response) => response.data));
    }

    /**
     * Get available time slots for a property
     * @param propertyId - The property ID
     * @param date - Date to check availability (YYYY-MM-DD format, must be today or future)
     * @returns Observable<AvailableSlotsResponse>
     */
    getAvailableSlots(propertyId: string, date: string): Observable<AvailableSlotsResponse> {
        const params = { date };
        return this.httpService
            .get<AvailableSlotsResponse>(`properties/${propertyId}/available-slots`, { params })
            .pipe(map((response) => response));
    }

    /**
     * Search appointments with filters
     * @param searchParams - Search parameters
     * @returns Observable<AppointmentsResponse>
     */
    searchAppointments(searchParams: AppointmentSearchParams = {}): Observable<AppointmentsResponse> {
        const params: Record<string, string> = {
            page: searchParams.page?.toString() || '1',
            limit: searchParams.limit?.toString() || PAGE_SIZE.toString(),
        };

        // Add optional search parameters
        if (searchParams.q) params['q'] = searchParams.q;
        if (searchParams.email) params['email'] = searchParams.email;
        if (searchParams.phone) params['phone'] = searchParams.phone;

        return this.httpService.get<AppointmentsResponse>('appointments/search', { params });
    }
}
