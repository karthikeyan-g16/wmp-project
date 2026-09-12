import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MarketData } from '../../types/analytics';
import { COLORS } from '../../utils/constants';

interface PerformanceChartProps {
  data: MarketData[];
  ticker: string;
}

export function PerformanceChart({ data, ticker }: PerformanceChartProps) {
  const chartData = [...data]
    .sort((a, b) => (a.price_date ?? '').localeCompare(b.price_date ?? ''))
    .map((d) => ({
      date: d.price_date,
      price: d.price,
    }));

  if (chartData.length === 0) {
    return <p className="text-slate-500 text-center py-8">No price data available for {ticker}.</p>;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke={COLORS.blue} strokeWidth={2} dot={false} name={ticker} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
