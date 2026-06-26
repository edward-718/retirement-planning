import { formatMoneyShort } from '@/utils/format';

interface FunnelData {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelData[];
  maxWidth?: number;
}

export default function FunnelChart({ data, maxWidth = 400 }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {data.map((item, index) => {
        const widthPercent = (item.value / maxValue) * 100;
        const isNegative = item.value < 0;

        return (
          <div key={item.label} className="relative w-full" style={{ maxWidth: `${maxWidth}px` }}>
            <div className="flex items-center gap-4">
              <span className="text-sm text-teal-600 w-24 text-right">{item.label}</span>
              <div className="flex-1 relative">
                <div className="h-10 bg-teal-50 rounded-lg overflow-hidden transition-all duration-500">
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-4 transition-all duration-1000"
                    style={{
                      width: `${Math.max(10, widthPercent)}%`,
                      backgroundColor: item.color,
                      opacity: 0.8 + (index * 0.05),
                    }}
                  >
                    {widthPercent > 20 && (
                      <span className="text-white font-bold text-sm">
                        {formatMoneyShort(Math.abs(item.value))}
                      </span>
                    )}
                  </div>
                </div>
                {widthPercent <= 20 && (
                  <div
                    className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-sm"
                    style={{ color: item.color }}
                  >
                    {formatMoneyShort(Math.abs(item.value))}
                  </div>
                )}
              </div>
            </div>
            {index < data.length - 1 && (
              <div
                className="ml-24 mt-1 text-xs text-teal-400 flex items-center"
                style={{ paddingLeft: `${Math.max(10, widthPercent) * 2}px` }}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {isNegative ? '盈余' : '缺口'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
