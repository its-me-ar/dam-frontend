import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../context/Toast';
import SharedAssetPage from '../SharedAsset';

// Mock react-router-dom
const mockUseParams = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
}));

// Mock the useSharedAsset hook
const mockUseSharedAsset = vi.fn();
vi.mock('../../hooks/useSharedAsset', () => ({
  useSharedAsset: () => mockUseSharedAsset(),
}));

// Mock useDownload
const mockDownloadFile = vi.fn();
vi.mock('../../hooks/useDownload', () => ({
  useDownload: () => ({
    downloadFile: mockDownloadFile,
  }),
}));

// Mock usePageTitle
vi.mock('../../hooks/usePageTitle', () => ({
  usePageTitle: vi.fn(),
}));

// Mock useToast
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  }),
}));

// Mock @tanstack/react-query to ensure QueryClient and QueryClientProvider are available
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: null,
    })),
    QueryClient: actual.QueryClient,
    QueryClientProvider: actual.QueryClientProvider,
  };
});

// Mock the helper functions
vi.mock('../../utils/helper', () => ({
  formatSize: vi.fn(bytes => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size = size / 1024;
      i++;
    }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }),
}));

// Mock the components
vi.mock('../../components/SharedAssetError', () => ({
  SharedAssetError: ({ error }: { error: any }) => (
    <div data-testid='shared-asset-error'>
      <div>Error: {error?.message || 'Unknown error'}</div>
    </div>
  ),
}));

vi.mock('../../components/SharedAssetLoading', () => ({
  SharedAssetLoading: () => (
    <div data-testid='shared-asset-loading'>
      <div>Loading shared asset...</div>
    </div>
  ),
}));

vi.mock('../../components/AssetPreviewCard', () => ({
  AssetPreviewCard: ({
    asset,
    canPreview,
    onPreview,
  }: {
    asset: { name: string };
    canPreview: boolean;
    onPreview: () => void;
  }) => (
    <div data-testid='asset-preview-card'>
      <div>Asset: {asset.name}</div>
      <div>Can Preview: {canPreview ? 'Yes' : 'No'}</div>
      <button onClick={onPreview}>Preview Asset</button>
    </div>
  ),
}));

vi.mock('../../components/SharedAssetPreviewModal', () => ({
  SharedAssetPreviewModal: ({
    asset,
    isOpen,
    onClose,
  }: {
    asset: { name: string };
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid='shared-asset-preview-modal'>
        <div>Preview: {asset.name}</div>
        <button onClick={onClose}>Close Preview</button>
      </div>
    ) : null,
}));

vi.mock('../../components/AssetMetadata', () => ({
  AssetMetadata: ({ asset }: { asset: { name: string } }) => (
    <div data-testid='asset-metadata'>
      <div>Metadata for: {asset.name}</div>
    </div>
  ),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{component}</ToastProvider>
    </QueryClientProvider>
  );
};

const mockSharedAsset = {
  id: 'asset-1',
  name: 'test-image.jpg',
  mimeType: 'image/jpeg',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  sizeBytes: 1024000,
  uploader: {
    id: 'user-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
  },
  sharedBy: {
    id: 'user-2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
  },
  visibilityStatus: 'PUBLIC' as const,
  paths: {
    original: 'https://example.com/original.jpg',
    thumbnail: 'https://example.com/thumb.jpg',
  },
};

describe('SharedAssetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ assetId: 'asset-1' });
    mockUseSharedAsset.mockReturnValue({
      data: mockSharedAsset,
      isLoading: false,
      error: null,
    });
  });

  it('renders loading state', () => {
    mockUseSharedAsset.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);
    expect(screen.getByTestId('shared-asset-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = new Error('Asset not found');
    mockUseSharedAsset.mockReturnValue({
      data: null,
      isLoading: false,
      error,
    });

    renderWithQueryClient(<SharedAssetPage />);
    expect(screen.getByTestId('shared-asset-error')).toBeInTheDocument();
    expect(screen.getByText('Error: Asset not found')).toBeInTheDocument();
  });

  it('renders shared asset page with public visibility', () => {
    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Shared Asset')).toBeInTheDocument();
    expect(screen.getByText('Publicly shared content')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('renders shared asset page with restricted visibility', () => {
    const restrictedAsset = {
      ...mockSharedAsset,
      visibilityStatus: 'RESTRICTED' as const,
    };
    mockUseSharedAsset.mockReturnValue({
      data: restrictedAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Restricted shared content')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('renders shared asset page with private visibility', () => {
    const privateAsset = {
      ...mockSharedAsset,
      visibilityStatus: 'PRIVATE' as const,
    };
    mockUseSharedAsset.mockReturnValue({
      data: privateAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Private content')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('displays asset information correctly', () => {
    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('IMAGE')).toBeInTheDocument();
    expect(screen.getByText('1000.0 KB')).toBeInTheDocument();
    expect(
      screen.getByText('Created 1/1/2024, 5:30:00 AM')
    ).toBeInTheDocument();
    expect(screen.getByText('Uploaded by John Doe (USER)')).toBeInTheDocument();
    expect(screen.getByText('Shared by Jane Smith')).toBeInTheDocument();
  });

  it('displays file type icons and colors correctly', () => {
    renderWithQueryClient(<SharedAssetPage />);

    // Check for image file type styling
    const fileTypeElement = screen.getByText('IMAGE');
    expect(fileTypeElement).toHaveClass('text-green-600', 'bg-green-100');
  });

  it('handles video files correctly', () => {
    const videoAsset = {
      ...mockSharedAsset,
      mimeType: 'video/mp4',
    };
    mockUseSharedAsset.mockReturnValue({
      data: videoAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('VIDEO')).toBeInTheDocument();
    // Video should have red styling
    const fileTypeElement = screen.getByText('VIDEO');
    expect(fileTypeElement).toHaveClass('text-red-600', 'bg-red-100');
  });

  it('handles audio files correctly', () => {
    const audioAsset = {
      ...mockSharedAsset,
      mimeType: 'audio/mp3',
    };
    mockUseSharedAsset.mockReturnValue({
      data: audioAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('AUDIO')).toBeInTheDocument();
    // Audio should have purple styling
    const fileTypeElement = screen.getByText('AUDIO');
    expect(fileTypeElement).toHaveClass('text-purple-600', 'bg-purple-100');
  });

  it('handles archive files correctly', () => {
    const archiveAsset = {
      ...mockSharedAsset,
      mimeType: 'application/zip',
    };
    mockUseSharedAsset.mockReturnValue({
      data: archiveAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('APPLICATION')).toBeInTheDocument();
    // Archive should have orange styling
    const fileTypeElement = screen.getByText('APPLICATION');
    expect(fileTypeElement).toHaveClass('text-orange-600', 'bg-orange-100');
  });

  it('handles unknown file types correctly', () => {
    const unknownAsset = {
      ...mockSharedAsset,
      mimeType: 'application/unknown',
    };
    mockUseSharedAsset.mockReturnValue({
      data: unknownAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('APPLICATION')).toBeInTheDocument();
    // Unknown should have gray styling
    const fileTypeElement = screen.getByText('APPLICATION');
    expect(fileTypeElement).toHaveClass('text-gray-600', 'bg-gray-100');
  });

  it('handles assets without size information', () => {
    const assetWithoutSize = {
      ...mockSharedAsset,
      sizeBytes: undefined,
    };
    mockUseSharedAsset.mockReturnValue({
      data: assetWithoutSize,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Unknown size')).toBeInTheDocument();
  });

  it('handles assets without uploader information', () => {
    const assetWithoutUploader = {
      ...mockSharedAsset,
      uploader: undefined,
    };
    mockUseSharedAsset.mockReturnValue({
      data: assetWithoutUploader,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    // Should not display uploader info
    expect(screen.queryByText('Uploaded by')).not.toBeInTheDocument();
  });

  it('handles assets where sharedBy is same as uploader', () => {
    const assetSameUser = {
      ...mockSharedAsset,
      sharedBy: {
        id: 'user-1', // Same as uploader
        fullName: 'John Doe',
        email: 'john@example.com',
      },
    };
    mockUseSharedAsset.mockReturnValue({
      data: assetSameUser,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Uploaded by John Doe (USER)')).toBeInTheDocument();
    // Should not display separate shared by info
    expect(screen.queryByText('Shared by John Doe')).not.toBeInTheDocument();
  });

  it('opens preview modal when preview button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedAssetPage />);

    const previewButton = screen.getByText('Preview Asset');
    await user.click(previewButton);

    expect(
      screen.getByTestId('shared-asset-preview-modal')
    ).toBeInTheDocument();
    expect(screen.getByText('Preview: test-image.jpg')).toBeInTheDocument();
  });

  it('closes preview modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedAssetPage />);

    // Open preview
    const previewButton = screen.getByText('Preview Asset');
    await user.click(previewButton);

    expect(
      screen.getByTestId('shared-asset-preview-modal')
    ).toBeInTheDocument();

    // Close preview
    const closeButton = screen.getByText('Close Preview');
    await user.click(closeButton);

    expect(
      screen.queryByTestId('shared-asset-preview-modal')
    ).not.toBeInTheDocument();
  });

  it('handles download button click', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedAssetPage />);

    const downloadButton = screen.getByText('Download');
    await user.click(downloadButton);

    expect(mockDownloadFile).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'test-image.jpg'
    );
  });

  it('handles share button click for public assets', async () => {
    const user = userEvent.setup();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/shared/asset-1' },
      writable: true,
    });

    // Mock clipboard.writeText
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    renderWithQueryClient(<SharedAssetPage />);

    const shareButton = screen.getByText('Share');
    await user.click(shareButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      'https://example.com/shared/asset-1'
    );
  });

  it('handles clipboard write failure gracefully', async () => {
    const user = userEvent.setup();
    // Mock clipboard.writeText to throw error
    const mockWriteText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Clipboard access denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    // Mock window.prompt
    const mockPrompt = vi.fn();
    Object.defineProperty(window, 'prompt', {
      value: mockPrompt,
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/shared/asset-1' },
      writable: true,
    });

    renderWithQueryClient(<SharedAssetPage />);

    const shareButton = screen.getByText('Share');
    await user.click(shareButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      'https://example.com/shared/asset-1'
    );
    expect(mockPrompt).toHaveBeenCalledWith(
      'Copy this link:',
      'https://example.com/shared/asset-1'
    );
  });

  it('does not show share button for non-public assets', () => {
    const restrictedAsset = {
      ...mockSharedAsset,
      visibilityStatus: 'RESTRICTED' as const,
    };
    mockUseSharedAsset.mockReturnValue({
      data: restrictedAsset,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('displays metadata section', () => {
    renderWithQueryClient(<SharedAssetPage />);

    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByTestId('asset-metadata')).toBeInTheDocument();
    expect(
      screen.getByText('Metadata for: test-image.jpg')
    ).toBeInTheDocument();
  });

  it('handles missing assetId parameter', () => {
    mockUseParams.mockReturnValue({ assetId: undefined });
    mockUseSharedAsset.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SharedAssetPage />);

    // Should show loading state when no assetId
    expect(screen.getByTestId('shared-asset-loading')).toBeInTheDocument();
  });
});
