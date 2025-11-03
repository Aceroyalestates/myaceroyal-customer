import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NationalityService {
    constructor(private httpService: HttpService) { }

    getNationalities(page: number = 1, limit: number = 10): Observable<any> {
        return this.httpService.get(`nationalities?page=${page}&limit=${limit}`);
    }

    getStatesByNationalityId(id: string): Observable<any> {
        return this.httpService.get(`states/nationality/${id}`);
    }
}