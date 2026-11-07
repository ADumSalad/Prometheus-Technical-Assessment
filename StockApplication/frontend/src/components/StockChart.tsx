import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import type { StockDailySummary } from "../types/stockTypes";

interface StockChartProps {
  data: StockDailySummary[];
}

export default function StockChart({ data }: StockChartProps) {
  // Sort oldest to newest for the chart.
  const chartData = [...data].sort((a, b) =>
    a.day.localeCompare(b.day)
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="day"
          tickFormatter={(day) => day.slice(5)}
        />

        <YAxis
          tickFormatter={(value) => `$${value}`}
        />

        <Tooltip
          formatter={(value) => `$${Number(value).toFixed(4)}`}
        />

        <Legend />

        <Line
          type="monotone"
          dataKey="lowAverage"
          name="Average Low"
          stroke="#2563eb"
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="highAverage"
          name="Average High"
          stroke="#16a34a"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}