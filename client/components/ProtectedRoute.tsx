import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component (Issue #3 fix)
 * Validates authentication before rendering protected content
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Check if token exists and is not expired
    const checkAuth = () => {
      const authenticated = api.isAuthenticated();
      setIsValid(authenticated);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-amber-600 font-body">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
