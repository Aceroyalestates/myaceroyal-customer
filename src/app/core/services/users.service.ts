import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

import { IResponse } from '../models/generic';
import { AvatarRequest, ChangePasswordRequest, UpdateUserRequest, UserProfileResponse } from '../models/users';


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

    updateUserAvatar(payload: AvatarRequest): Observable<UserProfileResponse> {
        return this.httpService.patch<UserProfileResponse>('users/me/avatar', payload);
    }

    deleteUserAvatar(): Observable<UserProfileResponse> {
        return this.httpService.delete<UserProfileResponse>('users/me/avatar');
    }

    changeUserPassword(payload: ChangePasswordRequest): Observable<IResponse> {
        return this.httpService.patch<IResponse>('users/me/password', payload);
    }

}
