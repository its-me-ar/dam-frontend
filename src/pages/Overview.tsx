import { Card, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/dashboard/StatCard'
import { ChartPlaceholder } from '../components/dashboard/ChartPlaceholder'

export default function OverviewPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">DAM Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Manage assets, uploads and activity</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Assets" value="1,248" delta="+32 this week" tone="peach" />
        <StatCard title="Storage Used" value="62%" delta="512 GB of 800 GB" tone="mint" />
        <ChartPlaceholder />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="New Uploads" value="32" delta="Today" tone="indigo" />
        <StatCard title="Processing Queue" value="5" delta="In progress" tone="sky" />
        <Card><CardContent>Quick links</CardContent></Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="mb-4 text-lg font-semibold">Recent Uploads</h3>
            <div className="space-y-3">
              {[
                { name: 'Homepage Banner.png', note: 'Marketing / Banners', meta: '2.1 MB' },
                { name: 'Product_01.mp4', note: 'Videos / Products', meta: '34 MB' },
                { name: 'Logo.svg', note: 'Brand / Logos', meta: '24 KB' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-100" />
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.note}</div>
                    </div>
                  </div>
                  <div className="tabular-nums text-sm text-gray-600">{t.meta}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

