import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { Property } from 'src/app/core/models/properties';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PaymentService } from 'src/app/core/services/payment.service';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, tap, map } from 'rxjs/operators';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DefaultBankAccount, StartOfflinePurchasePayload } from 'src/app/core/models/payment';
import { NgxCurrencyDirective } from "ngx-currency";
import { ImageService } from 'src/app/core/services/image.service';
import { ImageUploadApiResponse } from 'src/app/core/models/images';



@Component({
  selector: 'app-view-property',
  imports: [
    CommonModule, 
    SharedModule, 
    NzTabsModule, 
    NzModalModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzRadioModule,
    NzUploadModule,
    NzSpinModule,
    NzSwitchModule,
    NgxCurrencyDirective,
  ],
  templateUrl: './view-property.component.html',
  styleUrl: './view-property.component.css'
})
export class ViewPropertyComponent {
  id: string | null = null;
  property: Property | null = null;
  loading = false;
  error: string | null = null;
  selectedIndex = 0;
  selectedUnit: any;
  availableUnitNumber: number[] = [];
  selectedUnitNumber: number | null = null;
  selectedPlan: any = '1';
  selectedPaymentMethod: number | null = null;
  defaultBankAccounts: DefaultBankAccount[] = [];

  isUnitModalVisible = false;
  isPlanModalVisible = false;
  isPaymentMethodModalVisible = false;
  isBankTransferModalVisible = false;
  isBankChequeModalVisible = false;
  isPaymentSuccessModalVisible = false;
  isLoading = false;
  totalAmount = 0;
  discountAmount = 0;
  finalAmount = 0;

  // user-entered custom payment amount (optional)
  enteredAmount: number | null = null;

  selectedFile: File | null = null;
  refCode = '';
  couponCode = '';
  validatedRefCode = '';
  // Realtor/coupon validation state
  realtorLoading = false;
  realtorResult: { name?: string; email?: string } | null = null;
  realtorError: string | null = null;
  realtorAccepted = false;

  // whether the user wants the realtor to manage the property
  realtorManage = false;

  couponLoading = false;
  couponResult: any = null;
  couponResponse: any = null; // full response from coupon validation
  couponError: string | null = null;
  discountAmountNumber: number | null = null;
  couponAccepted = false;

  proofUrl = '';

  private refCode$ = new Subject<string>();
  private couponCode$ = new Subject<string>();
  private subs = new Subscription();

  showUnitModal(): void {
    this.isUnitModalVisible = true;
    this.selectedUnitNumber = null; // Reset selection when modal opens
  }


  handleUnitOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedUnitNumber);
    this.totalAmount = (this.selectedUnit?.price || 0) * (this.selectedUnitNumber || 1);
    setTimeout(() => {
      this.isUnitModalVisible = false;
      this.isLoading = false;
      this.isPlanModalVisible = true;
    }, 500);
  }

  handlePlanOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPlan);
    setTimeout(() => {
      this.isPlanModalVisible = false;
      this.isLoading = false;
      this.isPaymentMethodModalVisible = true;
    }, 500);
  }

  handlePaymentMethodOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    console.log('Typeof selectedPaymentMethod:', typeof this.selectedPaymentMethod);
    setTimeout(() => {
      this.isPaymentMethodModalVisible = false;
      this.isLoading = false;
      if (this.selectedPaymentMethod === 1) {
        this.isBankTransferModalVisible = true;
      } else if (this.selectedPaymentMethod === 3) {
        this.isBankChequeModalVisible = true;
      } else if (this.selectedPaymentMethod === 2) {
        this.isPaymentSuccessModalVisible = true;
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
    this.isUnitModalVisible = false;
    this.isPlanModalVisible = false;
    this.isPaymentMethodModalVisible = false;
    this.isBankTransferModalVisible = false;
    this.isBankChequeModalVisible = false;
    this.isPaymentSuccessModalVisible = false;
    this.isLoading = false;
    this.selectedUnitNumber = null;
    this.selectedPlan = '1';
    this.selectedPaymentMethod = null;
    this.refCode = '';
    this.couponCode = '';
    this.realtorAccepted = false;
    this.couponAccepted = false;
    this.discountAmountNumber = null;
    this.totalAmount = 0;
    this.finalAmount = 0;
    this.enteredAmount = null;
    this.realtorResult = null;
    this.realtorError = null;
    this.couponResult = null;
    this.couponError = null;
    this.couponResponse = null;
    this.discountAmount = 0;
    this.selectedFile = null;
    this.proofUrl = '';
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute, 
    private router: Router,
    private propertiesService: PropertiesService,
    private notificationService: NzNotificationService,
    private paymentService: PaymentService,
    private message: NzMessageService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.loadProperty(this.id);
      }
    });

    // listen to referral code changes (debounced) and validate when length >= 5
      const refSub = this.refCode$
        .pipe(
          debounceTime(1200),
          distinctUntilChanged(),
          filter((v) => (v || '').toString().trim().length > 0),
          tap(() => {
            this.realtorLoading = true;
            this.realtorError = null;
            this.realtorResult = null;
          }),
          switchMap((code) =>
            this.paymentService.getRealtorByRefCode(code).pipe(
              map((res) => res.data ?? null),
              catchError((err) => {
                console.error('Realtor lookup error', err);
                this.realtorError = 'Failed to validate referral code';
                return of(null);
              })
            )
          )
        )
        .subscribe((data) => {
          this.realtorLoading = false;
          if (data) {
            this.realtorResult = data;
          } else if (!this.realtorError) {
            this.realtorError = 'No realtor found for this code';
          }
        });

    const couponSub = this.couponCode$
      .pipe(
        // wait a bit longer (a few seconds of idle typing) before validating
        debounceTime(1200),
        distinctUntilChanged(),
        // allow any length but ignore empty values
        filter((v) => (v || '').toString().trim().length > 0),
        tap(() => {
          this.couponLoading = true;
          this.couponError = null;
          this.couponResult = null;
          this.discountAmountNumber = null;
        }),
        switchMap((code) =>
          this.paymentService.validateCoupon(code, this.totalAmount).pipe(
            catchError((err) => {
              console.error('Coupon validation error', err);
              this.couponError = 'Failed to validate coupon';
              return of(null);
            })
          )
        )
      )
      .subscribe((res: any) => {
        this.couponLoading = false;
        if (res && res.success) {
          this.couponResult = res.data.coupon;
          this.couponResponse = res.data; // Store the entire response
          console.log('Coupon validated:', res);
          // compute discount amount based on coupon type and selected unit price
          const base = (this.selectedUnit?.price || 0) * (this.selectedUnitNumber || 1);
          if (this.couponResult.discount_type === 'percent') {
            this.discountAmountNumber = Math.round((base * (this.couponResult.value || 0)) / 100);
          } else {
            this.discountAmountNumber = this.couponResult.value || 0;
          }
        } else if (!this.couponError) {
          this.couponError = (res && res.message) || 'Invalid coupon';
        }
      });

    this.subs.add(refSub);
    this.subs.add(couponSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  back() {
    this.location.back();
  }

  selectTab(unit: any): void {
    console.log('Selected tab:', unit);
    this.selectedUnit = unit;
    this.availableUnitNumber = Array.from({ length: unit.total_units }, (_, i) => i + 1);
    console.log('Available unit numbers:', this.availableUnitNumber);
  }

  loadProperty(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.propertiesService.getPropertyById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.loading = false;
        console.log('Property loaded:', property);
        if (property.property_units && property.property_units.length > 0) {
          this.selectedUnit = property.property_units[0];

        this.availableUnitNumber = Array.from({ length: this.selectedUnit.total_units }, (_, i) => i + 1);
        }
        console.log('Selected unit after load:', this.selectedUnit);
        this.getDefaultBankAccounts();
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load property details';
        console.error('Error loading property:', error);
      },
    });
  }
  bookInspection() {
    this.router.navigateByUrl(`main/explore/book/${this.property?.id}`);
  }
  generateLink(){
    this.router.navigateByUrl('new-user');
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

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.notificationService.success('',`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      this.notificationService.error('',`${info.file.name} file upload failed.`);
    }
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

  // called from template when refCode input changes
  onRefCodeChange(value: string): void {
    this.realtorAccepted = false;
      const v = (value || '').toString().trim();
      if (!v) {
        // clear state immediately when input is emptied
        this.realtorResult = null;
        this.realtorError = null;
        this.realtorLoading = false;
        return;
      }
      this.refCode$.next(v);
  }

  acceptRealtor(): void {
    if (!this.realtorResult) return;
    this.realtorAccepted = true;
    // this.notificationService.success('', `Realtor ${this.realtorResult.name} accepted`);
  }

  onCouponCodeChange(value: string): void {
    this.couponAccepted = false;
    const v = (value || '').toString().trim();
    if (!v) {
      // clear state immediately when input is emptied
      this.couponResult = null;
      this.couponError = null;
      this.couponLoading = false;
      this.discountAmountNumber = null;
      return;
    }
    this.couponCode$.next(v);
  }

  acceptCoupon(): void {
    if (!this.couponResult) return;
    this.couponAccepted = true;
    this.finalAmount = this.couponResponse.discount ? this.couponResponse.discounted_total : this.totalAmount;
    // this.notificationService.success('', `Coupon ${this.couponResponse.coupon.code} applied`);
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

  startOfflinePurchase(): void {
    if (!this.property || !this.selectedUnit || !this.selectedUnitNumber || !this.selectedPlan) {
      this.notificationService.error('Error', 'Please select unit, quantity, and plan before proceeding');
      return;
    }
    this.isLoading = true;

    const payload: StartOfflinePurchasePayload = {
      unit_id: this.selectedUnit.id,
      quantity: this.selectedUnitNumber,
      plan_id: this.selectedPlan === '1' ? undefined : parseInt(this.selectedPlan, 10),
      referral_code: this.realtorAccepted ? this.refCode : undefined,
      coupon_code: this.couponAccepted ? this.couponCode : undefined,
      amount_paid: this.selectedPlan === '1' ? this.finalAmount || this.totalAmount : 
        this.enteredAmount || (this.selectedUnit?.property_installment_plans[0].initial_amount * this.selectedUnitNumber!),
      proof_url: this.proofUrl,
    };

    console.log('Initiating offline purchase with payload:', payload);

    this.paymentService.initiateOfflinePurchase(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Offline purchase initiated successfully:', res);
        this.notificationService.success('Success', 'Purchase initiated. Awaiting approval.');
        // Close all modals and reset state as needed
        this.handleCancel();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error initiating offline purchase:', err);
        const errMsg = err?.error?.message || 'Failed to initiate offline purchase';
        this.notificationService.error('Error', errMsg);
      }
    });
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

  initiatePurchase(): void {
    if (!this.proofUrl) {
      this.message.error('Please upload proof of payment before proceeding.');
      return;
    }
    this.startOfflinePurchase();
  }
}
