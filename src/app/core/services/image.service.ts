import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ImageResponse, ImageUploadApiResponse } from '../models/images';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private httpService: HttpService) { }
  //transformation={"width":800,"height":600,"crop":"fit"}
  uploadImage1(file: File, folder: string = 'properties/images', category: string = 'image', transformation = { "width": 800, "height": 600, "crop": "fit" }, tags?: string[]): Observable<{ data: ImageResponse, message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('category', category);
    if (transformation) {
      formData.append('transformation', JSON.stringify(transformation));
    }
    if (tags) {
      formData.append('tags', tags.join(','));
    }
    console.log({ formData: formData.values })
    for (const [key, value] of formData.entries()) {

      console.log(`${key}:`, value);
    }

    return this.httpService.post<{ data: ImageResponse, message: string }>('uploads/single', formData);
  }

  uploadImage(
    file: File,
    folder: string = 'properties/images',
    category: string = 'image',
    transformation: { width: number; height: number; crop: string } = { width: 800, height: 600, crop: 'fit' },
    tags: string[] = ['property', 'featured']
  ): Observable<ImageUploadApiResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    // formData.append('folder', folder);
    // formData.append('category', category);
    // formData.append('transformation', JSON.stringify(transformation));
    // formData.append('tags', tags.join(','));

    // Debugging: Log FormData entries
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Set headers for the request
    const headers = {
      Accept: 'application/json',
      // Authorization header will be handled by HttpService (e.g., via an interceptor)
    };

    return this.httpService.post<ImageUploadApiResponse>('uploads/single', formData);
  }

  deleteImage(
    publicId: string
  ): Observable<ImageUploadApiResponse> {
    return this.httpService.delete<ImageUploadApiResponse>(`uploads/batch`, { body: { publicIds: [publicId], resourceType: "image" } });
  }
}
