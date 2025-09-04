import React, { useEffect, useRef } from 'react';
import { useGitRepo, useRepoFiles, useRepoTree } from '@/hooks/use-git-repo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RepoDialogProps {
  trigger?: React.ReactNode;
}

const RepoDialog: React.FC<RepoDialogProps> = ({ trigger }) => {
  const {
    repositories,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGitRepo();
  const [repoFiles, setRepoFiles] = React.useState<{ owner: string; name: string; branch?: string }>({ owner: '', name: '' });
  const containerRef = useRef<HTMLDivElement>(null);
  const { files } = useRepoFiles(repoFiles.owner, repoFiles.name);
  const { tree } = useRepoTree(repoFiles.owner, repoFiles.name, repoFiles.branch || 'main');

  console.log("Files for", repoFiles, files);
  useEffect(() => {
    if (tree) {
      console.log('Repo tree:', tree);
    }
  }, [tree]);

  // Attach scroll listener to the actual scrollable viewport and only load at true end
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    // Locate the actual scrollable viewport inside the ScrollArea
    const viewport = root.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight; // strict end
      if (atBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || <Button>View Repositories</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Error Loading Repositories</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load repositories</p>
            <p className="text-sm text-gray-500 mt-2">
              Please make sure you're authenticated and have linked your GitHub account.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>View Repositories</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            GitHub Repositories
            {repositories.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({repositories.length} repos)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div ref={containerRef} className="w-full">
          <ScrollArea
            className="h-[60vh] w-full pr-4"
          >
          {isLoading && repositories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading repositories...</p>
              </div>
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No repositories found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {repositories.map((repo) => (
                <Card key={repo.id} onClick={() => {
                  setRepoFiles({ owner: repo.fullName.split('/')[0], name: repo.name, branch: repo.defaultBranch || 'main' });
                }} className="w-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {repo.private ? (
                            <Lock className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-500" />
                          )}
                          <span className="truncate">{repo.name}</span>
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          {repo.fullName}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="ml-4 shrink-0"
                      >
                        <Link
                          to={`/file-test-case/new-session?repo=${repo.name}&_branch=${repo.defaultBranch || 'main'}&_owner=${repo.fullName.split('/')[0]}`}
                          className="flex items-center gap-1"
                        >
                          Create TestCase
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {repo.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getLanguageColor(repo.language),
                              }}
                            />
                            <span>{repo.language}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          <span>{repo.defaultBranch}</span>
                        </div>

                        {repo.size > 0 && (
                          <span>{formatSize(repo.size)} KB</span>
                        )}

                        <span>
                          Updated {formatDate(repo.updatedAt)}
                        </span>

                        {/* {repo.hasCode && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Has Code
                          </span>
                        )} */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                  <span className="text-gray-500">Loading more...</span>
                </div>
              )}

              {!hasNextPage && repositories.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No more repositories to load</p>
                </div>
              )}
            </div>
          )}
          </ScrollArea>
        </div>

        {hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Shell: '#89e051',
  };
  return colors[language] || '#858585';
};

const formatSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) return sizeInKB.toString();
  if (sizeInKB < 1024 * 1024) return `${(sizeInKB / 1024).toFixed(1)}M`;
  return `${(sizeInKB / (1024 * 1024)).toFixed(1)}G`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export default RepoDialog;
