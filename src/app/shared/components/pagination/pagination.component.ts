import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() pagination!: PaginationData;
  @Input() showInfo = true;
  @Input() maxVisiblePages = 5;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 10;
  visiblePages: number[] = [];

  ngOnInit(): void {
    this.updatePaginationData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagination']) {
      this.updatePaginationData();
    }
  }

  private updatePaginationData(): void {
    if (this.pagination) {
      this.currentPage = this.pagination.page;
      this.totalPages = this.pagination.pages;
      this.totalItems = this.pagination.total;
      this.itemsPerPage = this.pagination.limit;
      this.calculateVisiblePages();
    }
  }

  private calculateVisiblePages(): void {
    this.visiblePages = [];
    
    if (this.totalPages <= this.maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        this.visiblePages.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < this.maxVisiblePages) {
        startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        this.visiblePages.push(i);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.calculateVisiblePages();
      this.pageChange.emit(page);
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);
    if (newLimit !== this.itemsPerPage) {
      this.limitChange.emit(newLimit);
    }
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get showFirstEllipsis(): boolean {
    return this.visiblePages.length > 0 && this.visiblePages[0] > 1;
  }

  get showLastEllipsis(): boolean {
    return this.visiblePages.length > 0 && this.visiblePages[this.visiblePages.length - 1] < this.totalPages;
  }
}
