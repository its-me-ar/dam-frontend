import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from './ui/Modal'
import { Card, CardContent } from './ui/Card'
import { Share2, Users, Globe, Check } from 'lucide-react'
import { fetchUsers } from '../lib/api'
import { useShareAsset } from '../hooks/useShareAsset'
import { useToast } from './ui/Toast'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  assetId: string
  assetName: string
}

export function ShareModal({ open, onClose, assetId, assetName }: ShareModalProps) {
  const [shareType, setShareType] = useState<'PUBLIC' | 'RESTRICTED'>('PUBLIC')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const { notifySuccess, notifyError } = useToast()
  const { shareAsync, isLoading } = useShareAsset()

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: open && shareType === 'RESTRICTED'
  })

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleShare = async () => {
    try {
      const payload = {
        asset_id: assetId,
        share_type: shareType,
        ...(shareType === 'RESTRICTED' && { user_ids: selectedUserIds })
      }

      const result = await shareAsync(payload)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.share_url)
      setCopied(true)
      notifySuccess('Share link copied to clipboard!')
      
      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 2000)
    } catch (error: any) {
      // Extract the actual API error message
      const apiMessage = error?.response?.data?.message || error?.message || 'Failed to share asset'
      notifyError(apiMessage)
    }
  }

  const canShare = shareType === 'PUBLIC' || (shareType === 'RESTRICTED' && selectedUserIds.length > 0)

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Share2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Share Asset</h2>
            <p className="text-sm text-gray-600 truncate" title={assetName}>{assetName}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Share Type Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Share Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShareType('PUBLIC')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  shareType === 'PUBLIC'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Globe className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Public</div>
                <div className="text-xs text-gray-500">Anyone with link</div>
              </button>
              <button
                onClick={() => setShareType('RESTRICTED')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  shareType === 'RESTRICTED'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Restricted</div>
                <div className="text-xs text-gray-500">Selected users only</div>
              </button>
            </div>
          </div>

          {/* User Selection for Restricted */}
          {shareType === 'RESTRICTED' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Users ({selectedUserIds.length} selected)
              </label>
              <Card>
                <CardContent className="p-0 max-h-48 overflow-y-auto">
                  {usersLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No users found</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.full_name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email} • {user.role}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!canShare || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
