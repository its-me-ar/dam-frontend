import { Card, CardContent } from '../../components/ui/Card';

export function ChartPlaceholder() {
  return (
    <Card>
      <CardContent>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Spending</h3>
          <button className='rounded-full bg-gray-100 px-2 py-1 text-xs'>
            12 Days
          </button>
        </div>
        <div className='grid h-48 grid-cols-12 items-end gap-2'>
          {[30, 40, 20, 50, 18, 42, 28, 36, 25, 32, 20, 38].map((h, i) => (
            <div
              key={i}
              className='rounded-sm bg-emerald-300/80'
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
