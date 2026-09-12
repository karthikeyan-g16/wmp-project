import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '□' },
  { to: '/portfolio', label: 'Portfolios', icon: '◈' },
  { to: '/analytics', label: 'Analytics', icon: '◔' },
];

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="text-xl font-bold text-white no-underline">
          WMP
        </Link>
        <p className="text-xs text-slate-400 mt-1">Wealth Management</p>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors ${
              isActive(link.to)
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-3">
          <div className="text-sm font-medium text-white truncate">{user?.fullName}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
