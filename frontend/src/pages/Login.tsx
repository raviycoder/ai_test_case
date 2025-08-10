import GitHubLoginButton from "@/components/github-login-button";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Continue with your GitHub account
                </p>
            </div>
            <GitHubLoginButton />
        </div>
    </div>
  )
}

export default Login