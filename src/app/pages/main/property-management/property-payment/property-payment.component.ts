import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ContinueOfflinePurchasePayload, ContinueOnlinePurchasePayload, DefaultBankAccount, PaymentData } from 'src/app/core/models/payment';
import { FormsModule } from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ImageService } from 'src/app/core/services/image.service';
import { ImageUploadApiResponse } from 'src/app/core/models/images';
import { Property } from 'src/app/core/models/properties';
import type { ImageSliderItem } from 'src/app/shared/components/image-slider/image-slider.component';

@Component({
  selector: 'app-property-payment',
  imports: [
    CommonModule,
    SharedModule,
    NzModalModule,
    FormsModule,
    NgxCurrencyDirective,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzRadioModule,
    NzTabsModule
  ],
  templateUrl: './property-payment.component.html',
  styleUrl: './property-payment.component.css'
})
export class PropertyPaymentComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();
  propertyPurchaseDetails: any = null;
  isPaymentMethodModalVisible = false;
  enteredAmount: number | null = null;
  currentSchedule: any = null;
  selectedPaymentMethod: number | null = null;
  isLoading = false;
  isBankTransferModalVisible = false;
  isBankChequeModalVisible = false;
  isPaymentSuccessModalVisible = false;
  finalAmount: number | null = null;
  selectedFile: File | null = null;
  proofUrl: string = '';
  defaultBankAccounts: DefaultBankAccount[] = [];
  schedules: any[] = [];
  property: any = null;
  propertyDetails: Property | null = null;
  purchaseSummary: any = null;
  paymentHistory: PaymentData[] = [];
  isLoadingPaymentHistory = false;
  propertyImages: ImageSliderItem[] = [];
  currentImageIndex = 0;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private propertyService: PropertiesService,
    private notificationService: NzNotificationService,
        private message: NzMessageService,
        private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getPurchaseDetails(this.id!);
    this.getDefaultBankAccounts();
  }

  showPaymentMethodModal(schedule: any): void {
    this.currentSchedule = schedule;
    this.finalAmount = this.getScheduleOutstandingAmount(schedule);
    console.log('Selected schedule for payment:', schedule);
    this.isPaymentMethodModalVisible = true;
  }

  handlePaymentMethodOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    console.log('Typeof selectedPaymentMethod:', typeof this.selectedPaymentMethod);
    setTimeout(() => {
      this.finalAmount = this.enteredAmount == 0 ? this.finalAmount : this.enteredAmount;
      console.log('Final amount for payment:', this.finalAmount);
      this.isPaymentMethodModalVisible = false;
      this.isLoading = false;
      if (this.selectedPaymentMethod === 1) {
        this.isBankTransferModalVisible = true;
      } else if (this.selectedPaymentMethod === 3) {
        this.isBankChequeModalVisible = true;
      } else if (this.selectedPaymentMethod === 2) {
        this.startOnlinePurchase();
      }
    }, 500);
  }

    handleBankTransferOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    setTimeout(() => {
      this.isBankTransferModalVisible = false;
      this.isLoading = false;
      this.isPaymentSuccessModalVisible = true;
    }, 500);
  }

  handleBankChequeOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    setTimeout(() => {
      this.isBankChequeModalVisible = false;
      this.isLoading = false;
      this.isPaymentSuccessModalVisible = true;
    }, 1000);
  }

  handlePaymentSuccessOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    // setTimeout(() => {
    //   this.isPaymentSuccessModalVisible = false;
    //   this.isLoading = false;
    // }, 500);
    this.startOfflinePurchase();
  }

  handleCancel(): void {
    this.isPaymentMethodModalVisible = false;
    this.isBankTransferModalVisible = false;
    this.isBankChequeModalVisible = false;
    this.isPaymentSuccessModalVisible = false;
    this.isLoading = false;
    this.selectedPaymentMethod = null;
    this.finalAmount = 0;
    this.enteredAmount = null;
    // this.realtorResult = null;
    // this.realtorError = null;
    // this.couponResult = null;
    // this.couponError = null;
    // this.couponResponse = null;
    // this.discountAmount = 0;
    this.selectedFile = null;
    this.proofUrl = '';
  }

  getPurchaseDetails(purchaseId: string) {
    this.isLoading = true;
    this.paymentService.getPurchaseDetails(purchaseId).subscribe({
      next: (response) => {
        console.log('Purchase details:', response);
        this.propertyPurchaseDetails = response.data;
        this.loadPropertyDetails(response.data.unit.property.id);
        this.getPurchasePayments(purchaseId);
        this.preparePropertyImages();
        if (this.shouldLoadSchedules) {
          this.getUserSchedules(purchaseId);
        } else {
          this.schedules = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching purchase details:', error);
        this.isLoading = false;
      }
    });
  }

  loadPropertyDetails(propertyId: string): void {
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        this.propertyDetails = property;
      },
      error: (error) => {
        console.error('Error fetching full property details:', error);
        this.propertyDetails = null;
      }
    });
  }

  getUserSchedules(purchaseId: string) {
    this.isLoading = true;
    this.paymentService.getUserPurchaseSchedules(purchaseId).subscribe({
      next: (response) => {
        console.log('Payment schedules:', response);
        this.property = response.property;
        this.purchaseSummary = response.summary;
        this.schedules = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching payment schedules:', error);
        this.schedules = [];
        this.isLoading = false;
      }
    });
  }

  getPurchasePayments(purchaseId: string): void {
    this.isLoadingPaymentHistory = true;
    this.paymentService.getPaymentHistory(1, 10, 'created_at', 'DESC', { purchase_id: purchaseId }).subscribe({
      next: (response) => {
        this.paymentHistory = response?.data || [];
        this.isLoadingPaymentHistory = false;
      },
      error: (error) => {
        console.error('Error fetching purchase payment history:', error);
        this.paymentHistory = [];
        this.isLoadingPaymentHistory = false;
      }
    });
  }

  get shouldLoadSchedules(): boolean {
    return !!this.propertyPurchaseDetails?.plan_id;
  }

  get paymentTypeLabel(): string {
    if (!this.propertyPurchaseDetails) {
      return 'N/A';
    }

    return this.propertyPurchaseDetails.plan_id ? 'Installment' : 'Outright';
  }

  get paymentModeLabel(): string {
    return this.formatPaymentMethod(this.propertyPurchaseDetails?.payment_method);
  }

  get unitTypeLabel(): string {
    const rawValue = this.propertyPurchaseDetails?.unit?.unit_type?.name || this.propertyPurchaseDetails?.unit?.name;
    return this.formatDisplayValue(rawValue);
  }

  get purchaseStatusLabel(): string {
    return this.formatDisplayValue(this.propertyPurchaseDetails?.status);
  }

  get purchaseStatusClass(): string {
    const status = this.propertyPurchaseDetails?.status;
    if (status === 'completed') {
      return 'status-pill status-pill--success';
    }
    if (status === 'cancelled' || status === 'failed') {
      return 'status-pill status-pill--danger';
    }
    return 'status-pill status-pill--warning';
  }

  get hasPaymentHistory(): boolean {
    return this.paymentHistory.length > 0;
  }

  get hasInstallmentSchedule(): boolean {
    return this.shouldLoadSchedules && this.schedules.length > 0;
  }

  get purchaseBalanceDue(): number {
    return Number(this.propertyPurchaseDetails?.balance_due || this.purchaseSummary?.remainingBalance || 0);
  }

  get totalAmountPaid(): number {
    if (this.purchaseSummary?.totalAmountPaid != null) {
      return Number(this.purchaseSummary.totalAmountPaid);
    }

    if (this.paymentHistory.length > 0) {
      return this.paymentHistory.reduce((total, payment) => total + Number(payment.amount || 0), 0);
    }

    return Number(this.propertyPurchaseDetails?.total_price || 0) - this.purchaseBalanceDue;
  }

  get isOfflinePaymentMode(): boolean {
    const method = this.propertyPurchaseDetails?.payment_method;
    return method === 'bank_transfer' || method === 'cheque' || method === 'bank_draft' || method === 'bank_deposit';
  }

  get isPendingPaystackPayment(): boolean {
    return this.propertyPurchaseDetails?.payment_method === 'paystack' && this.propertyPurchaseDetails?.status === 'in-progress';
  }

  get outstandingAmount(): number {
    const balanceDue = Number(this.propertyPurchaseDetails?.balance_due || 0);
    if (balanceDue > 0) {
      return balanceDue;
    }

    return Number(
      this.propertyPurchaseDetails?.initial_payment_due
      || this.propertyPurchaseDetails?.total_price
      || 0
    );
  }

  get payableSchedules(): any[] {
    return [...this.schedules]
      .filter((schedule) => ['pending', 'partial', 'overdue'].includes(schedule.status))
      .sort((left, right) => {
        const statusRank = (status: string) => status === 'overdue' ? 0 : status === 'partial' ? 1 : 2;
        const statusDifference = statusRank(left.status) - statusRank(right.status);
        if (statusDifference !== 0) {
          return statusDifference;
        }

        return new Date(left.due_date).getTime() - new Date(right.due_date).getTime();
      });
  }

  get nextPayableSchedule(): any | null {
    return this.payableSchedules[0] ?? null;
  }

  get hasPaymentAction(): boolean {
    return !!this.nextPayableSchedule || this.isPendingPaystackPayment || this.isOfflinePaymentInReview;
  }

  get paymentActionTitle(): string {
    if (this.isOfflinePaymentInReview) {
      return 'Finance Review In Progress';
    }

    if (this.nextPayableSchedule?.status === 'overdue') {
      return 'Overdue Installment Payment';
    }

    if (this.nextPayableSchedule) {
      return 'Next Installment Payment';
    }

    if (this.isPendingPaystackPayment) {
      return 'Resume Pending Payment';
    }

    return 'Payment Management';
  }

  get paymentActionAmount(): number {
    if (this.nextPayableSchedule) {
      return this.getScheduleOutstandingAmount(this.nextPayableSchedule);
    }

    return this.outstandingAmount;
  }

  get paymentActionDescription(): string {
    if (this.isOfflinePaymentInReview) {
      return `Your ${this.paymentModeLabel.toLowerCase()} payment is currently under finance review. You can still check payment history or schedules for this property here.`;
    }

    if (this.nextPayableSchedule) {
      return `Installment ${this.nextPayableSchedule.installment_number} is ${this.formatDisplayValue(this.nextPayableSchedule.status)}. You can continue payment for this property from here.`;
    }

    if (this.isPendingPaystackPayment) {
      return 'Your Paystack checkout was started but not completed. You can restart payment for this property from here.';
    }

    return 'Manage payment actions for this property from here.';
  }

  get paymentActionStatusLabel(): string {
    if (this.isOfflinePaymentInReview) {
      return 'Under Review';
    }

    if (this.nextPayableSchedule?.status === 'overdue') {
      return 'Overdue';
    }

    if (this.nextPayableSchedule) {
      return this.formatDisplayValue(this.nextPayableSchedule.status);
    }

    if (this.isPendingPaystackPayment) {
      return 'Pending';
    }

    return this.paymentTypeLabel;
  }

  get paymentActionStatusClass(): string {
    if (this.isOfflinePaymentInReview) {
      return 'payment-action-card__badge payment-action-card__badge--warning';
    }

    if (this.nextPayableSchedule?.status === 'overdue') {
      return 'payment-action-card__badge payment-action-card__badge--danger';
    }

    if (this.nextPayableSchedule || this.isPendingPaystackPayment) {
      return 'payment-action-card__badge payment-action-card__badge--warning';
    }

    return 'payment-action-card__badge';
  }

  get paymentActionButtonLabel(): string {
    if (this.nextPayableSchedule) {
      return 'Make Payment';
    }

    if (this.isPendingPaystackPayment) {
      return 'Resume Paystack';
    }

    return 'View Payments';
  }

  get showSecondaryPaymentsButton(): boolean {
    return this.paymentActionButtonLabel !== 'View Payments';
  }

  get isOfflinePaymentInReview(): boolean {
    return this.isOfflinePaymentMode && this.propertyPurchaseDetails?.status === 'in-progress' && !this.nextPayableSchedule;
  }

  formatPaymentMethod(method: string | null | undefined): string {
    if (!method) {
      return 'N/A';
    }

    if (method === 'cheque') {
      return 'Bank Draft';
    }

    return method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatDisplayValue(value: string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }

    if (value === 'cheque') {
      return 'Bank Draft';
    }

    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  startOnlinePurchase(): void {
      
      this.isLoading = true;

      const payload: ContinueOnlinePurchasePayload = {
        amount: this.finalAmount!,
        purchase_id: this.currentSchedule.purchase_id,
      };
  
      console.log('Initiating online purchase with payload:', payload);
  
      this.paymentService.continueOnlinePurchase(payload).subscribe({
        next: (res) => {
          console.log('Online purchase initiated successfully:', res);
          if (res && res.data && res.data.authorization_url) {
            // Redirect user to payment gateway URL
            // window.location.href = res.data.session.data.authorization_url;
            window.open(res.data.authorization_url, '_blank');
          } else {
            this.notificationService.error('Error', 'Payment link not received');
          }
          // Close all modals and reset state as needed
          this.handleCancel();
          this.getUserSchedules(this.id!);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error initiating online purchase:', err);
          const errMsg = err?.error?.message || 'Failed to initiate payment';
          this.notificationService.error('Error', errMsg);
        }
      });
    }

    startOfflinePurchase(): void {
        
        this.isLoading = true;
    
        const payload: ContinueOfflinePurchasePayload = {
          amount: this.finalAmount!,
          purchase_id: this.currentSchedule.purchase_id,
          method: this.selectedPaymentMethod === 1 ? 'bank_transfer' : 'cheque',
          proof_url: this.proofUrl
        };
    
        console.log('Initiating offline purchase with payload:', payload);

        this.paymentService.continueOfflinePurchase(payload).subscribe({
          next: (res) => {
            this.isLoading = false;
            console.log('Offline purchase initiated successfully:', res);
            this.notificationService.info('Payment in review', 'Transaction submitted and currently under finance review.');
            // Close all modals and reset state as needed
            this.handleCancel();
            // navigate to subscription page
            // this.router.navigateByUrl('main/subscription');
            this.getUserSchedules(this.id!);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error initiating offline purchase:', err);
            const errMsg = err?.error?.message || 'Failed to initiate payment';
            this.notificationService.error('Error', errMsg);
          }
        });
      }

    getDefaultBankAccounts(): void {
    this.paymentService.getBankAccounts().subscribe({
      next: (res) => {
        this.defaultBankAccounts = res;
        console.log('Default bank accounts:', this.defaultBankAccounts);
      },
      error: (err) => {
        console.error('Error fetching bank accounts:', err);
        this.notificationService.error('Error', 'Failed to load bank accounts');
      }
    });
  }

  copyToClipboard(accountNumber: string): void {
    navigator.clipboard.writeText(accountNumber).then(() => {
      console.log('Account number copied to clipboard:', accountNumber);
      this.notificationService.success('', 'Account number copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      this.notificationService.error('Error', 'Could not copy account number');
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type;

      // Define allowed file types
      const isImage = fileType.startsWith('image/');
      const isPdf = fileType === 'application/pdf';

      // Validation 1: Check file type
      if (!isImage && !isPdf) {
        this.message.error('Invalid file type. Please select an Image (JPEG/PNG) or PDF.');
        input.value = ''; // Clear the input
        this.selectedFile = null;
        return;
      }

      // Validation 2: Check file size (e.g., max 1MB for both)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
          this.message.error('File size exceeds the limit (1MB max).');
          input.value = '';
          this.selectedFile = null;
          return;
      }
      
      // File is valid
      this.selectedFile = file;
      // this.message.success(`File selected: ${file.name}`);
      this.uploadProof();
      
      // Proceed with upload or other processing...
    } else {
      this.selectedFile = null;
      this.message.info('No file selected.');
    }
  }

  uploadProof(): void {
    if (!this.selectedFile) {
      this.message.error('Please select a file to upload as proof of payment.');
      return;
    }

      this.isLoading = true;
  
      this.imageService.uploadImage(this.selectedFile).subscribe({
        next: (uploadRes: ImageUploadApiResponse) => {
          console.log('Image uploaded successfully:', uploadRes);
          const url = uploadRes.data.file.secure_url;
          if (!url) {
            this.message.error('Failed to get uploaded image URL.');
            this.isLoading = false;
            return;
          }
          this.proofUrl = url;
          this.message.success('Proof of payment uploaded successfully.');
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Image upload error', err);
          this.message.error('Image upload failed');
          this.isLoading = false;
        }
      });
  }

  getScheduleOutstandingAmount(schedule: any): number {
    if (!schedule) {
      return 0;
    }

    const amountDue = Number(schedule.amount_due || 0);
    const amountPaid = Number(schedule.amount_paid || 0);

    if (schedule.status === 'partial' || schedule.status === 'overdue') {
      return Math.max(amountDue - amountPaid, 0);
    }

    return amountDue;
  }

  openPrimaryPaymentAction(): void {
    if (this.nextPayableSchedule) {
      this.showPaymentMethodModal(this.nextPayableSchedule);
      return;
    }

    if (this.isPendingPaystackPayment && this.id) {
      this.currentSchedule = {
        purchase_id: this.id,
        amount_due: this.outstandingAmount,
        amount_paid: this.totalAmountPaid,
        status: this.purchaseBalanceDue > 0 ? 'partial' : 'pending',
      };
      this.finalAmount = this.outstandingAmount;
      this.selectedPaymentMethod = 2;
      this.startOnlinePurchase();
      return;
    }

    this.goToPaymentsPage();
  }

  goToPaymentsPage(): void {
    this.router.navigate(['/main/financial-transactions']);
  }

  scrollToScheduleSection(): void {
    document.getElementById('payment-schedule-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

    private preparePropertyImages(): void {
    if (!this.propertyPurchaseDetails || !this.propertyPurchaseDetails.unit || !this.propertyPurchaseDetails.unit.property) {
      this.propertyImages = [];
      this.currentImageIndex = 0;
      return;
    }

    // If property has images, use them
    if (this.propertyPurchaseDetails.unit.property.property_images && this.propertyPurchaseDetails.unit.property.property_images.length > 0) {
      this.propertyImages = this.propertyPurchaseDetails.unit.property.property_images.map((img: any, index: number) => ({
        src: img.image_url,
        alt: `${this.propertyPurchaseDetails.unit.property.name} - Image ${index + 1}`,
        title: `${this.propertyPurchaseDetails.unit.property.name} - Image ${index + 1}`
      }));
      console.log('Prepared property images:', this.propertyImages);
    } else {
      // Fallback to default images
      this.propertyImages = [
        {
          src: 'images/property-image2.jpg',
          alt: `${this.property.name} - Property Image`,
          title: `${this.property.name} - Property Image`
        },
        {
          src: 'images/property-image3.jpg',
          alt: `${this.property.name} - Property Image`,
          title: `${this.property.name} - Property Image`
        },
        {
          src: 'images/property-image4.jpg',
          alt: `${this.property.name} - Property Image`,
          title: `${this.property.name} - Property Image`
        }
      ];
    }
    this.currentImageIndex = 0;
  }

  get currentImage(): ImageSliderItem | null {
    return this.propertyImages[this.currentImageIndex] ?? null;
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.propertyImages.length) {
      this.currentImageIndex = index;
    }
  }

  showPreviousImage(): void {
    if (this.propertyImages.length <= 1) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.propertyImages.length - 1
        : this.currentImageIndex - 1;
  }

  showNextImage(): void {
    if (this.propertyImages.length <= 1) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === this.propertyImages.length - 1
        ? 0
        : this.currentImageIndex + 1;
  }

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
