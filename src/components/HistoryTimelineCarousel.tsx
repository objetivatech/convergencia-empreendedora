import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ZoomIn } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

// Import all timeline images
import timelineApaeGravatai from "@/assets/timeline-apae-gravatai.jpg";
import timelineAulasArtesanato from "@/assets/timeline-aulas-artesanato.jpg";
import timelineMultifeira from "@/assets/timeline-multifeira.jpg";
import timelineFgtas from "@/assets/timeline-fgtas.jpg";
import timelineAcessuas from "@/assets/timeline-acessuas.jpg";
import timelinePortalVida from "@/assets/timeline-portal-vida.jpg";
import timelineMotivaArtesao from "@/assets/timeline-motiva-artesao.jpg";
import timelineElaPode1 from "@/assets/timeline-ela-pode-1.jpg";
import timelineElaPode2 from "@/assets/timeline-ela-pode-2.jpg";
import timelineElaPode3 from "@/assets/timeline-ela-pode-3.jpg";
import timelineElaPode4 from "@/assets/timeline-ela-pode-4.jpg";
import timelineColetivoTpm from "@/assets/timeline-coletivo-tpm.jpg";
import timelineMulheresProposito from "@/assets/timeline-mulheres-proposito.jpg";
import timelineEventosOnline1 from "@/assets/timeline-eventos-online-1.jpg";
import timelineEventosOnline2 from "@/assets/timeline-eventos-online-2.jpg";
import timelinePodcast from "@/assets/timeline-podcast.jpg";
import timelineEconomiaSolidaria from "@/assets/timeline-economia-solidaria.jpg";
import timelineProjetoNasce from "@/assets/timeline-projeto-nasce.jpg";
import timelineProjetoMorroSantana from "@/assets/timeline-projeto-morro-santana.jpg";
import timelineProjetoSumare from "@/assets/timeline-projeto-sumare.jpg";
import timelineProjetoFormosa from "@/assets/timeline-projeto-formosa.jpg";
import timelineAceleraEmpreendedora from "@/assets/timeline-acelera-empreendedora.jpg";
import timelinePlanejamentoFinanceiro from "@/assets/timeline-planejamento-financeiro.jpg";
import timelineAdelinoBorba from "@/assets/timeline-adelino-borba.jpg";

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
  },
  {
    date: "Agosto - Outubro 2019",
    title: "Motiva Artesão - IFRS",
    description: "Projeto de educação empreendedora, O MOTIVA ARTESÃO, foram 10 aulas sobre empreendedorismo, gestão e planejamento, formamos 20 alunas em parceria com o IFRS Alvorada.",
    image: timelineMotivaArtesao
  },
  {
    date: "Durante 2019",
    title: "Ela Pode - Palestras",
    description: "Trabalho voluntário no projeto Ela Pode, da RME, patrocinado pelo Google, facilitadora de conteúdos sobre empreendedorismo feminino. Feira do Livro, palestra para o grupo Empreendedoras Restinga / Workshop no IFRS Alvorada.",
    image: timelineElaPode1
  },
  {
    date: "Durante 2019",
    title: "Ela Pode - Workshops SENAC",
    description: "Trabalho voluntário no projeto Ela Pode, da RME, patrocinado pelo Google, facilitadora de conteúdos sobre empreendedorismo feminino. Workshop para as alunas do SENAC Comunidade/Porto Alegre.",
    image: timelineElaPode2
  },
  {
    date: "Durante 2019",
    title: "Ela Pode - Comunidades",
    description: "Trabalho voluntário no projeto Ela Pode, da RME, patrocinado pelo Google, facilitadora de conteúdos sobre empreendedorismo feminino. Workshops nas comunidades Vila Elza, Jardim Algarve, Piratini e 11 de Abril em Alvorada.",
    image: timelineElaPode3
  },
  {
    date: "Durante 2019",
    title: "Ela Pode - Centros Profissionalizantes",
    description: "Trabalho voluntário no projeto Ela Pode, da RME, patrocinado pelo Google, facilitadora de conteúdos sobre empreendedorismo feminino. Workshops no Centro Profissionalizante Florestan Fernandes em Alvorada e na Kurti Festas em Viamão.",
    image: timelineElaPode4
  },
  {
    date: "De 2019 à 2022",
    title: "Coletivo TPM",
    description: "Coletivo TPM – **Todas Podem Mais** – formado a partir do desejo das empreendedoras em continuar formando conexões e aprendendo sobre empreendedorismo feminino; começou no final de 2019, onde conseguimos realizar algumas feiras, durou durante toda pandemia, se mantendo como um grupo de Whatsapp, onde havia troca de informações, indicação de cursos e locais de feiras e eventos. Foi desativado em 2022.",
    image: timelineColetivoTpm
  },
  {
    date: "Dezembro 2019",
    title: "Mulheres com Propósito Pepsico",
    description: "Mulheres com Propósito da Pepsico e Banco de Alimentos, participamos das atividades em Porto Alegre, contribuindo com palestras e formações sobre empreendedorismo e gestão.",
    image: timelineMulheresProposito
  },
  {
    date: "Durante 2020",
    title: "Eventos Online - Pandemia",
    description: "A partir de abril de 2020 nossas atividades tiveram de mudar de formato. Palestras, cursos, clube de negócios, mentorias, tudo passou a ser online para empreendedoras.",
    image: timelineEventosOnline1
  },
  {
    date: "Durante 2020",
    title: "Acelera Empreendedora Online",
    description: "Continuidade dos eventos online durante a pandemia, mantendo o apoio às empreendedoras através de palestras, cursos e networking virtual.",
    image: timelineEventosOnline2
  },
  {
    date: "2020 - 2021",
    title: "Podcast Convergência Feminina",
    description: "Em abril de 2021, nasce o Podcast Convergência Feminina, que começa de forma solo. Em novembro de 2022 com a flexibilização da pandemia, acontecem as primeiras entrevistas com convidadas. Está pausado agora, mas voltaremos com certeza, qui sá em 2026.",
    image: timelinePodcast
  },
  {
    date: "2021 - 2023",
    title: "Economia Solidária Alvorada",
    description: "Participamos dos encontros para reativação e fortalecimento da economia solidária no município de Alvorada, representando o coletivo TPM.",
    image: timelineEconomiaSolidaria
  },
  {
    date: "Fevereiro 2022",
    title: "Nasce o projeto Mulheres em Convergência",
    description: "Nasce também o MULHERES EM CONVERGÊNCIA, programa de capacitação de empreendedoras, o primeiro encontro foi no jardim Algarve em Alvorada, com um pequeno grupo de mulheres.",
    image: timelineProjetoNasce
  },
  {
    date: "Março 2022",
    title: "Projeto - Morro Santana",
    description: "Capacitação no Bairro Morro Santana em Porto Alegre, com o grupo de mulheres do coletivo **Bazarte no morro**. 1º encontro em abril.",
    image: timelineProjetoMorroSantana
  },
  {
    date: "Abril 2022",
    title: "Projeto - Sumaré",
    description: "Capacitação no Bairro Sumaré em Alvorada, com o grupo de mulheres do coletivo TPM.",
    image: timelineProjetoSumare
  },
  {
    date: "Abril 2022",
    title: "Projeto - Formosa",
    description: "Capacitação no Bairro Formosa em Alvorada, com o grupo de mulheres do coletivo TPM.",
    image: timelineProjetoFormosa
  },
  {
    date: "Maio 2022",
    title: "Acelera Empreendedora Presencial",
    description: "Realizamos um encontro presencial de empreendedoras, o ACELERA EMPREENDEDORA, onde reunimos mais de 40 mulheres. Tivemos palestras, pitch e rodada de negócios.",
    image: timelineAceleraEmpreendedora
  },
  {
    date: "Junho 2022",
    title: "Workshop Planejamento Financeiro",
    description: "Workshop sobre Organização e Produtividade, realizado no Bairro Jardim Algarve.",
    image: timelinePlanejamentoFinanceiro
  },
  {
    date: "Outubro 2023",
    title: "Palestra Centro Adelino Borba",
    description: "Palestra sobre Empreendedorismo – Mais Mulheres a frente de negócios – realizada no centro municipal de capacitação profissional Adelino Borba, em Alvorada.",
    image: timelineAdelinoBorba
  }
];

export const HistoryTimelineCarousel = () => {
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

        <div className="max-w-6xl mx-auto">
          <Carousel
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {timelineEvents.map((event, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <div className="relative h-64 overflow-hidden group">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {event.date}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                          <div className="relative">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-auto max-h-[80vh] object-contain"
                            />
                            <div className="p-6">
                              <Badge className="mb-2">{event.date}</Badge>
                              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                              <p className="text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-primary">{event.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm line-clamp-4">{event.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};