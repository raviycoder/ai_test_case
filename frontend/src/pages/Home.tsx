import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import GithubLink from '@/components/github-linking';
import { useUser } from '@/hooks/useUser';
import RepoDialog from '@/components/RepoDialog';

const Home = () => {
  const { signOut, isSigningOut } = useAuth();
  const { userData } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to Your Dashboard
          </h1>
          
          {userData && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{userData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{userData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID</p>
                    <p className="font-mono text-sm">{userData._id || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Verified</p>
                    <p className="font-medium">
                      {userData.emailVerified ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>
                {userData.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Avatar</p>
                    <img
                      src={userData.image}
                      alt="User avatar"
                      className="w-16 h-16 rounded-full border"
                    />
                  </div>
                )}
              </div>
              
              <div className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </Button>
                  
                  <RepoDialog 
                    trigger={
                      <Button variant="outline" className="w-full sm:w-auto">
                        View Repositories
                      </Button>
                    }
                  />
                </div>
                
                <div>
                  <GithubLink isLinked={userData.accountLinked} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
