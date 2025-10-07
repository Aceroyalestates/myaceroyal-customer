import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ContentChild,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ng-zorro imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { SearchBarComponent } from '../search-bar/search-bar.component';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'status' | 'actions' | 'custom';
  render?: (value: any, row: any) => string;
  filterOptions?: { label: string; value: any }[];
}

export interface TableAction {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  tooltip?: string;
}

// ...existing code...

export interface TableFilter {
  [key: string]: any;
}

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzTagModule,
    NzPaginationModule,
    NzDividerModule,
    NzSpinModule,
    NzEmptyModule,
    SearchBarComponent,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnChanges {
  get isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() showSearch = true;
  @Input() showFilters = true;
  @Input() showPagination = true;
  @Input() showSelection = false;
  @Input() showExport = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() sortable = true;
  @Input() responsive = true;
  @Input() bordered = true;
  @Input() size: 'small' | 'middle' | 'default' = 'default';
  @Input() emptyText = 'No data available';
  @Input() searchPlaceholder = 'Search...';
  @Input() enableRowClick = false;
  @Input() rowKey = 'id';
  @Input() enableSorting = true;
  @Input() enableSelection = false;
  @Input() rowLink?: (row: any) => string;

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<TableFilter>();
  @Output() sortChange = new EventEmitter<{
    column: string;
    direction: string | null;
  }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<{ page: number; size: number }>();
  @Output() exportRequest = new EventEmitter<void>();
  @Output() selectedData = new EventEmitter<any[]>();

  @ContentChild('customCell') customCellTemplate!: TemplateRef<any>;
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Table state
  searchTerm = '';
  currentPage = 1;
  currentPageSize = 10;
  sortField: string | null = null;
  sortOrder: string | null = null;
  selectedRows: any[] = [];
  indeterminate = false;
  allChecked = false;
  filters: TableFilter = {};

  // Processed data
  filteredData: any[] = [];
  displayData: any[] = [];
  total = 0;

  // Utility properties
  Object = Object;
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentPageSize = this.pageSize;
    this.initializeFilters();
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.updateData();
    }
  }

  initializeFilters(): void {
    this.filters = {};
    this.columns.forEach((column) => {
      if (column.filterable) {
        this.filters[column.key] = null;
      }
    });
  }

  updateData(): void {
    let processedData = [...this.data];

    // Apply search
    if (this.searchTerm.trim()) {
      processedData = this.applySearch(processedData);
    }

    // Apply filters
    processedData = this.applyFilters(processedData);

    // Apply sorting
    if (this.sortField && this.sortOrder) {
      processedData = this.applySort(processedData);
    }

    this.filteredData = processedData;
    this.total = processedData.length;

    // Apply pagination
    this.updateDisplayData();

    // Update selection state
    this.updateSelectionState();
  }

  applySearch(data: any[]): any[] {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    return data.filter((row) => {
      return this.columns.some((column) => {
        const value = this.getCellValue(row, column);
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  }

  applyFilters(data: any[]): any[] {
    return data.filter((row) => {
      return Object.keys(this.filters).every((key) => {
        const filterValue = this.filters[key];
        if (!filterValue) return true;

        const cellValue = this.getCellValue(row, this.getColumnByKey(key));
        return this.matchesFilter(cellValue, filterValue);
      });
    });
  }

  applySort(data: any[]): any[] {
    if (!this.sortField || !this.sortOrder) return data;

    return [...data].sort((a, b) => {
      const aValue = this.getCellValue(a, this.getColumnByKey(this.sortField!));
      const bValue = this.getCellValue(b, this.getColumnByKey(this.sortField!));

      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;

      return this.sortOrder === 'desc' ? -result : result;
    });
  }

  updateDisplayData(): void {
    const startIndex = (this.currentPage - 1) * this.currentPageSize;
    const endIndex = startIndex + this.currentPageSize;
    this.displayData = this.filteredData.slice(startIndex, endIndex);
  }

  getCellValue(row: any, column: TableColumn | null): any {
    if (!column) return '';

    const keys = column.key.split('.');
    let value = row;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    return value ?? '';
  }

  getColumnByKey(key: string): TableColumn | null {
    return this.columns.find((col) => col.key === key) || null;
  }

  matchesFilter(cellValue: any, filterValue: any): boolean {
    if (Array.isArray(filterValue)) {
      return filterValue.includes(cellValue);
    }
    return String(cellValue)
      .toLowerCase()
      .includes(String(filterValue).toLowerCase());
  }

  // Search functionality
  onSearchChange(): void {
    this.currentPage = 1;
    this.updateData();
    this.searchChange.emit(this.searchTerm);
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.onSearchChange();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  // Filter functionality
  onFilterChange(column: TableColumn, value: any): void {
    this.filters[column.key] = value;
    this.currentPage = 1;
    this.updateData();
    this.filterChange.emit({ ...this.filters });
  }

  clearFilter(column: TableColumn): void {
    this.filters[column.key] = null;
    this.onFilterChange(column, null);
  }

  clearAllFilters(): void {
    this.initializeFilters();
    this.currentPage = 1;
    this.updateData();
    this.filterChange.emit({ ...this.filters });
  }

  // Sorting functionality
  onSortChange(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortField === column.key) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else if (this.sortOrder === 'desc') {
        this.sortField = null;
        this.sortOrder = null;
      } else {
        this.sortOrder = 'asc';
      }
    } else {
      this.sortField = column.key;
      this.sortOrder = 'asc';
    }

    this.updateData();
    this.sortChange.emit({
      column: this.sortField || '',
      direction: this.sortOrder,
    });
  }

  getSortDirection(column: TableColumn): string | null {
    return this.sortField === column.key ? this.sortOrder : null;
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item[this.rowKey] || index;
  }

  // Check if filters have values
  hasActiveFilters(): boolean {
    return Object.values(this.filters).some(
      (f) => f !== null && f !== undefined
    );
  }

  // Selection functionality
  updateSelectionState(): void {
    const validRows = this.displayData.filter(
      (row) => row[this.rowKey] !== undefined
    );
    const selectedCount = this.selectedRows.length;
    const totalCount = validRows.length;

    this.allChecked = totalCount > 0 && selectedCount === totalCount;
    this.indeterminate = selectedCount > 0 && selectedCount < totalCount;
  }

  onAllCheckedChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRows = [...this.displayData];
    } else {
      this.selectedRows = [];
    }
    this.updateSelectionState();
    this.selectionChange.emit(this.selectedRows);
    this.selectedData.emit(this.selectedRows);
  }

  onRowCheckedChange(row: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedRows.find((r) => r[this.rowKey] === row[this.rowKey])) {
        this.selectedRows.push(row);
      }
    } else {
      this.selectedRows = this.selectedRows.filter(
        (r) => r[this.rowKey] !== row[this.rowKey]
      );
    }
    this.updateSelectionState();
    this.selectionChange.emit(this.selectedRows);
    this.selectedData.emit(this.selectedRows);
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.some((r) => r[this.rowKey] === row[this.rowKey]);
  }

  // Pagination functionality
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayData();
    this.pageChange.emit({ page, size: this.currentPageSize });
  }

  onPageSizeChange(size: number): void {
    this.currentPageSize = size;
    this.currentPage = 1;
    this.updateDisplayData();
    this.pageChange.emit({ page: this.currentPage, size });
  }

  // Action functionality
  onActionClick(action: TableAction, row: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (action.disabled && action.disabled(row)) {
      return;
    }

    this.actionClick.emit({ action: action.key, row });
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  // Row click functionality
  onRowClick(row: any): void {
    if (this.enableRowClick) {
      this.rowClick.emit(row);
    }
  }

  // Get row link for navigation
  getRowLink(row: any): string | undefined {
    return this.rowLink ? this.rowLink(row) : undefined;
  }

  // Status color helper
  getStatusColor(status: string): string {
    const statusLower = String(status).toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'completed':
      case 'active':
      case 'true':
      case 'success':
        return 'success';
      case 'pending':
      case 'processing':
      case 'waiting':
        return 'processing';
      case 'under review':
      case 'review':
        return 'warning';
      case 'failed':
      case 'error':
      case 'false':
      case 'rejected':
      case 'inactive':
        return 'error';
      case 'draft':
      case 'scheduled':
        return 'default';
      default:
        return 'default';
    }
  }

  // Utility methods
  formatCellValue(value: any, column: TableColumn): string {
    if (column.render) {
      return column.render(value, this.getCellValue);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'number' && value !== null && value !== undefined) {
      return Number(value).toLocaleString();
    }

    return String(value || '');
  }

  // Export functionality
  exportToCSV(): void {
    // Emit event for parent to handle if needed
    this.exportRequest.emit();
    
    const headers = this.columns.map((col) => col.title).join(',');
    const rows = this.filteredData.map((row) =>
      this.columns
        .map((col) => {
          const value = this.getCellValue(row, col);
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'table-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Public method to trigger export from parent component
  public triggerExport(): void {
    this.exportToCSV();
  }
}
