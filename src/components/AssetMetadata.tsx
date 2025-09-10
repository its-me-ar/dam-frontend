import { Download } from 'lucide-react'
import { formatSize } from '../utils/helper'
import { useDownload } from '../hooks/useDownload'

interface AssetMetadataProps {
  asset: {
    name: string
    mimeType: string
    sizeBytes?: number
    visibilityStatus: string
    paths: Record<string, string>
  }
}

export function AssetMetadata({ asset }: AssetMetadataProps) {
  const { downloadFile } = useDownload()

  return (
    <div className="space-y-4">
      {/* Available Variants */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Available Variants</h4>
        <div className="space-y-3">
          {Object.entries(asset.paths)
            .filter(([key]) => key !== 'thumbnail')
            .map(([key, url]) => (
            <div key={key} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900 capitalize">
                  {key === 'original' ? 'Original' : key.toUpperCase()}
                </span>
                <button
                  onClick={() => downloadFile(url, `${asset.name}-${key}`)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Information */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Share Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Visibility:</span>
            <span className="font-medium">{asset.visibilityStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">File Size:</span>
            <span className="font-medium">{formatSize(asset.sizeBytes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">MIME Type:</span>
            <span className="font-medium">{asset.mimeType}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
