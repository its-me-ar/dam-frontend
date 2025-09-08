import { useRef, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUploadAsset } from '../hooks/useUploadAsset'
import { Menu, Home, Images, Settings as SettingsIcon, Plus, Loader2 } from 'lucide-react'
 

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const upload = useUploadAsset()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden rounded-md p-2 hover:bg-gray-100" onClick={() => setOpen((v) => !v)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-semibold">DAM</div>
          </div>
          <div className="hidden md:block w-full max-w-lg">
            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search assets..." />
          </div>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload.mutate(f)
            }} />
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:translate-y-px"
              onClick={() => fileRef.current?.click()}
            >
              {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          <button
            className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Logout
          </button>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        <aside className={`fixed top-14 bottom-0 left-0 z-10 w-56 transform overflow-y-auto border-r border-gray-200 bg-white pl-3 pr-2 py-4 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Navigation</div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Home className="h-4 w-4" />
              Overview
            </NavLink>
            <NavLink
              to="/assets"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Images className="h-4 w-4" />
              Assets
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
          <div className="mt-6 border-t border-gray-200 pt-3 text-xs text-gray-500">v0.1.0</div>
        </aside>

        <main className="flex-1 pr-4 pl-2 py-4 md:ml-56">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


