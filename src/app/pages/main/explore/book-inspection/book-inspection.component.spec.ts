import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookInspectionComponent } from './book-inspection.component';

describe('BookInspectionComponent', () => {
  let component: BookInspectionComponent;
  let fixture: ComponentFixture<BookInspectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookInspectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
