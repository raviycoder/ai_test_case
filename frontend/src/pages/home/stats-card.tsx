import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Activity } from "lucide-react";
import { type TestSession } from "@/lib/apis/ai-test-api";

interface StatsCardProps {
  sessions: TestSession[];
}

export const StatsCard = ({ sessions }: StatsCardProps) => {
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const activeSessions = sessions.filter(
    (s) => s.status === "processing" || s.status === "pending"
  ).length;

  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Overview</CardTitle>
            <CardDescription>Your testing statistics</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              Total Sessions
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {completedSessions}
            </div>
            <div className="text-xs text-green-600 font-medium">Completed</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {activeSessions}
            </div>
            <div className="text-xs text-amber-600 font-medium">Active</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.reduce(
                (acc, s) => acc + (s.countFiles || 0),
                0
              )}
            </div>
            <div className="text-xs text-purple-600 font-medium">
              Files Tested
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
