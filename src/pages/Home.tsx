import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Briefcase, BookOpen, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Implementar inscrição na newsletter
      toast({
        title: "Obrigada!",
        description: "Seu email foi cadastrado com sucesso em nossa newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow-elegant sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-brand-primary" />
              <h1 className="text-2xl font-bold text-brand-primary font-nexa">
                Mulheres em Convergência
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#sobre" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Sobre
              </a>
              <a href="#projetos" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Projetos
              </a>
              <a href="#blog" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Convergindo
              </a>
              <a href="#diretorio" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Diretório
              </a>
              <Button variant="default" className="bg-brand-primary hover:bg-brand-primary/90">
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(199, 90, 146, 0.9), rgba(145, 145, 192, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Empoderando Mulheres Empreendedoras
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-nexa">
              Conectando Sonhos, 
              <span className="block text-white/90">Transformando Realidades</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-montserrat">
              Um espaço criado para educar, conectar e impulsionar mulheres por meio do 
              empreendedorismo e do fortalecimento de redes de apoio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-white/90 font-androgyne">
                Comece Sua Jornada
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Conheça Nossa Comunidade
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seções Principais */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-nexa">
              Nossos Pilares
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construímos um ecossistema completo para o crescimento feminino no empreendedorismo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-brand transition-smooth cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-brand-primary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-brand-primary/20 transition-smooth">
                  <Users className="h-8 w-8 text-brand-primary" />
                </div>
                <h4 className="text-xl font-bold mb-2 font-montserrat">Comunidade</h4>
                <p className="text-muted-foreground">
                  Conecte-se com outras empreendedoras, compartilhe experiências e cresça juntas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-brand transition-smooth cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-brand-secondary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-brand-secondary/20 transition-smooth">
                  <Briefcase className="h-8 w-8 text-brand-secondary" />
                </div>
                <h4 className="text-xl font-bold mb-2 font-montserrat">Diretório</h4>
                <p className="text-muted-foreground">
                  Encontre e promova negócios liderados por mulheres em sua região.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-brand transition-smooth cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-brand-tertiary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-brand-tertiary/20 transition-smooth">
                  <BookOpen className="h-8 w-8 text-brand-tertiary" />
                </div>
                <h4 className="text-xl font-bold mb-2 font-montserrat">Educação</h4>
                <p className="text-muted-foreground">
                  Acesse cursos, workshops e conteúdos exclusivos para empreendedoras.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-brand transition-smooth cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-gray-medium/10 rounded-full p-4 inline-block mb-4 group-hover:bg-gray-medium/20 transition-smooth">
                  <Heart className="h-8 w-8 text-gray-medium" />
                </div>
                <h4 className="text-xl font-bold mb-2 font-montserrat">Impacto Social</h4>
                <p className="text-muted-foreground">
                  Gere autonomia financeira e transforme comunidades através do empreendedorismo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-brand-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <Mail className="h-12 w-12 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 font-nexa">
              Fique por Dentro das Novidades
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Receba conteúdos exclusivos, dicas de empreendedorismo e oportunidades de networking.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
                required
              />
              <Button type="submit" className="bg-white text-brand-primary hover:bg-white/90 font-androgyne">
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-brand-primary" />
                <span className="text-xl font-bold font-nexa">Mulheres em Convergência</span>
              </div>
              <p className="text-white/70 mb-4">
                Empoderando mulheres através do empreendedorismo e da criação de redes de apoio.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-montserrat">Links Rápidos</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#sobre" className="hover:text-brand-primary transition-smooth">Sobre Nós</a></li>
                <li><a href="#projetos" className="hover:text-brand-primary transition-smooth">Projetos</a></li>
                <li><a href="#blog" className="hover:text-brand-primary transition-smooth">Blog Convergindo</a></li>
                <li><a href="#diretorio" className="hover:text-brand-primary transition-smooth">Diretório</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-montserrat">Comunidade</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-brand-primary transition-smooth">Grupos</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-smooth">Eventos</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-smooth">Mentoria</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-smooth">Embaixadoras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-montserrat">Contato</h4>
              <div className="space-y-2 text-white/70">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@mulheresemconvergencia.com.br</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+55 (11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, Brasil</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 Mulheres em Convergência. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;