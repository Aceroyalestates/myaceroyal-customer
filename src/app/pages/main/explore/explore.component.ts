import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { Router } from '@angular/router';
import { Property } from 'src/app/core/models/properties';
import { PaginationData } from 'src/app/shared/components/pagination/pagination.component';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { TableAction, TableColumn } from 'src/app/shared/components/table/table.component';

@Component({
  selector: 'app-explore',
  imports: [SharedModule, NzTabsModule, CommonModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {
  activeTab: string = 'developed'; // 'developed' or 'undeveloped'
  properties: Property[] = [];
  loading = false;
  error: string | null = null;
  lucy!: string;
  pagination: PaginationData | null = null;
  currentPage = 1;
  pageSize = 12;

  columns: TableColumn[] = [
    { key: 'name', title: 'Property Name', sortable: true, type: 'text' },
    { key: 'location', title: 'Location', sortable: true, type: 'text' },
    { key: 'propertyType', title: 'Property Type', sortable: true, type: 'text' },
    { key: 'unitType', title: 'Unit Type', sortable: true, type: 'text' },
    { key: 'quantity', title: 'Listings', sortable: true, type: 'text' },
    { key: 'price', title: 'Unit Price', sortable: true, type: 'text' },
  ];

  actions: TableAction[] = [
    { key: 'view', label: 'View', icon: 'eye', color: 'blue', tooltip: 'View property details' },
  ];

  emptyArray: any[] = new Array(12).fill('');

  getRowLink = (row: Property) => `/main/explore/view/${row.id}`;
  selectedproperty = signal<Property[]>([]);

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

  constructor(
    private router: Router,
    private propertiesService: PropertiesService
  ) {
    effect(() => {
      console.log('Selected property from table: ', this.selectedproperty());
    });
  }

  ngOnInit(): void {
    this.loadProperties();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    console.log(`Tab changed to: ${tabId}`); // Added for debugging
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if placeholder also fails
    target.src = '[https://placehold.co/400x250/CCCCCC/666666?text=Image+Error](https://placehold.co/400x250/CCCCCC/666666?text=Image+Error)';
  }

    loadProperties(page: number = 1, limit: number = this.pageSize): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;
    this.pageSize = limit;
    
    this.propertiesService.getProperties(page, limit, {}).subscribe({
      next: (response) => {
        this.properties = response.data || [];
        this.pagination = response.pagination || null;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load properties';
        console.error('Error loading properties:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadProperties(page, this.pageSize);
  }

  onLimitChange(limit: number): void {
    this.loadProperties(1, limit); // Reset to first page when changing limit
  }

  handleViewProperty(id: string | number) {
    this.router.navigateByUrl(`/main/explore/view/${id}`);
  }

  handleSelectedData(selected: Property[]) {
    this.selectedproperty.set(selected);
    console.log(this.selectedproperty);
  }

  onTableAction(event: { action: string; row: Property }): void {
    console.log('Table action:', event.action, 'on row:', event.row);
    switch (event.action) {
      case 'view':
        this.handleViewProperty(event.row.id);
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  }

  onRowClick(row: Property): void {
    console.log('Row clicked:', row);
    this.handleViewProperty(row.id);
  }
}
