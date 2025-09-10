import { Play, Eye, File, Video, Image, Music, Archive } from 'lucide-react'
import { formatDuration } from '../utils/helper'

interface AssetPreviewCardProps {
  asset: {
    name: string
    mimeType: string
    thumbnailUrl?: string
    durationSeconds?: number
  }
  canPreview: boolean
  onPreview: () => void
}

export function AssetPreviewCard({ asset, canPreview, onPreview }: AssetPreviewCardProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('audio/')) return Music
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive
    return File
  }

  const FileIcon = getFileIcon(asset.mimeType)

  return (
    <div 
      className="relative cursor-pointer"
      onClick={onPreview}
    >
      {asset.thumbnailUrl ? (
        <img 
          src={asset.thumbnailUrl} 
          alt={asset.name}
          className="w-full h-96 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-96 bg-gray-100 flex flex-col items-center justify-center rounded-t-lg gap-3">
          <div className="p-4 rounded-full bg-gray-200">
            <FileIcon className="h-16 w-16 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Preview not available</p>
            <p className="text-xs text-gray-500 mt-1">You can still download the file to view it locally.</p>
          </div>
        </div>
      )}
      
      {/* Video Play Button */}
      {asset.mimeType?.startsWith('video') && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transition-colors">
            <Play className="h-8 w-8" />
          </button>
        </div>
      )}
      
      {/* Duration for videos */}
      {asset.durationSeconds && asset.mimeType?.startsWith('video') && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {formatDuration(asset.durationSeconds)}
        </div>
      )}
      
      {/* Preview overlay for clickable assets */}
      {canPreview && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="bg-white/90 text-gray-900 px-3 py-2 rounded-lg flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Click to preview</span>
          </div>
        </div>
      )}
    </div>
  )
}
