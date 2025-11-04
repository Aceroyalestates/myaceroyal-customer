import { CommonModule, Location } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { Property } from 'src/app/core/types/general';
import { Properties } from 'src/app/core/constants';
import { ColumnDef } from '@tanstack/angular-table';
import { Router, RouterLink } from '@angular/router';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PaymentHistoryItem, PaymentHistoryResponse } from 'src/app/core/models/payment';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';


@Component({
  selector: 'app-property-management',
  imports: [
    CommonModule,
    SharedModule,
    NzTabsModule,
    RouterLink,
    NzPaginationModule
  ],
  templateUrl: './property-management.component.html',
  styleUrl: './property-management.component.css',
})
export class PropertyManagementComponent {
  properties: Property[] = Properties;
  columns: ColumnDef<Property>[] = [
      { accessorKey: 'name', header: 'Property Name' },
      { accessorKey: 'location', header: 'Location' },
      { accessorKey: 'propertyType', header: 'Property Type' },
      { accessorKey: 'unitType', header: 'Unit Type' },
      { accessorKey: 'quantity', header: 'Listings' },
      { accessorKey: 'price', header: 'Unit Price' },
    ];
    getRowLink = (row: Property) => `/property-management/view/${row.id}`;
    selectedproperty = signal<Property[]>([]);

    stats: { title: string; value: number }[] = [
      { title: 'Total Properties', value: 7 },
      { title: 'Developed Properties', value: 4 },
      { title: 'Land', value: 3 },
    ];

    pendingPayments = [
    {
      id: 1,
      image: 'https://i.pinimg.com/564x/eb/9b/f9/eb9bf9dc04cff1b6ecf32e8805e76a99.jpg',
      title: 'Luxury Apartment Complex',
      units: 2,
      amount: 500000,
      paymentOption: '2 Month Installment',
    },
    {
      id: 2,
      image: 'https://i.pinimg.com/564x/eb/9b/f9/eb9bf9dc04cff1b6ecf32e8805e76a99.jpg',
      title: 'Luxury Apartment Complex',
      units: 2,
      amount: 500000,
      paymentOption: '2 Month Installment',
    },
    {
      id: 3,
      image: 'https://png.pngtree.com/background/20250107/original/pngtree-luxurious-house-night-view-with-sufficient-light-picture-image_15538213.jpg',
      title: 'Commercial Office Tower',
      units: 5,
      amount: 2000000,
      paymentOption: '6 Month Installment',
    },
    {
      id: 4,
      image: 'https://png.pngtree.com/background/20250107/original/pngtree-luxurious-house-night-view-with-sufficient-light-picture-image_15538213.jpg',
      title: 'Suburban Family Homes',
      units: 3,
      amount: 750000,
      paymentOption: '3 Month Installment',
    },
  ];
  paymentHistory: any | null = null;
  inProgressPayments: PaymentHistoryItem[] | null = null;
  fullyPaidPayments: any[] | null = null;
  savedPayments: any[] | null = null;
  savedPagination: any | null = null;
  inProgressPagination: any | null = null;
  fullyPaidPagination: any | null = null;
  isLoading = false;
  inPaymentProperties: any[] = [];
  emptyArray: any[] = new Array(12).fill('');

    constructor(
      private location: Location,
      private router: Router,
      private paymentService: PaymentService
    ) {
      effect(() => {
        console.log('Selected property from table: ', this.selectedproperty());
      })
    }

    ngOnInit() {
      this.loadPendingPayments();
      this.loadPropertyForms();
      this.getPurchases();
    }

  back() {
    this.location.back();
  }

    handleSelectedData(selected: Property[]) {
        this.selectedproperty.set(selected);
        console.log(this.selectedproperty);
      }

    loadPendingPayments(): void {
      this.isLoading = true;
      this.paymentService.getUserPayments().subscribe({
        next: (response: any) => {
          console.log('Pending payments loaded:', response);
          this.paymentHistory = response;
          this.inProgressPayments = response.data.filter((payment: PaymentHistoryItem) => payment.purchase.status === 'in-progress');
          this.inProgressPagination = response.pagination;
          // this.fullyPaidPayments = response.data.filter((payment: PaymentHistoryItem) => payment.status === 'paid');
          // this.savedPayments = response.data.filter((payment: PaymentHistoryItem) => payment.status === 'saved');
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading pending payments:', error);
          this.isLoading = false;
        }
      });
    }

    loadPropertyForms(): void {
      this.isLoading = true;
      this.paymentService.getpropertyForms().subscribe({
        next: (response: any) => {
          console.log('Property forms loaded:', response);
          this.savedPayments = response.data;
          this.savedPagination = response.pagination;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading property forms:', error);
          this.isLoading = false;
        }
      });
    }

    getPurchases(): void {
      this.isLoading = true;
      this.paymentService.getPurchases().subscribe({
        next: (response: any) => {
          console.log('Purchases loaded:', response);
          this.fullyPaidPayments = response.data.filter((purchase: any) => purchase.status === 'completed');
          this.fullyPaidPagination = response.pagination;
          this.inPaymentProperties = response.data.filter((purchase: any) => purchase.status === 'in-progress');
          console.log('In-payment properties:', this.inPaymentProperties);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading purchases:', error);
          this.isLoading = false;
        }
      });
    }

    // onSavedPageChange($event)
    onSavedPageChange(page: number): void {
      this.isLoading = true;
      this.paymentService.getpropertyForms(page).subscribe({
        next: (response: any) => {
          console.log('Property forms loaded for page', page, ':', response);
          this.savedPayments = response.data;
          this.savedPagination = response.pagination;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading property forms for page', page, ':', error);
          this.isLoading = false;
        }
      });
    }

    onInProgressPageChange(page: number): void {
      this.isLoading = true;
      this.paymentService.getUserPayments(undefined, undefined, undefined, undefined, undefined, page).subscribe({
        next: (response: any) => {
          console.log('In-progress payments loaded for page', page, ':', response);
          this.inProgressPayments = response.data.filter((payment: PaymentHistoryItem) => payment.purchase.status === 'in-progress');
          this.inProgressPagination = response.pagination;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading in-progress payments for page', page, ':', error);
          this.isLoading = false;
        }
      });
    }

    onFullyPaidPageChange(page: number): void {
      this.isLoading = true;
      this.paymentService.getPurchases(page).subscribe({
        next: (response: any) => {
          console.log('Fully paid purchases loaded for page', page, ':', response);
          this.fullyPaidPayments = response.data.filter((purchase: any) => purchase.status === 'completed');
          this.fullyPaidPagination = response.pagination;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading fully paid purchases for page', page, ':', error);
          this.isLoading = false;
        }
      });
    }

    gotoPurchaseForm(purchaseId: string): void {
      this.router.navigate([`/main/subscription/${purchaseId}`]);
    }
    
}
