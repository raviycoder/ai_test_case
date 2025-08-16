import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Github, Loader2 } from "lucide-react";

const GitHubLoginButton = () => {
  const { loginWithGitHub, isSigningIn } = useAuth();

  const handleGitHubLogin = () => {
    loginWithGitHub(import.meta.env.VITE_BASE_URL); // Redirect to home after login
  };

  return (
    <Button
      variant="default"
      size="lg"
      className="w-full bg-gray-900 hover:bg-gray-800 text-white border-0 py-3 px-6 text-base font-medium transition-all duration-200 hover:shadow-lg"
      onClick={handleGitHubLogin}
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <>
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <Github className="w-5 h-5 mr-3" />
          <span>Continue with GitHub</span>
        </>
      )}
    </Button>
  );
};

export default GitHubLoginButton;
