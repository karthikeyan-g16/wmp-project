import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface AllocationPieChartProps {
  data: Record<string, number>;
}

export function AllocationPieChart({ data }: AllocationPieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return <p className="text-slate-500 text-center py-8">No allocation data available.</p>;
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
