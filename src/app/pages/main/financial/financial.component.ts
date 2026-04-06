import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PaymentHistoryFilters, PaymentHistoryItem, PaymentSummary } from 'src/app/core/models/payment';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

type PaymentSortBy = NonNullable<PaymentHistoryFilters['sort_by']>;

@Component({
  selector: 'app-financial',
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NzTableModule,
    NzSelectModule,
    NzInputModule,
    NzPaginationModule
  ],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.css'
})
export class FinancialComponent {
  readonly statusOptions = ['pending', 'paid', 'approved', 'failed', 'cancelled', 'processing'];
  readonly methodOptions = ['paystack', 'bank_transfer', 'bank_deposit'];
  readonly sortByOptions: PaymentSortBy[] = [
    'created_at',
    'amount',
    'status',
    'method',
    'paid_at',
    'approved_at'
  ];

  paymentSummary: PaymentSummary | null = null;
  paymentHistory: PaymentHistoryItem[] = [];
  isLoading = false;

  filters: PaymentHistoryFilters = {
    status: '',
    method: '',
    purchase_id: '',
    from_date: '',
    to_date: '',
    sort_by: 'created_at',
    sort_order: 'DESC'
  };

  pageIndex = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(page: number = this.pageIndex): void {
    this.isLoading = true;
    this.pageIndex = page;

    this.paymentService.getPaymentHistory(
      this.pageIndex,
      this.pageSize,
      this.filters.sort_by || 'created_at',
      this.filters.sort_order || 'DESC',
      this.filters
    ).subscribe({
      next: (response) => {
        this.paymentHistory = response.data;
        this.paymentSummary = response.summary;
        this.pageIndex = response.pagination.current_page;
        this.pageSize = response.pagination.per_page;
        this.totalItems = response.pagination.total_items;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading payment history:', error);
      }
    });
  }

  applyFilters(): void {
    this.loadPaymentHistory(1);
  }

  resetFilters(): void {
    this.filters = {
      status: '',
      method: '',
      purchase_id: '',
      from_date: '',
      to_date: '',
      sort_by: 'created_at',
      sort_order: 'DESC'
    };
    this.loadPaymentHistory(1);
  }

  onPageIndexChange(page: number): void {
    this.loadPaymentHistory(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.loadPaymentHistory(1);
  }

  get statusKeys(): string[] {
    return Object.keys(this.paymentSummary?.status_breakdown || {});
  }

  get methodKeys(): string[] {
    return Object.keys(this.paymentSummary?.method_breakdown || {});
  }

  formatLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  openProof(url: string | null): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
