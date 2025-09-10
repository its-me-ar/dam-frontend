import { Suspense, lazy, useMemo, useState } from 'react'
import { useSharedWithMe } from '../hooks/useSharedWithMe'
import { Card, CardContent } from '../components/ui/Card'
import { Play, LayoutGrid, Rows, List, Download, Globe, Users, User } from 'lucide-react'
import { formatDuration, formatSize } from '../utils/helper'
import { useDownload } from '../hooks/useDownload'
import { usePageTitle } from '../hooks/usePageTitle'

const AssetPreviewModal = lazy(() => import('../components/AssetPreviewModal').then(m => ({ default: m.AssetPreviewModal })))

export default function SharedWithMePage() {
  usePageTitle()
  const { data, isLoading, isError } = useSharedWithMe()
  const { downloadFile } = useDownload()
  const [selected, setSelected] = useState<{ id: string; name: string; mime: string } | null>(null)
  const [view, setView] = useState<'grid-sm' | 'grid-lg' | 'list'>('grid-sm')
  const gridClass = useMemo(() => view === 'grid-lg' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', [view])
  const thumbClass = view === 'grid-lg' ? 'h-64' : 'h-44'

  const handleDownload = async (asset: any) => {
    // For shared assets, we need to use the share token to download
    // This would typically involve calling a specific download endpoint with the share token
    // For now, we'll use the asset ID and let the backend handle the access control
    const downloadUrl = `/api/assets/shared/${asset.shareToken}/download`
    await downloadFile(downloadUrl, asset.name)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shared with Me</h1>
        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setView('grid-sm')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${view === 'grid-sm' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Grid"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            onClick={() => setView('grid-lg')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${view === 'grid-lg' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="Large Grid"
          >
            <Rows className="h-4 w-4" />
            Large
          </button>
          <button
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            title="List"
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <Card><CardContent>Loading…</CardContent></Card>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">Failed to load shared assets</div>
      ) : data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No shared assets</p>
              <p className="text-sm">No one has shared any assets with you yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {view === 'list' ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <div className="hidden md:grid grid-cols-[auto_1fr_100px_140px_140px_120px_80px] items-center gap-3 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Preview</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Shared by</div>
                    <div>Size</div>
                    <div>Share Type</div>
                    <div></div>
                  </div>
                  {data?.map((a) => (
                    <div key={a.id} className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_100px_140px_140px_120px_80px] items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected({ id: a.assetId, name: a.name, mime: a.mimeType })}>
                      <div className="h-12 w-16 overflow-hidden rounded-md bg-gray-100">
                        {a.thumbnailUrl ? <img src={a.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium" title={a.name}>{a.name}</div>
                        <div className="text-xs text-gray-500 truncate">Uploaded by {a.uploader.fullName}</div>
                      </div>
                      <div className="hidden md:block text-sm text-gray-600">{a.mimeType.split('/')[0]}</div>
                      <div className="hidden md:block text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{a.sharedBy.fullName}</span>
                        </div>
                      </div>
                      <div className="hidden md:block text-sm text-gray-600">{formatSize(a.sizeBytes)}</div>
                      <div className="hidden md:flex items-center justify-center">
                        {a.shareType === 'PUBLIC' ? (
                          <div className="flex items-center gap-1 text-xs text-green-600" title="Public share">
                            <Globe className="h-3 w-3" />
                            <span>Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-blue-600" title="Restricted share">
                            <Users className="h-3 w-3" />
                            <span>Restricted</span>
                          </div>
                        )}
                      </div>
                      <div className="hidden md:flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(a)
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Download asset"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid ${gridClass} gap-4`}>
              {data?.map((a) => (
                <Card key={a.id} className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer" onClick={() => setSelected({ id: a.assetId, name: a.name, mime: a.mimeType })}>
                  <div className="relative">
                    {a.thumbnailUrl ? (
                      <img src={a.thumbnailUrl} alt={a.name} className={`${thumbClass} w-full object-cover`} loading="lazy" />
                    ) : (
                      <div className={`flex ${thumbClass} items-center justify-center bg-gray-100 text-gray-400`}>No preview</div>
                    )}
                    {a.mimeType?.startsWith('video') ? (
                      <>
                        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 p-2 text-white shadow">
                          <Play className="h-4 w-4" />
                        </div>
                        {a.durationSeconds ? (
                          <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white">
                            {formatDuration(a.durationSeconds)}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(a)
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-md shadow-sm transition-colors"
                      title="Download asset"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {/* Share Type Indicator */}
                    <div className="absolute bottom-2 left-2">
                      {a.shareType === 'PUBLIC' ? (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                          <Globe className="h-3 w-3" />
                          <span>Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                          <Users className="h-3 w-3" />
                          <span>Restricted</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="truncate font-medium" title={a.name}>{a.name}</div>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{a.mimeType.split('/')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatSize(a.sizeBytes)}</span>
                      <span>{new Date(a.sharedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Shared by {a.sharedBy.fullName}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Uploaded by {a.uploader.fullName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      <Suspense fallback={null}>
        <AssetPreviewModal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          assetId={selected?.id ?? null}
          assetName={selected?.name}
          mimeType={selected?.mime}
        />
      </Suspense>
    </div>
  )
}
