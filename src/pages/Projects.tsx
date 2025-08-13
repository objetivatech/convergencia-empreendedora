import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, BookOpen, Briefcase, Award, Calendar, ArrowRight } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Comunidade Mulheres em Convergência",
      description: "Espaço exclusivo para networking, troca de experiências e crescimento conjunto entre empreendedoras.",
      category: "Comunidade",
      status: "Ativo",
      participants: 1200,
      icon: Users,
      features: [
        "Grupos de discussão por área de atuação",
        "Eventos mensais de networking",
        "Mentoria entre pares",
        "Fórum de dúvidas e suporte"
      ],
      bgColor: "bg-brand-primary/10",
      iconColor: "text-brand-primary"
    },
    {
      id: 2,
      title: "Diretório de Negócios Femininos",
      description: "Plataforma que conecta consumidores a negócios liderados por mulheres, promovendo o consumo consciente.",
      category: "Marketplace",
      status: "Ativo", 
      participants: 850,
      icon: Briefcase,
      features: [
        "Busca por localização e categoria",
        "Perfis detalhados dos negócios",
        "Sistema de avaliações",
        "Integração com redes sociais"
      ],
      bgColor: "bg-brand-secondary/10",
      iconColor: "text-brand-secondary"
    },
    {
      id: 3,
      title: "Academia de Empreendedorismo Feminino",
      description: "Cursos e workshops especializados em empreendedorismo, liderança e desenvolvimento pessoal para mulheres.",
      category: "Educação",
      status: "Em Desenvolvimento",
      participants: 0,
      icon: BookOpen,
      features: [
        "Cursos online e presenciais",
        "Certificações reconhecidas",
        "Acompanhamento personalizado",
        "Biblioteca de recursos"
      ],
      bgColor: "bg-brand-tertiary/10",
      iconColor: "text-brand-tertiary"
    },
    {
      id: 4,
      title: "Programa Embaixadoras",
      description: "Rede de afiliadas que promovem nossos serviços e são recompensadas pelo crescimento da comunidade.",
      category: "Afiliados",
      status: "Ativo",
      participants: 150,
      icon: Award,
      features: [
        "Comissões atrativas",
        "Material de divulgação exclusivo",
        "Treinamentos regulares",
        "Dashboard de performance"
      ],
      bgColor: "bg-gray-medium/10",
      iconColor: "text-gray-medium"
    }
  ];

  const upcomingProjects = [
    {
      title: "Incubadora de Startups Femininas",
      description: "Programa de aceleração para startups lideradas por mulheres com mentoria especializada.",
      launchDate: "Q2 2024",
      status: "Planejamento"
    },
    {
      title: "Mulheres Tech",
      description: "Iniciativa focada em mulheres na área de tecnologia com eventos e networking específico.",
      launchDate: "Q3 2024", 
      status: "Desenvolvimento"
    },
    {
      title: "Fundo de Microcrédito",
      description: "Linha de crédito especial para mulheres empreendedoras com juros diferenciados.",
      launchDate: "Q4 2024",
      status: "Estruturação"
    }
  ];

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
              <a href="/about" className="text-gray-dark hover:text-brand-primary transition-smooth">
                Sobre
              </a>
              <a href="/projects" className="text-brand-primary font-medium">
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
              Nossos Projetos
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-montserrat">
              Conheça as iniciativas que estamos desenvolvendo para fortalecer o 
              ecossistema de empreendedorismo feminino no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* Projetos Ativos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center font-nexa">
              Projetos Ativos
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {projects.map((project) => {
                const IconComponent = project.icon;
                return (
                  <Card key={project.id} className="hover:shadow-brand transition-smooth group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${project.bgColor} rounded-full p-3 group-hover:scale-110 transition-smooth`}>
                          <IconComponent className={`h-8 w-8 ${project.iconColor}`} />
                        </div>
                        <div className="text-right">
                          <Badge variant={project.status === 'Ativo' ? 'default' : 'secondary'} className="mb-2">
                            {project.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {project.participants > 0 ? `${project.participants} participantes` : 'Em breve'}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-nexa">{project.title}</CardTitle>
                      <Badge variant="outline" className="w-fit">{project.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 font-montserrat">Principais Funcionalidades:</h4>
                        <ul className="space-y-2">
                          {project.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button className="w-full group-hover:bg-brand-primary/90 transition-smooth">
                        {project.status === 'Ativo' ? 'Participar Agora' : 'Saiba Mais'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Projetos Futuros */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center font-nexa">
              Próximos Lançamentos
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingProjects.map((project, index) => (
                <Card key={index} className="hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{project.status}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {project.launchDate}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold mb-3 font-montserrat">
                      {project.title}
                    </h4>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Quer ser notificada sobre o lançamento destes projetos?
              </p>
              <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
                Cadastre-se na Nossa Newsletter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-brand-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h3 className="text-3xl font-bold mb-4 font-nexa">
              Tem Uma Ideia de Projeto?
            </h3>
            <p className="text-xl mb-8 text-white/90">
              Estamos sempre abertas a novas ideias e parcerias que possam fortalecer 
              nossa missão de empoderar mulheres empreendedoras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-white/90 font-androgyne">
                Enviar Proposta
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Entrar em Contato
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;