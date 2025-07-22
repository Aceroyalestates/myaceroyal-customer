import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-view-property',
  imports: [CommonModule, SharedModule, NzTabsModule],
  templateUrl: './view-property.component.html',
  styleUrl: './view-property.component.css'
})
export class ViewPropertyComponent {
  developedProperties = [
    {
      id: 1,
      image: 'https://i.pinimg.com/564x/eb/9b/f9/eb9bf9dc04cff1b6ecf32e8805e76a99.jpg',
      title: 'Luxury Apartment Complex',
      description: 'Modern units with stunning city views and premium amenities. Located in the heart of the city.',
    },
    {
      id: 2,
      image: 'https://www.maramani.com/cdn/shop/products/Duplex2bedroomapartment-ID24412-Perspective_1.jpg?v=1666854766&width=2048',
      title: 'Suburban Family Homes',
      description: 'Spacious homes in a quiet neighborhood, close to schools and parks. Perfect for families.',
    },
    {
      id: 3,
      image: 'https://png.pngtree.com/background/20250107/original/pngtree-luxurious-house-night-view-with-sufficient-light-picture-image_15538213.jpg',
      title: 'Commercial Office Tower',
      description: 'State-of-the-art office spaces in a prime business district. Ideal for growing businesses.',
    },
  ];
}
