import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <img 
          src="/lovable-uploads/5eba316e-250b-4229-91de-5bccaefa8515.png" 
          alt="Mulheres em Convergência" 
          className="h-16 w-16 mb-6 opacity-50"
        />
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página Não Encontrada</h2>
        <p className="text-xl text-muted-foreground mb-8 text-responsive">
          Ops! A página que você está procurando não existe.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;