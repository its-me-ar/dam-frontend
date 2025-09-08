import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import OverviewPage from '../pages/Overview'
import AssetsPage from '../pages/Assets'
import SettingsPage from '../pages/Settings'
import LoginPage from '../pages/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'assets', element: <AssetsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}


