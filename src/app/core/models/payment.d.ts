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
