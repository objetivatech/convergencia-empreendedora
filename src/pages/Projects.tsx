import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Target, ExternalLink, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "Comunidade Mulheres em Convergência",
      description: "Espaço exclusivo para networking, troca de experiências e crescimento conjunto entre empreendedoras.",
      category: "Comunidade",
      status: "Ativo",
      participants: 1200,
      features: [
        "Grupos de discussão por área de atuação",
        "Eventos mensais de networking",
        "Mentoria entre pares",
        "Fórum de dúvidas e suporte"
      ]
    },
    {
      id: 2,
      title: "Diretório de Negócios Femininos",
      description: "Plataforma que conecta consumidores a negócios liderados por mulheres, promovendo o consumo consciente.",
      category: "Marketplace",
      status: "Ativo", 
      participants: 850,
      features: [
        "Busca por localização e categoria",
        "Perfis detalhados dos negócios",
        "Sistema de avaliações",
        "Integração com redes sociais"
      ]
    },
    {
      id: 3,
      title: "Academia de Empreendedorismo Feminino",
      description: "Cursos e workshops especializados em empreendedorismo, liderança e desenvolvimento pessoal para mulheres.",
      category: "Educação",
      status: "Em Desenvolvimento",
      participants: 0,
      features: [
        "Cursos online e presenciais",
        "Certificações reconhecidas",
        "Acompanhamento personalizado",
        "Biblioteca de recursos"
      ]
    },
    {
      id: 4,
      title: "Programa Embaixadoras",
      description: "Rede de afiliadas que promovem nossos serviços e são recompensadas pelo crescimento da comunidade.",
      category: "Afiliados",
      status: "Ativo",
      participants: 150,
      features: [
        "Comissões atrativas",
        "Material de divulgação exclusivo",
        "Treinamentos regulares",
        "Dashboard de performance"
      ]
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
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Nossas Iniciativas
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Nossos Projetos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Conheça as iniciativas que estamos desenvolvendo para fortalecer o 
              ecossistema de empreendedorismo feminino no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* Projetos Ativos */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Projetos Ativos</h2>
            <p className="text-xl text-muted-foreground">
              Iniciativas que já estão transformando vidas
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                      <Badge variant="outline" className="mb-2">{project.category}</Badge>
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
                  <CardDescription className="text-base">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Principais Funcionalidades:</h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    {project.status === 'Ativo' ? 'Participar Agora' : 'Saiba Mais'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projetos Futuros */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Próximos Lançamentos</h2>
            <p className="text-xl text-muted-foreground">
              O que está por vir no nosso roadmap de crescimento
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{project.status}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {project.launchDate}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mb-3">
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
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Cadastre-se na Nossa Newsletter
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tem Uma Ideia de Projeto?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Estamos sempre abertas a novas ideias e parcerias que possam fortalecer 
            nossa missão de empoderar mulheres empreendedoras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Enviar Proposta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Entrar em Contato
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Projects;