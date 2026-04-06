import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FaqService } from 'src/app/core/services/faq.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-faq',
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    NzSpinModule,
    NzCollapseModule,
    NzEmptyModule,
    NzButtonModule,
    NzInputModule,
    NzPaginationModule,
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit, OnDestroy {
  faqs: any[] = [];
  isLoading = false;
  search = '';
  appliedSearch = '';
  page = 1;
  limit = 10;
  total = 0;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(450),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.appliedSearch = value.trim();
        this.page = 1;
        this.loadFaqs(1, this.limit);
      });

    this.loadFaqs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFaqs(page: number = this.page, limit: number = this.limit): void {
    this.isLoading = true;
    this.faqService.getFaqs({
      page,
      limit,
      search: this.appliedSearch,
      include_property: true,
    }).subscribe({
      next: (response: any) => {
        this.faqs = response.data ?? [];
        const pagination = response.pagination ?? {};
        this.page = pagination.current_page ?? pagination.page ?? page;
        this.limit = pagination.per_page ?? pagination.limit ?? limit;
        this.total = pagination.total_items ?? pagination.total ?? this.faqs.length;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching FAQs:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.appliedSearch = this.search.trim();
    this.page = 1;
    this.loadFaqs(1, this.limit);
  }

  onSearchInput(value: string): void {
    this.search = value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    if (!this.search && !this.appliedSearch) {
      return;
    }

    this.search = '';
    this.appliedSearch = '';
    this.page = 1;
    this.loadFaqs(1, this.limit);
  }

  onPageIndexChange(page: number): void {
    this.page = page;
    this.loadFaqs(page, this.limit);
  }

  onPageSizeChange(limit: number): void {
    this.limit = limit;
    this.page = 1;
    this.loadFaqs(1, limit);
  }

  getPropertyLabel(faq: any): string | null {
    return faq?.property?.name || faq?.property_name || null;
  }
}
