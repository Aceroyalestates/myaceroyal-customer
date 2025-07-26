import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-property-payment',
  imports: [
    CommonModule,
    SharedModule,
    RouterLink
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

  constructor(private route: ActivatedRoute) {}

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
  }

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
