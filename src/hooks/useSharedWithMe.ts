import { useQuery } from '@tanstack/react-query'
import { fetchSharedWithMe, type SharedAsset } from '../lib/api'
import { buildAssetUrl } from '../lib/api'

export interface SharedWithMeAsset {
  id: string
  assetId: string
  name: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  thumbnailUrl?: string
  durationSeconds?: number
  uploader: {
    id: string
    fullName: string
    email: string
    role: string
  }
  sharedBy: {
    id: string
    fullName: string
    email: string
  }
  shareType: 'PUBLIC' | 'RESTRICTED'
  shareToken: string
  isActive: boolean
  sharedAt: string
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['sharedWithMe'],
    queryFn: async (): Promise<SharedWithMeAsset[]> => {
      const data = await fetchSharedWithMe()
      
      return data.map((item: SharedAsset): SharedWithMeAsset => {
        // Build thumbnail URL if available
        let thumbnailUrl: string | undefined
        const thumbnailMetadata = item.asset.metadata.find(m => m.key === 'image_variants' || m.key === 'video_variants')
        if (thumbnailMetadata?.value?.thumbnails?.[0]?.path) {
          thumbnailUrl = buildAssetUrl(thumbnailMetadata.value.thumbnails[0].path)
        }

        // Extract duration for videos
        let durationSeconds: number | undefined
        if (item.asset.mime_type.startsWith('video/') && thumbnailMetadata?.value?.original?.duration) {
          durationSeconds = thumbnailMetadata.value.original.duration
        }

        return {
          id: item.id,
          assetId: item.asset_id,
          name: item.asset.filename,
          mimeType: item.asset.mime_type,
          sizeBytes: item.asset.size_bytes,
          createdAt: item.asset.created_at,
          thumbnailUrl,
          durationSeconds,
          uploader: {
            id: item.asset.uploader.id,
            fullName: item.asset.uploader.full_name,
            email: item.asset.uploader.email,
            role: item.asset.uploader.role
          },
          sharedBy: {
            id: item.sharedBy.id,
            fullName: item.sharedBy.full_name,
            email: item.sharedBy.email
          },
          shareType: item.share_type,
          shareToken: item.share_token,
          isActive: item.is_active,
          sharedAt: item.created_at
        }
      })
    }
  })
}
