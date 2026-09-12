import type { Holding } from '../../types/portfolio';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface HoldingTableProps {
  holdings: Holding[];
  onDelete?: (holdingId: string) => void;
}

export function HoldingTable({ holdings, onDelete }: HoldingTableProps) {
  if (holdings.length === 0) {
    return <p className="text-slate-500 text-center py-6">No holdings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200 text-left text-sm text-slate-500">
            <th className="pb-3 pr-4 font-medium">Ticker</th>
            <th className="pb-3 pr-4 font-medium">Type</th>
            <th className="pb-3 pr-4 text-right font-medium">Qty</th>
            <th className="pb-3 pr-4 text-right font-medium">Avg Cost</th>
            <th className="pb-3 pr-4 text-right font-medium">Total Cost</th>
            {onDelete && <th className="pb-3 font-medium"></th>}
          </tr>
        </thead>
        <tbody className="text-sm">
          {holdings.map((h, i) => (
            <tr key={h.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-3 pr-4 font-semibold text-slate-900">{h.tickerSymbol}</td>
              <td className="py-3 pr-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                  {h.assetType}
                </span>
              </td>
              <td className="py-3 pr-4 text-right text-slate-700">{formatNumber(h.quantity)}</td>
              <td className="py-3 pr-4 text-right text-slate-700">{formatCurrency(h.averageCost)}</td>
              <td className="py-3 pr-4 text-right font-semibold text-slate-900">{formatCurrency(h.totalCost)}</td>
              {onDelete && (
                <td className="py-3 text-right">
                  <button
                    onClick={() => onDelete(h.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
