import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Target, Award, ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import Layout from "@/components/Layout";

const Home = () => {
  return (
    <Layout>
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Conectando Sonhos, 
              <span className="block text-white/90">Transformando Realidades</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Um espaço criado para educar, conectar e impulsionar mulheres por meio do 
              empreendedorismo e do fortalecimento de redes de apoio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
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

      {/* Valores Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Nossos Valores
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construímos um ecossistema completo para o crescimento feminino no empreendedorismo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-primary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Empoderamento</CardTitle>
                <CardDescription>
                  Fortalecemos mulheres através da educação e oportunidades de crescimento.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-secondary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Comunidade</CardTitle>
                <CardDescription>
                  Conectamos mulheres empreendedoras criando uma rede de apoio sólida.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-accent/10 rounded-full p-4 inline-block mb-4 group-hover:bg-accent/20 transition-colors">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Foco</CardTitle>
                <CardDescription>
                  Oferecemos direcionamento claro para alcançar objetivos empresariais.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-primary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Excelência</CardTitle>
                <CardDescription>
                  Promovemos a busca contínua pela excelência em todos os projetos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Mulheres Conectadas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Projetos Realizados</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-primary-foreground/80">Cidades Atingidas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-primary-foreground/80">Taxa de Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nossas participantes dizem</h2>
            <p className="text-xl text-muted-foreground">
              Histórias reais de transformação e crescimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "A plataforma me ajudou a conectar com outras empreendedoras e expandir meu negócio 
                  de forma sustentável. Hoje tenho uma rede de apoio incrível!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Maria Silva</div>
                    <div className="text-sm text-muted-foreground">Fundadora da EcoBeauty</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Os cursos e workshops oferecidos são de altíssima qualidade. Aprendi conceitos 
                  fundamentais que aplicei imediatamente em minha empresa."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
                    A
                  </div>
                  <div>
                    <div className="font-semibold">Ana Costa</div>
                    <div className="text-sm text-muted-foreground">CEO da TechWomen</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Encontrei inspiração e direcionamento para meus projetos. A comunidade é 
                  acolhedora e sempre disposta a ajudar."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold mr-3">
                    J
                  </div>
                  <div>
                    <div className="font-semibold">Juliana Santos</div>
                    <div className="text-sm text-muted-foreground">Diretora da ImpactoBr</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronta para transformar sua jornada empreendedora?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Junte-se à nossa comunidade de mulheres visionárias e comece a construir 
            o futuro que você merece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Comece Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;