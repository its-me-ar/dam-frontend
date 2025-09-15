import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoginPayload,
  LoginResponse,
  User,
  AssetPathsResponse,
  InvitePayload,
  InviteResponse,
  InvitationsListResponse,
  RegisterInvitePayload,
  RegisterInviteResponse,
  MetricsResponse,
  JobsResponse,
  ShareAssetPayload,
  ShareAssetResponse,
  UsersResponse,
  AssetVisibilityResponse,
  PublicAssetResponse,
  RestrictedAssetResponse,
  SharedWithMeResponse,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Re-export types for backward compatibility
export type {
  LoginPayload,
  LoginResponse,
  User,
  AssetPathsResponse,
  InvitePayload,
  InviteResponse,
  InvitationsListResponse,
  RegisterInvitePayload,
  RegisterInviteResponse,
  MetricsResponse,
  JobsResponse,
  ShareAssetPayload,
  ShareAssetResponse,
  UsersResponse,
  AssetVisibilityResponse,
  PublicAssetResponse,
  RestrictedAssetResponse,
  SharedWithMeResponse,
} from '../types';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export function buildAssetUrl(path: string): string {
  if (!path) return '';
  const storageBase =
    (import.meta.env.VITE_STORAGE_BE_URL as string | undefined) ?? API_BASE_URL;
  const base = storageBase.endsWith('/')
    ? storageBase.slice(0, -1)
    : storageBase;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${normalized}`;
}

type LoginApiResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: { id: string; full_name: string; email: string; role: string };
  };
};

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginApiResponse>(
    '/auth/login',
    payload
  );
  return { token: data.data.token };
}

// Asset Paths

export async function fetchAssetPaths(
  assetId: string
): Promise<AssetPathsResponse['data']> {
  const { data } = await apiClient.get<AssetPathsResponse>(
    `/assets/${assetId}`
  );
  return data.data;
}

// Invitations

export async function sendInvitation(
  payload: InvitePayload
): Promise<InviteResponse['data']> {
  const { data } = await apiClient.post<InviteResponse>(
    '/invitations',
    payload
  );
  return data.data;
}

export async function fetchInvitations() {
  const { data } = await apiClient.get<InvitationsListResponse>('/invitations');
  return data.data;
}

export async function reinviteInvitation(
  invitationId: string
): Promise<InviteResponse['data']> {
  const { data } = await apiClient.put<InviteResponse>(
    `/invitations/${invitationId}/reinvite`
  );
  return data.data;
}

// Register via invitation

export async function registerWithInvite(
  payload: RegisterInvitePayload
): Promise<RegisterInviteResponse> {
  const { data } = await apiClient.post<RegisterInviteResponse>(
    '/auth/register',
    payload
  );
  return data;
}

// Dashboard metrics and jobs

export async function fetchMetrics() {
  const { data } = await apiClient.get<MetricsResponse>('/assets/metrics');
  return data.data;
}

export async function fetchJobs() {
  const { data } = await apiClient.get<JobsResponse>('/assets/jobs');
  return data.data;
}

// Share asset

export async function shareAsset(
  payload: ShareAssetPayload
): Promise<ShareAssetResponse['data']> {
  const { data } = await apiClient.post<ShareAssetResponse>(
    '/assets/share',
    payload
  );
  return data.data;
}

// Users

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<UsersResponse>('/users');
  return data.data;
}

// Shared Asset Visibility

export async function fetchAssetVisibility(
  assetId: string
): Promise<AssetVisibilityResponse['data']> {
  const { data } = await apiClient.get<AssetVisibilityResponse>(
    `/assets/share/visibility/${assetId}`
  );
  return data.data;
}

// Public Asset Data
export async function fetchPublicAsset(
  assetId: string
): Promise<PublicAssetResponse['data']> {
  const { data } = await apiClient.get<PublicAssetResponse>(
    `/assets/public/${assetId}`
  );
  return data.data;
}

// Restricted Asset Data (same structure as public)

export async function fetchRestrictedAsset(
  assetId: string
): Promise<RestrictedAssetResponse['data']> {
  const { data } = await apiClient.get<RestrictedAssetResponse>(
    `/assets/restricted/${assetId}`
  );
  return data.data;
}

// Shared with me API

export async function fetchSharedWithMe(): Promise<
  SharedWithMeResponse['data']
> {
  const { data } = await apiClient.get<SharedWithMeResponse>('/assets/shared');
  return data.data;
}
