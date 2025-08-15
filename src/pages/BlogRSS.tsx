import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function BlogRSS() {
  useEffect(() => {
    const generateRSSFeed = async () => {
      try {
        // Buscar posts publicados do blog
        const { data: posts, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            content,
            excerpt,
            slug,
            published_at,
            seo_description,
            featured_image_url,
            author_id,
            profiles!blog_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const siteUrl = window.location.origin;
        const currentDate = new Date().toISOString();

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Convergência Empreendedora - Blog</title>
    <link>${siteUrl}</link>
    <description>Blog sobre empreendedorismo feminino, economia solidária e transformação social através do trabalho de mulheres.</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml"/>
    <managingEditor>mulheresemconvergencia@gmail.com (Convergência Empreendedora)</managingEditor>
    <webMaster>mulheresemconvergencia@gmail.com (Convergência Empreendedora)</webMaster>
    <category>Empreendedorismo</category>
    <category>Economia Solidária</category>
    <category>Mulheres</category>
    <image>
      <url>${siteUrl}/logo-horizontal.png</url>
      <title>Convergência Empreendedora</title>
      <link>${siteUrl}</link>
    </image>
    
${posts?.map(post => {
  const pubDate = new Date(post.published_at || '').toUTCString();
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const authorName = post.profiles?.full_name || 'Convergência Empreendedora';
  const description = post.seo_description || post.excerpt || '';
  const content = post.content || '';
  
  return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>mulheresemconvergencia@gmail.com (${authorName})</author>
      <category>Blog</category>
      ${post.featured_image_url ? `<enclosure url="${post.featured_image_url}" type="image/jpeg"/>` : ''}
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

        // Criar arquivo RSS como XML e forçar download
        const blob = new Blob([rssXml], { type: 'application/rss+xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Definir como response XML
        document.open();
        document.write(rssXml);
        document.close();

      } catch (error) {
        console.error('Erro ao gerar RSS:', error);
        document.write(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Convergência Empreendedora - Blog</title>
    <link>${window.location.origin}</link>
    <description>Erro ao carregar feed RSS</description>
    <item>
      <title>Feed temporariamente indisponível</title>
      <description>Tente novamente em alguns minutos</description>
    </item>
  </channel>
</rss>`);
      }
    };

    generateRSSFeed();
  }, []);

  return null; // Este componente não renderiza nada visível
}