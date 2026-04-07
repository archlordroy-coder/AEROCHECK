import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const DashboardLayout = lazy(() => import("@/components/layout/DashboardLayout"));
const AgentDashboard = lazy(() => import("@/pages/dashboard/AgentDashboard"));
const QIPDashboard = lazy(() => import("@/pages/dashboard/QIPDashboard"));
const DLAADashboard = lazy(() => import("@/pages/dashboard/DLAADashboard"));
const DLAAReview = lazy(() => import("@/pages/dlaa/DLAAReview"));
const SuperviseurDashboard = lazy(() => import("@/pages/dashboard/SuperviseurDashboard"));
const AdminDashboard = lazy(() => import("@/pages/dashboard/AdminDashboard"));
const AgentProfile = lazy(() => import("@/pages/agent/AgentProfile"));
const DocumentSubmit = lazy(() => import("@/pages/documents/DocumentSubmit"));
const DocumentVerify = lazy(() => import("@/pages/documents/DocumentVerify"));
const LicenseIssue = lazy(() => import("@/pages/licenses/LicenseIssue"));
const LicenseView = lazy(() => import("@/pages/licenses/LicenseView"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

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
    return <Navigate to="/app/dashboard" replace />;
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
    return <Navigate to="/app/dashboard" replace />;
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
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      {/* Protected routes with dashboard layout */}
      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        
        {/* Agent routes */}
        <Route path="profile" element={<AgentProfile />} />
        <Route path="documents/submit" element={<DocumentSubmit />} />
        <Route path="license" element={<LicenseView />} />

        {/* QIP routes */}
        <Route path="qip" element={
          <ProtectedRoute roles={['QIP', 'SUPER_ADMIN', 'DNA']}>
            <QIPDashboard />
          </ProtectedRoute>
        } />
        <Route path="qip/verify/:id" element={
          <ProtectedRoute roles={['QIP', 'SUPER_ADMIN', 'DNA']}>
            <DocumentVerify />
          </ProtectedRoute>
        } />

        {/* DLAA routes */}
        <Route path="dlaa" element={
          <ProtectedRoute roles={['DLAA', 'SUPER_ADMIN', 'DNA']}>
            <DLAADashboard />
          </ProtectedRoute>
        } />
        <Route path="dlaa/review/:id" element={
          <ProtectedRoute roles={['DLAA', 'SUPER_ADMIN', 'DNA']}>
            <DLAAReview />
          </ProtectedRoute>
        } />
        <Route path="dlaa/issue/:id" element={
          <ProtectedRoute roles={['DLAA', 'SUPER_ADMIN', 'DNA']}>
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
          <ProtectedRoute roles={['SUPER_ADMIN', 'DNA']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'DNA']}>
            <UserManagement />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
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
