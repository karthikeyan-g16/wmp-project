import { Link } from 'react-router-dom';
import type { PortfolioSummary } from '../../types/portfolio';
import { formatDate } from '../../utils/formatters';

interface PortfolioListProps {
  portfolios: PortfolioSummary[];
}

export function PortfolioList({ portfolios }: PortfolioListProps) {
  if (portfolios.length === 0) {
    return <p className="text-slate-500 text-center py-8">No portfolios found.</p>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((p) => (
        <Link
          key={p.id}
          to={`/portfolio/${p.id}`}
          className="block p-5 bg-white rounded-xl border border-slate-200 no-underline hover:shadow-md transition-shadow"
        >
          <h3 className="text-base font-semibold text-slate-900 mb-2">{p.name}</h3>
          <div className="flex justify-between text-sm text-slate-500">
            <span>{p.holdingsCount} holdings</span>
            <span>{p.currency}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Created {formatDate(p.createdAt)}</div>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              p.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {p.status}
          </span>
        </Link>
      ))}
    </div>
  );
}
