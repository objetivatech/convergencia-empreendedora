import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import timelineApaeGravatai from "@/assets/timeline-apae-gravatai.jpg";
import timelineAulasArtesanato from "@/assets/timeline-aulas-artesanato.jpg";
import timelineMultifeira from "@/assets/timeline-multifeira.jpg";
import timelineFgtas from "@/assets/timeline-fgtas.jpg";
import timelineAcessuas from "@/assets/timeline-acessuas.jpg";
import timelinePortalVida from "@/assets/timeline-portal-vida.jpg";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "Maio 2015",
    title: "APAE Gravataí",
    description: "Trabalho voluntário na APAE de Gravataí, aulas semanais de artesanato com as mães das crianças e jovens atendidos na entidade. Começamos a perceber as barreiras e dificuldades enfrentadas pelas mulheres.",
    image: timelineApaeGravatai
  },
  {
    date: "Setembro 2015",
    title: "Aulas de Artesanato",
    description: "Aulas de artesanato para as mulheres da comunidade, Jardim Algarve, em Alvorada parceria com a Rádio Comunitária Acácia FM 87.9.",
    image: timelineAulasArtesanato
  },
  {
    date: "2015 - 2017",
    title: "Multifeira",
    description: "Em um chamamento nas redes sociais, reunimos aproximadamente 20 moradores entre artesãos e empreendedores da área da alimentação e formamos a Multifeira do Jardim Algarve, fazendo feiras mensais nas praças do bairro.",
    image: timelineMultifeira
  },
  {
    date: "Março 2017",
    title: "Ação FGTAS",
    description: "Confecção das carteirinhas de artesão pelo FGTAS, realizada na comunidade. Conseguimos em parceria com a SMDE, trazer os examinadores para realizar mais de 40 carteirinhas, para os artesãos da Multifeira Jardim Algarve e outros das comunidades próximas.",
    image: timelineFgtas
  },
  {
    date: "Abril 2018",
    title: "Ação ACESSUAS - PMA",
    description: "Parceria com a Secretaria de Assistência Social da Prefeitura de Alvorada, através da diretora do ACESSUAS, Vera Lúcia Alves, aulas sobre letramento digital para artesãs do município.",
    image: timelineAcessuas
  },
  {
    date: "Março - Dezembro 2019",
    title: "Portal da Vida",
    description: "Trabalho voluntário no projeto Portal da Vida, da ativista social Karen Monteiro, escuta ativa de mulheres em situação de vulnerabilidade, encontros quinzenas com as atendidas pelo projeto na sede da Rádio Comunitária Acácia FM.",
    image: timelinePortalVida
  }
];

export const HistoryTimeline = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Nossa Jornada
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Linha do Tempo</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça os principais marcos da nossa história e como chegamos até aqui
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Linha central */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/20 h-full hidden md:block"></div>
          
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative mb-12 md:mb-16">
              {/* Mobile layout */}
              <div className="md:hidden">
                <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {event.date}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-primary">{event.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:flex items-center">
                {index % 2 === 0 ? (
                  // Evento à esquerda
                  <>
                    <div className="w-1/2 pr-8">
                      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="flex">
                          <div className="w-1/3 relative overflow-hidden">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                          <CardContent className="w-2/3 p-6">
                            <Badge className="mb-3 bg-primary text-primary-foreground">
                              {event.date}
                            </Badge>
                            <h3 className="text-xl font-bold mb-3 text-primary">{event.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                          </CardContent>
                        </div>
                      </Card>
                    </div>
                    {/* Marcador central */}
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                    <div className="w-1/2 pl-8"></div>
                  </>
                ) : (
                  // Evento à direita
                  <>
                    <div className="w-1/2 pr-8"></div>
                    {/* Marcador central */}
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                    <div className="w-1/2 pl-8">
                      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="flex">
                          <CardContent className="w-2/3 p-6">
                            <Badge className="mb-3 bg-primary text-primary-foreground">
                              {event.date}
                            </Badge>
                            <h3 className="text-xl font-bold mb-3 text-primary">{event.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                          </CardContent>
                          <div className="w-1/3 relative overflow-hidden">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};