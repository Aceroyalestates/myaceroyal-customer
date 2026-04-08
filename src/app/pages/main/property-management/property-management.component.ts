import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

type PortfolioFilter = 'all' | 'needs_form' | 'submitted_form' | 'in_payment' | 'fully_paid';

interface PortfolioItem {
  purchaseId: string;
  purchase: any | null;
  form: any | null;
  property: any | null;
  unit: any | null;
}

@Component({
  selector: 'app-property-management',
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './property-management.component.html',
  styleUrl: './property-management.component.css',
})
export class PropertyManagementComponent {
  isLoading = false;
  purchases: any[] = [];
  purchaseForms: any[] = [];
  propertyFormStats: Record<string, unknown> | null = null;
  emptyArray: any[] = new Array(8).fill('');
  selectedFilter: PortfolioFilter = 'all';
  mobileFilterSheetOpen = false;

  readonly portfolioFilters: Array<{ key: PortfolioFilter; label: string }> = [
    { key: 'all', label: 'All Properties' },
    { key: 'needs_form', label: 'Form In Progress' },
    { key: 'submitted_form', label: 'Form Submitted' },
    { key: 'in_payment', label: 'Payment In Progress' },
    { key: 'fully_paid', label: 'Fully Paid' }
  ];

  constructor(
    private location: Location,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  back(): void {
    this.location.back();
  }

  setFilter(filter: PortfolioFilter): void {
    this.selectedFilter = filter;
    this.mobileFilterSheetOpen = false;
  }

  openMobileFilters(): void {
    this.mobileFilterSheetOpen = true;
  }

  closeMobileFilters(): void {
    this.mobileFilterSheetOpen = false;
  }

  get activeFilterLabel(): string {
    return this.portfolioFilters.find((filter) => filter.key === this.selectedFilter)?.label || 'Filters';
  }

  loadPortfolio(): void {
    this.isLoading = true;

    forkJoin({
      purchases: this.paymentService.getPurchases(),
      propertyForms: this.paymentService.getpropertyForms(),
      statistics: this.paymentService.getPropertyFormStatistics()
    }).subscribe({
      next: ({ purchases, propertyForms, statistics }: any) => {
        this.purchases = purchases?.data || [];
        this.purchaseForms = propertyForms?.data || [];
        this.propertyFormStats = statistics?.data || null;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading property portfolio:', error);
        this.isLoading = false;
      }
    });
  }

  get portfolioItems(): PortfolioItem[] {
    const formMap = new Map<string, any>(
      this.purchaseForms
        .filter((form) => !!form?.purchase_id)
        .map((form) => [form.purchase_id, form])
    );

    const purchaseItems: PortfolioItem[] = this.purchases.map((purchase) => ({
      purchaseId: purchase.id,
      purchase,
      form: formMap.get(purchase.id) || null,
      property: purchase?.unit?.property || null,
      unit: purchase?.unit || null
    }));

    const purchaseIds = new Set(purchaseItems.map((item) => item.purchaseId));

    const formOnlyItems: PortfolioItem[] = this.purchaseForms
      .filter((form) => form?.purchase_id && !purchaseIds.has(form.purchase_id))
      .map((form) => ({
        purchaseId: form.purchase_id,
        purchase: form.purchase || null,
        form,
        property: form.property || form.purchase?.unit?.property || null,
        unit: form.unit || form.purchase?.unit || null
      }));

    return [...purchaseItems, ...formOnlyItems];
  }

  get filteredPortfolioItems(): PortfolioItem[] {
    return this.portfolioItems.filter((item) => {
      switch (this.selectedFilter) {
        case 'needs_form':
          return this.needsFormCompletion(item);
        case 'submitted_form':
          return this.hasSubmittedForm(item);
        case 'in_payment':
          return this.isPaymentInProgress(item);
        case 'fully_paid':
          return this.isFullyPaid(item);
        default:
          return true;
      }
    });
  }

  get summaryCards(): Array<{ label: string; value: number }> {
    const stats = this.normalizedStats;
    return [
      { label: 'Portfolio Properties', value: stats.totalProperties },
      { label: 'Forms In Progress', value: stats.formsInProgress },
      { label: 'Payment In Progress', value: stats.paymentInProgress },
      { label: 'Fully Paid', value: stats.fullyPaid }
    ];
  }

  getFilterCount(filter: PortfolioFilter): number {
    if (filter === 'all') {
      return this.portfolioItems.length;
    }
    return this.portfolioItems.filter((item) => {
      switch (filter) {
        case 'needs_form':
          return this.needsFormCompletion(item);
        case 'submitted_form':
          return this.hasSubmittedForm(item);
        case 'in_payment':
          return this.isPaymentInProgress(item);
        case 'fully_paid':
          return this.isFullyPaid(item);
        default:
          return true;
      }
    }).length;
  }

  gotoPurchaseForm(purchaseId: string, purchaseForm?: any): void {
    this.router.navigate([`/main/subscription/${purchaseId}`], {
      state: {
        purchaseForm
      }
    });
  }

  gotoPropertyDetails(purchaseId: string): void {
    this.router.navigate([`/main/property-management/view/${purchaseId}`]);
  }

  needsFormCompletion(item: PortfolioItem): boolean {
    return item.form?.form_status !== 'submitted';
  }

  hasSubmittedForm(item: PortfolioItem): boolean {
    return item.form?.form_status === 'submitted';
  }

  isPaymentInProgress(item: PortfolioItem): boolean {
    return item.purchase?.status === 'in-progress';
  }

  isFullyPaid(item: PortfolioItem): boolean {
    return item.purchase?.status === 'completed';
  }

  getPropertyName(item: PortfolioItem): string {
    return item.property?.title || item.property?.name || item.form?.property_title || 'Untitled Property';
  }

  getPropertyLocation(item: PortfolioItem): string {
    return item.property?.location || item.purchase?.unit?.property?.location || 'N/A';
  }

  getPropertySubtitle(item: PortfolioItem): string {
    return (
      item.property?.location ||
      item.property?.address ||
      item.purchase?.unit?.property?.location ||
      item.purchase?.unit?.property?.address ||
      item.form?.property?.location ||
      item.form?.property?.address ||
      ''
    );
  }

  getPropertyImage(item: PortfolioItem): string {
    return (
      item.property?.image ||
      item.property?.images?.[0]?.url ||
      item.form?.property?.image ||
      item.form?.property?.images?.[0]?.url ||
      item.property?.property_images?.[0]?.image_url ||
      item.form?.property?.property_images?.[0]?.image_url ||
      item.purchase?.unit?.property?.property_images?.[0]?.image_url ||
      ''
    );
  }

  getPropertyInitials(item: PortfolioItem): string {
    return this.getPropertyName(item)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('');
  }

  getPurchaseAmount(item: PortfolioItem): number {
    return Number(item.purchase?.total_price || item.form?.amount_paid || 0);
  }

  getInitialDueAmount(item: PortfolioItem): number {
    return Number(item.purchase?.initial_payment_due || item.form?.amount_paid || 0);
  }

  getQuantity(item: PortfolioItem): number {
    return Number(item.purchase?.quantity || item.property?.quantity_bought || 0);
  }

  getPaymentType(item: PortfolioItem): string {
    const data = item.purchase || item.form;
    if (data?.payment_type) {
      return data.payment_type === 'installment' ? 'Installment' : 'Outright';
    }
    if (data?.plan || data?.plan_id || data?.purchase?.plan) {
      return 'Installment';
    }
    return 'Outright';
  }

  getPaymentMode(item: PortfolioItem): string {
    const method = item.purchase?.payment_method || item.form?.payment_method || item.form?.purchase?.payment_method;
    if (!method) {
      return 'N/A';
    }
    if (method === 'cheque') {
      return 'Bank Draft';
    }
    return method.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  getPaymentStatus(item: PortfolioItem): string {
    const status = item.purchase?.status || 'draft';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  formatNaira(amount: number): string {
    if (!Number.isFinite(amount)) {
      return '₦0';
    }

    const absoluteAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absoluteAmount >= 1_000_000_000) {
      const value = absoluteAmount / 1_000_000_000;
      return `${sign}₦${this.formatCompactValue(value)}b`;
    }

    if (absoluteAmount >= 1_000_000) {
      const value = absoluteAmount / 1_000_000;
      return `${sign}₦${this.formatCompactValue(value)}m`;
    }

    return `${sign}₦${absoluteAmount.toLocaleString('en-NG')}`;
  }

  getFormStatus(item: PortfolioItem): string {
    const status = item.form?.form_status || 'draft';
    return status
      .split('_')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getFormStatusClass(item: PortfolioItem): string {
    const status = item.form?.form_status;
    if (status === 'submitted') {
      return 'status-pill status-pill--success';
    }
    if (status === 'rejected') {
      return 'status-pill status-pill--danger';
    }
    return 'status-pill status-pill--warning';
  }

  getPaymentStatusClass(item: PortfolioItem): string {
    if (this.isFullyPaid(item)) {
      return 'status-pill status-pill--success';
    }
    if (this.isPaymentInProgress(item)) {
      return 'status-pill status-pill--warning';
    }
    return 'status-pill';
  }

  getStatusMessage(item: PortfolioItem): string {
    if (item.form?.form_status === 'submitted') {
      return 'Subscription form submitted. Awaiting internal review.';
    }

    if (item.purchase?.payment_method === 'paystack' && item.purchase?.status === 'in-progress') {
      return 'Paystack checkout was started but not completed.';
    }

    if ((item.purchase?.payment_method === 'bank_transfer' || item.purchase?.payment_method === 'bank_draft' || item.purchase?.payment_method === 'cheque') && item.purchase?.status === 'in-progress') {
      return 'Offline payment is still being reviewed by the finance team.';
    }

    if (item.form?.form_status === 'draft') {
      return 'Your subscription form is still in progress.';
    }

    return 'View this property to see full payment and ownership details.';
  }

  private get normalizedStats(): {
    totalProperties: number;
    formsInProgress: number;
    submittedForms: number;
    paymentInProgress: number;
    fullyPaid: number;
  } {
    const stats = this.propertyFormStats || {};
    const statusDistribution = this.readRecord(stats, 'statusDistribution')
      || this.readRecord(stats, 'status_distribution')
      || this.readRecord(stats, 'formStatusDistribution')
      || this.readRecord(stats, 'form_status_distribution')
      || this.readRecord(stats, 'formStatuses')
      || {};

    const totalProperties = this.readNumber(stats, [
      'totalProperties',
      'total_properties',
      'totalForms',
      'total_forms',
      'total'
    ]) ?? this.portfolioItems.length;

    const submittedForms = this.readNumber(statusDistribution, ['submitted']) ?? this.portfolioItems.filter((item) => this.hasSubmittedForm(item)).length;
    const draftForms = this.readNumber(statusDistribution, ['draft']) ?? this.portfolioItems.filter((item) => item.form?.form_status === 'draft').length;
    const rejectedForms = this.readNumber(statusDistribution, ['rejected']) ?? this.portfolioItems.filter((item) => item.form?.form_status === 'rejected').length;
    const formsInProgress = this.readNumber(stats, ['formsInProgress', 'forms_in_progress'])
      ?? draftForms + rejectedForms;

    const paymentInProgress = this.readNumber(stats, ['paymentInProgress', 'payment_in_progress'])
      ?? this.portfolioItems.filter((item) => this.isPaymentInProgress(item)).length;

    const fullyPaid = this.readNumber(stats, ['fullyPaid', 'fully_paid', 'completedPurchases', 'completed_purchases'])
      ?? this.portfolioItems.filter((item) => this.isFullyPaid(item)).length;

    return {
      totalProperties,
      formsInProgress,
      submittedForms,
      paymentInProgress,
      fullyPaid
    };
  }

  private readRecord(source: Record<string, unknown>, key: string): Record<string, unknown> | null {
    const value = source?.[key];
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  }

  private formatCompactValue(value: number): string {
    const rounded = value >= 10 ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace(/\.0$/, '');
  }

  private readNumber(source: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const value = source?.[key];
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
      }
      if (value && typeof value === 'object' && 'count' in (value as Record<string, unknown>)) {
        const count = (value as Record<string, unknown>)['count'];
        if (typeof count === 'number') {
          return count;
        }
        if (typeof count === 'string' && count.trim() !== '' && !Number.isNaN(Number(count))) {
          return Number(count);
        }
      }
    }
    return null;
  }
}
