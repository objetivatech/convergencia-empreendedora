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

    console.log('ProtectedRoute Debug:', {
      user: user?.email,
      profile: profile?.email,
      adminOnly,
      isAdmin: isAdmin(),
      profileIsAdmin: profile?.is_admin,
      requiredRole,
      hasRequiredRole: requiredRole ? hasRole(requiredRole) : true,
      profileRoles: profile?.roles
    });

    // Check if user is authenticated
    if (!user) {
      console.log('ProtectedRoute: No user, redirecting to', redirectTo);
      navigate(redirectTo);
      return;
    }

    // Check admin requirement with improved logic
    if (adminOnly) {
      const userIsAdmin = isAdmin() || profile?.is_admin || false;
      console.log('ProtectedRoute: Admin check:', { userIsAdmin, adminOnly });
      
      if (!userIsAdmin) {
        console.log('ProtectedRoute: User is not admin, redirecting to dashboard');
        navigate("/dashboard");
        return;
      }
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      console.log('ProtectedRoute: User does not have required role:', requiredRole);
      navigate("/dashboard");
      return;
    }

    // Check subscription requirement
    if (requiredSubscription && !hasSubscription(requiredSubscription)) {
      console.log('ProtectedRoute: User does not have required subscription:', requiredSubscription);
      navigate("/dashboard");
      return;
    }

    console.log('ProtectedRoute: All checks passed, allowing access');
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

  if (adminOnly) {
    const userIsAdmin = isAdmin() || profile?.is_admin || false;
    if (!userIsAdmin) {
      return null;
    }
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredSubscription && !hasSubscription(requiredSubscription)) {
    return null;
  }

  return <>{children}</>;
};