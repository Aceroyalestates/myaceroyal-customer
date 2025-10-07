import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { PaymentHistoryResponse, PaymentSchedulesResponse } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

    constructor(private httpService: HttpService) {}
  
    getPaymentSchedules(
      page: number = 1,
      limit: number = 10,
      filters?: any
    ): Observable<PaymentSchedulesResponse> {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      };
      return this.httpService.get<PaymentSchedulesResponse>('users/me/schedules/dashboard', params);
    }

    //api/payments/me?method=bank_transfer&from_date=2025-01-01&to_date=2025-07-24&page=1&limit=10&sort_by=created_at&sort_order=DESC

    getPaymentHistory(
      // method: string,
      // fromDate: string,
      // toDate: string,
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'created_at',
      sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<PaymentHistoryResponse> {
      return this.httpService.get<PaymentHistoryResponse>('payments/me', {
        params: {
          // method,
          // from_date: fromDate,
          // to_date: toDate,
          page: page.toString(),
          limit: limit.toString(),
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
    }
}
