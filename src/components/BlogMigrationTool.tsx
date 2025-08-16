import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: string;
  featured_image_url?: string;
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
    featured_image_url: "https://mulheresemconvergencia.com.br/wp-content/uploads/2023/11/group-of-businesswomen-at-meeting-in-office-1024x682.jpg",
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
    featured_image_url: "https://mulheresemconvergencia.com.br/wp-content/uploads/2025/06/Mulheres-em-Convergencia-Blog-Convergindo-6-HAPPY-HOUR-CONECTA-29.08.24-1024x576.jpg",
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
    featured_image_url: "https://mulheresemconvergencia.com.br/wp-content/uploads/2023/11/group-of-women-eating-lunch-at-work-1024x682.jpg",
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
    featured_image_url: "https://mulheresemconvergencia.com.br/wp-content/uploads/2025/06/Mulheres-em-Convergencia-Blog-Convergindo-1-O-ponto-de-virada-para-mulheres-que-decidem-fazer-dar-certo-1-1024x576.jpg",
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
    featured_image_url: "https://mulheresemconvergencia.com.br/wp-content/uploads/2025/06/Mulheres-em-Convergencia-Blog-Convergindo-South-Summit-Brasil-2025-1-1024x576.jpg",
    category: "Networking",
    tags: ["south summit", "inovação", "networking", "eventos"]
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
      // Primeiro, vamos obter o autor padrão (admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .single();

      if (!profile) {
        throw new Error('Nenhum usuário admin encontrado para ser autor dos posts');
      }

      const authorId = profile.id;

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
              author_id: authorId,
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