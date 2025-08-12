import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Repo from "./pages/Repo.tsx";
import FilesDashboard from "./pages/FilesDashboard.tsx";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar.tsx";
import AppSidebar from "./components/AppSidebar.tsx";

const router = createBrowserRouter([
  {
    path: "/",
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
    path: "/app",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
    // file-test-case/new-session?repo=ai_test_case&_branch=main&_owner=raviycoder
    path: "/file-test-case/:sessionId",
    element: (
      <SidebarProvider>
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
