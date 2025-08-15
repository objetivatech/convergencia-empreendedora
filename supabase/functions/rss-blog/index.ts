import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/rss+xml; charset=utf-8',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const siteUrl = req.headers.get('origin') || 'https://convergencia-empreendedora.lovable.app';
    const currentDate = new Date().toISOString();

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Convergência Empreendedora - Blog</title>
    <link>${siteUrl}</link>
    <description>Blog sobre empreendedorismo feminino, economia solidária e transformação social através do trabalho de mulheres. Aqui você encontra histórias inspiradoras, dicas práticas e conteúdo educativo para fortalecer o empreendedorismo feminino no Brasil.</description>
    <language>pt-BR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml"/>
    <managingEditor>mulheresemconvergencia@gmail.com (Convergência Empreendedora)</managingEditor>
    <webMaster>mulheresemconvergencia@gmail.com (Convergência Empreendedora)</webMaster>
    <category>Empreendedorismo</category>
    <category>Economia Solidária</category>
    <category>Mulheres</category>
    <category>Transformação Social</category>
    <image>
      <url>${siteUrl}/logo-horizontal.png</url>
      <title>Convergência Empreendedora</title>
      <link>${siteUrl}</link>
      <width>88</width>
      <height>31</height>
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

    return new Response(rssXml, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Erro ao gerar RSS:', error);
    
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Convergência Empreendedora - Blog</title>
    <link>https://convergencia-empreendedora.lovable.app</link>
    <description>Feed RSS temporariamente indisponível</description>
    <item>
      <title>Feed temporariamente indisponível</title>
      <description>Nosso feed RSS está temporariamente fora do ar. Tente novamente em alguns minutos.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    return new Response(errorRss, {
      headers: corsHeaders
    });
  }
});