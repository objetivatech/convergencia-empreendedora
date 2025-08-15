import { useEffect } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import Layout from "@/components/Layout";

export default function AdminTest() {
  const { profile, loading, isAdmin } = useUserRoles();

  useEffect(() => {
    console.log('AdminTest Debug:', {
      profile,
      loading,
      isAdmin: isAdmin(),
      profileIsAdmin: profile?.is_admin,
      profileRoles: profile?.roles,
      profileEmail: profile?.email
    });
  }, [profile, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Teste de Acesso Admin</h1>
          <p>Carregando dados do usuário...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Acesso Admin</h1>
        
        <div className="bg-card p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Informações do Usuário</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Email:</label>
              <p className="text-muted-foreground">{profile?.email || 'N/A'}</p>
            </div>
            
            <div>
              <label className="font-medium">Nome:</label>
              <p className="text-muted-foreground">{profile?.full_name || 'N/A'}</p>
            </div>
            
            <div>
              <label className="font-medium">É Admin (função isAdmin()):</label>
              <p className={`font-semibold ${isAdmin() ? 'text-green-600' : 'text-red-600'}`}>
                {isAdmin() ? 'SIM' : 'NÃO'}
              </p>
            </div>
            
            <div>
              <label className="font-medium">Campo is_admin:</label>
              <p className={`font-semibold ${profile?.is_admin ? 'text-green-600' : 'text-red-600'}`}>
                {profile?.is_admin ? 'TRUE' : 'FALSE'}
              </p>
            </div>
            
            <div>
              <label className="font-medium">Roles:</label>
              <p className="text-muted-foreground">
                {profile?.roles?.length ? profile.roles.join(', ') : 'Nenhuma'}
              </p>
            </div>
            
            <div>
              <label className="font-medium">Pode editar blog:</label>
              <p className={`font-semibold ${profile?.can_edit_blog ? 'text-green-600' : 'text-red-600'}`}>
                {profile?.can_edit_blog ? 'SIM' : 'NÃO'}
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded">
            <h3 className="font-medium mb-2">Status de Acesso:</h3>
            {isAdmin() ? (
              <div className="text-green-600 font-semibold">
                ✅ Usuário tem acesso administrativo
              </div>
            ) : (
              <div className="text-red-600 font-semibold">
                ❌ Usuário NÃO tem acesso administrativo
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}