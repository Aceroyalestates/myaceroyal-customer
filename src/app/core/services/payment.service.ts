import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import { DefaultBankAccount, PaymentHistoryResponse, PaymentSchedulesResponse, RealtorByRefCodeResponse, SettingsResponse, StartOfflinePurchasePayload, StartOfflinePurchaseResponse, ValidateCouponResponse } from '../models/payment';

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


    getPaymentHistory(
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'created_at',
      sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<PaymentHistoryResponse> {
      return this.httpService.get<PaymentHistoryResponse>('payments/me', {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
    }

    validateCoupon(code: string, totalAmount: number): Observable<ValidateCouponResponse> {
      return this.httpService.get<ValidateCouponResponse>(`coupons/${code}/validate?totalAmount=${totalAmount}`);
    }

    getRealtorByRefCode(refCode: string): Observable<RealtorByRefCodeResponse> {
      return this.httpService.get<RealtorByRefCodeResponse>(`realtors/${refCode}`);
    }

    getBankAccounts(): Observable<DefaultBankAccount[]> {
      return this.httpService.get<SettingsResponse>('settings/payments.bank_accounts').pipe(
        map(response => response.data.parsed_value)
      );
    }

    // api/purchases/start/offline
    initiateOfflinePurchase(payload: StartOfflinePurchasePayload): Observable<StartOfflinePurchaseResponse> {
      return this.httpService.post<StartOfflinePurchaseResponse>('purchases/start/offline', payload);
    }

}
