import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-explore',
  imports: [SharedModule, NzTabsModule, CommonModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {
  activeTab: string = 'developed'; // 'developed' or 'undeveloped'

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
    {
      id: 4,
      image: 'https://i.pinimg.com/564x/eb/9b/f9/eb9bf9dc04cff1b6ecf32e8805e76a99.jpg',
      title: 'Luxury Apartment Complex',
      description: 'Modern units with stunning city views and premium amenities. Located in the heart of the city.',
    },
    {
      id: 5,
      image: 'https://png.pngtree.com/background/20250107/original/pngtree-luxurious-house-night-view-with-sufficient-light-picture-image_15538213.jpg',
      title: 'Commercial Office Tower',
      description: 'State-of-the-art office spaces in a prime business district. Ideal for growing businesses.',
    },
    {
      id: 6,
      image: 'https://www.maramani.com/cdn/shop/products/Duplex2bedroomapartment-ID24412-Perspective_1.jpg?v=1666854766&width=2048',
      title: 'Suburban Family Homes',
      description: 'Spacious homes in a quiet neighborhood, close to schools and parks. Perfect for families.',
    },
  ];

  undevelopedProperties = [
    {
      id: 1,
      image: 'https://urbangeekz.com/wp-content/uploads/2016/07/Buying-A-Plot-Of-Land.jpg',
      title: 'Expansive Farmland',
      description: 'Vast acres of fertile land, suitable for agriculture or large-scale development projects.',
    },
    {
      id: 2,
      image: 'https://images.nigeriapropertycentre.com/properties/images/1664585/064148bb33a65e-20-plots-of-land-available-in-lekki-phase-1-for-sale-lekki-lagos.jpg',
      title: 'Coastal Development Site',
      description: 'Prime beachfront property with potential for resorts, residential complexes, or mixed-use.',
    },
    {
      id: 3,
      image: 'https://mixtafrica.com/wp-content/uploads/2024/03/Nigerian-Land-Sizes-and-Measurement.jpg',
      title: 'Urban Infill Lot',
      description: 'Strategic plot in a developing urban area, ideal for commercial or residential infill projects.',
    },
    {
      id: 4,
      image: 'https://www.jkcement.com/wp-content/uploads/2023/08/beautiful-landscape-with-small-village-1024x575-jpg.webp',
      title: 'Expansive Farmland',
      description: 'Vast acres of fertile land, suitable for agriculture or large-scale development projects.',
    },
    {
      id: 5,
      image: 'https://amazingproperty.com.ng/wp-content/uploads/2015/11/Plot-C-1024x614.jpg',
      title: 'Coastal Development Site',
      description: 'Prime beachfront property with potential for resorts, residential complexes, or mixed-use.',
    },
    {
      id: 6,
      image: 'https://images.nigeriapropertycentre.com/properties/images/2635810/0676ea6c751a0e-plots-of-land-mixed-use-land-for-sale-ibadan-oyo.jpg',
      title: 'Urban Infill Lot',
      description: 'Strategic plot in a developing urban area, ideal for commercial or residential infill projects.',
    },
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    console.log(`Tab changed to: ${tabId}`); // Added for debugging
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if placeholder also fails
    target.src = '[https://placehold.co/400x250/CCCCCC/666666?text=Image+Error](https://placehold.co/400x250/CCCCCC/666666?text=Image+Error)';
  }
}
