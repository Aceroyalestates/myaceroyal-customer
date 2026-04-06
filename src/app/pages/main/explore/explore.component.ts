import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { Router } from '@angular/router';
import { Property, PropertyFilters, PropertyType } from 'src/app/core/models/properties';
import { PaginationData } from 'src/app/shared/components/pagination/pagination.component';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-explore',
  imports: [SharedModule, NzTabsModule, CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {
  private readonly minimumSearchLength = 4;
  private readonly searchDebounceMs = 600;
  private readonly searchInput$ = new Subject<string>();
  private readonly subscriptions = new Subscription();

  properties: Property[] = [];
  propertyTypes: PropertyType[] = [];
  loading = false;
  propertyTypesLoading = false;
  error: string | null = null;
  pagination: PaginationData | null = null;
  currentPage = 1;
  pageSize = 12;
  showFilters = false;
  searchQuery = '';
  selectedTypeId: number | null = null;
  locationQuery = '';
  minPriceQuery = '';
  maxPriceQuery = '';
  filters: PropertyFilters = {
    search: '',
  };

  emptyArray: any[] = new Array(12).fill('');

  getRowLink = (row: Property) => `/main/explore/view/${row.slug}`;
  selectedproperty = signal<Property[]>([]);

  constructor(
    private router: Router,
    private propertiesService: PropertiesService
  ) {
    effect(() => {
      console.log('Selected property from table: ', this.selectedproperty());
    });
  }

  ngOnInit(): void {
    const searchSub = this.searchInput$
      .pipe(
        map((query) => query.trim()),
        debounceTime(this.searchDebounceMs),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        const hasActiveSearch = !!this.filters.search;

        if (query.length >= this.minimumSearchLength) {
          this.filters = {
            ...this.filters,
            search: query,
          };
          this.loadProperties(1, this.pageSize);
          return;
        }

        if (hasActiveSearch) {
          this.filters = {
            ...this.filters,
            search: undefined,
          };
          this.loadProperties(1, this.pageSize);
        }
      });

    this.subscriptions.add(searchSub);
    this.loadPropertyTypes();
    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    
    this.propertiesService.getProperties(page, limit, this.filters).subscribe({
      next: (response) => {
        this.properties = response.data || [];
        this.pagination = response.pagination
          ? {
              total: Number(response.pagination.total) || 0,
              page: Number(response.pagination.page) || page,
              limit: Number(response.pagination.limit) || limit,
              pages: Number(response.pagination.pages) || 0,
            }
          : null;
        this.currentPage = this.pagination?.page ?? page;
        this.pageSize = this.pagination?.limit ?? limit;
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

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchInput$.next(query);
  }

  applyFilters(): void {
    this.filters = {
      search: this.searchQuery.trim() || undefined,
      type: this.selectedTypeId ?? undefined,
      location: this.locationQuery.trim() || undefined,
      min_price: this.parseNumberFilter(this.minPriceQuery),
      max_price: this.parseNumberFilter(this.maxPriceQuery),
    };
    this.loadProperties(1, this.pageSize);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedTypeId = null;
    this.locationQuery = '';
    this.minPriceQuery = '';
    this.maxPriceQuery = '';
    this.filters = {
      search: '',
    };
    this.loadProperties(1, this.pageSize);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  private loadPropertyTypes(): void {
    this.propertyTypesLoading = true;
    this.propertiesService.getPropertyTypes().subscribe({
      next: (response) => {
        this.propertyTypes = response.data || [];
        this.propertyTypesLoading = false;
      },
      error: (error) => {
        this.propertyTypesLoading = false;
        console.error('Error loading property types:', error);
      },
    });
  }

  private parseNumberFilter(value: string): number | undefined {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return undefined;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  handleViewProperty(slug: string) {
    this.router.navigateByUrl(`/main/explore/view/${slug}`);
  }

  handleSelectedData(selected: Property[]) {
    this.selectedproperty.set(selected);
    console.log(this.selectedproperty);
  }

  onTableAction(event: { action: string; row: Property }): void {
    console.log('Table action:', event.action, 'on row:', event.row);
    switch (event.action) {
      case 'view':
        this.handleViewProperty(event.row.slug);
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  }

  onRowClick(row: Property): void {
    console.log('Row clicked:', row);
    this.handleViewProperty(row.slug);
  }
}
