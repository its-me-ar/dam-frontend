import { Card, CardContent } from '../../components/ui/Card';
import type { StatCardProps } from '../../types';

const toneToClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  peach: 'bg-orange-50 text-orange-800',
  mint: 'bg-green-50 text-green-800',
  indigo: 'bg-indigo-50 text-indigo-800',
  sky: 'bg-sky-50 text-sky-800',
};

export function StatCard({
  title,
  value,
  delta,
  tone = 'peach',
}: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className='flex items-start justify-between'>
          <div>
            <div className='text-sm text-gray-600'>{title}</div>
            <div className='mt-1 text-3xl font-bold tracking-tight'>
              {value}
            </div>
            {delta ? (
              <div className='mt-1 text-xs text-gray-500'>{delta}</div>
            ) : null}
          </div>
          <div
            className={`h-8 w-8 shrink-0 rounded-full ${toneToClasses[tone]} grid place-items-center`}
          >
            ↗
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
