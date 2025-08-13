import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Eye, Users, Award, Globe } from "lucide-react";

const About = () => {
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
              <a href="/" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Home
              </a>
              <a href="/about" className="text-brand-primary font-medium">
                Sobre
              </a>
              <a href="/projects" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Projetos
              </a>
              <a href="/blog" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Convergindo
              </a>
              <Button variant="default" className="bg-brand-primary hover:bg-brand-primary/90">
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-hero-gradient text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 font-nexa">
              Sobre Nós
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-montserrat">
              Conheça nossa história, missão e os valores que nos movem na jornada de 
              empoderamento feminino através do empreendedorismo.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center font-nexa">
              Nossa História
            </h3>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-xl leading-relaxed text-muted-foreground mb-6">
                O <strong className="text-brand-primary">Mulheres em Convergência</strong> nasceu da necessidade 
                de criar um ecossistema completo que apoie mulheres empreendedoras em todas as fases de suas jornadas.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                Observamos que muitas mulheres talentosas enfrentavam desafios similares: falta de networking, 
                dificuldade de acesso a recursos educacionais específicos, e principalmente, a ausência de uma 
                comunidade que realmente compreendesse suas necessidades únicas como empreendedoras.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Foi assim que decidimos criar mais do que uma plataforma - criamos um movimento de transformação 
                social através do empreendedorismo feminino, onde cada mulher encontra não apenas ferramentas, 
                mas uma verdadeira rede de apoio para realizar seus sonhos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Missão */}
            <Card className="hover:shadow-brand transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="bg-brand-primary/10 rounded-full p-4 inline-block mb-6">
                  <Target className="h-12 w-12 text-brand-primary" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-brand-primary font-nexa">
                  Missão
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Educar, conectar e impulsionar mulheres por meio do empreendedorismo e do 
                  fortalecimento de redes de apoio, gerando impacto social, autonomia financeira 
                  e transformação de comunidades.
                </p>
              </CardContent>
            </Card>

            {/* Visão */}
            <Card className="hover:shadow-brand transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="bg-brand-secondary/10 rounded-full p-4 inline-block mb-6">
                  <Eye className="h-12 w-12 text-brand-secondary" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-brand-secondary font-nexa">
                  Visão
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Ser a principal referência em empreendedorismo feminino no Brasil, 
                  criando um ecossistema onde toda mulher tenha acesso às ferramentas e 
                  à rede de apoio necessárias para transformar suas ideias em negócios de sucesso.
                </p>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card className="hover:shadow-brand transition-smooth">
              <CardContent className="p-8 text-center">
                <div className="bg-brand-tertiary/10 rounded-full p-4 inline-block mb-6">
                  <Heart className="h-12 w-12 text-brand-tertiary" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-brand-tertiary font-nexa">
                  Valores
                </h4>
                <ul className="text-muted-foreground leading-relaxed text-left space-y-2">
                  <li>• <strong>Sororidade:</strong> Apoio mútuo entre mulheres</li>
                  <li>• <strong>Empoderamento:</strong> Autonomia e autoconfiança</li>
                  <li>• <strong>Inovação:</strong> Criatividade e transformação</li>
                  <li>• <strong>Impacto Social:</strong> Mudança positiva na sociedade</li>
                  <li>• <strong>Excelência:</strong> Qualidade em tudo que fazemos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nosso Impacto */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-8 font-nexa">
              Nosso Impacto
            </h3>
            <p className="text-xl text-muted-foreground">
              Números que demonstram o crescimento da nossa comunidade e o impacto positivo 
              que estamos gerando na vida das mulheres empreendedoras.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-brand-primary/10 rounded-full p-6 inline-block mb-4">
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
              <h4 className="text-3xl font-bold text-brand-primary font-androgyne mb-2">
                1,200+
              </h4>
              <p className="text-muted-foreground">Mulheres na Comunidade</p>
            </div>

            <div className="text-center">
              <div className="bg-brand-secondary/10 rounded-full p-6 inline-block mb-4">
                <Globe className="h-8 w-8 text-brand-secondary" />
              </div>
              <h4 className="text-3xl font-bold text-brand-secondary font-androgyne mb-2">
                850+
              </h4>
              <p className="text-muted-foreground">Negócios no Diretório</p>
            </div>

            <div className="text-center">
              <div className="bg-brand-tertiary/10 rounded-full p-6 inline-block mb-4">
                <Award className="h-8 w-8 text-brand-tertiary" />
              </div>
              <h4 className="text-3xl font-bold text-brand-tertiary font-androgyne mb-2">
                95%
              </h4>
              <p className="text-muted-foreground">Taxa de Satisfação</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-medium/10 rounded-full p-6 inline-block mb-4">
                <Target className="h-8 w-8 text-gray-medium" />
              </div>
              <h4 className="text-3xl font-bold text-gray-medium font-androgyne mb-2">
                R$ 2.5M
              </h4>
              <p className="text-muted-foreground">Faturamento Gerado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-brand-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h3 className="text-3xl font-bold mb-4 font-nexa">
              Faça Parte Desta Transformação
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Junte-se a centenas de mulheres que já estão transformando suas vidas 
              através do empreendedorismo e do poder da rede.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-white/90 font-androgyne">
                Entrar na Comunidade
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Cadastrar Meu Negócio
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;