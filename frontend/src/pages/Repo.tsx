import RepoDialog from '@/components/RepoDialog';
import { Button } from '@/components/ui/button';

const Repo = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Repository Management
                    </h1>
                    
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            View and manage your GitHub repositories. Click the button below to explore your repos.
                        </p>
                        
                        <RepoDialog 
                            trigger={
                                <Button size="lg" className="w-full md:w-auto">
                                    Browse My Repositories
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Repo;