import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
  Target,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { type TestSession } from "@/lib/apis/ai-test-api";

interface SessionItemProps {
  session: TestSession;
}

export const SessionItem = ({ session }: SessionItemProps) => {
  const getStatusColor = (status: TestSession["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: TestSession["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {session.repositoryId || "Unknown Repository"}
              </h3>
              <Badge
                className={`border ${getStatusColor(
                  session.status
                )} flex items-center space-x-1`}
              >
                {getStatusIcon(session.status)}
                <span className="capitalize">{session.status}</span>
              </Badge>
            </div>
            {session.repoBranch && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <GitBranch className="w-4 h-4" />
                <span>Branch: {session.repoBranch}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 font-mono">
              {session.sessionId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded">
              <Target className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Framework</p>
              <p className="text-sm font-medium text-gray-900">
                {session.framework}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-green-100 rounded">
              <FileText className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Files</p>
              <p className="text-sm font-medium text-gray-900">
                {session.countFiles || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-100 rounded">
              <Clock className="w-3 h-3 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium text-gray-900">
                {session.processingTimeMs
                  ? `${session.processingTimeMs}ms`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-orange-100 rounded">
              <Calendar className="w-3 h-3 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {session.completedAt && (
          <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Completed{" "}
              {formatDistanceToNow(new Date(session.completedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">Session ID</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
              {session.sessionId.split("_")[1]}
            </code>
          </div>
          <Link
            to={`/file-test-case/${session.sessionId}?repo=${
              session.repositoryId?.split("/")[1]
            }&_branch=${session.repoBranch}&_owner=${
              session.repositoryId?.split("/")[0]
            }&_file=${session.defaultPath ?? ""}`}
          >
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => {
                console.log("View session:", session.sessionId);
              }}
            >
              <FileText className="w-4 h-4" />
              <span>View Details</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
