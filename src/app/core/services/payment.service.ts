import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import { DefaultBankAccount, PaymentHistoryResponse, PaymentSchedulesResponse, PurchaseFormPayload, PurchaseFormResponse, RealtorByRefCodeResponse, SettingsResponse, StartOfflinePurchasePayload, StartOfflinePurchaseResponse, StartOnlinePurchasePayload, StartOnlinePurchaseResponse, ValidateCouponResponse } from '../models/payment';

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

    
    initiateOfflinePurchase(payload: StartOfflinePurchasePayload): Observable<StartOfflinePurchaseResponse> {
      return this.httpService.post<StartOfflinePurchaseResponse>('purchases/start/offline', payload);
    }

    initiateOnlinePurchase(payload: StartOnlinePurchasePayload): Observable<StartOnlinePurchaseResponse> {
      return this.httpService.post<StartOnlinePurchaseResponse>('purchases/start/online', payload);
    }

    submitPurchaseForm(payload: PurchaseFormPayload): Observable<PurchaseFormResponse> {
      return this.httpService.post<PurchaseFormResponse>('property-forms', payload);
    }

    getUserPayments(
      status?: string,
      method?: string,
      purchase_id?: string,
      from_date?: string,
      to_date?: string,
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'created_at',
      sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<PaymentHistoryResponse> {
      const params: any = {
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (status) {
        params.status = status;
      }
      if (method) {
        params.method = method;
      }
      if (purchase_id) {
        params.purchase_id = purchase_id;
      }
      if (from_date) {
        params.from_date = from_date;
      }
      if (to_date) {
        params.to_date = to_date;
      }

      return this.httpService.get<PaymentHistoryResponse>('payments/me', { params });
    }

    getpropertyForms(
      page: number = 1,
      limit: number = 10,
      sortOrder: 'ASC' | 'DESC' = 'DESC',
      status: string = 'in_progress'
    ): Observable<any> {
      return this.httpService.get<any>('property-forms', {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          sort_order: sortOrder
        }
      });
    }

    getPurchases(
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'created_at',
      sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Observable<any> {
      return this.httpService.get<any>('purchases/me/full', {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
    }

}
