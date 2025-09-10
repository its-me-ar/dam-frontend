import { useParams } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Download, Share2, Globe, Users, Calendar, File, FileText, Video, Image, Music, Archive } from 'lucide-react'
import { formatSize } from '../utils/helper'
import { useSharedAsset } from '../hooks/useSharedAsset'
import { useToast } from '../components/ui/Toast'
import { useDownload } from '../hooks/useDownload'
import { useState } from 'react'
import { SharedAssetError } from '../components/SharedAssetError'
import { SharedAssetLoading } from '../components/SharedAssetLoading'
import { AssetPreviewCard } from '../components/AssetPreviewCard'
import { SharedAssetPreviewModal } from '../components/SharedAssetPreviewModal'
import { AssetMetadata } from '../components/AssetMetadata'
import { usePageTitle } from '../hooks/usePageTitle'

export default function SharedAssetPage() {
  usePageTitle()
  const { assetId } = useParams<{ assetId: string }>()
  const { data: asset, isLoading: loading, error } = useSharedAsset(assetId || '')
  const { notifySuccess, notifyError } = useToast()
  const { downloadFile } = useDownload()
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false)

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('audio/')) return Music
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive
    return File
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return 'text-red-600 bg-red-100'
    if (mimeType.startsWith('image/')) return 'text-green-600 bg-green-100'
    if (mimeType.startsWith('audio/')) return 'text-purple-600 bg-purple-100'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  const isVideo = asset?.mimeType?.startsWith('video')
  const isImage = asset?.mimeType?.startsWith('image')
  const canPreview = isVideo || isImage

  if (loading) {
    return <SharedAssetLoading />
  }

  if (error) {
    return <SharedAssetError error={error} />
  }

  if (!asset) {
    return <SharedAssetLoading />
  }

  const FileIcon = getFileIcon(asset.mimeType)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Share2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Shared Asset</h1>
              <p className="text-sm text-gray-600">
                {asset.visibilityStatus === 'PUBLIC' 
                  ? 'Publicly shared content' 
                  : asset.visibilityStatus === 'RESTRICTED' 
                    ? 'Restricted shared content' 
                    : 'Private content'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {asset.visibilityStatus === 'PUBLIC' ? (
              <div className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                <Globe className="h-4 w-4" />
                Public
              </div>
            ) : asset.visibilityStatus === 'RESTRICTED' ? (
              <div className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                <Users className="h-4 w-4" />
                Restricted
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                <File className="h-4 w-4" />
                Private
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Asset Details */}
          <div className="space-y-6">
            {/* Asset Preview */}
            <Card>
              <CardContent className="p-0">
                <AssetPreviewCard
                  asset={asset}
                  canPreview={canPreview || false}
                  onPreview={() => setShowPreview(true)}
                />
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{asset.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getFileTypeColor(asset.mimeType)}`}>
                        <FileIcon className="h-3 w-3" />
                        {asset.mimeType.split('/')[0].toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {typeof asset.sizeBytes === 'number' ? formatSize(asset.sizeBytes) : 'Unknown size'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Created {new Date(asset.createdAt).toLocaleString()}</span>
                    </div>
                    
                    {asset.uploader && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {asset.uploader.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          Uploaded by {asset.uploader.fullName} ({asset.uploader.role})
                        </span>
                      </div>
                    )}
                    
                    {asset.sharedBy && asset.sharedBy.id !== asset.uploader?.id && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-4 w-4 rounded-full bg-blue-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {asset.sharedBy.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          Shared by {asset.sharedBy.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => downloadFile(asset.paths.original, asset.name)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    {asset.visibilityStatus === 'PUBLIC' && (
                      <button 
                        onClick={async () => {
                          const shareUrl = window.location.href
                          try {
                            await navigator.clipboard.writeText(shareUrl)
                            notifySuccess('Link copied to clipboard!')
                          } catch (error) {
                            console.error('Failed to copy:', error)
                            notifyError('Failed to copy link. Please try again.')
                            // Fallback: show prompt
                            prompt('Copy this link:', shareUrl)
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
                </div>
                <AssetMetadata asset={asset} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <SharedAssetPreviewModal
        asset={asset}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}
