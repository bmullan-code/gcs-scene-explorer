
import { GCSListResponse, GCSObject } from '../types';

export class GCSService {
  private static BASE_URL = 'https://storage.googleapis.com/storage/v1/b';

  static async listObjects(bucket: string, prefix: string, token: string): Promise<GCSListResponse> {
    const url = `${this.BASE_URL}/${bucket}/o?prefix=${prefix}&delimiter=/`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `GCS request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getObjectMedia(bucket: string, path: string, token: string): Promise<Response> {
    const url = `${this.BASE_URL}/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    return response;
  }

  static getPublicUrl(bucket: string, path: string): string {
    // Note: This requires the bucket to have appropriate IAM permissions or signed URLs.
    // In a authenticated session context, we usually use the alt=media endpoint.
    return `https://storage.googleapis.com/${bucket}/${path}`;
  }
}
