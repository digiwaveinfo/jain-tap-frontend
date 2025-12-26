import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!api.isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
