import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface FaqQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    include_property?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class FaqService {
    constructor(private httpService: HttpService) { }

    getFaqs(params: FaqQueryParams = {}): Observable<any> {
        const {
            page = 1,
            limit = 10,
            search = '',
            include_property = true,
        } = params;

        const query = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            include_property: String(include_property),
        });

        if (search.trim()) {
            query.set('search', search.trim());
        }

        return this.httpService.get(`faqs?${query.toString()}`);
    }

    getFaqById(id: string, includeProperty: boolean = true): Observable<any> {
        return this.httpService.get(`faqs/${id}?include_property=${includeProperty}`);
    }
}
