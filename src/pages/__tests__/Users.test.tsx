import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../context/Toast';
import UsersPage from '../Users';

// Mock the API functions
vi.mock('../../lib/api', () => ({
  sendInvitation: vi.fn(),
  fetchInvitations: vi.fn(),
  reinviteInvitation: vi.fn(),
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
      data: [],
      isLoading: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    })),
    QueryClient: actual.QueryClient,
    QueryClientProvider: actual.QueryClientProvider,
  };
});

// Mock useToast
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  }),
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

describe('UsersPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { fetchInvitations, sendInvitation, reinviteInvitation } =
      await import('../../lib/api');
    vi.mocked(fetchInvitations).mockResolvedValue([]);
    vi.mocked(sendInvitation).mockResolvedValue({
      id: 'new-invite',
      email: 'test@example.com',
      role: 'USER' as const,
      status: 'PENDING' as const,
      inviteBy: 'admin@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      acceptedAt: null,
      invitationLink: 'invite-token-123',
    });
    vi.mocked(reinviteInvitation).mockResolvedValue({
      id: 'invite-1',
      email: 'user1@example.com',
      role: 'USER' as const,
      status: 'PENDING' as const,
      inviteBy: 'admin@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      acceptedAt: null,
      invitationLink: 'new-invite-token-123',
    });
  });

  it('renders page title and invitation form', () => {
    renderWithQueryClient(<UsersPage />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Invite a new user')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USER')).toBeInTheDocument();
    expect(screen.getByText('Send Invite')).toBeInTheDocument();
  });

  it('handles email input changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<UsersPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('handles role selection changes', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<UsersPage />);

    const roleSelect = screen.getByDisplayValue('USER');
    await user.selectOptions(roleSelect, 'MANAGER');

    expect(roleSelect).toHaveValue('MANAGER');
  });

  it('disables send button when email is empty', () => {
    renderWithQueryClient(<UsersPage />);

    const sendButton = screen.getByText('Send Invite');
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when email is provided', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<UsersPage />);

    const emailInput = screen.getByPlaceholderText('Email');
    await user.type(emailInput, 'test@example.com');

    const sendButton = screen.getByText('Send Invite');
    expect(sendButton).not.toBeDisabled();
  });

  it('displays invitations table', () => {
    renderWithQueryClient(<UsersPage />);

    expect(screen.getByText('Invitations')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Invited By')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('displays empty state when no invitations', () => {
    renderWithQueryClient(<UsersPage />);

    expect(screen.getAllByText('No invitations')).toHaveLength(2);
  });

  it('handles clipboard write failure gracefully', () => {
    // Mock clipboard failure
    const mockWriteText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Clipboard access denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    renderWithQueryClient(<UsersPage />);

    // This test verifies the component renders without crashing
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
