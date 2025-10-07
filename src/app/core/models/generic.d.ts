// can i put any datatype as the default type for a generic interface?
export interface IResponse<T = any> {
  success?: boolean;
  message: string;
  pagination?: Pagination;
  data?: T;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Activity {
  id: number;
  user_id: string;
  role_id: number;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  metadata: {
    plan_id: number;
    quantity: number;
    amount_paid: number;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    id: string;
    full_name: string;
    role_id: number;
    role: {
      name: string;
    };
  };
  // Additional properties for dashboard display
  full_name?: string;
  date?: string;
  is_active?: boolean;
}

export interface Role {
  value: number;
  label: string;
  name: string;
}

export interface CountryInterface {
  id: number
  name: string
  code: string
  is_active: boolean
  sort_order: number
  createdAt: string
  updatedAt: string
}

export interface StateInterface {
  id: number,
  name: string
  code: string
  nationality_id: number,
  is_active: true,
  sort_order: 0,
  createdAt: string
  updatedAt: string
  nationality: {
    id: number,
    name: string
    code: string
  }
}
