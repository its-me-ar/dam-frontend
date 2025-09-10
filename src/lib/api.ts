import axios from 'axios'
import type { AxiosInstance } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

export function buildAssetUrl(path: string): string {
  if (!path) return ''
  const storageBase = (import.meta.env.VITE_STORAGE_BE_URL as string | undefined) ?? API_BASE_URL
  const base = storageBase.endsWith('/') ? storageBase.slice(0, -1) : storageBase
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${normalized}`
}

export type LoginPayload = { email: string; password: string }


type LoginApiResponse = {
  success: boolean
  message: string
  data: {
    token: string
    user: { id: string; full_name: string; email: string; role: string }
  }
}

export type LoginResponse = { token: string }

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginApiResponse>('/auth/login', payload)
  return { token: data.data.token }
}


// Asset Paths
export type AssetPathsResponse = {
  status: string
  message: string
  data: {
    asset_id: string
    filename: string
    mime_type: string
    paths: Record<string, string>
  }
}

export async function fetchAssetPaths(assetId: string): Promise<AssetPathsResponse['data']> {
  const { data } = await apiClient.get<AssetPathsResponse>(`/assets/${assetId}`)
  return data.data
}

// Invitations
export type InvitePayload = { email: string; role: 'USER' | 'MANAGER' }
export type InviteResponse = {
  success: boolean
  message: string
  data: {
    id: string
    email: string
    role: 'USER' | 'MANAGER'
    status: 'PENDING' | 'JOINED'
    inviteBy: string
    createdAt: string
    updatedAt: string
    acceptedAt: string | null
    invitationLink: string
  }
}

export async function sendInvitation(payload: InvitePayload): Promise<InviteResponse['data']> {
  const { data } = await apiClient.post<InviteResponse>('/invitations', payload)
  return data.data
}

export type InvitationsListResponse = {
  success: boolean
  message: string
  data: Array<{
    id: string
    email: string
    role: 'USER' | 'MANAGER'
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'JOINED'
    inviteBy: string
    createdAt: string
    updatedAt: string
    acceptedAt: string | null
    invitedBy: { id: string; email: string; full_name: string; role: 'ADMIN' | 'MANAGER' | 'USER' }
  }>
}

export async function fetchInvitations() {
  const { data } = await apiClient.get<InvitationsListResponse>('/invitations')
  return data.data
}

export async function reinviteInvitation(invitationId: string): Promise<InviteResponse['data']> {
  const { data } = await apiClient.put<InviteResponse>(`/invitations/${invitationId}/reinvite`)
  return data.data
}

// Register via invitation
export type RegisterInvitePayload = { token: string; full_name: string; password: string }
export type RegisterInviteResponse = { success: boolean; message: string }

export async function registerWithInvite(payload: RegisterInvitePayload): Promise<RegisterInviteResponse> {
  const { data } = await apiClient.post<RegisterInviteResponse>('/auth/register', payload)
  return data
}

// Dashboard metrics and jobs
export type MetricsResponse = {
  status: string
  message: string
  data: { totalAssets: number; addedThisWeek: number; storageUsedGB: number; newUploadsToday: number }
}

export async function fetchMetrics() {
  const { data } = await apiClient.get<MetricsResponse>('/assets/metrics')
  return data.data
}

export type JobsResponse = {
  status: string
  message: string
  data: Array<{
    id: string
    asset_id: string
    job_id: string
    worker_name: string
    event_name: string
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED'
    created_at: string
    updated_at: string
    asset: { asset_id: string; filename: string; mime_type: string; uploader_id: string; status: string; created_at: string }
  }>
}

export async function fetchJobs() {
  const { data } = await apiClient.get<JobsResponse>('/assets/jobs')
  return data.data
}

// Share asset
export type ShareAssetPayload = {
  asset_id: string
  share_type: 'PUBLIC' | 'RESTRICTED'
  user_ids?: string[]
}

export type ShareAssetResponse = {
  success: boolean
  message: string
  data: {
    share_url: string
    asset_id: string
    share_type: string
  }
}

export async function shareAsset(payload: ShareAssetPayload): Promise<ShareAssetResponse['data']> {
  const { data } = await apiClient.post<ShareAssetResponse>('/assets/share', payload)
  return data.data
}

// Users
export type User = {
  id: string
  full_name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  createdAt: string
}

export type UsersResponse = {
  status: string
  message: string
  data: User[]
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<UsersResponse>('/users')
  return data.data
}

// Shared Asset Visibility
export type AssetVisibilityResponse = {
  status: string
  message: string
  data: {
    asset_id: string
    visibility_status: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE'
  }
}

export async function fetchAssetVisibility(assetId: string): Promise<AssetVisibilityResponse['data']> {
  const { data } = await apiClient.get<AssetVisibilityResponse>(`/assets/share/visibility/${assetId}`)
  return data.data
}

// Public Asset Data
export type PublicAssetResponse = {
  status: string
  message: string
  data: {
    asset_id: string
    filename: string
    mime_type: string
    size_bytes: number
    uploader: {
      id: string
      full_name: string
      email: string
      role: string
    }
    shared_by: {
      id: string
      full_name: string
      email: string
    }
    created_at: string
    paths: Record<string, string>
  }
}

export async function fetchPublicAsset(assetId: string): Promise<PublicAssetResponse['data']> {
  const { data } = await apiClient.get<PublicAssetResponse>(`/assets/public/${assetId}`)
  return data.data
}

// Restricted Asset Data (same structure as public)
export type RestrictedAssetResponse = PublicAssetResponse

export async function fetchRestrictedAsset(assetId: string): Promise<RestrictedAssetResponse['data']> {
  const { data } = await apiClient.get<RestrictedAssetResponse>(`/assets/restricted/${assetId}`)
  return data.data
}

// Shared with me API
export interface SharedAsset {
  id: string
  asset_id: string
  shared_by: string
  share_type: 'PUBLIC' | 'RESTRICTED'
  share_token: string
  user_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  asset: {
    asset_id: string
    filename: string
    mime_type: string
    storage_path: string
    uploader_id: string
    group_id: string | null
    size_bytes: number
    status: string
    created_at: string
    updated_at: string
    metadata: Array<{
      metadata_id: string
      asset_id: string
      key: string
      value: any
      created_at: string
      updated_at: string
    }>
    uploader: {
      id: string
      full_name: string
      email: string
      role: string
    }
  }
  sharedBy: {
    id: string
    full_name: string
    email: string
  }
  user: {
    id: string
    full_name: string
    email: string
  } | null
}

export interface SharedWithMeResponse {
  status: string
  message: string
  data: SharedAsset[]
}

export async function fetchSharedWithMe(): Promise<SharedWithMeResponse['data']> {
  const { data } = await apiClient.get<SharedWithMeResponse>('/assets/shared')
  return data.data
}


