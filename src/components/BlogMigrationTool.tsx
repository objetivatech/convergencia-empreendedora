import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Importar todas as imagens como ES6 modules
import heroImage from "@/assets/hero-image.jpg";
import blogMentalidadeEmpreendedora from "@/assets/blog-mentalidade-empreendedora.jpg";
import blogHappyHourConecta from "@/assets/blog-happy-hour-conecta.jpg";
import blogEsgEmpreendedorismo from "@/assets/blog-esg-empreendedorismo.jpg";
import blogPontoDeVirada from "@/assets/blog-ponto-de-virada.jpg";
import blogSouthSummit2025 from "@/assets/blog-south-summit-2025.jpg";
import blogFemaleEntrepreneur from "@/assets/blog-female-entrepreneur.jpg";
import blogModernOfficeWorkers from "@/assets/blog-modern-office-workers.jpg";
import blogWomenBrainstorming from "@/assets/blog-women-brainstorming.jpg";
import blogWomenNetworking from "@/assets/blog-women-networking.jpg";
import blogFemaleLeader from "@/assets/blog-female-leader.jpg";

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: string;
  featured_image_url: string;
  seo_title?: string;
  seo_description?: string;
  category: string;
  tags: string[];
}

const blogPostsData: BlogPostData[] = [
  {
    title: "Desenvolva uma mentalidade empreendedora!",
    slug: "desenvolva-uma-mentalidade-empreendedora",
    content: `
      <h2>Refletindo sobre o assunto</h2>
      <p>Conversando outro dia com uma colega mentora, falávamos sobre como certas empreendedoras têm dificuldade de se enxergar no papel de empresária, de dona de negócio.</p>
      
      <p>Essa empreendedora não consegue olhar para o seu dia a dia, para as suas atividades e vê-las como parte do processo da empresa. Não sabe identificar nem classificar esses processos ou tão pouco os qualificar.</p>
      
      <p>Ela trabalha no negócio (como se ainda fosse uma funcionária da empresa) e não "o negócio", trabalhar neste caso é gerenciar, com intenção de crescer e ter uma empresa que se sustenta economicamente.</p>
      
      <p>Ou em outro caso, ainda mais comum, ela esta "tocando o negócio" e acha que está tudo bem que não precisa de mais nada, mas ela tem como meta crescer a empresa, mas não sabe como vai fazer para atingir esse objetivo, nem sabe como avaliar a situação da empresa.</p>
      
      <blockquote><p>Mark Twain disse certa vez: "O que nos causa problemas não é o que não sabemos. É o que temos certeza de que sabemos e que, ao final, não é verdade."</p></blockquote>
      
      <p>Ainda tem aquela empreendedora tipo consumista, ela quer as melhores ferramentas, as embalagens mais bonitas, a melhor social media, a melhor gestora de tráfego, e por aí vai… quando na realidade ela precisa é se reciclar, investir em conhecimento e desenvolvimento pessoal.</p>
      
      <h2>E como desenvolver essa mentalidade para negócios</h2>
      
      <p>Eu diria que a primeira coisa é observar. Como boa consultora, que eu sou, adoro uma análise e estudo de caso. Recomendo que leia sobre outras empresas do mesmo segmento que o seu, não importa se a sua empresa é pequena e está em fase inicial.</p>
      
      <p>Espelhe-se nas organizações de sucesso, e comece certo, desde o início. De que forma? Com objetivos claros, criando processos que vão te dar mais produtividade e objetividade e tendo métricas de crescimento.</p>
      
      <h3>Etapas para criar uma mentalidade Empreendedora</h3>
      <ul>
        <li>Seja curioso, pesquise e pergunte esteja aberta a novas ideias</li>
        <li>Tenha um planejamento, mesmo que de curto prazo</li>
        <li>Leia sobre empreendedorismo, vendas, marketing, comportamento humano</li>
        <li>Conheça os números da sua empresa e acompanhe de perto</li>
        <li>Tenha mentores, pessoas que te ajudam e te inspiram</li>
        <li>Entenda quais são seus desafios</li>
        <li>Seja crítica com você mesma, na medida certa</li>
      </ul>
      
      <h2>Saiba definir prioridades</h2>
      <p>Todas as pessoas podem empreender, tem gente que nasce mais propensa ao empreender, tem gente que aprende fazendo, e acaba fazendo muito bem. Em qualquer um dos casos, é preciso persistência e fazer alguns sacrifícios para conquistar seus sonhos.</p>
    `,
    excerpt: "Conversando outro dia com uma colega mentora, falávamos sobre como certas empreendedoras têm dificuldade de se enxergar no papel de empresária, de dona de negócio. Descubra como desenvolver uma mentalidade empreendedora de sucesso.",
    published_at: "2023-11-28T00:00:00Z",
    featured_image_url: blogMentalidadeEmpreendedora,
    seo_title: "Como Desenvolver uma Mentalidade Empreendedora de Sucesso",
    seo_description: "Descubra as estratégias essenciais para desenvolver uma mentalidade empreendedora vencedora e transformar seu negócio.",
    category: "Desenvolvimento Pessoal",
    tags: ["mentalidade", "empreendedorismo", "desenvolvimento", "gestão"]
  },
  {
    title: "Happy Hour Conecta – Conexões, Inspiração e Networking",
    slug: "happy-hour-conecta-conexoes-inspiracao-e-networking",
    content: `
      <p><strong>Happy Hour Conecta: Conexões, Inspiração e Networking no Evento de 29/08/2024</strong></p>
      
      <p>No último dia 29 de agosto de 2024, o Happy Hour Conecta reuniu mulheres empreendedoras para um encontro marcante, repleto de networking feminino, trocas de experiências e novas parcerias. O evento, criado para fortalecer laços entre empresárias de diferentes setores, proporcionou um ambiente animado, leve e altamente produtivo, mostrando o verdadeiro poder da colaboração feminina.</p>
      
      <h3>Um Espaço de Conexões Verdadeiras</h3>
      <p>O Happy Hour Conecta nasceu da necessidade de criar um ambiente descontraído onde mulheres empreendedoras pudessem se conhecer, trocar experiências e, principalmente, formar parcerias estratégicas. Diferente de eventos corporativos tradicionais, este encontro aconteceu em um clima mais informal, permitindo que as participantes se sentissem à vontade para compartilhar desafios, conquistas e ideias inovadoras.</p>
      
      <h3>Networking que Gera Resultados</h3>
      <p>O que mais nos impressionou no evento foi a qualidade das conexões estabelecidas. Não se tratava apenas de trocar cartões de visita, mas de encontrar pessoas alinhadas com propósitos semelhantes, dispostas a colaborar e crescer juntas.</p>
      
      <p>Entre as participantes, estavam empreendedoras de diversos segmentos: consultorias, e-commerce, serviços digitais, alimentação, moda sustentável e muito mais. Essa diversidade enriqueceu as conversas e abriu possibilidades de parcerias inéditas.</p>
      
      <h3>Inspiração em Cada Conversa</h3>
      <p>Um dos momentos mais marcantes do evento foram as histórias compartilhadas pelas participantes. Cada mulher presente tinha uma trajetória única, repleta de superação, criatividade e determinação. Essas narrativas serviram como fonte de inspiração para todas, reforçando que o empreendedorismo feminino é uma força transformadora.</p>
    `,
    excerpt: "No último dia 29 de agosto de 2024, o Happy Hour Conecta reuniu mulheres empreendedoras para um encontro marcante, repleto de networking feminino, trocas de experiências e novas parcerias.",
    published_at: "2024-09-10T00:00:00Z",
    featured_image_url: blogHappyHourConecta,
    category: "Networking",
    tags: ["networking", "eventos", "conexões", "parcerias"]
  },
  {
    title: "Desbloqueando Potenciais: Empreendedorismo Feminino e ESG",
    slug: "desbloqueando-potenciais-empreendedorismo-feminino-e-esg",
    content: `
      <p>Em um mundo em constante evolução, a interseção entre Empreendedorismo Feminino, ESG (Ambiental, Social e Governança) emerge como uma força motriz para transformações significativas. A crescente participação de mulheres no mundo dos negócios não apenas redefine paradigmas, mas também catalisa uma abordagem mais sustentável e socialmente responsável.</p>
      
      <p>Está claro que são elas que podem contribuir substancialmente para o crescimento econômico e para a redução da pobreza em seus territórios, porque se dispõem a trabalhar efetivamente para interromper padrões de desigualdade e ensinar as futuras gerações sobre economia e sustentabilidade.</p>
      
      <p>Neste artigo, exploraremos como o empreendedorismo feminino está se tornando um pilar essencial no cenário ESG, destacando os benefícios intrínsecos e o impacto social positivo que resulta do apoio e investimento nesse movimento.</p>
      
      <h3>O Empreendedorismo Feminino como Catalisador de Mudanças ESG</h3>
      <p>As mulheres empreendedoras têm demonstrado uma tendência natural para integrar práticas sustentáveis e socialmente responsáveis em seus negócios. Isso não é coincidência; estudos apontam que empresas lideradas por mulheres tendem a priorizar:</p>
      
      <ul>
        <li><strong>Sustentabilidade Ambiental:</strong> Implementação de práticas eco-friendly e economia circular</li>
        <li><strong>Responsabilidade Social:</strong> Criação de empregos locais e programas de inclusão</li>
        <li><strong>Governança Transparente:</strong> Gestão ética e transparente dos negócios</li>
      </ul>
      
      <h3>Impacto Social e Econômico</h3>
      <p>O empreendedorismo feminino alinhado com princípios ESG gera impactos positivos mensuráveis:</p>
      
      <ul>
        <li>Redução da desigualdade de gênero no mercado de trabalho</li>
        <li>Promoção da diversidade e inclusão</li>
        <li>Desenvolvimento de soluções inovadoras para problemas sociais</li>
        <li>Fortalecimento de comunidades locais</li>
      </ul>
    `,
    excerpt: "Em um mundo em constante evolução, a interseção entre Empreendedorismo Feminino e ESG emerge como uma força motriz para transformações significativas. Descubra como mulheres estão liderando mudanças sustentáveis.",
    published_at: "2024-09-12T00:00:00Z",
    featured_image_url: blogEsgEmpreendedorismo,
    category: "Empreendedorismo",
    tags: ["ESG", "sustentabilidade", "impacto social", "liderança feminina"]
  },
  {
    title: "Mulheres em Convergência: o ponto de virada para mulheres que decidem fazer dar certo",
    slug: "mulheres-em-convergencia-ponto-de-virada",
    content: `
      <p>Você já sentiu que carrega o mundo nas costas e, ainda assim, precisa seguir forte, sonhando, fazendo o necessário, empreendendo e construindo o seu lugar no mundo? Se sim, você não está sozinha. E é exatamente por isso que o Mulheres em Convergência existe.</p>
      
      <p>Neste post do nosso blog Convergindo, queremos te dar boas-vindas com carinho, propósito e direção. Queremos te contar o que é essa plataforma que começa a transformar vidas, negócios e comunidades a partir de um ponto comum: o protagonismo feminino e o empreendedorismo periférico.</p>
      
      <h2>Um espaço criado por e para mulheres que fazem acontecer</h2>
      <p>O Mulheres em Convergência é mais do que uma plataforma digital. É um movimento que nasceu da necessidade real de conectar mulheres empreendedoras, especialmente aquelas que estão nas periferias, que empreendem por necessidade e transformam desafios em oportunidades.</p>
      
      <p>Aqui, acreditamos que toda mulher tem potencial empreendedor. Seja você uma mãe que vende docinhos para complementar a renda familiar, uma profissional que decidiu abrir seu próprio negócio, ou uma liderança comunitária que mobiliza outras mulheres — este é o seu lugar.</p>
      
      <h3>O que você encontra aqui:</h3>
      <ul>
        <li><strong>Conexão real:</strong> Uma rede de mulheres que se apoiam mutuamente</li>
        <li><strong>Conhecimento prático:</strong> Conteúdos, cursos e mentorias focados na realidade empreendedora</li>
        <li><strong>Oportunidades de crescimento:</strong> Parcerias, colaborações e novos mercados</li>
        <li><strong>Visibilidade:</strong> Espaço para mostrar seu trabalho e alcançar novos clientes</li>
      </ul>
      
      <p>Nossa missão é clara: fortalecer o ecossistema empreendedor feminino, especialmente nas periferias, criando pontes entre sonhos e realizações, entre necessidades e soluções, entre mulheres que querem crescer juntas.</p>
    `,
    excerpt: "Você já sentiu que carrega o mundo nas costas e ainda assim precisa seguir forte? Este é o espaço criado para mulheres que decidem fazer dar certo. Conheça o Mulheres em Convergência.",
    published_at: "2025-04-15T00:00:00Z",
    featured_image_url: blogPontoDeVirada,
    category: "Empreendedorismo",
    tags: ["mulheres", "empreendedorismo", "periferia", "protagonismo"]
  },
  {
    title: "Nosso Olhar sobre o South Summit Brasil 2025: Conexões, Inovação e Impacto Social",
    slug: "south-summit-brasil-2025-conexoes-inovacao-impacto-social",
    content: `
      <h2>A inovação não acolhe a todos.</h2>
      
      <p>Entre os dias <strong>9 e 11 de abril de 2025</strong>, estivemos presentes no <strong>South Summit Brasil</strong>, realizado no icônico <strong>Cais Mauá</strong>, em <strong>Porto Alegre – RS</strong>. Este evento se consolidou como um dos maiores e mais relevantes encontros de inovação e empreendedorismo da América Latina, atraindo startups, investidores, corporações e instituições que pensam o futuro da economia global.</p>
      
      <p>Para nós, não se tratava apenas de mais um grande evento — foi uma oportunidade estratégica para reforçar a presença e a voz do <strong>Mulheres em Convergência</strong> em um ambiente onde conexões reais acontecem e negócios com propósito ganham escala.</p>
      
      <h3>South Summit Brasil: onde inovação e impacto social se encontram</h3>
      <p>O South Summit Brasil 2025 reuniu mais de 15.000 participantes, incluindo empreendedores, investidores, corporações e formadores de opinião. Durante três dias intensos, pudemos vivenciar de perto as tendências que estão moldando o futuro dos negócios no Brasil e na América Latina.</p>
      
      <p>O que nos chamou a atenção foi a crescente atenção dada a negócios de impacto social, especialmente aqueles liderados por mulheres e focados em soluções para comunidades periféricas. Isso reforça nossa convicção de que estamos no caminho certo.</p>
      
      <h3>Networking estratégico e conexões que importam</h3>
      <p>Durante o evento, estabelecemos conexões valiosas com:</p>
      <ul>
        <li><strong>Investidores de impacto</strong> interessados em apoiar negócios liderados por mulheres</li>
        <li><strong>Aceleradoras e incubadoras</strong> focadas em diversidade e inclusão</li>
        <li><strong>Corporações</strong> buscando parcerias com propósito social</li>
        <li><strong>Empreendedoras</strong> de diferentes regiões do Brasil</li>
      </ul>
      
      <p>Essas conexões já estão gerando frutos concretos para nossa comunidade, com novas oportunidades de mentoria, investimento e parcerias estratégicas.</p>
    `,
    excerpt: "Entre os dias 9 e 11 de abril de 2025, estivemos presentes no South Summit Brasil. Compartilhamos nossa experiência neste grande encontro de inovação e empreendedorismo da América Latina.",
    published_at: "2025-04-22T00:00:00Z",
    featured_image_url: blogSouthSummit2025,
    category: "Networking",
    tags: ["south summit", "inovação", "networking", "eventos"]
  },
  {
    title: "5 Dicas Essenciais para Empreendedoras Iniciantes",
    slug: "5-dicas-essenciais-para-empreendedoras-iniciantes",
    content: `
      <p>Começar um negócio pode parecer desafiador, mas com as estratégias certas, qualquer mulher pode transformar sua ideia em uma empresa de sucesso. Aqui estão 5 dicas fundamentais para quem está dando os primeiros passos no empreendedorismo.</p>
      
      <h3>1. Valide sua ideia antes de investir</h3>
      <p>Antes de investir tempo e dinheiro, converse com potenciais clientes. Faça pesquisas, crie um produto mínimo viável (MVP) e teste no mercado. Isso evitará surpresas desagradáveis e ajudará a refinar sua proposta de valor.</p>
      
      <h3>2. Estabeleça um planejamento financeiro sólido</h3>
      <p>Muitos negócios falham por falta de controle financeiro. Mantenha suas finanças pessoais separadas das empresariais, faça projeções realistas e sempre tenha uma reserva de emergência.</p>
      
      <h3>3. Invista em conhecimento e networking</h3>
      <p>Participe de eventos, cursos e grupos de empreendedoras. O conhecimento é seu maior ativo, e as conexões que você faz podem abrir portas inesperadas.</p>
      
      <h3>4. Foque na solução, não apenas no produto</h3>
      <p>Entenda profundamente o problema que você está resolvendo. Clientes compram soluções, não produtos. Quanto melhor você entender a dor do seu cliente, melhor será sua oferta.</p>
      
      <h3>5. Seja paciente e persistente</h3>
      <p>O sucesso no empreendedorismo não acontece da noite para o dia. Seja paciente com o processo, aprenda com os erros e mantenha a persistência mesmo diante das dificuldades.</p>
    `,
    excerpt: "Começar um negócio pode parecer desafiador, mas com as estratégias certas, qualquer mulher pode transformar sua ideia em uma empresa de sucesso. Confira 5 dicas fundamentais para empreendedoras iniciantes.",
    published_at: "2024-10-15T00:00:00Z",
    featured_image_url: blogFemaleEntrepreneur,
    category: "Desenvolvimento Pessoal",
    tags: ["dicas", "iniciantes", "planejamento", "empreendedorismo"]
  },
  {
    title: "Como Construir uma Rede de Apoio Sólida para seu Negócio",
    slug: "como-construir-rede-de-apoio-solida-para-seu-negocio",
    content: `
      <p>Uma das chaves para o sucesso no empreendedorismo feminino é ter uma rede de apoio sólida. Mulheres que se apoiam mutuamente criam um ecossistema poderoso de crescimento e oportunidades.</p>
      
      <h3>Por que uma rede de apoio é fundamental?</h3>
      <p>Empreender pode ser solitário, especialmente para mulheres que enfrentam desafios únicos no mundo dos negócios. Uma rede de apoio oferece:</p>
      <ul>
        <li>Suporte emocional nos momentos difíceis</li>
        <li>Compartilhamento de experiências e aprendizados</li>
        <li>Oportunidades de parcerias e colaborações</li>
        <li>Acesso a mentoria e conhecimento especializado</li>
        <li>Indicações e referências de negócios</li>
      </ul>
      
      <h3>Como construir sua rede de apoio</h3>
      <h4>1. Participe de comunidades de empreendedoras</h4>
      <p>Busque grupos locais e online de mulheres empreendedoras. Seja ativa nas discussões e contribua com suas experiências.</p>
      
      <h4>2. Encontre mentoras e seja mentora</h4>
      <p>Procure mulheres que já trilharam o caminho que você deseja percorrer. Ao mesmo tempo, ajude outras empreendedoras que estão começando.</p>
      
      <h4>3. Cultive relacionamentos genuínos</h4>
      <p>Networking não é apenas trocar cartões. Construa relacionamentos reais baseados em confiança e reciprocidade.</p>
      
      <h4>4. Diversifique sua rede</h4>
      <p>Conecte-se com pessoas de diferentes áreas, idades e backgrounds. A diversidade enriquece sua perspectiva e abre novas possibilidades.</p>
    `,
    excerpt: "Uma das chaves para o sucesso no empreendedorismo feminino é ter uma rede de apoio sólida. Descubra como construir conexões genuínas que impulsionam seu negócio.",
    published_at: "2024-11-05T00:00:00Z",
    featured_image_url: blogWomenNetworking,
    category: "Networking",
    tags: ["rede de apoio", "mentoria", "comunidade", "relacionamentos"]
  },
  {
    title: "Marketing Digital para Empreendedoras: Estratégias Que Funcionam",
    slug: "marketing-digital-para-empreendedoras-estrategias-que-funcionam",
    content: `
      <p>No mundo digital de hoje, ter uma presença online forte é essencial para qualquer negócio. Para empreendedoras, o marketing digital oferece oportunidades únicas de alcançar e engajar seu público-alvo de forma eficaz e econômica.</p>
      
      <h3>Por onde começar no marketing digital?</h3>
      <h4>1. Defina sua persona</h4>
      <p>Antes de criar qualquer estratégia, entenda profundamente quem é sua cliente ideal. Crie personas detalhadas com informações demográficas, comportamentais e psicográficas.</p>
      
      <h4>2. Escolha as plataformas certas</h4>
      <p>Não é necessário estar em todas as redes sociais. Foque nas plataformas onde seu público está mais ativo:</p>
      <ul>
        <li><strong>Instagram:</strong> Ideal para negócios visuais e lifestyle</li>
        <li><strong>LinkedIn:</strong> Perfeito para B2B e networking profissional</li>
        <li><strong>Facebook:</strong> Bom para públicos mais amplos e diversos</li>
        <li><strong>TikTok:</strong> Excelente para alcançar públicos mais jovens</li>
      </ul>
      
      <h3>Estratégias de conteúdo que engajam</h3>
      <h4>Conte sua história</h4>
      <p>As pessoas se conectam com histórias, não com produtos. Compartilhe sua jornada empreendedora, seus desafios e conquistas.</p>
      
      <h4>Eduque seu público</h4>
      <p>Crie conteúdo educativo relacionado ao seu nicho. Isso estabelece você como autoridade no assunto e gera confiança.</p>
      
      <h4>Seja autêntica</h4>
      <p>Autenticidade é fundamental no marketing digital. Seja genuína em suas comunicações e não tenha medo de mostrar o lado humano do seu negócio.</p>
      
      <h3>Métricas que importam</h3>
      <p>Acompanhe indicadores relevantes como taxa de engajamento, alcance, conversões e ROI. Use ferramentas gratuitas como Google Analytics para monitorar seu desempenho.</p>
    `,
    excerpt: "No mundo digital de hoje, ter uma presença online forte é essencial para qualquer negócio. Descubra estratégias de marketing digital que realmente funcionam para empreendedoras.",
    published_at: "2024-11-20T00:00:00Z",
    featured_image_url: blogModernOfficeWorkers,
    category: "Marketing",
    tags: ["marketing digital", "redes sociais", "estratégias", "conteúdo"]
  },
  {
    title: "Gestão do Tempo: Como Equilibrar Vida Pessoal e Empreendedorismo",
    slug: "gestao-do-tempo-equilibrar-vida-pessoal-empreendedorismo",
    content: `
      <p>Uma das maiores dificuldades das empreendedoras é encontrar o equilíbrio entre as demandas do negócio e a vida pessoal. A gestão eficaz do tempo é crucial para manter a sanidade e garantir o crescimento sustentável do seu empreendimento.</p>
      
      <h3>Os desafios únicos das mulheres empreendedoras</h3>
      <p>Mulheres empreendedoras frequentemente enfrentam desafios adicionais na gestão do tempo:</p>
      <ul>
        <li>Responsabilidades familiares e domésticas</li>
        <li>Pressão social para "dar conta de tudo"</li>
        <li>Dificuldade em delegar tarefas</li>
        <li>Sentimento de culpa ao priorizar o trabalho</li>
      </ul>
      
      <h3>Estratégias eficazes de gestão do tempo</h3>
      <h4>1. Estabeleça prioridades claras</h4>
      <p>Use a matriz de Eisenhower para classificar tarefas por urgência e importância. Foque primeiro no que é importante e urgente, depois no que é importante mas não urgente.</p>
      
      <h4>2. Crie blocos de tempo dedicados</h4>
      <p>Reserve períodos específicos para diferentes atividades: trabalho focado, família, autocuidado. Respeite esses blocos como compromissos inegociáveis.</p>
      
      <h4>3. Aprenda a dizer não</h4>
      <p>Nem toda oportunidade é boa para você neste momento. Pratique dizer não a compromissos que não agregam valor aos seus objetivos principais.</p>
      
      <h4>4. Automatize e delegue</h4>
      <p>Use ferramentas de automação para tarefas repetitivas e delegue o que outras pessoas podem fazer melhor ou mais barato que você.</p>
      
      <h3>A importância do autocuidado</h3>
      <p>Lembre-se: você é o ativo mais importante do seu negócio. Invista em seu bem-estar físico e mental. Isso não é luxo, é necessidade para a sustentabilidade do seu empreendimento.</p>
    `,
    excerpt: "Uma das maiores dificuldades das empreendedoras é encontrar o equilíbrio entre as demandas do negócio e a vida pessoal. Descubra estratégias eficazes de gestão do tempo.",
    published_at: "2024-12-10T00:00:00Z",
    featured_image_url: blogWomenBrainstorming,
    category: "Desenvolvimento Pessoal",
    tags: ["gestão do tempo", "equilíbrio", "produtividade", "autocuidado"]
  },
  {
    title: "Liderança Feminina: Desenvolvendo seu Estilo Único de Liderança",
    slug: "lideranca-feminina-desenvolvendo-estilo-unico-lideranca",
    content: `
      <p>A liderança feminina traz características únicas e valiosas para o mundo dos negócios. Mulheres líderes tendem a ser mais colaborativas, empáticas e focadas no desenvolvimento de suas equipes, criando ambientes de trabalho mais inclusivos e produtivos.</p>
      
      <h3>Características da liderança feminina</h3>
      <h4>Liderança colaborativa</h4>
      <p>Mulheres líderes frequentemente adotam um estilo mais participativo, envolvendo a equipe nas decisões e valorizando diferentes perspectivas.</p>
      
      <h4>Inteligência emocional</h4>
      <p>A capacidade de entender e gerenciar emoções, tanto próprias quanto dos outros, é uma forte característica da liderança feminina.</p>
      
      <h4>Foco no desenvolvimento</h4>
      <p>Líderes mulheres tendem a investir mais tempo no desenvolvimento e mentoria de suas equipes, criando ambientes de crescimento mútuo.</p>
      
      <h3>Como desenvolver suas habilidades de liderança</h3>
      <h4>1. Autoconhecimento</h4>
      <p>Entenda seus pontos fortes e áreas de melhoria. Use ferramentas como avaliações 360° e feedback constante para se conhecer melhor.</p>
      
      <h4>2. Desenvolva sua comunicação</h4>
      <p>Pratique a comunicação assertiva, aprenda a dar feedback construtivo e desenvolva suas habilidades de apresentação.</p>
      
      <h4>3. Construa confiança</h4>
      <p>A confiança é fundamental para a liderança. Trabalhe em sua autoestima, celebre suas conquistas e aprenda com os erros sem se autopunir.</p>
      
      <h4>4. Seja mentora e busque mentoria</h4>
      <p>Ajude outras mulheres a crescer em suas carreiras e busque mentores que possam te orientar em sua jornada de liderança.</p>
      
      <h3>Superando desafios da liderança feminina</h3>
      <p>Mulheres líderes enfrentam desafios únicos, como:</p>
      <ul>
        <li>Síndrome da impostora</li>
        <li>Dupla jornada de trabalho</li>
        <li>Preconceitos e estereótipos</li>
        <li>Dificuldade em negociação salarial</li>
      </ul>
      <p>Reconhecer esses desafios é o primeiro passo para superá-los e desenvolver estratégias eficazes para lidar com eles.</p>
    `,
    excerpt: "A liderança feminina traz características únicas e valiosas para o mundo dos negócios. Descubra como desenvolver seu estilo único de liderança e superar os desafios do caminho.",
    published_at: "2025-01-15T00:00:00Z",
    featured_image_url: blogFemaleLeader,
    category: "Liderança",
    tags: ["liderança feminina", "desenvolvimento", "gestão", "empoderamento"]
  },
  {
    title: "Finanças para Empreendedoras: Dominando os Números do seu Negócio",
    slug: "financas-para-empreendedoras-dominando-numeros-negocio",
    content: `
      <p>Muitas empreendedoras têm receio dos números, mas dominar as finanças do seu negócio é fundamental para tomar decisões estratégicas e garantir a sustentabilidade da empresa. Não é preciso ser um gênio da matemática para entender os conceitos básicos de gestão financeira.</p>
      
      <h3>Conceitos financeiros essenciais</h3>
      <h4>Fluxo de caixa</h4>
      <p>É o movimento de dinheiro que entra e sai da sua empresa. Mantenha sempre um controle detalhado para evitar surpresas desagradáveis.</p>
      
      <h4>Ponto de equilíbrio</h4>
      <p>É o valor mínimo de vendas necessário para cobrir todos os custos. Conhecer esse número te ajuda a definir metas realistas.</p>
      
      <h4>Margem de contribuição</h4>
      <p>É quanto cada produto ou serviço contribui para pagar os custos fixos e gerar lucro após cobrir os custos variáveis.</p>
      
      <h3>Ferramentas para gestão financeira</h3>
      <h4>Planilhas básicas</h4>
      <p>Comece com planilhas simples no Excel ou Google Sheets para controlar receitas, despesas e fluxo de caixa.</p>
      
      <h4>Aplicativos de gestão</h4>
      <p>Use aplicativos como Conta Azul, Neon Business ou similares para automatizar controles financeiros.</p>
      
      <h4>Separação de contas</h4>
      <p>Mantenha sempre contas bancárias separadas para pessoa física e jurídica. Isso facilita o controle e é exigido por lei.</p>
      
      <h3>Dicas práticas para melhorar suas finanças</h3>
      <ul>
        <li>Faça previsões financeiras mensais e anuais</li>
        <li>Monitore seus indicadores semanalmente</li>
        <li>Mantenha uma reserva de emergência</li>
        <li>Renegocie contratos e busque melhores condições</li>
        <li>Invista em educação financeira</li>
      </ul>
      
      <p>Lembre-se: números não mentem. Eles te mostram a realidade do seu negócio e te capacitam a tomar decisões baseadas em dados, não apenas em intuição.</p>
    `,
    excerpt: "Muitas empreendedoras têm receio dos números, mas dominar as finanças do seu negócio é fundamental para tomar decisões estratégicas. Aprenda os conceitos essenciais de gestão financeira.",
    published_at: "2025-02-05T00:00:00Z",
    featured_image_url: blogModernOfficeWorkers,
    category: "Finanças",
    tags: ["finanças", "gestão", "fluxo de caixa", "planejamento"]
  },
  {
    title: "Inovação e Criatividade: Como Diferenciarse no Mercado",
    slug: "inovacao-e-criatividade-como-diferenciarse-no-mercado",
    content: `
      <p>Em um mercado cada vez mais competitivo, inovação e criatividade são diferenciais fundamentais para o sucesso. Empreendedoras que conseguem pensar fora da caixa e oferecer soluções únicas têm mais chances de se destacar e conquistar seu espaço.</p>
      
      <h3>O que é inovação nos negócios?</h3>
      <p>Inovação não significa necessariamente criar algo completamente novo. Pode ser:</p>
      <ul>
        <li>Melhorar um produto ou serviço existente</li>
        <li>Encontrar novas formas de entregar valor</li>
        <li>Otimizar processos internos</li>
        <li>Criar novos modelos de negócio</li>
        <li>Desenvolver experiências únicas para o cliente</li>
      </ul>
      
      <h3>Como estimular a criatividade no seu negócio</h3>
      <h4>1. Questione o status quo</h4>
      <p>Sempre pergunte "por que fazemos assim?" e "como podemos fazer melhor?". Questionar processos estabelecidos abre espaço para inovação.</p>
      
      <h4>2. Ouça seus clientes</h4>
      <p>Seus clientes são uma fonte rica de ideias. Escute suas dores, sugestões e reclamações - elas podem ser o ponto de partida para inovações.</p>
      
      <h4>3. Observe outros mercados</h4>
      <p>Soluções inovadoras frequentemente vêm da adaptação de ideias de outros setores para seu mercado.</p>
      
      <h4>4. Crie um ambiente de experimentação</h4>
      <p>Permita-se testar novas ideias, mesmo que algumas falhem. O importante é aprender com cada experiência.</p>
      
      <h3>Técnicas para gerar ideias inovadoras</h3>
      <h4>Brainstorming estruturado</h4>
      <p>Organize sessões de brainstorming com regras claras: todas as ideias são válidas, quantidade antes de qualidade, e construa sobre as ideias dos outros.</p>
      
      <h4>Design thinking</h4>
      <p>Use a metodologia do design thinking: empatize, defina, idealize, prototipe e teste. Esse processo estruturado leva a soluções mais assertivas.</p>
      
      <h4>Mapa mental</h4>
      <p>Use mapas mentais para explorar conexões entre diferentes conceitos e identificar oportunidades não óbvias.</p>
      
      <p>Lembre-se: a inovação é um processo, não um evento. Cultive uma mentalidade curiosa e esteja sempre aberta a novas possibilidades.</p>
    `,
    excerpt: "Em um mercado cada vez mais competitivo, inovação e criatividade são diferenciais fundamentais para o sucesso. Descubra como estimular a criatividade e gerar ideias inovadoras.",
    published_at: "2025-02-20T00:00:00Z",
    featured_image_url: blogWomenBrainstorming,
    category: "Inovação",
    tags: ["inovação", "criatividade", "diferenciação", "competitividade"]
  },
  {
    title: "Construindo uma Marca Pessoal Forte como Empreendedora",
    slug: "construindo-marca-pessoal-forte-como-empreendedora",
    content: `
      <p>Sua marca pessoal é como você é percebida no mercado. Para empreendedoras, ter uma marca pessoal forte pode ser o diferencial que abre portas, atrai clientes ideais e gera oportunidades de negócio.</p>
      
      <h3>O que é marca pessoal?</h3>
      <p>Marca pessoal é a percepção que as pessoas têm sobre você, seus valores, competências e personalidade. É como você se posiciona no mercado e na mente do seu público.</p>
      
      <h3>Por que a marca pessoal é importante para empreendedoras?</h3>
      <ul>
        <li><strong>Credibilidade:</strong> Uma marca forte gera confiança</li>
        <li><strong>Diferenciação:</strong> Te ajuda a se destacar da concorrência</li>
        <li><strong>Networking:</strong> Facilita a criação de conexões valiosas</li>
        <li><strong>Oportunidades:</strong> Atrai propostas e parcerias</li>
        <li><strong>Autoridade:</strong> Te posiciona como especialista na área</li>
      </ul>
      
      <h3>Como construir sua marca pessoal</h3>
      <h4>1. Defina seu propósito e valores</h4>
      <p>Antes de tudo, seja clara sobre o que você representa. Quais são seus valores fundamentais? Qual é sua missão? Que impacto você quer causar?</p>
      
      <h4>2. Identifique seu diferencial único</h4>
      <p>O que você faz melhor que ninguém? Qual é sua combinação única de habilidades, experiências e personalidade?</p>
      
      <h4>3. Seja consistente</h4>
      <p>Mantenha coerência em todas as suas comunicações, desde suas redes sociais até suas apresentações e networking.</p>
      
      <h4>4. Crie conteúdo relevante</h4>
      <p>Compartilhe seu conhecimento através de posts, artigos, vídeos ou podcasts. Eduque seu público e demonstre sua expertise.</p>
      
      <h4>5. Seja autêntica</h4>
      <p>Não tente ser quem você não é. A autenticidade é fundamental para construir uma marca pessoal sólida e duradoura.</p>
      
      <h3>Canais para fortalecer sua marca pessoal</h3>
      <ul>
        <li><strong>LinkedIn:</strong> Para networking profissional</li>
        <li><strong>Instagram:</strong> Para mostrar seu lado pessoal e profissional</li>
        <li><strong>Blog ou site:</strong> Para demonstrar expertise</li>
        <li><strong>Palestras e eventos:</strong> Para aumentar visibilidade</li>
        <li><strong>Podcast ou YouTube:</strong> Para alcançar novos públicos</li>
      </ul>
      
      <p>Lembre-se: construir uma marca pessoal forte leva tempo e consistência. Seja paciente e mantenha o foco em agregar valor ao seu público.</p>
    `,
    excerpt: "Sua marca pessoal é como você é percebida no mercado. Para empreendedoras, ter uma marca pessoal forte pode ser o diferencial que abre portas e atrai clientes ideais.",
    published_at: "2025-03-10T00:00:00Z",
    featured_image_url: blogFemaleLeader,
    category: "Marketing",
    tags: ["marca pessoal", "posicionamento", "autoridade", "networking"]
  },
  {
    title: "Vendas para Empreendedoras: Técnicas Eficazes para Conquistar Clientes",
    slug: "vendas-para-empreendedoras-tecnicas-eficazes-conquistar-clientes",
    content: `
      <p>Muitas empreendedoras têm dificuldade com vendas, seja por timidez, falta de técnica ou receio de serem vistas como "insistentes". Mas dominar o processo de vendas é fundamental para o sucesso de qualquer negócio.</p>
      
      <h3>Mudando a mentalidade sobre vendas</h3>
      <p>Venda não é empurrar um produto para alguém que não precisa. Venda é:</p>
      <ul>
        <li>Ajudar o cliente a resolver um problema</li>
        <li>Oferecer valor e transformação</li>
        <li>Criar relacionamentos duradouros</li>
        <li>Ser consultiva, não apenas transacional</li>
      </ul>
      
      <h3>O processo de vendas em etapas</h3>
      <h4>1. Prospecção</h4>
      <p>Identifique quem são seus clientes ideais e onde encontrá-los. Use redes sociais, indicações e eventos para encontrar prospects qualificados.</p>
      
      <h4>2. Qualificação</h4>
      <p>Nem todo prospect é um bom cliente. Qualifique-os perguntando sobre necessidades, orçamento, prazo e autoridade de decisão.</p>
      
      <h4>3. Apresentação da solução</h4>
      <p>Apresente sua oferta focando nos benefícios, não apenas nas características. Mostre como você resolve os problemas específicos do cliente.</p>
      
      <h4>4. Tratamento de objeções</h4>
      <p>Objeções são normais e saudáveis. Escute atentamente, entenda a preocupação real e responda de forma empática e factual.</p>
      
      <h4>5. Fechamento</h4>
      <p>Não tenha medo de pedir a venda. Use técnicas como assumir a venda, oferecer alternativas ou criar urgência saudável.</p>
      
      <h4>6. Pós-venda</h4>
      <p>O trabalho não termina na venda. Acompanhe a satisfação do cliente, peça feedback e trabalhe para gerar indicações.</p>
      
      <h3>Técnicas específicas para empreendedoras</h3>
      <h4>Venda consultiva</h4>
      <p>Faça perguntas inteligentes para entender profundamente as necessidades do cliente antes de apresentar sua solução.</p>
      
      <h4>Storytelling</h4>
      <p>Use histórias de outros clientes para demonstrar resultados e criar conexão emocional.</p>
      
      <h4>Prova social</h4>
      <p>Compartilhe depoimentos, casos de sucesso e resultados obtidos para gerar credibilidade.</p>
      
      <h4>Vendas por relacionamento</h4>
      <p>Construa relacionamentos genuínos antes de tentar vender. Pessoas compram de quem confiam.</p>
      
      <p>Lembre-se: vendas é uma habilidade que se desenvolve com prática. Quanto mais você vender, melhor você ficará.</p>
    `,
    excerpt: "Muitas empreendedoras têm dificuldade com vendas, mas dominar o processo é fundamental para o sucesso. Descubra técnicas eficazes para conquistar e manter clientes.",
    published_at: "2025-03-25T00:00:00Z",
    featured_image_url: blogFemaleEntrepreneur,
    category: "Vendas",
    tags: ["vendas", "técnicas", "clientes", "relacionamento"]
  },
  {
    title: "Sustentabilidade nos Negócios: Como Empreender com Propósito",
    slug: "sustentabilidade-nos-negocios-como-empreender-com-proposito",
    content: `
      <p>A sustentabilidade deixou de ser apenas uma tendência para se tornar uma necessidade. Empreendedoras que conseguem alinhar lucro com propósito social e ambiental estão criando negócios mais resilientes e significativos.</p>
      
      <h3>Os três pilares da sustentabilidade</h3>
      <h4>1. Ambiental</h4>
      <p>Minimizar o impacto ambiental através de práticas como:</p>
      <ul>
        <li>Uso responsável de recursos naturais</li>
        <li>Redução de desperdícios</li>
        <li>Escolha de fornecedores sustentáveis</li>
        <li>Compensação de carbono</li>
      </ul>
      
      <h4>2. Social</h4>
      <p>Gerar impacto positivo na sociedade através de:</p>
      <ul>
        <li>Práticas trabalhistas justas</li>
        <li>Diversidade e inclusão</li>
        <li>Desenvolvimento da comunidade local</li>
        <li>Responsabilidade social corporativa</li>
      </ul>
      
      <h4>3. Econômico</h4>
      <p>Manter a viabilidade financeira enquanto:</p>
      <ul>
        <li>Cria valor para stakeholders</li>
        <li>Investe em inovação sustentável</li>
        <li>Mantém transparência financeira</li>
        <li>Planeja crescimento a longo prazo</li>
      </ul>
      
      <h3>Como implementar práticas sustentáveis</h3>
      <h4>Comece pequeno</h4>
      <p>Você não precisa revolucionar tudo de uma vez. Comece com mudanças simples como reduzir o uso de papel ou escolher fornecedores locais.</p>
      
      <h4>Envolva sua equipe</h4>
      <p>Crie uma cultura de sustentabilidade envolvendo todos os colaboradores nas iniciativas e decisões sustentáveis.</p>
      
      <h4>Meça e comunique</h4>
      <p>Monitore o impacto das suas ações e comunique os resultados para clientes, investidores e colaboradores.</p>
      
      <h4>Seja autêntica</h4>
      <p>Evite o "greenwashing". Seja genuína em suas práticas sustentáveis e comunique de forma transparente.</p>
      
      <h3>Benefícios da sustentabilidade nos negócios</h3>
      <ul>
        <li><strong>Diferenciação competitiva:</strong> Atrai clientes conscientes</li>
        <li><strong>Redução de custos:</strong> Eficiência operacional</li>
        <li><strong>Atração de talentos:</strong> Profissionais querem trabalhar com propósito</li>
        <li><strong>Acesso a investimentos:</strong> Investidores ESG são crescentes</li>
        <li><strong>Resiliência:</strong> Negócios sustentáveis são mais resistentes a crises</li>
      </ul>
      
      <p>Empreender com propósito não é apenas bom para o mundo - é bom para os negócios. Clientes, funcionários e investidores cada vez mais valorizam empresas que se preocupam com seu impacto social e ambiental.</p>
    `,
    excerpt: "A sustentabilidade deixou de ser tendência para se tornar necessidade. Descubra como empreendedoras podem alinhar lucro com propósito social e ambiental.",
    published_at: "2025-04-08T00:00:00Z",
    featured_image_url: blogWomenBrainstorming,
    category: "Sustentabilidade",
    tags: ["sustentabilidade", "propósito", "ESG", "impacto social"]
  },
  {
    title: "Tecnologia a Favor das Empreendedoras: Ferramentas para Otimizar seu Negócio",
    slug: "tecnologia-a-favor-das-empreendedoras-ferramentas-otimizar-negocio",
    content: `
      <p>A tecnologia pode ser uma grande aliada das empreendedoras, ajudando a automatizar processos, melhorar a eficiência e escalar negócios. O segredo é escolher as ferramentas certas para suas necessidades específicas.</p>
      
      <h3>Áreas onde a tecnologia pode ajudar</h3>
      <h4>Gestão de relacionamento com clientes (CRM)</h4>
      <p>Ferramentas como HubSpot, Pipedrive ou RD Station ajudam a organizar contatos, acompanhar o funil de vendas e automatizar o relacionamento com clientes.</p>
      
      <h4>Marketing digital</h4>
      <p>Use ferramentas como:</p>
      <ul>
        <li><strong>Canva:</strong> Para criar materiais visuais</li>
        <li><strong>Mailchimp:</strong> Para email marketing</li>
        <li><strong>Hootsuite:</strong> Para gerenciar redes sociais</li>
        <li><strong>Google Analytics:</strong> Para analisar performance</li>
      </ul>
      
      <h4>Gestão financeira</h4>
      <p>Aplicativos como Conta Azul, Neon Business ou Omie facilitam o controle financeiro, emissão de notas fiscais e conciliação bancária.</p>
      
      <h4>Produtividade</h4>
      <p>Ferramentas como:</p>
      <ul>
        <li><strong>Trello ou Asana:</strong> Para gestão de projetos</li>
        <li><strong>Google Workspace:</strong> Para colaboração</li>
        <li><strong>Calendly:</strong> Para agendamentos</li>
        <li><strong>Notion:</strong> Para organização geral</li>
      </ul>
      
      <h3>Como escolher as ferramentas certas</h3>
      <h4>1. Identifique suas necessidades</h4>
      <p>Antes de buscar ferramentas, mapeie quais são seus principais desafios e necessidades operacionais.</p>
      
      <h4>2. Comece simples</h4>
      <p>Não tente implementar muitas ferramentas de uma vez. Comece com o básico e vá evoluindo gradualmente.</p>
      
      <h4>3. Considere o custo-benefício</h4>
      <p>Muitas ferramentas oferecem versões gratuitas ou trials. Teste antes de investir.</p>
      
      <h4>4. Pense na integração</h4>
      <p>Escolha ferramentas que se integram entre si para evitar retrabalho e duplicação de dados.</p>
      
      <h4>5. Considere a curva de aprendizado</h4>
      <p>Ferramentas muito complexas podem não compensar se você não tem tempo para aprender a usá-las.</p>
      
      <h3>Tendências tecnológicas para ficar de olho</h3>
      <ul>
        <li><strong>Inteligência Artificial:</strong> Para automação e insights</li>
        <li><strong>Chatbots:</strong> Para atendimento ao cliente</li>
        <li><strong>E-commerce:</strong> Para vendas online</li>
        <li><strong>Marketing de automação:</strong> Para nutrir leads</li>
        <li><strong>Analytics avançados:</strong> Para decisões baseadas em dados</li>
      </ul>
      
      <p>Lembre-se: a tecnologia deve servir ao seu negócio, não o contrário. Escolha ferramentas que realmente agreguem valor e simplifiquem sua operação.</p>
    `,
    excerpt: "A tecnologia pode ser uma grande aliada das empreendedoras. Descubra as principais ferramentas para automatizar processos, melhorar a eficiência e escalar seu negócio.",
    published_at: "2025-04-18T00:00:00Z",
    featured_image_url: blogModernOfficeWorkers,
    category: "Tecnologia",
    tags: ["tecnologia", "ferramentas", "automação", "produtividade"]
  }
];

export default function BlogMigrationTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migratedPosts, setMigratedPosts] = useState<string[]>([]);
  const { toast } = useToast();

  const findOrCreateCategory = async (categoryName: string) => {
    const slug = categoryName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verificar se categoria existe
    let { data: category } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!category) {
      // Criar categoria
      const { data: newCategory, error } = await supabase
        .from('blog_categories')
        .insert({
          name: categoryName,
          slug: slug,
          description: `Categoria: ${categoryName}`
        })
        .select('id')
        .single();

      if (error) throw error;
      category = newCategory;
    }

    return category.id;
  };

  const findOrCreateTags = async (tagNames: string[]) => {
    const tagIds: string[] = [];

    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar se tag existe
      let { data: tag } = await supabase
        .from('blog_tags')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!tag) {
        // Criar tag
        const { data: newTag, error } = await supabase
          .from('blog_tags')
          .insert({
            name: tagName,
            slug: slug
          })
          .select('id')
          .single();

        if (error) throw error;
        tag = newTag;
      }

      tagIds.push(tag.id);
    }

    return tagIds;
  };

  const migrateAllPosts = async () => {
    setIsLoading(true);
    setProgress(0);
    setMigratedPosts([]);

    try {
      for (let i = 0; i < blogPostsData.length; i++) {
        const post = blogPostsData[i];
        
        try {
          // Verificar se post já existe
          const { data: existingPost } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', post.slug)
            .single();

          if (existingPost) {
            console.log(`Post "${post.title}" já existe, pulando...`);
            setProgress(((i + 1) / blogPostsData.length) * 100);
            continue;
          }

          // Criar categoria
          const categoryId = await findOrCreateCategory(post.category);

          // Criar tags
          const tagIds = await findOrCreateTags(post.tags);

          // Criar post
          const { data: newPost, error: postError } = await supabase
            .from('blog_posts')
            .insert({
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt,
              published_at: post.published_at,
              featured_image_url: post.featured_image_url,
              seo_title: post.seo_title,
              seo_description: post.seo_description,
              author_id: null, // Definir como null para não dar erro de autor
              category_id: categoryId,
              status: 'published'
            })
            .select('id')
            .single();

          if (postError) throw postError;

          // Associar tags ao post
          if (tagIds.length > 0) {
            const tagAssociations = tagIds.map(tagId => ({
              post_id: newPost.id,
              tag_id: tagId
            }));

            const { error: tagError } = await supabase
              .from('blog_post_tags')
              .insert(tagAssociations);

            if (tagError) throw tagError;
          }

          setMigratedPosts(prev => [...prev, post.title]);
          
        } catch (postError) {
          console.error(`Erro ao migrar post "${post.title}":`, postError);
          toast({
            title: "Erro na migração",
            description: `Erro ao migrar o post "${post.title}"`,
            variant: "destructive",
          });
        }

        setProgress(((i + 1) / blogPostsData.length) * 100);
      }

      toast({
        title: "Migração concluída!",
        description: `${migratedPosts.length} posts foram migrados com sucesso`,
      });

    } catch (error) {
      console.error('Erro na migração:', error);
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro durante o processo de migração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Ferramenta de Migração do Blog</CardTitle>
        <p className="text-muted-foreground">
          Esta ferramenta irá migrar {blogPostsData.length} posts do site antigo para o novo portal.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{blogPostsData.length}</div>
            <div className="text-sm text-muted-foreground">Posts para migrar</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{migratedPosts.length}</div>
            <div className="text-sm text-muted-foreground">Posts migrados</div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {Math.round(progress)}% concluído
            </p>
          </div>
        )}

        <Button 
          onClick={migrateAllPosts} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Migrando...' : 'Iniciar Migração'}
        </Button>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Posts a serem migrados:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {blogPostsData.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <div className="font-medium text-sm">{post.title}</div>
                  <div className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-2">{post.category}</Badge>
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="mr-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {migratedPosts.includes(post.title) && (
                  <Badge variant="default">Migrado</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}