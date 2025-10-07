import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { Property, UnitType } from 'src/app/core/models/properties';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';


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
    NzUploadModule
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
  selectedPlan: any | null = null;
  selectedPaymentMethod: number | null = null;

  isUnitModalVisible = false;
  isPlanModalVisible = false;
  isPaymentMethodModalVisible = false;
  isBankTransferModalVisible = false;
  isBankChequeModalVisible = false;
  isPaymentSuccessModalVisible = false;
  isLoading = false;

  selectedFile: File | null = null;

  showUnitModal(): void {
    this.isUnitModalVisible = true;
    this.selectedUnitNumber = null; // Reset selection when modal opens
  }


  handleUnitOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedUnitNumber);
    setTimeout(() => {
      this.isUnitModalVisible = false;
      this.isLoading = false;
      this.isPlanModalVisible = true;
    }, 1000);
  }

  handlePlanOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPlan);
    setTimeout(() => {
      this.isPlanModalVisible = false;
      this.isLoading = false;
      this.isPaymentMethodModalVisible = true;
    }, 1000);
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
    }, 1000);
  }

  handleBankTransferOk(): void {
    this.isLoading = true;
    console.log('Clicked OK', this.selectedPaymentMethod);
    setTimeout(() => {
      this.isBankTransferModalVisible = false;
      this.isLoading = false;
      this.isPaymentSuccessModalVisible = true;
    }, 1000);
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
    setTimeout(() => {
      this.isPaymentSuccessModalVisible = false;
      this.isLoading = false;
    }, 1000);
  }

  handleCancel(): void {
    this.isUnitModalVisible = false;
    this.isPlanModalVisible = false;
    this.isPaymentMethodModalVisible = false;
    this.isBankTransferModalVisible = false;
    this.isBankChequeModalVisible = false;
    this.isPaymentSuccessModalVisible = false;
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute, 
    private router: Router,
    private propertiesService: PropertiesService,
    private notificationService: NzNotificationService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.loadProperty(this.id);
      }
    });
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
      this.message.success(`File selected: ${file.name}`);
      
      // Proceed with upload or other processing...
    } else {
      this.selectedFile = null;
      this.message.info('No file selected.');
    }
  }


}
