import { e } from "node_modules/@angular/material/ripple.d-BxTUZJt7";

export interface PaymentSchedulesResponse {
  success: boolean;
  message: string;
  dashboard: PaymentScheduleDashboard;
}

export interface PaymentSchedule {
  id: string;
  purchase_id: string;
  user_id: string;
  amount_due: string;
  amount_paid: string;
  due_date: string;
  status: string;
  payment_ids: string[];
  paid_at: string | null;
  grace_days: number;
  note: string | null;
  is_auto_applied: boolean;
  installment_number: number;
  installment_type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentScheduleDashboard {
  totalPurchases: number;
  totalSchedules: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  remainingBalance: number;
  overdueSchedules: number;
  upcomingSchedules: number;
  recentSchedules: PaymentSchedule[];
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: PaymentData[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
  summary: PaymentSummary;
}

export interface PaymentSummary {
    total_payments: number;
    total_amount: number;
    status_breakdown: {
      [status: string]: {
        count: number;
        total_amount: number;
      };
    };
    method_breakdown: {
      [method: string]: {
        count: number;
        total_amount: number;
      };
    }
}

export interface PaymentData {
    id: string;
    amount: number;
    method: string;
    status: string;
    payment_type: string;
    payment_reference: string | null;
    gateway_reference: string | null;
    proof_url: string | null;
    applied_to: Record<string, unknown>;
    error_message: string | null;
    created_at: string;
    paid_at: string | null;
    approved_at: string | null;
    updated_at: string;
    purchase: {
        id: string;
        quantity: number;
        total_price: number;
        balance_due: number;
        status: string;
        property: {
            id: string;
            name: string;
            location: string;
        };
        unit: {
            id: number;
            name: string | null;
            type: string;
            price: number;
            size: string | null;
        };
        plan: {
            id: number;
            name: string;
            duration_months: number;
            initial_amount: number;
            total_price: number;
        };
    };
}


export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  coupon: {
      id: string;
      code: string;
      discount_type: string;
      value: number;
      max_uses: number;
      usage_count: number;
      starts_at: string;
      expires_at: string;
      is_active: boolean;
  } | null;
  discount: number | null;
}

export interface RealtorByRefCodeResponse {
  success: boolean;
  message: string;
  data?: {
      name: string;
      email: string;
      code: string;
  } | null;
}

// src/app/models/bank-account.model.ts
export interface DefaultBankAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
  icon_url: string;
}

// And for the full response structure (optional but recommended for a Service):
export interface SettingsResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    key: string;
    value: string; // The stringified JSON
    type: string;
    category: string;
    description: string;
    is_public: boolean;
    is_system: boolean;
    updated_by: string;
    createdAt: string;
    updatedAt: string;
    updatedBy: {
      email: string;
      id: string;
      full_name: string;
    };
    parsed_value: DefaultBankAccount[]; // The array you want to use
  };
}


// {
//   "unit_id": "73",
//   "plan_id": "3",
//   "quantity": 1,
//   "amount_paid": 200000000,
//   "proof_url": "string",
//   "referral_code": "",
//   "coupon_code": "EARLYBIRD20",
//   "realtor_can_manage": false
// }

export interface StartOfflinePurchasePayload {
  unit_id: number;
  plan_id?: number;
  quantity: number;
  amount_paid: number;
  proof_url: string;
  referral_code?: string;
  coupon_code?: string;
  realtor_can_manage?: boolean;
}

// {
//   "message": "Offline purchase started",
//   "data": {
//     "purchase_id": "0666f93d-d2d5-4211-b6e4-cda7a5fe9d8d",
//     "payment_reference": "156b9636-395c-48dd-ad18-b6465b22f87f",
//     "purchase_form_id": "7a1e2b31-b0bc-4aa2-b832-82c1d6fac44c"
//   }
// }

export interface StartOfflinePurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchase_id: string;
    payment_reference: string;
    purchase_form_id: string;
  };
}

