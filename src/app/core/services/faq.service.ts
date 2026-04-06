import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class FaqService {
    constructor(private httpService: HttpService) { }

    getFaqs(page: number = 1, limit: number = 10): Observable<any> {
        return this.httpService.get(`faqs?page=${page}&limit=${limit}`);
    }

    getFaqById(id: string): Observable<any> {
        return this.httpService.get(`faqs/${id}`);
    }
}
