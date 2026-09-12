import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-slate-200">404</h1>
        <p className="text-lg text-slate-500 mt-4 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg no-underline transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
