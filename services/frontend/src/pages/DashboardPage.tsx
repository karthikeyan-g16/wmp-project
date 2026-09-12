import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portfolioApi } from '../api/portfolioApi';
import { PortfolioList } from '../components/portfolio/PortfolioList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { PortfolioSummary } from '../types/portfolio';

export function DashboardPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    portfolioApi
      .list(user.id)
      .then(setPortfolios)
      .catch((err) => setError(err.message || 'Failed to load portfolios'))
      .finally(() => setLoading(false));
  }, [user]);

  const totalHoldings = portfolios.reduce((sum, p) => sum + p.holdingsCount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
        <p className="text-slate-500 mt-1">Overview of your investment portfolios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-slate-500">Portfolios</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{portfolios.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-slate-500">Total Holdings</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{totalHoldings}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-3xl font-bold text-green-500 mt-1">
            {portfolios.filter((p) => p.status === 'ACTIVE').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Portfolios</h2>
          <Link
            to="/portfolio"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg no-underline transition"
          >
            View All
          </Link>
        </div>
        {loading && <LoadingSpinner />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <PortfolioList portfolios={portfolios} />}
      </div>
    </div>
  );
}
