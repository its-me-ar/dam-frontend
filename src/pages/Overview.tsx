import { Card, CardContent } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { useQuery } from '@tanstack/react-query';
import { fetchJobs, fetchMetrics } from '../lib/api';
import { usePageTitle } from '../hooks/usePageTitle';

export default function OverviewPage() {
  usePageTitle();
  const metrics = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics });
  const jobs = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });
  return (
    <div>
      <h1 className='mb-2 text-2xl font-semibold'>DAM Dashboard</h1>
      <p className='mb-6 text-sm text-gray-500'>
        Manage assets, uploads and activity
      </p>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatCard
          title='Total Assets'
          value={String(metrics.data?.totalAssets ?? '—')}
          delta={`+${metrics.data?.addedThisWeek ?? '—'} this week`}
          tone='peach'
        />
        <StatCard
          title='Storage Used'
          value={`${metrics.data?.storageUsedGB ?? '—'} GB`}
          delta='Total used'
          tone='mint'
        />
        <StatCard
          title='New Uploads'
          value={String(metrics.data?.newUploadsToday ?? '—')}
          delta='Today'
          tone='indigo'
        />
      </div>

      {/* <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Processing Queue" value="5" delta="In progress" tone="sky" />
        <Card><CardContent>Quick links</CardContent></Card>
      </div> */}

      <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardContent>
            <h3 className='mb-4 text-lg font-semibold'>Processing Jobs</h3>
            {jobs.isLoading ? (
              <div className='text-sm text-gray-500'>Loading…</div>
            ) : jobs.data?.length ? (
              <div className='space-y-3'>
                {jobs.data.map(j => (
                  <div
                    key={j.id}
                    className='flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2'
                  >
                    <div>
                      <div className='font-medium'>{j.asset.filename}</div>
                      <div className='text-xs text-gray-500'>
                        {j.worker_name} • {j.event_name}
                      </div>
                    </div>
                    <div className='text-xs'>
                      <span
                        className={`rounded-md px-2 py-0.5 ${j.status === 'ACTIVE' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : j.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                      >
                        {j.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-sm text-gray-500'>No jobs</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
