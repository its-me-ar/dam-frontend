import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../Login';

// Mock the AuthContext
const mockLogin = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    isAuthenticated: false,
  })),
}));

// Mock the API
const mockMutateAsync = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    })),
  };
});

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => {
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'navigate');
      div.setAttribute('data-to', to);
      return div;
    },
  };
});

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
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    renderWithQueryClient(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: 'Sign in' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Required')).toHaveLength(2);
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    await user.type(passwordInput, '123');

    const submitButton = screen.getByRole('button', { name: 'Sign in' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Too short')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockToken = 'mock-jwt-token';
    mockMutateAsync.mockResolvedValue({ token: mockToken });

    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays the app branding', () => {
    renderWithQueryClient(<LoginPage />);

    expect(screen.getByText('Digital Asset Manager')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Organize, preview, and share your creative assets with ease.'
      )
    ).toBeInTheDocument();
  });

  it('handles network error during login', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // The component should handle the error gracefully
    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles server error response', async () => {
    const user = userEvent.setup();
    const serverError = new Error('Invalid credentials');
    mockMutateAsync.mockRejectedValue(serverError);

    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // The component should handle the error gracefully
    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
  });

  it('validates email format correctly', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // Test invalid email format
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('validates password length correctly', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // Test short password
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Too short')).toBeInTheDocument();
    });
  });

  it('maintains form state during validation', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // Fill form with valid data
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit and trigger validation
    await user.click(submitButton);

    // Form values should be maintained
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
