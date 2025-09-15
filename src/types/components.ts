import type { ReactNode } from 'react';

// Modal components
export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  contentClassName?: string;
};

// Asset components
export interface AssetPreviewCardProps {
  asset: {
    name: string;
    mimeType: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
  };
  canPreview: boolean;
  onPreview: () => void;
}

export type AssetPreviewModalProps = {
  assetId: string | null;
  assetName?: string;
  mimeType?: string;
  open: boolean;
  onClose: () => void;
};

export interface AssetMetadataProps {
  asset: {
    name: string;
    mimeType: string;
    sizeBytes?: number;
    visibilityStatus: string;
    paths: Record<string, string>;
  };
}

// Share components
export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
}

export interface ShareInfoModalProps {
  open: boolean;
  onClose: () => void;
  asset: {
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
  } | null;
}

export interface SharedAssetPreviewModalProps {
  asset: {
    name: string;
    mimeType: string;
    paths: Record<string, string>;
  };
  isOpen: boolean;
  onClose: () => void;
}

// Error components
export interface SharedAssetErrorProps {
  error: Error;
}

// Dashboard components
export type StatCardProps = {
  title: string;
  value: string;
  delta?: string;
  tone?: 'peach' | 'mint' | 'indigo' | 'sky';
};
