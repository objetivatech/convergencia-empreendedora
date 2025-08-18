import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Target, Award, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import heroImage from "@/assets/hero-image.jpg";
import { AccessibilitySkipLink } from "@/components/AccessibilitySkipLink";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Lazy load heavy components
const TestimonialsCarousel = lazy(() => import("@/components/TestimonialsCarousel"));

const Home = () => {
  // Monitor performance metrics
  usePerformanceMonitoring();

  return (
    <>
      <AccessibilitySkipLink />
      <SEOHead 
        title="Mulheres em Convergência - Conectando Sonhos, Transformando Realidades"
        description="Plataforma que conecta, educa e impulsiona mulheres empreendedoras através de uma comunidade forte, recursos educacionais e oportunidades de negócio."
        keywords="mulheres empreendedoras, empreendedorismo feminino, negócios femininos, comunidade de mulheres, educação empresarial, networking feminino, plataforma digital"
        url="https://mulheresemconvergencia.com.br/"
      />
      <Layout>
        <main id="main-content">{/* ... keep existing code (all sections) */}
        {/* Hero Section */}
        <section 
          className="relative section-padding text-white overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(199, 90, 146, 0.9), rgba(145, 145, 192, 0.8)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 md:mb-6 bg-white/20 text-white border-white/30 text-xs md:text-sm">
                Empoderando Mulheres Empreendedoras
              </Badge>
              <h1 className="font-bold mb-4 md:mb-6 text-responsive">
                Conectando Sonhos, 
                <span className="block text-white/90">Transformando Realidades</span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 max-w-3xl mx-auto text-responsive">
                Um espaço criado para educar, conectar e impulsionar mulheres por meio do 
                empreendedorismo e do fortalecimento de redes de apoio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-sm md:text-base" asChild>
                  <Link to="/auth">
                    Comece Sua Jornada
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-sm md:text-base" asChild>
                  <Link to="/sobre">
                    Conheça Nossa Comunidade
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ... keep existing code (all other sections) */}
        {/* Valores Section */}
        <section className="section-padding bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-bold mb-4 text-foreground text-responsive">
                Nossos Valores
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-responsive">
                Construímos um ecossistema completo para o crescimento feminino no empreendedorismo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center card-padding">
                  <div className="bg-primary/10 rounded-full p-3 md:p-4 inline-block mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base md:text-lg">Empoderamento</CardTitle>
                  <CardDescription className="text-sm md:text-base text-responsive">
                    Fortalecemos mulheres através da educação e oportunidades de crescimento.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center card-padding">
                  <div className="bg-secondary/10 rounded-full p-3 md:p-4 inline-block mb-3 md:mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-secondary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base md:text-lg">Comunidade</CardTitle>
                  <CardDescription className="text-sm md:text-base text-responsive">
                    Conectamos mulheres empreendedoras criando uma rede de apoio sólida.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center card-padding">
                  <div className="bg-accent/10 rounded-full p-3 md:p-4 inline-block mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-accent" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base md:text-lg">Foco</CardTitle>
                  <CardDescription className="text-sm md:text-base text-responsive">
                    Oferecemos direcionamento claro para alcançar objetivos empresariais.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="text-center card-padding">
                  <div className="bg-primary/10 rounded-full p-3 md:p-4 inline-block mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base md:text-lg">Excelência</CardTitle>
                  <CardDescription className="text-sm md:text-base text-responsive">
                    Promovemos a busca contínua pela excelência em todos os projetos.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-padding bg-primary text-white" aria-labelledby="stats-heading">
          <div className="container mx-auto">
            <h2 id="stats-heading" className="sr-only">Nossos números</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2" aria-label="Quinhentas mulheres conectadas">500+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base text-responsive">Mulheres Conectadas</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2" aria-label="Mais de cinquenta projetos realizados">50+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base text-responsive">Projetos Realizados</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2" aria-label="Mais de quinze cidades atingidas">15+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base text-responsive">Cidades Atingidas</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2" aria-label="Noventa e cinco porcento de taxa de satisfação">95%</div>
                <div className="text-primary-foreground/80 text-sm md:text-base text-responsive">Taxa de Satisfação</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-padding bg-background" aria-labelledby="testimonials-heading">
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 id="testimonials-heading" className="font-bold mb-4 text-responsive">O que nossas participantes dizem</h2>
              <p className="text-lg md:text-xl text-muted-foreground text-responsive">
                Depoimentos reais do Google My Business
              </p>
            </div>

            <Suspense fallback={<LoadingSpinner size="lg" text="Carregando depoimentos..." />}>
              <TestimonialsCarousel />
            </Suspense>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto text-center">
            <h2 className="font-bold mb-4 text-responsive">
              Pronta para transformar sua jornada empreendedora?
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-white/90 max-w-2xl mx-auto text-responsive">
              Junte-se à nossa comunidade de mulheres visionárias e comece a construir 
              o futuro que você merece.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-sm md:text-base" asChild>
                <Link to="/auth">
                  Comece Agora
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-sm md:text-base" asChild>
                <Link to="/sobre">
                  Saiba Mais
                </Link>
              </Button>
            </div>
          </div>
        </section>
        </main>
      </Layout>
    </>
  );
};

export default Home;