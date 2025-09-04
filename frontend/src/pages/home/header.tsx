import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

export const Header = () => {
  const { signOut, isSigningOut } = useAuth();
  const { userData } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Test Generator
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {userData?.name || "User"}
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
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
