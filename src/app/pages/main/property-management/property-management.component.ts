import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

type PortfolioFilter = 'all' | 'forms' | 'payments';

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
  isLoadingMore = false;
  purchases: any[] = [];
  purchaseForms: any[] = [];
  propertyFormStats: Record<string, unknown> | null = null;
  emptyArray: any[] = new Array(8).fill('');
  selectedFilter: PortfolioFilter = 'all';
  filterSheetOpen = false;
  readonly portfolioPageSize = 12;
  purchasePage = 1;
  purchaseTotalPages = 1;
  purchaseTotalItems = 0;
  formPage = 1;
  formTotalPages = 1;
  formTotalItems = 0;

  readonly portfolioFilters: Array<{ key: PortfolioFilter; label: string }> = [
    { key: 'all', label: 'All Properties' },
    { key: 'forms', label: 'Subscription Forms' },
    { key: 'payments', label: 'Payments' }
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
    this.filterSheetOpen = false;
  }

  openFilters(): void {
    this.filterSheetOpen = true;
  }

  closeFilters(): void {
    this.filterSheetOpen = false;
  }

  get activeFilterLabel(): string {
    return this.portfolioFilters.find((filter) => filter.key === this.selectedFilter)?.label || 'Filters';
  }

  loadPortfolio(): void {
    this.isLoading = true;
    this.purchasePage = 1;
    this.purchaseTotalPages = 1;
    this.purchaseTotalItems = 0;
    this.formPage = 1;
    this.formTotalPages = 1;
    this.formTotalItems = 0;

    forkJoin({
      purchases: this.paymentService.getPurchases(1, this.portfolioPageSize),
      propertyForms: this.paymentService.getpropertyForms(1, this.portfolioPageSize),
      statistics: this.paymentService.getPropertyFormStatistics()
    }).subscribe({
      next: ({ purchases, propertyForms, statistics }: any) => {
        this.purchases = purchases?.data || [];
        this.purchaseForms = propertyForms?.data || [];
        this.propertyFormStats = statistics?.data || null;
        this.setPurchasePagination(purchases);
        this.setFormPagination(propertyForms);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading property portfolio:', error);
        this.isLoading = false;
      }
    });
  }

  loadMorePortfolio(): void {
    if (this.isLoadingMore || !this.hasMorePortfolioItems) {
      return;
    }

    const nextPurchasePage = this.hasMorePurchases ? this.purchasePage + 1 : null;
    const nextFormPage = this.hasMoreForms ? this.formPage + 1 : null;

    this.isLoadingMore = true;

    forkJoin({
      purchases: nextPurchasePage ? this.paymentService.getPurchases(nextPurchasePage, this.portfolioPageSize) : of(null),
      propertyForms: nextFormPage ? this.paymentService.getpropertyForms(nextFormPage, this.portfolioPageSize) : of(null)
    }).subscribe({
      next: ({ purchases, propertyForms }) => {
        if (purchases?.data) {
          this.purchases = this.mergeById(this.purchases, purchases.data);
          this.setPurchasePagination(purchases);
        }

        if (propertyForms?.data) {
          this.purchaseForms = this.mergeById(this.purchaseForms, propertyForms.data);
          this.setFormPagination(propertyForms);
        }

        this.isLoadingMore = false;
      },
      error: (error: any) => {
        console.error('Error loading more property portfolio items:', error);
        this.isLoadingMore = false;
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
        case 'forms':
          return !!item.form;
        case 'payments':
          return !!item.purchase;
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

  get hasMorePurchases(): boolean {
    return this.purchasePage < this.purchaseTotalPages;
  }

  get hasMoreForms(): boolean {
    return this.formPage < this.formTotalPages;
  }

  get hasMorePortfolioItems(): boolean {
    return this.hasMorePurchases || this.hasMoreForms;
  }

  getFilterCount(filter: PortfolioFilter): number {
    switch (filter) {
      case 'forms':
        return this.formTotalItems || this.portfolioItems.filter((item) => !!item.form).length;
      case 'payments':
        return this.purchaseTotalItems || this.portfolioItems.filter((item) => !!item.purchase).length;
      default:
        return Math.max(
          this.portfolioItems.length,
          this.purchaseTotalItems,
          this.formTotalItems
        );
    }
  }

  isFormsFilter(): boolean {
    return this.selectedFilter === 'forms';
  }

  isPaymentsFilter(): boolean {
    return this.selectedFilter === 'payments';
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

  formatUnitType(item: PortfolioItem): string {
    const rawValue = item.unit?.unit_type?.name || item.unit?.name || '';
    if (!rawValue) {
      return 'N/A';
    }

    return rawValue
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
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

  getCardMetaItems(item: PortfolioItem): Array<{ label: string; value: string | number }> {
    if (this.isPaymentsFilter()) {
      return [
        { label: 'Payment Type', value: this.getPaymentType(item) },
        { label: 'Payment Mode', value: this.getPaymentMode(item) }
      ];
    }

    return [
      { label: 'Units', value: this.getQuantity(item) },
      { label: 'Unit Type', value: this.formatUnitType(item) }
    ];
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
    if (this.isFormsFilter()) {
      return '';
    }

    if (this.isPaymentsFilter()) {
      if (item.purchase?.payment_method === 'paystack' && item.purchase?.status === 'in-progress') {
        return 'Paystack checkout was started but not completed.';
      }

      if ((item.purchase?.payment_method === 'bank_transfer' || item.purchase?.payment_method === 'bank_draft' || item.purchase?.payment_method === 'cheque') && item.purchase?.status === 'in-progress') {
        return 'Offline payment is still being reviewed by the finance team.';
      }

      if (this.isFullyPaid(item)) {
        return 'This property has been fully paid for.';
      }

      return 'Open this property to review payment progress and next steps.';
    }

    if (item.purchase?.status === 'completed') {
      return 'This property is fully paid and part of your portfolio.';
    }

    if (item.form?.form_status === 'submitted') {
      return '';
    }

    if (item.form?.form_status === 'draft') {
      return '';
    }

    return '';
  }

  shouldShowFormChip(): boolean {
    return this.isFormsFilter();
  }

  shouldShowPaymentChip(): boolean {
    return this.isPaymentsFilter();
  }

  shouldShowContinueForm(item: PortfolioItem): boolean {
    return this.isFormsFilter() && this.needsFormCompletion(item);
  }

  getContinueFormLabel(item: PortfolioItem): string {
    return item.form?.form_status === 'rejected' ? 'Update Form' : 'Continue Form';
  }

  private get normalizedStats(): {
    totalProperties: number;
    formsInProgress: number;
    submittedForms: number;
    paymentInProgress: number;
    fullyPaid: number;
  } {
    const stats = this.propertyFormStats || {};
    const totals = this.readRecord(stats, 'totals') || {};
    const statusDistribution = this.readRecord(stats, 'statusDistribution')
      || this.readRecord(stats, 'status_distribution')
      || this.readRecord(stats, 'formStatusDistribution')
      || this.readRecord(stats, 'form_status_distribution')
      || this.readRecord(stats, 'formStatuses')
      || {};

    const totalProperties = this.readNumber(stats, [
      'totalProperties',
      'total_properties',
      'total'
    ]) ?? Math.max(
      this.portfolioItems.length,
      this.purchaseTotalItems,
      this.formTotalItems
    );

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

  private mergeById(currentItems: any[], nextItems: any[]): any[] {
    const itemMap = new Map<string, any>();

    [...currentItems, ...nextItems].forEach((item) => {
      const key = item?.id || item?.purchase_id;
      if (key) {
        itemMap.set(key, item);
      }
    });

    return Array.from(itemMap.values());
  }

  private setPurchasePagination(response: any): void {
    const pagination = response?.pagination || {};
    this.purchasePage = this.readNumber(pagination, ['current_page', 'page']) ?? this.purchasePage;
    this.purchaseTotalPages = this.readNumber(pagination, ['total_pages', 'pages']) ?? this.purchaseTotalPages;
    this.purchaseTotalItems = this.readNumber(pagination, ['total_items', 'total']) ?? this.purchaseTotalItems;
  }

  private setFormPagination(response: any): void {
    const pagination = response?.pagination || {};
    this.formPage = this.readNumber(pagination, ['current_page', 'page']) ?? this.formPage;
    this.formTotalPages = this.readNumber(pagination, ['total_pages', 'pages']) ?? this.formTotalPages;
    this.formTotalItems = this.readNumber(pagination, ['total_items', 'total']) ?? this.formTotalItems;
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
