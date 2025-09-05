import { useSessions } from "@/hooks/use-session";
import { Header } from "./home/header";
import { LeftPanel } from "./home/left-panel";
import { SessionsPanel } from "./home/session-panel";

const Home = () => {
  const { sessions, isLoading: loading, error } = useSessions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <LeftPanel sessions={sessions} />
          <SessionsPanel sessions={sessions} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Home;
