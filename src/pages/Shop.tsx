import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { addToCart } = useCartStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      type: product.type,
      digital: product.digital,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Loja Online
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Descubra produtos e serviços criados por mulheres empreendedoras
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="product">Produtos</SelectItem>
                  <SelectItem value="subscription">Assinaturas</SelectItem>
                  <SelectItem value="donation">Doações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link to="/cart">
              <Button variant="outline" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrinho
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-elegant transition-smooth">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                    />
                    {product.digital && (
                      <Badge className="absolute top-2 right-2 bg-secondary">
                        Digital
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {product.type}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Link to={`/produto/${product.id}`}>
                      <Button variant="outline">Ver Detalhes</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;