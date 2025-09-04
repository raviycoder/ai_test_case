import { UserProfileCard } from "./user-profile-card";
import { QuickActionsCard } from "./quick-action-card";
import { StatsCard } from "./stats-card";
import { type TestSession } from "@/lib/apis/ai-test-api";

interface LeftPanelProps {
  sessions: TestSession[];
}

export const LeftPanel = ({ sessions }: LeftPanelProps) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <UserProfileCard />
      <QuickActionsCard />
      <StatsCard sessions={sessions} />
    </div>
  );
};
