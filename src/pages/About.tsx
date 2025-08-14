import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Target, Award, ArrowRight, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { HistoryTimeline } from "@/components/HistoryTimeline";

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Nossa História
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Sobre Nós
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Conheça nossa missão de empoderar mulheres empreendedoras através da educação, 
              comunidade e oportunidades de crescimento.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Nossa História</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                O <span className="font-semibold text-primary">Mulheres em Convergência</span> nasceu 
                da necessidade de criar um ecossistema completo que apoie mulheres empreendedoras em 
                todas as fases de suas jornadas.
              </p>
              <p>
                Observamos que muitas mulheres talentosas enfrentavam desafios similares: falta de 
                networking, dificuldade de acesso a recursos educacionais específicos, e principalmente, 
                a ausência de uma comunidade que realmente compreendesse suas necessidades únicas como 
                empreendedoras.
              </p>
              <p>
                Foi assim que decidimos criar mais do que uma plataforma - criamos um movimento de 
                transformação social através do empreendedorismo feminino, onde cada mulher encontra 
                não apenas ferramentas, mas uma verdadeira rede de apoio para realizar seus sonhos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <HistoryTimeline />

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Pilares</h2>
            <p className="text-xl text-muted-foreground">
              Os valores que guiam nossa jornada de empoderamento feminino
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-primary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Missão</CardTitle>
                <CardDescription>
                  Educar, conectar e impulsionar mulheres por meio do empreendedorismo e do 
                  fortalecimento de redes de apoio, gerando impacto social, autonomia financeira 
                  e transformação de comunidades.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-secondary/10 rounded-full p-4 inline-block mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Visão</CardTitle>
                <CardDescription>
                  Ser a principal referência em empreendedorismo feminino no Brasil, criando um 
                  ecossistema onde toda mulher tenha acesso às ferramentas e à rede de apoio 
                  necessárias para transformar suas ideias em negócios de sucesso.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="bg-accent/10 rounded-full p-4 inline-block mb-4 group-hover:bg-accent/20 transition-colors">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Valores</CardTitle>
                <CardContent className="pt-4">
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Sororidade e apoio mútuo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Empoderamento e autonomia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Inovação e criatividade
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Impacto social positivo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Excelência em tudo
                    </li>
                  </ul>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Nosso Impacto */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nosso Impacto</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Números que demonstram o crescimento da nossa comunidade e o impacto positivo 
              que estamos gerando na vida das mulheres empreendedoras.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-primary/10 rounded-full p-6 inline-block mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Mulheres na Comunidade</div>
            </div>

            <div>
              <div className="bg-secondary/10 rounded-full p-6 inline-block mb-4">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-4xl font-bold text-secondary mb-2">850+</div>
              <div className="text-muted-foreground">Negócios no Diretório</div>
            </div>

            <div>
              <div className="bg-accent/10 rounded-full p-6 inline-block mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Taxa de Satisfação</div>
            </div>

            <div>
              <div className="bg-primary/10 rounded-full p-6 inline-block mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">R$ 2.5M</div>
              <div className="text-muted-foreground">Faturamento Gerado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Faça Parte Desta Transformação
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Junte-se a centenas de mulheres que já estão transformando suas vidas 
            através do empreendedorismo e do poder da rede.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Entrar na Comunidade
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Cadastrar Meu Negócio
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;