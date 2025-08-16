import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GithubLink from '@/components/github-linking';
import { useUser } from '@/hooks/useUser';
import { useSessions } from '@/hooks/useSessions';
import RepoDialog from '@/components/RepoDialog';
import { type TestSession } from '@/lib/ai-test-api';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  LogOut, 
  GitBranch, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  XCircle,
  Plus,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { signOut, isSigningOut } = useAuth();
  const { userData } = useUser();
  const { sessions, isLoading: loading, error } = useSessions();

  const getStatusColor = (status: TestSession['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: TestSession['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const activeSessions = sessions.filter(s => s.status === 'processing' || s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Test Generator
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {userData?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {userData?.image && (
                <img
                  src={userData.image}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              )}
              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {userData?.name || 'Not provided'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {userData?.email || 'Not provided'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        userData?.emailVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userData?.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Get started quickly</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <RepoDialog 
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Browse Repositories
                    </Button>
                  }
                />
                <div className="border-t pt-3">
                  <GithubLink isLinked={userData?.accountLinked} />
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Overview</CardTitle>
                    <CardDescription>Your testing statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
                    <div className="text-xs text-blue-600 font-medium">Total Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
                    <div className="text-xs text-green-600 font-medium">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{activeSessions}</div>
                    <div className="text-xs text-amber-600 font-medium">Active</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {sessions.reduce((acc, s) => acc + (s.selectedFiles?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">Files Tested</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sessions */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Test Sessions</CardTitle>
                      <CardDescription>Manage your AI test generation sessions</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600 font-medium">Loading sessions...</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-3 bg-red-100 rounded-full mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium mb-2">Error loading sessions</p>
                    <p className="text-sm text-gray-600 text-center max-w-md">
                      {error instanceof Error ? error.message : 'Failed to fetch sessions'}
                    </p>
                  </div>
                )}

                {!loading && !error && sessions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
                    <p className="text-gray-600 text-center max-w-md mb-6">
                      Get started by creating your first test session. Browse your repositories and generate AI-powered tests.
                    </p>
                    <RepoDialog 
                      trigger={
                        <Button className="flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Create First Session</span>
                        </Button>
                      }
                    />
                  </div>
                )}

                {!loading && !error && sessions.length > 0 && (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.sessionId} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {session.repositoryId || 'Unknown Repository'}
                                </h3>
                                <Badge className={`border ${getStatusColor(session.status)} flex items-center space-x-1`}>
                                  {getStatusIcon(session.status)}
                                  <span className="capitalize">{session.status}</span>
                                </Badge>
                              </div>
                              {session.repoBranch && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                  <GitBranch className="w-4 h-4" />
                                  <span>Branch: {session.repoBranch}</span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 font-mono">
                                {session.sessionId}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-blue-100 rounded">
                                <Target className="w-3 h-3 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Framework</p>
                                <p className="text-sm font-medium text-gray-900">{session.framework}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-green-100 rounded">
                                <FileText className="w-3 h-3 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Files</p>
                                <p className="text-sm font-medium text-gray-900">{session.selectedFiles?.length || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-purple-100 rounded">
                                <Clock className="w-3 h-3 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {session.processingTimeMs ? `${session.processingTimeMs}ms` : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-orange-100 rounded">
                                <Calendar className="w-3 h-3 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {session.completedAt && (
                            <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-800">
                                Completed {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-gray-500">Session ID</span>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {session.sessionId.split('_')[1]}
                              </code>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => {
                                console.log('View session:', session.sessionId);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              {/* http://localhost:5173/file-test-case/session_1755195143892_q52s7biph?repo=ai_agent&_branch=main&_owner=raviycoder&_file=backend%2Fcontrollers%2FagentController.js */}
                              <Link  to={`/file-test-case/${session.sessionId}?repo=${session.repositoryId?.split('/')[1]}&_branch=${session.repoBranch}&_owner=${session.repositoryId?.split('/')[0]}`}>
                                <span>View Details</span>
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
