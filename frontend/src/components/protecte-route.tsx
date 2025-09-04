import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: string;
}

const ProtectedRoute = ({ children, fallback = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;