import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import { ActivityLogsResponse, User, UsersResponse, TeamActivityLogsResponse } from '../models/users';
import { Property, PropertyResponse } from '../models/properties';

const PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private httpService: HttpService) {}

  getUsers(
    page: number = 1,
    limit: number = PAGE_SIZE,
    filters?: any
  ): Observable<UsersResponse> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };
    return this.httpService.get<UsersResponse>('users', params);
  }
  getActivityLogs(
    page: number = 1,
    limit: number = PAGE_SIZE,
    filters?: any
  ): Observable<ActivityLogsResponse> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };
    return this.httpService.get<ActivityLogsResponse>('activity-logs/my-logs', params);
  }

  /**
   * Get client list for realtor management
   * @param page Page number
   * @param limit Items per page
   * @param filters Additional filters
   * @returns Observable<TeamActivityLogsResponse>
   */
  getTeamActivityLogs(
    page: number = 1,
    limit: number = PAGE_SIZE,
    filters?: any
  ): Observable<TeamActivityLogsResponse> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };
    return this.httpService.get<TeamActivityLogsResponse>('realtors/me/clients', { params });
  }

  getAdminProperties(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Observable<PropertyResponse> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };
    return this.httpService.get<PropertyResponse>('admin/properties', params);
  }

  getAdminPropertyById(id: string): Observable<Property> {
    return this.httpService
      .get<{ data: Property }>(`admin/properties/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Get single user by ID
   * @param id User ID
   */
  getUserById(id: string): Observable<User> {
    return this.httpService
      .get<{ user: User }>(`users/${id}`)
      .pipe(map((response) => response.user));
  }

  /**
   * Create a new user
   * @param user User data to create
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.httpService
      .post<{ data: User }>('properties', user)
      .pipe(map((response) => response.data));
  }

  /**
   * Update existing user
   * @param id User ID
   * @param user User data to update
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.httpService
      .put<{ data: User }>(`properties/${id}`, user)
      .pipe(map((response) => response.data));
  }

  /**
   * Partially update existing user
   * @param id User ID
   * @param user Partial user data to update
   */
  patchUser(id: string, user: Partial<User>): Observable<User> {
    return this.httpService
      .patch<{ data: User }>(`properties/${id}`, user)
      .pipe(map((response) => response.data));
  }

  /**
   * Delete a user
   * @param id User ID
   */
  deleteUser(id: string): Observable<void> {
    return this.httpService.delete<void>(`properties/${id}`);
  }

  /**
   * Get system report data
   */
  getSystemReport(filters: any): Observable<any> {
    const params = {
      ...filters,
    };
    return this.httpService.get<any>('reports/system', params);
  }

  /**
   * Get customer report data
   */
  getCustomerReport(filters: any): Observable<any> {
    const params = {
      ...filters,
    };
    return this.httpService.get<any>('reports/customer', params);
  }

  // api/dashboard
  getDashboard(): Observable<any> {
    return this.httpService.get<any>('dashboard');
  }
}
