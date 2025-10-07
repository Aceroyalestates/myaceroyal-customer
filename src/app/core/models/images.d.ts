

// Root API response
export interface ImageUploadApiResponse {
  success: boolean;
  message: string;
  data: ImageResponse;
}

// Data object
export interface ImageResponse {
  file: FileInfo;
  transformations: Transformations;
}

export interface FileInfo {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
  original_filename: string;
  folder: string;
  category: string;
  tags: string[];
}

export interface Transformations {
  thumbnail: string;
  medium: string;
  large: string;
}