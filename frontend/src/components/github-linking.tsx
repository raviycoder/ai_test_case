import { useLink } from "@/hooks/use-link";
import { Button } from "./ui/button";
import { Github, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const GithubLink = ({isLinked}: {isLinked: boolean}) => {
    const { requestScopes, isRequestingScopes, error } = useLink();

    const handleLink = () => {
        requestScopes();
    };

    if (isLinked) {
        return (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">GitHub Connected</p>
                    <p className="text-xs text-green-600">Your account is linked and ready to use</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Button 
                onClick={handleLink} 
                disabled={isRequestingScopes}
                variant="outline"
                className="w-full flex items-center space-x-2 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
                {isRequestingScopes ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Linking...</span>
                    </>
                ) : (
                    <>
                        <Github className="w-4 h-4" />
                        <span>Link GitHub Account</span>
                    </>
                )}
            </Button>
            
            {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-700">
                        {error.message}
                    </AlertDescription>
                </Alert>
            )}
            
            {!isLinked && !error && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    Link your GitHub account to access private repositories and enhanced features
                </p>
            )}
        </div>
    );
}

export default GithubLink;