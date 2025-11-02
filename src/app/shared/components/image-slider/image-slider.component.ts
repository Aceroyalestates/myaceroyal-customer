import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ImageSliderItem {
  src: string;
  alt: string;
  title?: string;
}

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.css']
})
export class ImageSliderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() images: ImageSliderItem[] = [];
  @Input() showIndicators = true;
  @Input() showNavigation = true;
  @Input() autoPlay = false;
  @Input() autoPlayInterval = 5000;
  @Input() height = '465px';
  @Input() width = '100%';
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none' = 'cover';
  @Input() borderRadius = '8px';
  @Input() showImageCounter = true;
  @Input() enableKeyboardNavigation = true;
  @Input() enableSwipeNavigation = true;

  @Output() imageChange = new EventEmitter<number>();
  @Output() imageClick = new EventEmitter<ImageSliderItem>();

  currentIndex = 0;
  private autoPlayTimer: any;

  ngOnInit(): void {
    this.setupKeyboardNavigation();
    this.startAutoPlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && this.images.length > 0) {
      this.currentIndex = 0;
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.removeKeyboardNavigation();
  }

  nextImage(): void {
    if (this.images.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.emitImageChange();
    this.resetAutoPlay();
  }

  previousImage(): void {
    if (this.images.length === 0) return;
    
    this.currentIndex = this.currentIndex === 0 
      ? this.images.length - 1 
      : this.currentIndex - 1;
    this.emitImageChange();
    this.resetAutoPlay();
  }

  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.emitImageChange();
      this.resetAutoPlay();
    }
  }

  onImageClick(): void {
    this.imageClick.emit(this.images[this.currentIndex]);
  }

  onSwipeLeft(): void {
    if (this.enableSwipeNavigation) {
      this.nextImage();
    }
  }

  onSwipeRight(): void {
    if (this.enableSwipeNavigation) {
      this.previousImage();
    }
  }

  private emitImageChange(): void {
    this.imageChange.emit(this.currentIndex);
  }

  private startAutoPlay(): void {
    if (this.autoPlay && this.images.length > 1) {
      this.autoPlayTimer = setInterval(() => {
        this.nextImage();
      }, this.autoPlayInterval);
    }
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private resetAutoPlay(): void {
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  private setupKeyboardNavigation(): void {
    if (this.enableKeyboardNavigation) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private removeKeyboardNavigation(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enableKeyboardNavigation) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'Home':
        event.preventDefault();
        this.goToImage(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToImage(this.images.length - 1);
        break;
    }
  }

  get currentImage(): ImageSliderItem | null {
    return this.images.length > 0 ? this.images[this.currentIndex] : null;
  }

  get hasImages(): boolean {
    return this.images.length > 0;
  }

  get canGoPrevious(): boolean {
    return this.images.length > 1;
  }

  get canGoNext(): boolean {
    return this.images.length > 1;
  }
}
