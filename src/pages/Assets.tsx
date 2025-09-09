import { Suspense, lazy, useMemo, useState } from 'react'
import { useAssets } from '../hooks/useAssets'
import { Card, CardContent } from '../components/ui/Card'
import { Play, LayoutGrid, Rows, List } from 'lucide-react'
import { formatDuration, formatSize } from '../utils/helper'
const AssetPreviewModal = lazy(() => import('../components/AssetPreviewModal').then(m => ({ default: m.AssetPreviewModal })))
import { useAuth } from '../context/AuthContext'

export default function AssetsPage() {
  const { data, isLoading, isError } = useAssets()
  const [selected, setSelected] = useState<{ id: string; name: string; mime: string } | null>(null)
  const { userId } = useAuth()
  const [view, setView] = useState<'grid-sm' | 'grid-lg' | 'list'>('grid-sm')
  const gridClass = useMemo(() => view === 'grid-lg' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', [view])
  const thumbClass = view === 'grid-lg' ? 'h-64' : 'h-44'
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assets</h1>
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">Failed to load assets</div>
      ) : (
        <>
          {view === 'list' ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <div className="hidden md:grid grid-cols-[auto_1fr_100px_140px_140px] items-center gap-3 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Preview</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Created</div>
                    <div>Size</div>
                  </div>
                  {data?.map((a) => (
                    <div key={a.id} className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_100px_140px_140px] items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected({ id: a.id, name: a.name, mime: a.mimeType })}>
                      <div className="h-12 w-16 overflow-hidden rounded-md bg-gray-100">
                        {a.thumbnailUrl ? <img src={a.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium" title={a.name}>{a.name}</div>
                        <div className="text-xs text-gray-500 truncate">{a.uploader ? (a.uploader.id === userId ? 'Added by You' : `Added by ${a.uploader.fullName}`) : null}</div>
                      </div>
                      <div className="hidden md:block text-sm text-gray-600">{a.mimeType.split('/')[0]}</div>
                      <div className="hidden md:block text-sm text-gray-600">{new Date(a.createdAt).toLocaleString()}</div>
                      <div className="hidden md:block text-sm text-gray-600">{typeof a.sizeBytes === 'number' ? formatSize(a.sizeBytes) : '-'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid ${gridClass} gap-4`}>
              {data?.map((a) => (
                <Card key={a.id} className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer" onClick={() => setSelected({ id: a.id, name: a.name, mime: a.mimeType })}>
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
                  </div>
                  <CardContent>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="truncate font-medium" title={a.name}>{a.name}</div>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{a.mimeType.split('/')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                      {typeof a.sizeBytes === 'number' ? <span>{formatSize(a.sizeBytes)}</span> : null}
                    </div>
                    {a.uploader ? (
                      <div className="mt-1 text-xs text-gray-500">
                        Added by {a.uploader.id === userId ? 'You' : `${a.uploader.fullName} (${a.uploader.role})`}
                      </div>
                    ) : null}
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


