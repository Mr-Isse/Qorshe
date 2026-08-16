import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/store';

export function ProtectedRoute() {
  const location = useLocation(); const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#F8FAFA] text-[#04172A]">Checking session…</div>;
  if (!isAuthenticated || user?.role !== 'ADMIN') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
