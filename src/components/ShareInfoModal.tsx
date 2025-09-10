import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Card, CardContent } from './ui/Card';
import { Share2, Globe, Users, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import type { Asset } from '../hooks/useAssets';

interface ShareInfoModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export function ShareInfoModal({ open, onClose, asset }: ShareInfoModalProps) {
  const [copied, setCopied] = useState(false);
  const { notifySuccess, notifyError } = useToast();

  // Group shares by type
  const publicShares =
    asset?.shares?.filter(
      share => share.share_type === 'PUBLIC' && share.is_active
    ) || [];
  const restrictedShares =
    asset?.shares?.filter(
      share => share.share_type === 'RESTRICTED' && share.is_active
    ) || [];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notifySuccess('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      notifyError('Failed to copy to clipboard');
    }
  };

  const generateShareUrl = () => {
    // Use asset_id for sharing - one asset = one share link
    return `${window.location.origin}/shared/${asset?.id}`;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className='w-full'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Share2 className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold'>Share Information</h2>
            <p className='text-sm text-gray-600 truncate' title={asset?.name}>
              {asset?.name}
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          {/* Public Shares */}
          {publicShares.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Globe className='h-4 w-4 text-green-600' />
                <span className='text-sm font-medium text-gray-700'>
                  Public Share
                </span>
                <span className='text-xs text-gray-500'>
                  ({publicShares.length} link
                  {publicShares.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className='space-y-2'>
                {publicShares.map(share => (
                  <Card key={share.id} className='border-green-200 bg-green-50'>
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium text-green-800'>
                            Anyone with link
                          </div>
                          <div className='text-xs text-green-600'>
                            Created{' '}
                            {new Date(share.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => copyToClipboard(generateShareUrl())}
                            className='p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors'
                            title='Copy share link'
                          >
                            {copied ? (
                              <Check className='h-4 w-4' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </button>
                          <a
                            href={generateShareUrl()}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors'
                            title='Open share link'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Restricted Shares */}
          {restrictedShares.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Users className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium text-gray-700'>
                  Restricted Share
                </span>
                <span className='text-xs text-gray-500'>
                  ({restrictedShares.length} user
                  {restrictedShares.length > 1 ? 's' : ''})
                </span>
              </div>
              <Card className='border-blue-200 bg-blue-50'>
                <CardContent className='p-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-medium text-blue-800 mb-2'>
                        Shared with {restrictedShares.length} user
                        {restrictedShares.length > 1 ? 's' : ''}
                      </div>
                      <div className='space-y-1'>
                        {restrictedShares.map(share => (
                          <div key={share.id} className='text-xs text-blue-600'>
                            •{' '}
                            {share.user ? share.user.full_name : 'Unknown User'}{' '}
                            ({share.user?.email})
                          </div>
                        ))}
                      </div>
                      <div className='text-xs text-blue-500 mt-2'>
                        Created{' '}
                        {new Date(
                          restrictedShares[0].created_at
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => copyToClipboard(generateShareUrl())}
                        className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                        title='Copy share link'
                      >
                        {copied ? (
                          <Check className='h-4 w-4' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </button>
                      <a
                        href={generateShareUrl()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                        title='Open share link'
                      >
                        <ExternalLink className='h-4 w-4' />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No shares message */}
          {publicShares.length === 0 && restrictedShares.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <Share2 className='h-8 w-8 mx-auto mb-2 text-gray-400' />
              <p className='text-sm'>No active shares found</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-2 pt-2'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
