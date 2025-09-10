import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SharedWithMePage from '../SharedWithMe';

// Mock the useSharedWithMe hook
const mockUseSharedWithMe = vi.fn();
vi.mock('../../hooks/useSharedWithMe', () => ({
  useSharedWithMe: () => mockUseSharedWithMe(),
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
  formatDuration: vi.fn(seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
  }),
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

// Mock the lazy components
vi.mock('../../components/AssetPreviewModal', () => ({
  AssetPreviewModal: ({
    open,
    onClose,
    assetName,
    mimeType,
  }: {
    open: boolean;
    onClose: () => void;
    assetName: string;
    mimeType: string;
  }) =>
    open ? (
      <div data-testid='asset-preview-modal'>
        <div>Preview: {assetName}</div>
        <div>Type: {mimeType}</div>
        <button onClick={onClose}>Close Preview</button>
      </div>
    ) : null,
}));

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

const mockSharedAssets = [
  {
    id: 'share-1',
    assetId: 'asset-1',
    name: 'test-image.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024000,
    createdAt: '2024-01-01T00:00:00Z',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
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
    shareType: 'PUBLIC' as const,
    shareToken: 'token-1',
    isActive: true,
    sharedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'share-2',
    assetId: 'asset-2',
    name: 'test-video.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 5000000,
    createdAt: '2024-01-03T00:00:00Z',
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    durationSeconds: 120,
    uploader: {
      id: 'user-3',
      fullName: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'ADMIN',
    },
    sharedBy: {
      id: 'user-4',
      fullName: 'Alice Brown',
      email: 'alice@example.com',
    },
    shareType: 'RESTRICTED' as const,
    shareToken: 'token-2',
    isActive: true,
    sharedAt: '2024-01-04T00:00:00Z',
  },
];

describe('SharedWithMePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSharedWithMe.mockReturnValue({
      data: mockSharedAssets,
      isLoading: false,
      isError: false,
    });
  });

  it('renders page title and view controls', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('Shared with Me')).toBeInTheDocument();
    expect(screen.getByTitle('Grid')).toBeInTheDocument();
    expect(screen.getByTitle('Large Grid')).toBeInTheDocument();
    expect(screen.getByTitle('List')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseSharedWithMe.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithQueryClient(<SharedWithMePage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseSharedWithMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithQueryClient(<SharedWithMePage />);
    expect(
      screen.getByText('Failed to load shared assets')
    ).toBeInTheDocument();
  });

  it('displays empty state when no shared assets', () => {
    mockUseSharedWithMe.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('No shared assets')).toBeInTheDocument();
    expect(
      screen.getByText('No one has shared any assets with you yet.')
    ).toBeInTheDocument();
  });

  it('displays shared assets in grid view by default', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
  });

  it('switches to large grid view', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    const largeGridButton = screen.getByTitle('Large Grid');
    await user.click(largeGridButton);

    expect(largeGridButton).toHaveClass('bg-gray-900', 'text-white');
  });

  it('switches to list view', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    const listButton = screen.getByTitle('List');
    await user.click(listButton);

    expect(listButton).toHaveClass('bg-gray-900', 'text-white');
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Shared by')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Share Type')).toBeInTheDocument();
  });

  it('displays asset thumbnails in grid view', () => {
    renderWithQueryClient(<SharedWithMePage />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/thumb1.jpg');
    expect(images[0]).toHaveAttribute('alt', 'test-image.jpg');
  });

  it('displays video play icon and duration for video assets', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('2:00')).toBeInTheDocument(); // 120 seconds formatted
  });

  it('displays share type indicators', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('displays download buttons for all assets', () => {
    renderWithQueryClient(<SharedWithMePage />);

    const downloadButtons = screen.getAllByTitle('Download asset');
    expect(downloadButtons).toHaveLength(2);
  });

  it('handles download button click', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    const downloadButtons = screen.getAllByTitle('Download asset');
    await user.click(downloadButtons[0]);

    expect(mockDownloadFile).toHaveBeenCalledWith(
      '/api/assets/shared/token-1/download',
      'test-image.jpg'
    );
  });

  it('opens asset preview modal when asset is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    const assetCard = screen
      .getByText('test-image.jpg')
      .closest('[class*="cursor-pointer"]');
    await user.click(assetCard!);

    expect(screen.getByTestId('asset-preview-modal')).toBeInTheDocument();
    expect(screen.getByText('Preview: test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Type: image/jpeg')).toBeInTheDocument();
  });

  it('closes preview modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    // Open preview
    const assetCard = screen
      .getByText('test-image.jpg')
      .closest('[class*="cursor-pointer"]');
    await user.click(assetCard!);

    expect(screen.getByTestId('asset-preview-modal')).toBeInTheDocument();

    // Close preview
    const closeButton = screen.getByText('Close Preview');
    await user.click(closeButton);

    expect(screen.queryByTestId('asset-preview-modal')).not.toBeInTheDocument();
  });

  it('displays asset metadata correctly', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getByText('video')).toBeInTheDocument();
    expect(screen.getByText('1000.0 KB')).toBeInTheDocument();
    // Check that size information is displayed (there might be multiple size elements)
    expect(screen.getAllByText(/KB|MB|B/).length).toBeGreaterThanOrEqual(2);
  });

  it('displays uploader and shared by information', () => {
    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('Uploaded by John Doe')).toBeInTheDocument();
    expect(screen.getByText('Uploaded by Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Shared by Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Shared by Alice Brown')).toBeInTheDocument();
  });

  it('handles assets without thumbnails', () => {
    const assetsWithoutThumbnails = [
      {
        ...mockSharedAssets[0],
        thumbnailUrl: undefined,
      },
    ];
    mockUseSharedWithMe.mockReturnValue({
      data: assetsWithoutThumbnails,
      isLoading: false,
      isError: false,
    });

    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('No preview')).toBeInTheDocument();
  });

  it('displays share type correctly in list view', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    // Switch to list view
    const listButton = screen.getByTitle('List');
    await user.click(listButton);

    // Check for share type indicators in list view
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('displays shared date correctly', () => {
    renderWithQueryClient(<SharedWithMePage />);

    // Check for shared date in grid view
    expect(screen.getByText('1/2/2024')).toBeInTheDocument();
    expect(screen.getByText('1/4/2024')).toBeInTheDocument();
  });

  it('handles download button click in list view', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    // Switch to list view
    const listButton = screen.getByTitle('List');
    await user.click(listButton);

    const downloadButtons = screen.getAllByTitle('Download asset');
    await user.click(downloadButtons[0]);

    expect(mockDownloadFile).toHaveBeenCalledWith(
      '/api/assets/shared/token-1/download',
      'test-image.jpg'
    );
  });

  it('prevents event propagation when download button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<SharedWithMePage />);

    const downloadButtons = screen.getAllByTitle('Download asset');
    await user.click(downloadButtons[0]);

    // Should not open preview modal when download button is clicked
    expect(screen.queryByTestId('asset-preview-modal')).not.toBeInTheDocument();
  });

  it('handles assets with different file types', () => {
    const mixedAssets = [
      {
        ...mockSharedAssets[0],
        mimeType: 'audio/mp3',
      },
      {
        ...mockSharedAssets[1],
        mimeType: 'application/pdf',
      },
    ];
    mockUseSharedWithMe.mockReturnValue({
      data: mixedAssets,
      isLoading: false,
      isError: false,
    });

    renderWithQueryClient(<SharedWithMePage />);

    expect(screen.getByText('audio')).toBeInTheDocument();
    expect(screen.getByText('application')).toBeInTheDocument();
  });

  it('handles assets without duration information', () => {
    const assetsWithoutDuration = [
      {
        ...mockSharedAssets[1],
        durationSeconds: undefined,
      },
    ];
    mockUseSharedWithMe.mockReturnValue({
      data: assetsWithoutDuration,
      isLoading: false,
      isError: false,
    });

    renderWithQueryClient(<SharedWithMePage />);

    // Should not display duration for video without duration
    expect(screen.queryByText('2:00')).not.toBeInTheDocument();
  });
});
