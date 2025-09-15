import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAssetPaths } from '../lib/api';
import { Modal } from './ui/Modal';
import type { AssetPreviewModalProps } from '../types';

type Props = AssetPreviewModalProps;

export function AssetPreviewModal({
  assetId,
  assetName,
  mimeType,
  open,
  onClose,
}: Props) {
  const enabled = open && Boolean(assetId);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['asset-paths', assetId],
    queryFn: () => fetchAssetPaths(assetId as string),
    enabled,
  });

  const isVideo = mimeType?.startsWith('video');
  const isImage = mimeType?.startsWith('image');

  const videoSources = useMemo(() => {
    if (!data?.paths) return [] as Array<{ label: string; url: string }>;
    const entries = Object.entries(data.paths);
    // Prefer variants sorted by quality
    const preferredOrder = ['720p', '480p', 'original'];
    const sorted = entries.sort(
      (a, b) => preferredOrder.indexOf(a[0]) - preferredOrder.indexOf(b[0])
    );
    return sorted.map(([label, url]) => ({ label, url }));
  }, [data]);

  // Quality selection
  const [selectedQuality, setSelectedQuality] = useState<'auto' | string>(
    'auto'
  );
  const qualityOptions = useMemo(
    () => ['auto', ...videoSources.map(s => s.label)],
    [videoSources]
  );
  const currentVideoUrl = useMemo(() => {
    if (selectedQuality !== 'auto') {
      return videoSources.find(s => s.label === selectedQuality)?.url;
    }
    return videoSources[0]?.url;
  }, [selectedQuality, videoSources]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // When quality changes, swap src while preserving playback position/state
  useEffect(() => {
    if (!videoRef.current || !currentVideoUrl) return;
    const video = videoRef.current;
    const wasPaused = video.paused;
    const currentTime = video.currentTime;
    const playbackRate = video.playbackRate;
    const wasMuted = video.muted;
    const volume = video.volume;
    // swap source
    video.src = currentVideoUrl;
    video.playbackRate = playbackRate;
    video.muted = wasMuted;
    video.volume = volume;
    const onLoaded = () => {
      video.currentTime = currentTime;
      if (!wasPaused) void video.play().catch(() => {});
    };
    video.addEventListener('loadedmetadata', onLoaded, { once: true });
    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [currentVideoUrl]);

  const headerTitle = assetName ?? 'Preview';

  async function downloadFile(url: string, label?: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const urlPath = decodeURIComponent(url.split('?')[0]);
      const nameFromAsset =
        assetName && assetName.includes('.')
          ? assetName.substring(assetName.lastIndexOf('.'))
          : '';
      const nameFromUrl = urlPath.includes('.')
        ? `.${urlPath.split('.').pop()}`
        : '';
      const ext = nameFromAsset || nameFromUrl;
      const safeName = (
        assetName?.replace(/[^\w\-.]+/g, '_') || 'download'
      ).replace(/\.+$/, '');
      a.href = objectUrl;
      a.download = label ? `${safeName}-${label}${ext}` : `${safeName}${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback for CORS-restricted storage: use direct link with download attribute
      const a = document.createElement('a');
      const urlPath = decodeURIComponent(url.split('?')[0]);
      const nameFromAsset =
        assetName && assetName.includes('.')
          ? assetName.substring(assetName.lastIndexOf('.'))
          : '';
      const nameFromUrl = urlPath.includes('.')
        ? `.${urlPath.split('.').pop()}`
        : '';
      const ext = nameFromAsset || nameFromUrl;
      const safeName = (
        assetName?.replace(/[^\w\-.]+/g, '_') || 'download'
      ).replace(/\.+$/, '');
      a.href = url;
      a.download = label ? `${safeName}-${label}${ext}` : `${safeName}${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={headerTitle}
      size='xl'
      contentClassName='pt-2'
    >
      {isLoading ? (
        <div className='flex h-96 items-center justify-center text-gray-500'>
          Loading preview…
        </div>
      ) : isError ? (
        <div className='rounded-xl border border-red-200 bg-red-50 p-6 text-red-700'>
          Failed to load preview
        </div>
      ) : data ? (
        <div className='space-y-4'>
          {isVideo ? (
            data.paths ? (
              <div>
                <div className='w-full overflow-hidden rounded-xl border border-gray-200 bg-black'>
                  {/* Use max heights to avoid scroll; rely on intrinsic aspect */}
                  <video
                    ref={videoRef}
                    controls
                    className='w-full max-h-[65vh]'
                    src={currentVideoUrl ?? undefined}
                  />
                </div>
                <div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-500'>Quality:</span>
                    <div className='flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1'>
                      {qualityOptions.map(q => (
                        <button
                          key={q}
                          onClick={() =>
                            setSelectedQuality(q as typeof selectedQuality)
                          }
                          className={`rounded-full px-3 py-1 ${selectedQuality === q ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    {videoSources.map(s => (
                      <button
                        key={s.label}
                        onClick={() => downloadFile(s.url, s.label)}
                        className='rounded-full border border-gray-200 bg-white px-3 py-1 hover:bg-gray-50'
                      >
                        Download {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NoPreview data={data} onDownload={u => downloadFile(u)} />
            )
          ) : isImage ? (
            data.paths?.original ? (
              <div>
                <div className='flex items-center justify-center'>
                  <img
                    src={data.paths.original}
                    alt={assetName}
                    className='max-h-[70vh] rounded-xl border border-gray-200 object-contain'
                  />
                </div>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-sm'>
                  {Object.entries(data.paths).map(([label, url]) => (
                    <button
                      key={label}
                      onClick={() => downloadFile(url, label)}
                      className='rounded-full border border-gray-200 bg-white px-3 py-1 hover:bg-gray-50'
                    >
                      Download {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <NoPreview data={data} onDownload={u => downloadFile(u)} />
            )
          ) : (
            <NoPreview data={data} onDownload={u => downloadFile(u)} />
          )}
        </div>
      ) : (
        <div className='flex h-96 items-center justify-center text-gray-500'>
          No data
        </div>
      )}
    </Modal>
  );
}

function NoPreview({
  data,
  onDownload,
}: {
  data: { paths: Record<string, string> };
  onDownload?: (url: string) => void;
}) {
  const anyPath = data?.paths?.original ?? Object.values(data?.paths ?? {})[0];
  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-10 text-center'>
      <div className='text-2xl'>🗂️</div>
      <div className='space-y-1'>
        <p className='text-base font-medium text-gray-800'>
          Preview not available
        </p>
        <p className='text-sm text-gray-500'>
          You can still download the file to view it locally.
        </p>
      </div>
      {anyPath ? (
        onDownload ? (
          <button
            onClick={() => onDownload(anyPath)}
            className='rounded-lg bg-gray-900 px-4 py-2 text-white shadow hover:bg-black'
          >
            Download
          </button>
        ) : (
          <a
            href={anyPath}
            target='_blank'
            rel='noreferrer'
            className='rounded-lg bg-gray-900 px-4 py-2 text-white shadow hover:bg-black'
          >
            Download
          </a>
        )
      ) : null}
    </div>
  );
}
