import RepoDialog from '@/components/repo-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GitBranch, Github, Code2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Repo = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Dashboard</span>
                            </Button>
                            <div className="h-6 w-px bg-gray-300" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Repository Management
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Browse and manage your GitHub repositories
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="text-center pb-8">
                                <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl w-fit">
                                    <Github className="w-12 h-12 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                                    Browse Your Repositories
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600 max-w-lg mx-auto">
                                    Select a repository to generate AI-powered test cases for your code. 
                                    We support multiple frameworks and testing libraries.
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="text-center pb-8">
                                <RepoDialog 
                                    trigger={
                                        <Button 
                                            size="lg" 
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <GitBranch className="w-5 h-5 mr-3" />
                                            Browse My Repositories
                                        </Button>
                                    }
                                />
                                
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Don't see your repositories? Make sure your GitHub account is properly linked.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => navigate('/')}
                                    >
                                        Check Account Settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Features Card */}
                        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Code2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Supported Features</CardTitle>
                                        <CardDescription>What you can do</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Framework Support</p>
                                            <p className="text-xs text-gray-600">Jest, Vitest, Mocha, and more</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Smart Analysis</p>
                                            <p className="text-xs text-gray-600">AI analyzes your code structure</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Comprehensive Tests</p>
                                            <p className="text-xs text-gray-600">Unit, integration, and edge cases</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Quality Validation</p>
                                            <p className="text-xs text-gray-600">Syntax and logic validation</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Tips Card */}
                        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <GitBranch className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Quick Tips</CardTitle>
                                        <CardDescription>Get the best results</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="font-medium text-blue-800 mb-1">💡 Pro Tip</p>
                                        <p className="text-blue-700">Choose repositories with clear function definitions for better test generation</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <p className="font-medium text-green-800 mb-1">🚀 Best Practice</p>
                                        <p className="text-green-700">Select files with good documentation and type definitions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Repo;