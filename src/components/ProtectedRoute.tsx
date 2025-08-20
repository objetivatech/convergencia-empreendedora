// src/components/ProtectedRoute.tsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Database } from "@/integrations/supabase/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Database["public"]["Enums"]["user_role"];
  requiredSubscription?: Database["public"]["Enums"]["subscription_type"];
  adminOnly?: boolean;
  redirectTo?: string; // default: "/"
}

/**
 * Corrige loops de redirecionamento:
 * - Aguarda loading de auth e de profile.
 * - Faz apenas UM navigate() (com replace) quando necessário.
 * - Evita retornar "null" enquanto ainda carrega (mostra placeholder).
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
  requiredSubscription,
  adminOnly = false,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    hasRole,
    hasSubscription,
  } = useUserRoles();

  // evita multiplos navigates durante re-render
  const navigatedRef = useRef(false);

  const isLoading = authLoading || profileLoading;

  const notLogged = !isLoading && !user;
  const notAdmin = !isLoading && adminOnly && !profile?.is_admin;
  const lacksRole = !isLoading && requiredRole && !hasRole(requiredRole);
  const lacksSub = !isLoading && requiredSubscription && !hasSubscription(requiredSubscription);

  // Debug logs temporários
  console.log('🛡️ ProtectedRoute debug:', {
    path: location.pathname,
    authLoading,
    profileLoading,
    isLoading,
    user: user?.email,
    profile: profile ? { email: profile.email, isAdmin: profile.is_admin, canEditBlog: profile.can_edit_blog } : null,
    adminOnly,
    notLogged,
    notAdmin,
    lacksRole,
    lacksSub
  });

  useEffect(() => {
    if (isLoading || navigatedRef.current) return;

    // Decide o destino 1 vez só
    if (notLogged) {
      navigatedRef.current = true;
      navigate(redirectTo, { replace: true, state: { from: location.pathname } });
      return;
    }

    if (notAdmin || lacksRole || lacksSub) {
      navigatedRef.current = true;
      navigate(redirectTo, { replace: true, state: { from: location.pathname } });
    }
  }, [
    isLoading,
    notLogged,
    notAdmin,
    lacksRole,
    lacksSub,
    navigate,
    redirectTo,
    location.pathname,
  ]);

  // Enquanto carrega, não renderiza nada sensível e NÃO navega
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10 text-muted-foreground">
        Carregando permissões…
      </div>
    );
  }

  // Se chegou até aqui, está autorizado
  return <>{children}</>;
};

export default ProtectedRoute;
