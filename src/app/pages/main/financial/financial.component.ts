import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { PaymentData, PaymentScheduleDashboard, PaymentSchedulesResponse, PaymentSummary } from 'src/app/core/models/payment';
import { PaymentService } from 'src/app/core/services/payment.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-financial',
  imports: [
    CommonModule, 
    SharedModule, 
    RouterLink,
    NzTabsModule,
    NzTableModule
  ],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.css'
})
export class FinancialComponent {
stats: { title: string; value: string }[] = [
      { title: 'Total Amount Paid', value: '₦20,000,000' },
      { title: 'Total Installment Amount', value: 'N/A' },
      { title: 'Next installment', value: 'N/A' },
    ];

  paymentScheduleDashboard: PaymentScheduleDashboard | null = null;
  paymentSummary: PaymentSummary | null = null;
  paymentHistory: PaymentData[] = [];
  pendingPayments: PaymentData[] = [];
  completedPayments: PaymentData[] = [];
  isLoading: boolean = false;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadPaymentSchedules();
    this.getPaymentHistory();
  }

  pay(): void {
    // Implement payment logic here
    console.log('Payment initiated');
  }

  downloadReceipt(paymentId: string): void {
    // Implement receipt download logic here
    console.log(`Downloading receipt for payment ID: ${paymentId}`);
  }


  loadPaymentSchedules(): void {
    this.isLoading = true;
    this.paymentService.getPaymentSchedules().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.paymentScheduleDashboard = response.dashboard;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading payment schedules:', error);
      }
    });
  }

  getPaymentHistory(): void {
    this.isLoading = true;
    this.paymentService.getPaymentHistory().subscribe({
      next: (response) => {
        this.paymentHistory = response.data;
        this.paymentSummary = response.summary;
        this.pendingPayments = this.paymentHistory.filter(payment => payment.status === 'pending');
        this.completedPayments = this.paymentHistory.filter(payment => payment.status === 'paid');
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading payment history:', error);
      }
    });
  }
    
  }