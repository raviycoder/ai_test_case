import GitHubLoginButton from "@/components/github-login-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield, Zap, Code2 } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl w-fit">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              AI Test Generator
            </CardTitle>
            <CardDescription className="text-gray-600">
              Generate intelligent test cases for your code with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign in to continue
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect with your GitHub account to get started
              </p>
            </div>
            
            <GitHubLoginButton />

            {/* Features Preview */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wide font-medium">
                What you'll get
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">AI-powered test generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Secure GitHub integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Code2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-700">Support for multiple frameworks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Text */}
        <div className="text-center mt-6 text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}

export default Login