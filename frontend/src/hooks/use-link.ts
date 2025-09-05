import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/apis/auth-api';
export const useLink = () => {
    const queryClient = useQueryClient();
    
    // Mutation to request additional GitHub scopes
    const requestScopes = useMutation({
        mutationFn: () => authAPI.linkGitHub(),
        onSuccess: () => {
        // Invalidate session query to refetch user data
        queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'accessToken'] });
        },
    });
    return {
        requestScopes: requestScopes.mutate,
        isRequestingScopes: requestScopes.isPending,
        error: requestScopes.error,
    };
};
