import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  XCircle,
  Plus,
  Target,
} from "lucide-react";
import RepoDialog from "@/components/repo-dialog";
import { SessionItem } from "./session-item";
import { type TestSession } from "@/lib/apis/ai-test-api";

interface SessionsPanelProps {
  sessions: TestSession[];
  loading: boolean;
  error: Error | null;
}

export const SessionsPanel = ({ sessions, loading, error }: SessionsPanelProps) => {
  return (
    <div className="lg:col-span-2">
      <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Test Sessions</CardTitle>
                <CardDescription>
                  Manage your AI test generation sessions
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 font-medium">Loading sessions...</p>
              <p className="text-sm text-gray-500 mt-1">
                Please wait while we fetch your data
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">
                Error loading sessions
              </p>
              <p className="text-sm text-gray-600 text-center max-w-md">
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch sessions"}
              </p>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Get started by creating your first test session. Browse your
                repositories and generate AI-powered tests.
              </p>
              <RepoDialog
                trigger={
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create First Session</span>
                  </Button>
                }
              />
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionItem key={session.sessionId} session={session} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
