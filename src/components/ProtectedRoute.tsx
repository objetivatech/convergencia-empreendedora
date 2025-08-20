// src/components/ProtectedRoute.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
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
  
  // Fallback direto quando useUserRoles falha
  const [fallbackAdmin, setFallbackAdmin] = useState<boolean | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Se profile é null mas user existe, tentar consulta direta
  useEffect(() => {
    if (user && !profile && !profileLoading && adminOnly && fallbackAdmin === null && !fallbackLoading) {
      console.log('🔄 Fallback: Trying direct admin check for:', user.email);
      setFallbackLoading(true);
      
      const fetchAdminStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
          console.log('🔄 Fallback query result:', { data, error });
          if (data) {
            setFallbackAdmin(data.is_admin);
            console.log('✅ Fallback admin status:', data.is_admin);
          }
        } catch (error) {
          console.error('❌ Fallback query error:', error);
        } finally {
          setFallbackLoading(false);
        }
      };
      
      fetchAdminStatus();
    }
  }, [user, profile, profileLoading, adminOnly, fallbackAdmin, fallbackLoading]);

  const isLoading = authLoading || profileLoading || fallbackLoading;

  const notLogged = !isLoading && !user;
  // Use fallback admin status if profile is null
  const actualAdminStatus = profile?.is_admin ?? fallbackAdmin ?? false;
  const notAdmin = !isLoading && adminOnly && !actualAdminStatus;
  const lacksRole = !isLoading && requiredRole && !hasRole(requiredRole);
  const lacksSub = !isLoading && requiredSubscription && !hasSubscription(requiredSubscription);

  // Debug logs temporários
  console.log('🛡️ ProtectedRoute debug:', {
    path: location.pathname,
    authLoading,
    profileLoading,
    fallbackLoading,
    isLoading,
    user: user?.email,
    profile: profile ? { email: profile.email, isAdmin: profile.is_admin, canEditBlog: profile.can_edit_blog } : null,
    fallbackAdmin,
    actualAdminStatus,
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
