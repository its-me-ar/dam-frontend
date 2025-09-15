export type Asset = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl?: string;
  createdAt: string;
  durationSeconds?: number;
  sizeBytes?: number;
  uploader?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  shares?: Array<{
    id: string;
    asset_id: string;
    shared_by: string;
    share_type: 'PUBLIC' | 'RESTRICTED';
    share_token: string;
    user_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
  }>;
};

export type SharedAssetData = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl?: string;
  createdAt: string;
  durationSeconds?: number;
  sizeBytes?: number;
  uploader?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  sharedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  visibilityStatus: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
  paths: Record<string, string>;
};

export interface SharedWithMeAsset {
  id: string;
  assetId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  uploader: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  sharedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  shareType: 'PUBLIC' | 'RESTRICTED';
  shareToken: string;
  isActive: boolean;
  sharedAt: string;
}

export type ShareAssetPayload = {
  asset_id: string;
  share_type: 'PUBLIC' | 'RESTRICTED';
  user_ids?: string[];
};

export type AssetVisibilityStatus = 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
