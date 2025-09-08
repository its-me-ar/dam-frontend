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


