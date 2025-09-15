// Login API
export type LoginApiResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
  };
};

// Asset Paths API
export type AssetPathsResponse = {
  status: string;
  message: string;
  data: {
    asset_id: string;
    filename: string;
    mime_type: string;
    paths: Record<string, string>;
  };
};

// Invitations API
export type InvitePayload = {
  email: string;
  role: 'USER' | 'MANAGER';
};

export type InviteResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: 'USER' | 'MANAGER';
    status: 'PENDING' | 'JOINED';
    inviteBy: string;
    createdAt: string;
    updatedAt: string;
    acceptedAt: string | null;
    invitationLink: string;
  };
};

export type InvitationsListResponse = {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    email: string;
    role: 'USER' | 'MANAGER';
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'JOINED';
    inviteBy: string;
    createdAt: string;
    updatedAt: string;
    acceptedAt: string | null;
    invitedBy: {
      id: string;
      email: string;
      full_name: string;
      role: 'ADMIN' | 'MANAGER' | 'USER';
    };
  }>;
};

// Register via invitation
export type RegisterInvitePayload = {
  token: string;
  full_name: string;
  password: string;
};

export type RegisterInviteResponse = {
  success: boolean;
  message: string;
};

// Dashboard metrics and jobs
export type MetricsResponse = {
  status: string;
  message: string;
  data: {
    totalAssets: number;
    addedThisWeek: number;
    storageUsedGB: number;
    newUploadsToday: number;
  };
};

export type JobsResponse = {
  status: string;
  message: string;
  data: Array<{
    id: string;
    asset_id: string;
    job_id: string;
    worker_name: string;
    event_name: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
    created_at: string;
    updated_at: string;
    asset: {
      asset_id: string;
      filename: string;
      mime_type: string;
      uploader_id: string;
      status: string;
      created_at: string;
    };
  }>;
};

// Share asset API
export type ShareAssetResponse = {
  success: boolean;
  message: string;
  data: {
    share_url: string;
    asset_id: string;
    share_type: string;
  };
};

// Users API
export type UsersResponse = {
  status: string;
  message: string;
  data: Array<{
    id: string;
    full_name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    createdAt: string;
  }>;
};

// Asset Visibility API
export type AssetVisibilityResponse = {
  status: string;
  message: string;
  data: {
    asset_id: string;
    visibility_status: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE';
  };
};

// Public Asset Data
export type PublicAssetResponse = {
  status: string;
  message: string;
  data: {
    asset_id: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    uploader: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
    shared_by: {
      id: string;
      full_name: string;
      email: string;
    };
    created_at: string;
    paths: Record<string, string>;
  };
};

// Restricted Asset Data (same structure as public)
export type RestrictedAssetResponse = PublicAssetResponse;

// Shared with me API
export interface SharedAsset {
  id: string;
  asset_id: string;
  shared_by: string;
  share_type: 'PUBLIC' | 'RESTRICTED';
  share_token: string;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  asset: {
    asset_id: string;
    filename: string;
    mime_type: string;
    storage_path: string;
    uploader_id: string;
    group_id: string | null;
    size_bytes: number;
    status: string;
    created_at: string;
    updated_at: string;
    metadata: Array<{
      metadata_id: string;
      asset_id: string;
      key: string;
      value: any;
      created_at: string;
      updated_at: string;
    }>;
    uploader: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
  };
  sharedBy: {
    id: string;
    full_name: string;
    email: string;
  };
  user: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface SharedWithMeResponse {
  status: string;
  message: string;
  data: SharedAsset[];
}

// Assets API
export type AssetsApiResponse = {
  status: string;
  message: string;
  data: Array<{
    asset_id: string;
    filename: string;
    mime_type: string;
    storage_path: string;
    uploader_id: string;
    group_id: string | null;
    size_bytes: number;
    status: string;
    created_at: string;
    updated_at: string;
    metadata: Array<{
      metadata_id: string;
      asset_id: string;
      key: string;
      value: any;
      created_at: string;
      updated_at: string;
    }>;
    uploader: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
    shares: Array<{
      id: string;
      asset_id: string;
      shared_by: string;
      share_type: 'PUBLIC' | 'RESTRICTED';
      share_token: string;
      user_id: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      user: {
        id: string;
        full_name: string;
        email: string;
        role: string;
      } | null;
    }>;
  }>;
};

// Upload API
export type PresignResponse = {
  status: string;
  message: string;
  data: {
    url: string;
    asset_id: string;
  };
};
