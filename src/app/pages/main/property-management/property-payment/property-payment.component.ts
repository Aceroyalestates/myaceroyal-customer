import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzImage, NzImageModule, NzImageService } from 'ng-zorro-antd/image';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';

@Component({
  selector: 'app-property-payment',
  imports: [
    CommonModule,
    SharedModule,
    RouterLink,
    NzImageModule,
    NzCarouselModule
  ],
  templateUrl: './property-payment.component.html',
  styleUrl: './property-payment.component.css'
})
export class PropertyPaymentComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();
  property: any = {
      id: 1,
      image: 'https://www.maramani.com/cdn/shop/products/Duplex2bedroomapartment-ID24412-Perspective_1.jpg?v=1666854766&width=2048',
      title: 'Luxury Apartment Complex',
      units: 2,
      amount: 500000,
      paymentOption: '2 Month Installment',
    };
    propertyPurchaseDetails: any = null;
    images: NzImage[] = [];

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private propertyService: PropertiesService,
    private nzImageService: NzImageService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    // this.route.paramMap.subscribe(params => {
    //   this.id = params.get('id');
    //   console.log('Route ID:', this.id); // For debugging
    //   this.property = this.properties.find(p => p.id === Number(this.id)) || null;
    //   console.log({property: this.property})
    //   if (!this.property) {
    //     console.warn('Property not found for ID:', this.id);
    //   }
    // });
    this.getPurchaseDetails(this.id!);
    // this.getProperty(this.id!);
  }

  getPurchaseDetails(purchaseId: string) {
    this.paymentService.getPurchaseDetails(purchaseId).subscribe({
      next: (response) => {
        console.log('Purchase details:', response);
        this.propertyPurchaseDetails = response.data;
        this.images = response.data.unit.property.property_images.map((img: any) => ({ src: img.image_url }));
      },
      error: (error) => {
        console.error('Error fetching purchase details:', error);
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

  onClickImage(): void {
    this.nzImageService.preview(this.images, { nzZoom: 1.5, nzRotate: 0 });
  }

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
