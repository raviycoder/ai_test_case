import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { user, signOut, isSigningOut } = useAuth();

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
          
          {user && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID</p>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Verified</p>
                    <p className="font-medium">
                      {user.emailVerified ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>
                {user.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Avatar</p>
                    <img
                      src={user.image}
                      alt="User avatar"
                      className="w-16 h-16 rounded-full border"
                    />
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  variant="destructive"
                  className="w-full md:w-auto"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
