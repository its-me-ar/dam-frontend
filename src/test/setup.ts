import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Navigate: ({ to }: { to: string }) => {
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'navigate');
      div.setAttribute('data-to', to);
      return div;
    },
  };
});

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
}));

// Mock API functions
vi.mock('../lib/api', () => ({
  loginRequest: vi.fn(),
  registerWithInvite: vi.fn(),
  fetchMetrics: vi.fn(),
  fetchJobs: vi.fn(),
}));

// Mock hooks
vi.mock('../hooks/usePageTitle', () => ({
  usePageTitle: vi.fn(),
}));

// Mock Toast component
vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  }),
}));
