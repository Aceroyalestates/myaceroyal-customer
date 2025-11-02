import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzImage, NzImageModule, NzImageService } from 'ng-zorro-antd/image';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ContinueOfflinePurchasePayload, ContinueOnlinePurchasePayload, DefaultBankAccount, StartOnlinePurchasePayload } from 'src/app/core/models/payment';
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
import { ImageSliderComponent, ImageSliderItem } from 'src/app/shared/components/image-slider/image-slider.component';

@Component({
  selector: 'app-property-payment',
  imports: [
    CommonModule,
    SharedModule,
    RouterLink,
    NzImageModule,
    NzCarouselModule,
    NzModalModule,
    FormsModule,
    NgxCurrencyDirective,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzRadioModule,
    NzTabsModule,
    ImageSliderComponent
  ],
  templateUrl: './property-payment.component.html',
  styleUrl: './property-payment.component.css'
})
export class PropertyPaymentComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();
  propertyPurchaseDetails: any = null;
  images: NzImage[] = [];
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
  purchaseSummary: any = null;
  propertyImages: ImageSliderItem[] = [];
  sliderHeight = '300px';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private propertyService: PropertiesService,
    private nzImageService: NzImageService,
    private notificationService: NzNotificationService,
        private message: NzMessageService,
        private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getPurchaseDetails(this.id!);
    this.getUserSchedules(this.id!);
    this.getDefaultBankAccounts();
    
    // Set initial slider height based on screen size
    this.updateSliderHeight();
    
    // Listen for window resize events
    window.addEventListener('resize', this.updateSliderHeight.bind(this));
  }

  updateSliderHeight(): void {
    // 300px on mobile (< 768px), 550px from tablet and above
    this.sliderHeight = window.innerWidth >= 768 ? '550px' : '300px';
  }

  onImageChange(index: number): void {
    console.log('Image changed to index:', index);
  }

  onImageClick(image: ImageSliderItem): void {
    console.log('Image clicked:', image);
    // You can implement a lightbox or modal here if needed
  }

  showPaymentMethodModal(schedule: any): void {
    this.currentSchedule = schedule;
    this.finalAmount = schedule.status === 'partial' ? (schedule.amount_due - schedule.amount_paid) : schedule.amount_due;
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
        this.images = response.data.unit.property.property_images.map((img: any) => ({ src: img.image_url }));
        this.preparePropertyImages();
      },
      error: (error) => {
        console.error('Error fetching purchase details:', error);
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
        this.isLoading = false;
      }
    });
  }

  getProperty(propertyId: string) {
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (response: any) => {
        console.log('Property details:', response);
        this.property = response;
      },
      error: (error: any) => {
        console.error('Error fetching property details:', error);
      }
    }); 
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
            this.notificationService.success('Success', 'Payment initiated. Awaiting approval.');
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

    private preparePropertyImages(): void {
    if (!this.propertyPurchaseDetails || !this.propertyPurchaseDetails.unit || !this.propertyPurchaseDetails.unit.property) {
      this.propertyImages = [];
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
  }

  onClickImage(): void {
    this.nzImageService.preview(this.images, { nzZoom: 1.5, nzRotate: 0 });
  }

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
