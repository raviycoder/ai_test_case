import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login-page";
import Home from "./pages/home-page";
import ProtectedRoute from "./components/protecte-route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Repo from "./pages/repo-page";
import FilesDashboard from "./pages/files-dashboard-page";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import AppSidebar from "./components/app-sidebar";
import LandingPage from "./pages/landing/landing-page";
import NotFound from "./pages/not-found-page";

const router = createBrowserRouter([
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/repo",
    element: (
      <ProtectedRoute>
        <Repo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <LandingPage />
    )

  },
  {
    path: "*",
    element:(
      <NotFound />
    )
  },
  {
    // file-test-case/new-session?repo=ai_test_case&_branch=main&_owner=raviycoder
    path: "/file-test-case/:sessionId",
    element: (
      <SidebarProvider className="w-full">
        <div className="flex">
          <AppSidebar />
          <SidebarTrigger />
        </div>

        <ProtectedRoute>
          <main className="w-full p-0">
            <FilesDashboard />
          </main>
        </ProtectedRoute>
      </SidebarProvider>
    ),
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
