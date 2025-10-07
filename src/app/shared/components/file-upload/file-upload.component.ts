import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div 
        class="file-upload-area"
        [class]="uploadAreaClasses"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input 
          #fileInput 
          type="file" 
          [accept]="accept"
          [multiple]="multiple"
          (change)="onFileSelected($event)" 
          class="hidden"
        />
        <div class="upload-content">
          <div class="upload-icon">
            📄
          </div>
          <div class="upload-text">
            <p class="upload-title">{{ title }}</p>
            <p class="upload-subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </div>
      <div *ngIf="selectedFile" class="selected-file">
        <span class="file-name">{{ selectedFile.name }}</span>
        <button type="button" class="remove-file" (click)="removeFile()">×</button>
      </div>
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  `
})
export class FileUploadComponent {
  @Input() label: string = '';
  @Input() title: string = 'Click to upload or drag and drop';
  @Input() subtitle: string = 'PNG, JPG, PDF up to 10MB';
  @Input() accept: string = '*';
  @Input() multiple: boolean = false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragOver: boolean = false;

  get uploadAreaClasses(): string {
    const baseClasses = 'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200';
    const stateClasses = this.isDragOver 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300 hover:border-gray-400';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClasses} ${stateClasses} ${disabledClasses}`.trim();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileSelected.emit(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (!this.disabled) {
      const file = event.dataTransfer?.files[0];
      if (file) {
        this.selectedFile = file;
        this.fileSelected.emit(file);
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileRemoved.emit();
  }
}
