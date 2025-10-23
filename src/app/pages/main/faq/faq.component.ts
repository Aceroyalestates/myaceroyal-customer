import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FaqService } from 'src/app/core/services/faq.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-faq',
  imports: [
    SharedModule,
    CommonModule,
    NzSpinModule,
    NzCollapseModule,
    NzEmptyModule,
    NzButtonModule,
    
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {

  faqs: any[] = [];
  isLoading = false;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(page: number = 1, limit: number = 10): void {
    this.isLoading = true;
    this.faqService.getFaqs(page, limit).subscribe({
      next: (response: any) => {
        this.faqs = response.data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching FAQs:', error);
        this.isLoading = false;
      }
    });
  }

}
