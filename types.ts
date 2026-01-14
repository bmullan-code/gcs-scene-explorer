
export interface GCSObject {
  kind: string;
  id: string;
  name: string;
  bucket: string;
  generation: string;
  metageneration: string;
  contentType: string;
  timeCreated: string;
  updated: string;
  storageClass: string;
  size: string;
  md5Hash: string;
  mediaLink: string;
  selfLink: string;
}

export interface GCSListResponse {
  kind: string;
  prefixes?: string[];
  items?: GCSObject[];
}

export interface Scene {
  id: string | number;
  name?: string;
  timestamp?: string;
  description?: string;
  [key: string]: any;
}

export interface ScenesData {
  scenes: Scene[];
  metadata?: Record<string, any>;
}

export interface AuthConfig {
  accessToken: string;
  bucket: string;
  path: string;
}
