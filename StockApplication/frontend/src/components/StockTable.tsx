import type { StockDailySummary } from "../types/stockTypes";

interface StockTableProps {
  data: StockDailySummary[];
}

export default function StockTable({ data }: StockTableProps) {
  const sortedData = [...data].sort((a, b) =>
    b.day.localeCompare(a.day)
  );

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Average Low</th>
            <th>Average High</th>
            <th>Volume</th>
          </tr>
        </thead>

        <tbody>
          {sortedData.map((item) => (
            <tr key={item.day}>
              <td>{item.day}</td>
              <td>${item.lowAverage.toFixed(4)}</td>
              <td>${item.highAverage.toFixed(4)}</td>
              <td>{item.volume.toLocaleString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}