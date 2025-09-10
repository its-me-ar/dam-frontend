import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const ProtectedRoute = lazy(() => import('./ProtectedRoute'));
const RoleGuard = lazy(() =>
  import('./ProtectedRoute').then(m => ({ default: m.RoleGuard }))
);
const GuestRoute = lazy(() =>
  import('./ProtectedRoute').then(m => ({ default: m.GuestRoute }))
);
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));
const OverviewPage = lazy(() => import('../pages/Overview'));
const AssetsPage = lazy(() => import('../pages/Assets'));
const SharedWithMePage = lazy(() => import('../pages/SharedWithMe'));
const LoginPage = lazy(() => import('../pages/Login'));
const UsersPage = lazy(() => import('../pages/Users'));
const RegisterInvitePage = lazy(() => import('../pages/RegisterInvite'));
const SharedAssetPage = lazy(() => import('../pages/SharedAsset'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute />
      </Suspense>
    ),
    children: [
      {
        element: (
          <Suspense fallback={null}>
            <DashboardLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={null}>
                <OverviewPage />
              </Suspense>
            ),
          },
          {
            path: 'assets',
            element: (
              <Suspense fallback={null}>
                <AssetsPage />
              </Suspense>
            ),
          },
          {
            path: 'shared-with-me',
            element: (
              <Suspense fallback={null}>
                <SharedWithMePage />
              </Suspense>
            ),
          },
          {
            element: (
              <Suspense fallback={null}>
                <RoleGuard allowed={['ADMIN', 'MANAGER']} />
              </Suspense>
            ),
            children: [
              {
                path: 'users',
                element: (
                  <Suspense fallback={null}>
                    <UsersPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: (
      <Suspense fallback={null}>
        <GuestRoute />
      </Suspense>
    ),
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={null}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register/invite',
        element: (
          <Suspense fallback={null}>
            <RegisterInvitePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/shared/:assetId',
    element: (
      <Suspense fallback={null}>
        <SharedAssetPage />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
