import { useQuery } from '@tanstack/react-query'
import { apiClient, buildAssetUrl } from '../lib/api'

export type Asset = {
  id: string
  name: string
  mimeType: string
  thumbnailUrl?: string
  createdAt: string
  durationSeconds?: number
  sizeBytes?: number
  uploader?: { id: string; fullName: string; email: string; role: string }
}

type AssetsApiResponse = {
  status: string
  message: string
  data: Array<{
    asset_id: string
    filename: string
    mime_type: string
    storage_path: string
    size_bytes?: number
    created_at: string
    metadata: Array<{
      key: string
      value: any
    }>
    uploader?: { id: string; full_name: string; email: string; role: string }
  }>
}

function resolveThumbnailUrl(item: AssetsApiResponse['data'][number]): string | undefined {
  const meta = item.metadata?.find((m) => m.key.includes('variants'))
  const thumb = meta?.value?.thumbnails?.[0]?.path
  return thumb ? buildAssetUrl(thumb) : undefined
}

function resolveDurationSeconds(item: AssetsApiResponse['data'][number]): number | undefined {
  const meta = item.metadata?.find((m) => m.key === 'video_variants')
  const original = meta?.value?.original?.duration
  return typeof original === 'number' ? original : undefined
}

function resolveOriginalSizeBytes(item: AssetsApiResponse['data'][number]): number | undefined {
  if (typeof item.size_bytes === 'number') return item.size_bytes
  const videoMeta = item.metadata?.find((m) => m.key === 'video_variants')
  const imageMeta = item.metadata?.find((m) => m.key === 'image_variants')
  const size = videoMeta?.value?.original?.size ?? imageMeta?.value?.original?.size
  return typeof size === 'number' ? size : undefined
}

async function fetchAssets(): Promise<Asset[]> {
  const { data } = await apiClient.get<AssetsApiResponse>('/assets')
  return data.data.map((item) => ({
    id: item.asset_id,
    name: item.filename,
    mimeType: item.mime_type,
    thumbnailUrl: resolveThumbnailUrl(item),
    createdAt: item.created_at,
    durationSeconds: item.mime_type?.startsWith('video') ? resolveDurationSeconds(item) : undefined,
    sizeBytes: resolveOriginalSizeBytes(item),
    uploader: item.uploader ? { id: item.uploader.id, fullName: item.uploader.full_name, email: item.uploader.email, role: item.uploader.role } : undefined,
  }))
}

export function useAssets() {
  return useQuery({ queryKey: ['assets'], queryFn: fetchAssets })
}


