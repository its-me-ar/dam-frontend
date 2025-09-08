import { useAssets } from '../hooks/useAssets'
import { Card, CardContent } from '../components/ui/Card'
import { Play } from 'lucide-react'

export default function AssetsPage() {
  const { data, isLoading, isError } = useAssets()
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Assets</h1>
      {isLoading ? (
        <Card><CardContent>Loading…</CardContent></Card>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">Failed to load assets</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((a) => (
            <Card key={a.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative">
                {a.thumbnailUrl ? (
                  <img src={a.thumbnailUrl} alt={a.name} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gray-100 text-gray-400">No preview</div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size = size / 1024
    i++
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}


