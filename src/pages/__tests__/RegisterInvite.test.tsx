import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../context/Toast';
import RegisterInvitePage from '../RegisterInvite';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock the API
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: vi.fn(() => ({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    })),
  };
});

// Mock Toast
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  }),
}));

// Mock usePageTitle
vi.mock('../../hooks/usePageTitle', () => ({
  usePageTitle: vi.fn(),
}));

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

describe('RegisterInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithQueryClient(<RegisterInvitePage />);

    // Just verify the component renders without errors
    expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
  });

  it('shows missing token error when no token provided', () => {
    renderWithQueryClient(<RegisterInvitePage />);

    expect(screen.getByText('Missing token')).toBeInTheDocument();
  });

  it('displays the app branding', () => {
    renderWithQueryClient(<RegisterInvitePage />);

    expect(screen.getByText('Digital Asset Manager')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Accept your invitation to collaborate, upload and manage assets.'
      )
    ).toBeInTheDocument();
  });

  it('renders basic form elements', () => {
    renderWithQueryClient(<RegisterInvitePage />);

    // Verify basic form structure is present
    expect(screen.getByText('Accept Invitation')).toBeInTheDocument();
    expect(screen.getByText('Digital Asset Manager')).toBeInTheDocument();
  });
});
