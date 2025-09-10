import { useQuery } from '@tanstack/react-query'
import { fetchAssetVisibility, fetchPublicAsset, fetchRestrictedAsset, buildAssetUrl } from '../lib/api'

export type SharedAsset = {
  id: string
  name: string
  mimeType: string
  thumbnailUrl?: string
  createdAt: string
  durationSeconds?: number
  sizeBytes?: number
  uploader?: { id: string; fullName: string; email: string; role: string }
  sharedBy?: { id: string; fullName: string; email: string }
  visibilityStatus: 'PUBLIC' | 'RESTRICTED' | 'PRIVATE'
  paths: Record<string, string>
}

export function useSharedAsset(assetId: string) {
  return useQuery({
    queryKey: ['shared-asset', assetId],
    queryFn: async (): Promise<SharedAsset> => {
      try {
        // First check if asset is visible/shared
        const visibility = await fetchAssetVisibility(assetId)
        
        if (visibility.visibility_status === 'PRIVATE') {
          throw new Error('Asset is private and not accessible')
        }

        // Fetch the actual asset data based on visibility status
        let assetData
        if (visibility.visibility_status === 'PUBLIC') {
          assetData = await fetchPublicAsset(assetId)
        } else {
          assetData = await fetchRestrictedAsset(assetId)
        }

        // Build thumbnail URL - check if it's a full URL or needs to be built
        const thumbnailPath = assetData.paths.thumbnail
        const thumbnailUrl = thumbnailPath 
          ? (thumbnailPath.startsWith('http') ? thumbnailPath : buildAssetUrl(thumbnailPath))
          : undefined

        return {
          id: assetData.asset_id,
          name: assetData.filename,
          mimeType: assetData.mime_type,
          thumbnailUrl,
          createdAt: assetData.created_at,
          sizeBytes: assetData.size_bytes,
          uploader: {
            id: assetData.uploader.id,
            fullName: assetData.uploader.full_name,
            email: assetData.uploader.email,
            role: assetData.uploader.role
          },
          sharedBy: {
            id: assetData.shared_by.id,
            fullName: assetData.shared_by.full_name,
            email: assetData.shared_by.email
          },
          visibilityStatus: visibility.visibility_status,
          paths: assetData.paths
        }
      } catch (error) {
        console.error('Error fetching shared asset:', error)
        throw error
      }
    },
    enabled: !!assetId,
    retry: false, // Don't retry on 404/403 errors
  })
}
