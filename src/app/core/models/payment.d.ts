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

// export interface PaymentHistoryResponse {
//   success: boolean;
//   message: string;
//   data: PaymentData[];
//   pagination: {
//     current_page: number;
//     per_page: number;
//     total_items: number;
//     total_pages: number;
//     has_next_page: boolean;
//     has_previous_page: boolean;
//   };
//   summary: PaymentSummary;
// }

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



export interface StartOfflinePurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchase_id: string;
    payment_reference: string;
    purchase_form_id: string;
  };
}

export interface ContinueOfflinePurchasePayload {
  purchase_id: string;
  amount: number;
  method: string;
  proof_url: string;
}

export interface ContinueOfflinePurchaseResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface StartOnlinePurchasePayload {
  unit_id: number;
  plan_id?: number;
  quantity: number;
  amount_paid: number;
  referral_code?: string;
  coupon_code?: string;
  realtor_can_manage?: boolean;
}

export interface StartOnlinePurchaseResponse {
  success: boolean;
  message: string;
  data: {
    payment: PaymentData;
    session: {
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    };
  };
}

export interface ContinueOnlinePurchasePayload {
  purchase_id: string;
  amount: number;
}

export interface ContinueOnlinePurchaseResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    payment_reference: string;
    authorization_url: string;
    access_code: string;
    gateway_reference: string;
    purchase_id: string;
  }
}

export interface PurchaseFormPayload {
  title: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  occupation: string;
  employer_name?: string;
  employer_address?: string;
  monthly_income?: number;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
  next_of_kin_address: string;
  identity_type: 'national_id' | 'international_passport' | 'driver_license' | 'voter_card' | 'other';
  identity_number: string;
  identity_upload_url: string; // URL to uploaded identity document
  passport_photo_url: string; // URL to uploaded passport photo
  proof_of_income_url?: string; // URL to uploaded proof of income document
  bank_statement_url?: string; // URL to uploaded bank statement
  accepted_terms: boolean;
  accepted_privacy_policy: boolean;
  marketing_consent?: boolean;
  how_did_you_hear?: string; // e.g., 'referral', 'social_media', 'advertisement', etc.
  referral_source?: string; // e.g., name of person who referred
  special_requirements?: string;
}


export interface PurchaseFormResponse {
  success: boolean;
  message: string;
  data: PurchaseFormPayload & {
    id: string;
    purchase_id: string;
    form_status: 'draft' | 'submitted' | 'verified' | 'rejected';
    submitted_at: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    purchase: {
      id: string;
      property_name: string;
      unit_number: string;
      purchase_amount: string;
    };
  };  
}

// --- Nested Interfaces for Data Item ---

/**
 * Represents the property details within a purchase.
 */
export interface PropertyData {
  id: string;
  name: string;
  location: string;
}

/**
 * Represents the unit details within a purchase.
 */
export interface UnitData {
  id: number;
  name: string | null;
  type: string;
  price: number;
  size: string | null;
}

/**
 * Represents the payment plan details for the purchase.
 */
export interface PlanData {
  id: number;
  name: string;
  duration_months: number;
  initial_amount: number;
  total_price: number;
}

/**
 * Represents the purchase object related to a payment.
 */
export interface PurchaseData {
  id: string;
  quantity: number;
  total_price: number;
  balance_due: number;
  status: 'in-progress' | string;
  property: PropertyData;
  unit: UnitData;
  plan: PlanData | null; // Plan can be null for outright payments
}

/**
 * Represents the structure of the `applied_to` field (appears to be a simple object, can be left as `any` or an empty object type if structure is unknown).
 * Since the example shows an empty object `{}`, we'll define it as a key-value map for flexibility.
 */
export interface AppliedTo {
  [key: string]: any;
}


// --- Main Data Item Interface ---

/**
 * Represents a single payment history record.
 */
export interface PaymentHistoryItem {
  id: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | string; // Use union type for known statuses
  payment_type: 'installment' | 'outright' | string;
  payment_reference: string;
  gateway_reference: string | null;
  proof_url: string | null;
  applied_to: AppliedTo;
  error_message: string | null;
  created_at: string; // ISO 8601 string date
  paid_at: string | null; // ISO 8601 string date
  approved_at: string | null; // ISO 8601 string date
  updated_at: string; // ISO 8601 string date
  purchase: Purchase;
}


// --- Root Response Metadata Interfaces ---

/**
 * Represents the pagination details.
 */
export interface Pagination {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Represents the count and total amount for a specific status (e.g., paid, pending).
 */
export interface StatusDetail {
  count: number;
  total_amount: number;
}

/**
 * Represents the overall summary of payments.
 */
export interface Summary {
  total_payments: number;
  total_amount: number;
  status_breakdown: {
    pending: StatusDetail;
    paid: StatusDetail;
    [key: string]: StatusDetail; // Allow for other statuses dynamically
  };
  method_breakdown: {
    bank_transfer: StatusDetail;
    paystack: StatusDetail;
    [key: string]: StatusDetail; // Allow for other methods dynamically
  };
}


// --- Root Response Interface ---

/**
 * The root interface for the entire API response object.
 */
export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: PaymentHistoryItem[];
  pagination: Pagination;
  summary: Summary;
}

