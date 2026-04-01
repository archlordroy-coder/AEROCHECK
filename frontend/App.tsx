import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AgentDashboard from "@/pages/dashboard/AgentDashboard";
import QIPDashboard from "@/pages/dashboard/QIPDashboard";
import DLAADashboard from "@/pages/dashboard/DLAADashboard";
import SuperviseurDashboard from "@/pages/dashboard/SuperviseurDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import AgentProfile from "@/pages/agent/AgentProfile";
import DocumentSubmit from "@/pages/documents/DocumentSubmit";
import DocumentVerify from "@/pages/documents/DocumentVerify";
import LicenseIssue from "@/pages/licenses/LicenseIssue";
import LicenseView from "@/pages/licenses/LicenseView";
import UserManagement from "@/pages/admin/UserManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Dashboard Router - redirects based on role
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'AGENT':
      return <AgentDashboard />;
    case 'QIP':
      return <QIPDashboard />;
    case 'DLAA':
      return <DLAADashboard />;
    case 'DNA':
      return <SuperviseurDashboard />;
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    default:
      return <AgentDashboard />;
  }
}

const AppRoutes = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      {/* Protected routes with dashboard layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        
        {/* Agent routes */}
        <Route path="profile" element={<AgentProfile />} />
        <Route path="documents/submit" element={<DocumentSubmit />} />
        <Route path="license" element={<LicenseView />} />

        {/* QIP routes */}
        <Route path="qip" element={
          <ProtectedRoute roles={['QIP', 'SUPER_ADMIN']}>
            <QIPDashboard />
          </ProtectedRoute>
        } />
        <Route path="qip/verify/:id" element={
          <ProtectedRoute roles={['QIP', 'SUPER_ADMIN']}>
            <DocumentVerify />
          </ProtectedRoute>
        } />

        {/* DLAA routes */}
        <Route path="dlaa" element={
          <ProtectedRoute roles={['DLAA', 'SUPER_ADMIN']}>
            <DLAADashboard />
          </ProtectedRoute>
        } />
        <Route path="dlaa/issue/:id" element={
          <ProtectedRoute roles={['DLAA', 'SUPER_ADMIN']}>
            <LicenseIssue />
          </ProtectedRoute>
        } />

        {/* Superviseur routes */}
        <Route path="supervision" element={
          <ProtectedRoute roles={['DNA', 'SUPER_ADMIN']}>
            <SuperviseurDashboard />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="admin" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
