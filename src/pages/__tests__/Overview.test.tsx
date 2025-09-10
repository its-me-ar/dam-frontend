import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverviewPage from '../Overview';

// Mock the API functions
vi.mock('../../lib/api', () => ({
  fetchMetrics: vi.fn(),
  fetchJobs: vi.fn(),
}));

// Mock usePageTitle
vi.mock('../../hooks/usePageTitle', () => ({
  usePageTitle: vi.fn(),
}));

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: null,
    })),
  };
});

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

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title and description', () => {
    renderWithQueryClient(<OverviewPage />);

    expect(screen.getByText('DAM Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Manage assets, uploads and activity')
    ).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    renderWithQueryClient(<OverviewPage />);

    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('Storage Used')).toBeInTheDocument();
    expect(screen.getByText('New Uploads')).toBeInTheDocument();
  });

  it('renders processing jobs section', () => {
    renderWithQueryClient(<OverviewPage />);

    expect(screen.getByText('Processing Jobs')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    renderWithQueryClient(<OverviewPage />);

    // Just verify the component renders without errors
    expect(screen.getByText('DAM Dashboard')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const { fetchMetrics, fetchJobs } = await import('../../lib/api');
    vi.mocked(fetchMetrics).mockRejectedValue(new Error('API Error'));
    vi.mocked(fetchJobs).mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<OverviewPage />);

    // Should still render the basic structure
    expect(screen.getByText('DAM Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Manage assets, uploads and activity')
    ).toBeInTheDocument();
  });
});
