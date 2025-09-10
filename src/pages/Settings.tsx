import { usePageTitle } from '../hooks/usePageTitle'

export default function SettingsPage() {
  usePageTitle()
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Settings</h1>
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Branding</div>
          <div className="mt-2 text-gray-700">Customize brand colors and logo</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Users</div>
          <div className="mt-2 text-gray-700">Manage users and permissions</div>
        </div>
      </div>
    </div>
  )
}


