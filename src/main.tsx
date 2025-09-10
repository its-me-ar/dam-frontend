import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/Toast';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
