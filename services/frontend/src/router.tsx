import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>,
  },
  {
    path: '/portfolio',
    element: <ProtectedRoute><Layout><PortfolioPage /></Layout></ProtectedRoute>,
  },
  {
    path: '/portfolio/:portfolioId',
    element: <ProtectedRoute><Layout><PortfolioPage /></Layout></ProtectedRoute>,
  },
  {
    path: '/analytics',
    element: <ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
