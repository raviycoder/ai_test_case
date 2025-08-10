import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/auth-api';

// Auth hook using React Query
export const useAuth = () => {
  const queryClient = useQueryClient();

  // Query for session data
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: authAPI.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // GitHub login mutation
  const loginWithGitHub = useMutation({
    mutationFn: (callbackURL?: string) => authAPI.signInWithGitHub(callbackURL),
    onSuccess: () => {
      // Invalidate session query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  // Sign out mutation
  const signOut = useMutation({
    mutationFn: authAPI.signOut,
    onSuccess: () => {
      // Clear session cache
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  return {
    // Session data
    user: session?.data?.user || null,
    session: session?.data || null,
    isAuthenticated: !!session?.data?.user,
    
    // Loading states
    isLoading,
    isSigningIn: loginWithGitHub.isPending,
    isSigningOut: signOut.isPending,
    
    // Error states
    error: error || loginWithGitHub.error || signOut.error,
    
    // Actions
    loginWithGitHub: loginWithGitHub.mutate,
    signOut: signOut.mutate,
    refetchSession: refetch,
  };
};