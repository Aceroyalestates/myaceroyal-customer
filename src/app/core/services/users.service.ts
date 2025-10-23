import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

import { avatarRequest, UpdateUserRequest, UserProfileResponse } from '../models/users';


@Injectable({
    providedIn: 'root',
})
export class UsersService {
    constructor(private httpService: HttpService) { }

    getUserProfile(): Observable<UserProfileResponse> {
        return this.httpService.get<UserProfileResponse>('users/me');
    }

    updateUserProfile(data: UpdateUserRequest): Observable<UserProfileResponse> {
        return this.httpService.patch<UserProfileResponse>('users/me', data);
    }

    updateUserAvatar(payload: avatarRequest): Observable<UserProfileResponse> {
        return this.httpService.patch<UserProfileResponse>('users/me/avatar', payload);
    }

    changeUserPassword(payload: any): Observable<any> {
        return this.httpService.patch<any>('users/me/password', payload);
    }

}