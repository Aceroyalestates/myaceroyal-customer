import { Activity, IResponse } from './generic';

export interface UsersResponse extends IResponse {
  data: User[];
}

export interface Role {
  id: number;
  name: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar: string | null;
  role_id: number;
  is_verified: boolean;
  account_locked_at: string | null;
  gender: string | null;
  date_of_birth: string | null;
  referral_code: string | null;
  nationality: string | null;
  state: string | null;
  local_government: string | null;
  address: string | null;
  bank_verification_number: string | null;
  national_identity_number: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogsResponse extends IResponse {
  data: Activity[];
}

export interface TeamActivityLogsResponse extends IResponse {
  data: TeamActivityLog[];
}

export interface TeamActivityLog {
  id: number;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role_id: number;
    role: {
      name: string;
    };
  };
}

export interface UserProfileResponse extends IResponse {
  message?: string;
  user: User;
}

export interface AvatarRequest {
  avatar: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone_number?: string;
  avatar?: string | null;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  state?: string;
  local_government?: string;
  address?: string;
  bank_verification_number?: string;
  national_identity_number?: string;
  referral_code?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
