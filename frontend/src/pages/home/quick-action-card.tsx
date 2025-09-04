import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";
import GithubLink from "@/components/github-linking";
import RepoDialog from "@/components/repo-dialog";
import { useUser } from "@/hooks/use-user";

export const QuickActionsCard = () => {
  const { userData } = useUser();

  return (
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
  );
};
