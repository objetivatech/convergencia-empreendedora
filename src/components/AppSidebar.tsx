import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  Home,
  Info,
  FolderOpen,
  Store,
  Users,
  LayoutDashboard,
  Settings,
  FileText,
  Mail,
  Crown,
  Building2,
  LogOut,
  User
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const publicMenuItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Sobre", url: "/sobre", icon: Info },
  { title: "Projetos", url: "/projetos", icon: FolderOpen },
  { title: "Convergindo", url: "/convergindo", icon: FileText },
  { title: "Loja", url: "/loja", icon: Store },
  { title: "Convergentes", url: "/diretorio", icon: Users },
];

const userMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meu Perfil", url: "/perfil", icon: User },
];

const adminMenuItems = [
  { title: "Painel Admin", url: "/admin", icon: Settings },
  { title: "Gerenciar Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Editor de Blog", url: "/admin/blog", icon: FileText },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
];

const businessMenuItems = [
  { title: "Dashboard Negócio", url: "/dashboard-negocio", icon: Building2 },
];

const ambassadorMenuItems = [
  { title: "Dashboard Embaixadora", url: "/dashboard-embaixadora", icon: Crown },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile, isAdmin, hasRole } = useUserRoles();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    return isActive(path) 
      ? `${baseClasses} bg-primary/10 text-primary font-medium` 
      : `${baseClasses} hover:bg-muted/50`;
  };

  const hasAdminAccess = profile && isAdmin();
  const hasBusinessAccess = profile && hasRole('business_owner');
  const hasAmbassadorAccess = profile && hasRole('ambassador');

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="py-4">
        {/* Logo */}
        <div className="px-6 mb-6">
          {!collapsed ? (
            <img 
              src="/lovable-uploads/07fc5569-e601-40a0-85f0-0521b206817f.png" 
              alt="Mulheres em Convergência" 
              className="h-12 w-auto"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MC</span>
            </div>
          )}
        </div>

        {/* Public Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Menu - only if logged in */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Business Menu */}
        {hasBusinessAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Negócio</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Ambassador Menu */}
        {hasAmbassadorAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Embaixadora</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ambassadorMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Menu */}
        {hasAdminAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with user info and logout */}
      {user && (
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-8 w-8 p-0"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}