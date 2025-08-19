import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  Menu, 
  User, 
  LogOut, 
  Home,
  Info,
  BookOpen,
  LayoutDashboard,
  UserCog,
  Edit,
  Mail
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";

const MainNavigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, canEditBlog } = useUserRoles();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Menu principal (sempre visível)
  const mainMenuItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/sobre", label: "Sobre", icon: Info },
    { href: "/convergindo", label: "Convergindo", icon: BookOpen },
  ];

  // Menu "Minha Conta" (apenas para usuários logados)
  const accountMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  // Menu "Administração" (apenas para admins)
  const adminMenuItems = [
    { href: "/admin", label: "Painel Admin", icon: UserCog },
    { href: "/admin/blog", label: "Editor de Blog", icon: Edit },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  ];

  const ListItem = ({ 
    href, 
    children, 
    icon: Icon,
    onClick 
  }: { 
    href: string; 
    children: React.ReactNode; 
    icon?: any;
    onClick?: () => void;
  }) => (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative",
            isActive(href) && "bg-accent text-accent-foreground"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <div className="text-sm font-medium leading-none">{children}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/07fc5569-e601-40a0-85f0-0521b206817f.png" 
              alt="Mulheres em Convergência" 
              className="h-16"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Menu Principal */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Menu Principal</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-3 p-4">
                    {mainMenuItems.map((item) => (
                      <ListItem 
                        key={item.href} 
                        href={item.href} 
                        icon={item.icon}
                      >
                        {item.label}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Menu Minha Conta (apenas para usuários logados) */}
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Minha Conta</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 gap-3 p-4">
                      {accountMenuItems.map((item) => (
                        <ListItem 
                          key={item.href} 
                          href={item.href} 
                          icon={item.icon}
                        >
                          {item.label}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {/* Menu Administração (apenas para admins) */}
              {(isAdmin() || canEditBlog()) && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Administração</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-64 gap-3 p-4">
                      {adminMenuItems.map((item) => (
                        <ListItem 
                          key={item.href} 
                          href={item.href} 
                          icon={item.icon}
                        >
                          {item.label}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <NotificationCenter />

            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  {/* Menu Principal Mobile */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">Menu Principal</h3>
                    <div className="space-y-2">
                      {mainMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                              isActive(item.href)
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Minha Conta Mobile */}
                  {user && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Minha Conta</h3>
                      <div className="space-y-2">
                        {accountMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md relative",
                                isActive(item.href)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Menu Administração Mobile */}
                  {(isAdmin() || canEditBlog()) && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Administração</h3>
                      <div className="space-y-2">
                        {adminMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                                isActive(item.href)
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainNavigation;