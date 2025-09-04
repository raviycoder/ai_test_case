import { useQuery } from '@tanstack/react-query';
import { getUserSessions } from '@/lib/apis/ai-test-api';
import { useAuth } from './use-auth';

export const useSessions = () => {
  const { user } = useAuth();

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: getUserSessions,
    enabled: !!user?.id, // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    retry: 1, // Only retry once on failure
  });

  return {
    sessions,
    isLoading,
    error,
    refetch
  };
};
