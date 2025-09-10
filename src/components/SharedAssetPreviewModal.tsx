import { useState, useRef, useEffect, useMemo } from 'react';
import { File, Video, Image, Music, Archive } from 'lucide-react';

interface SharedAssetPreviewModalProps {
  asset: {
    name: string;
    mimeType: string;
    paths: Record<string, string>;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function SharedAssetPreviewModal({
  asset,
  isOpen,
  onClose,
}: SharedAssetPreviewModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<'auto' | string>(
    'auto'
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    return File;
  };

  // Video quality options
  const videoSources = useMemo(() => {
    const entries = Object.entries(asset.paths);
    const allowedQualities = ['720p', '480p', 'original'];
    const filtered = entries.filter(([key]) => allowedQualities.includes(key));
    const sorted = filtered.sort(
      (a, b) => allowedQualities.indexOf(a[0]) - allowedQualities.indexOf(b[0])
    );
    return sorted.map(([label, url]) => ({ label, url }));
  }, [asset.paths]);

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

  // Video quality change handler
  useEffect(() => {
    if (!videoRef.current || !currentVideoUrl) return;
    const video = videoRef.current;
    const wasPaused = video.paused;
    const currentTime = video.currentTime;
    const playbackRate = video.playbackRate;
    const wasMuted = video.muted;
    const volume = video.volume;

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

  const isVideo = asset.mimeType?.startsWith('video');
  const isImage = asset.mimeType?.startsWith('image');
  const FileIcon = getFileIcon(asset.mimeType);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>{asset.name}</h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-4'>
          {isVideo ? (
            <div className='space-y-4'>
              <div className='w-full overflow-hidden rounded-lg border border-gray-200 bg-black'>
                <video
                  ref={videoRef}
                  controls
                  className='w-full max-h-[60vh]'
                  src={currentVideoUrl ?? undefined}
                />
              </div>
              <div className='flex items-center justify-center gap-2 text-sm'>
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
            </div>
          ) : isImage ? (
            <div className='flex items-center justify-center'>
              <img
                src={asset.paths.original}
                alt={asset.name}
                className='max-h-[70vh] rounded-lg border border-gray-200 object-contain'
              />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-10 text-center'>
              <div className='p-4 rounded-full bg-gray-100'>
                <FileIcon className='h-12 w-12 text-gray-400' />
              </div>
              <div className='space-y-1'>
                <p className='text-base font-medium text-gray-800'>
                  Preview not available
                </p>
                <p className='text-sm text-gray-500'>
                  You can still download the file to view it locally.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
