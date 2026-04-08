import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, Observable } from 'rxjs';
import { ContinueOfflinePurchasePayload, ContinueOfflinePurchaseResponse, ContinueOnlinePurchasePayload, ContinueOnlinePurchaseResponse, DefaultBankAccount, PaymentHistoryFilters, PaymentHistoryResponse, PaymentScheduleListResponse, PaymentScheduleResponse, PaymentSchedulesResponse, PropertyFormStatisticsFilters, PropertyFormStatisticsResponse, PurchaseFormPayload, PurchaseFormResponse, PurchaseFormSubmitResponse, PurchasePaymentScheduleFilters, RealtorByRefCodeResponse, SettingsResponse, StartOfflinePurchasePayload, StartOfflinePurchaseResponse, StartOnlinePurchasePayload, StartOnlinePurchaseResponse, ValidateCouponResponse } from '../models/payment';

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
      sortOrder: 'ASC' | 'DESC' = 'DESC',
      filters?: PaymentHistoryFilters
    ): Observable<PaymentHistoryResponse> {
      const params: any = {
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.method) {
        params.method = filters.method;
      }
      if (filters?.purchase_id) {
        params.purchase_id = filters.purchase_id;
      }
      if (filters?.from_date) {
        params.from_date = filters.from_date;
      }
      if (filters?.to_date) {
        params.to_date = filters.to_date;
      }

      return this.httpService.get<PaymentHistoryResponse>('payments/me', {
        params
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

    continueOfflinePurchase(payload: ContinueOfflinePurchasePayload): Observable<ContinueOfflinePurchaseResponse> {
      return this.httpService.post<ContinueOfflinePurchaseResponse>(`payments/offline`, payload);
    }

    initiateOnlinePurchase(payload: StartOnlinePurchasePayload): Observable<StartOnlinePurchaseResponse> {
      return this.httpService.post<StartOnlinePurchaseResponse>('purchases/start/online', payload);
    }

    continueOnlinePurchase(payload: ContinueOnlinePurchasePayload): Observable<ContinueOnlinePurchaseResponse> {
      return this.httpService.post<ContinueOnlinePurchaseResponse>(`payments/online`, payload);
    }

    createPurchaseForm(payload: Partial<PurchaseFormPayload>): Observable<PurchaseFormResponse> {
      return this.httpService.post<PurchaseFormResponse>('property-forms', payload);
    }

    submitPurchaseForm(purchaseFormId: string): Observable<PurchaseFormSubmitResponse> {
      return this.httpService.post<PurchaseFormSubmitResponse>(`property-forms/${purchaseFormId}/submit`, {});
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

    getPropertyFormStatistics(filters?: PropertyFormStatisticsFilters): Observable<PropertyFormStatisticsResponse> {
      const params: Record<string, string> = {};

      if (filters?.userId) {
        params['userId'] = filters.userId;
      }
      if (filters?.fromDate) {
        params['fromDate'] = filters.fromDate;
      }
      if (filters?.toDate) {
        params['toDate'] = filters.toDate;
      }

      return this.httpService.get<PropertyFormStatisticsResponse>('property-forms/statistics', {
        params
      });
    }

    getPurchaseFormByPurchaseId(purchaseId: string): Observable<PurchaseFormResponse> {
      return this.httpService.get<PurchaseFormResponse>(`property-forms/purchase/${purchaseId}`);
    }

    updatePurchaseForm(purchaseFormId: string, payload: Partial<PurchaseFormPayload>): Observable<PurchaseFormResponse> {
      return this.httpService.patch<PurchaseFormResponse>(`property-forms/${purchaseFormId}`, payload);
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

    getPurchaseDetails(purchaseId: string): Observable<any> {
      return this.httpService.get<any>(`purchases/${purchaseId}`);
    }

    getUserPurchaseSchedules(
      purchaseId: string,
      filters?: PurchasePaymentScheduleFilters
    ): Observable<PaymentScheduleListResponse> {
      const params: Record<string, string> = {};

      if (filters?.status) {
        params['status'] = filters.status;
      }
      if (filters?.sortBy) {
        params['sortBy'] = filters.sortBy;
      }
      if (filters?.sortOrder) {
        params['sortOrder'] = filters.sortOrder;
      }
      if (filters?.includePayments !== undefined) {
        params['includePayments'] = String(filters.includePayments);
      }

      return this.httpService.get<PaymentScheduleListResponse>(`purchases/${purchaseId}/schedules`, {
        params
      });
    }

    getOverduePurchaseSchedules(purchaseId: string): Observable<PaymentScheduleListResponse> {
      return this.httpService.get<PaymentScheduleListResponse>(`purchases/${purchaseId}/schedules/overdue`);
    }

    getUpcomingPurchaseSchedules(
      purchaseId: string,
      daysAhead: number = 30
    ): Observable<PaymentScheduleListResponse> {
      return this.httpService.get<PaymentScheduleListResponse>(`purchases/${purchaseId}/schedules/upcoming`, {
        params: {
          daysAhead: String(daysAhead),
        }
      });
    }

    getPaymentScheduleById(scheduleId: string): Observable<PaymentScheduleResponse> {
      return this.httpService.get<PaymentScheduleResponse>(`schedules/${scheduleId}`);
    }

}
