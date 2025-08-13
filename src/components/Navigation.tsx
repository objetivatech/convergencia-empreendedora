import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, User, Heart } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre" },
    { href: "/projetos", label: "Projetos" },
    { href: "/loja", label: "Loja" },
    { href: "/diretorios", label: "Diretórios" },
    { href: "/comunidade", label: "Comunidade" },
  ];

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
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/cart" className="relative">
              <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Carrinho</span>
                {totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 md:h-5 md:w-5 p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Button>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md ${
                        isActive(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;