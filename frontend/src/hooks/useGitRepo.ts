import { repoAPI } from '@/lib/repo-api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useGitRepo = () => {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['githubRepos'],
        queryFn: ({ pageParam = 1 }) => repoAPI.getRepos({ page: pageParam, perPage: 10 }),
        getNextPageParam: (lastPage) => {
            return lastPage?.meta?.hasMore ? lastPage.meta.page + 1 : undefined;
        },
        initialPageParam: 1,
    });

    // Flatten all repositories from all pages
    const repositories = data?.pages.flatMap(page => page?.repositories || []) || [];

    return {
        repositories,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    };
};


export const useRepoFiles = (owner: string, repo: string) => {
    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['repoFiles', owner, repo],
    queryFn: () => repoAPI.getRepoFiles(owner, repo),
    enabled: Boolean(owner && repo),
    });

    return {
        files: data,
        isLoading,
        error,
    };
};

export const useRepoTree = (owner: string, repo: string, branch = 'main') => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['repoTree', owner, repo, branch],
        queryFn: () => repoAPI.getRepoTree(owner, repo, branch),
        enabled: Boolean(owner && repo),
    });

    return { tree: data, isLoading, error };
};

export const useFileContent = (owner: string, repo: string, path: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['fileContent', owner, repo, path],
        queryFn: () => repoAPI.getFileContent(owner, repo, path),
        enabled: Boolean(owner && repo && path),
    });

    return { content: data, isLoading, error };
};