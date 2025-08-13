import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Database["public"]["Enums"]["user_role"];
  requiredSubscription?: Database["public"]["Enums"]["subscription_type"];
  adminOnly?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredSubscription,
  adminOnly = false,
  redirectTo = "/auth" 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, hasRole, hasSubscription, isAdmin } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    // Check if user is authenticated
    if (!user) {
      navigate(redirectTo);
      return;
    }

    // Check admin requirement
    if (adminOnly && !isAdmin()) {
      navigate("/dashboard");
      return;
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      navigate("/dashboard");
      return;
    }

    // Check subscription requirement
    if (requiredSubscription && !hasSubscription(requiredSubscription)) {
      navigate("/dashboard");
      return;
    }
  }, [
    user, 
    profile, 
    authLoading, 
    profileLoading, 
    requiredRole, 
    requiredSubscription, 
    adminOnly, 
    redirectTo, 
    navigate, 
    hasRole, 
    hasSubscription, 
    isAdmin
  ]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (adminOnly && !isAdmin()) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredSubscription && !hasSubscription(requiredSubscription)) {
    return null;
  }

  return <>{children}</>;
};