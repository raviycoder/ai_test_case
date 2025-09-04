import { userAPI } from "@/lib/apis/user-api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "./use-auth";

export const useUser = () => {
    const queryClient = useQueryClient();

    const {data: users, isLoading: isLoadingUsers, error: errorUsers, refetch: refetchUsers} = useQuery({
        queryKey:["user"],
        queryFn: userAPI.getUsers
    });

    const {user} = useAuth();

    const {data: userData, isLoading: isLoadingUser, error: errorUser, refetch: refetchUser}= useQuery({
        queryKey:["user", user?.id],
        enabled: !!user?.id,
        queryFn: () => userAPI.getUserById(user!.id as string)
    });

    const updateUser = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (userData: any) => userAPI.updateUser(user!.id as string, userData),
        onSuccess: () => {
            // Invalidate user query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['users', user?.id] });
        },
    });

    const deleteUser = useMutation({
        mutationFn: () => userAPI.deleteUser(user!.id as string),
        onSuccess: () => {
            // Invalidate user query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
        },
    });

    const createUser = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (userData: any) => userAPI.createUser(userData),
        onSuccess: () => {
            // Invalidate user query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    return {
        createUser,
        users,
        isLoadingUsers,
        errorUsers,
        refetchUsers,
        userData:{...userData?.data},
        isLoadingUser,
        errorUser,
        refetchUser,
        updateUser,
        deleteUser
    };

}