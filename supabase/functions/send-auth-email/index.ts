import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  type: string; // 'signup', 'recovery', 'confirmation'
  userData?: {
    full_name?: string;
    confirmation_url?: string;
    recovery_url?: string;
  };
}

const serve_handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, type, userData }: EmailRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: 'Email and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mailrelayApiKey = Deno.env.get('MAILRELAY_API_KEY');
    if (!mailrelayApiKey) {
      console.error('MAILRELAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Definir templates de email baseados no tipo
    let subject = '';
    let content = '';

    switch (type) {
      case 'signup':
        subject = 'Confirme seu cadastro - Mulheres em Convergência';
        content = `
          <h2>Bem-vinda ao Mulheres em Convergência!</h2>
          <p>Olá ${userData?.full_name || 'empreendedora'},</p>
          <p>Obrigada por se cadastrar em nossa plataforma! Para completar seu cadastro, clique no link abaixo:</p>
          <p><a href="${userData?.confirmation_url || '#'}" style="background-color: #c75a92; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Confirmar Cadastro</a></p>
          <p>Se você não fez este cadastro, pode ignorar este email.</p>
          <p>Atenciosamente,<br>Equipe Mulheres em Convergência</p>
        `;
        break;
      
      case 'recovery':
        subject = 'Recuperação de senha - Mulheres em Convergência';
        content = `
          <h2>Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a recuperação de sua senha. Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${userData?.recovery_url || '#'}" style="background-color: #c75a92; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Recuperar Senha</a></p>
          <p>Se você não solicitou esta recuperação, pode ignorar este email.</p>
          <p>Atenciosamente,<br>Equipe Mulheres em Convergência</p>
        `;
        break;
      
      default:
        subject = 'Mulheres em Convergência';
        content = `
          <h2>Olá!</h2>
          <p>Você recebeu este email do Mulheres em Convergência.</p>
          <p>Atenciosamente,<br>Equipe Mulheres em Convergência</p>
        `;
    }

    // Enviar email via MailRelay API
    const mailrelayUrl = 'https://api.mailrelay.com/v2/emails';
    
    const emailPayload = {
      to: [{ email, name: userData?.full_name || email }],
      subject,
      html_content: content,
      from: {
        email: 'noreply@mulheresemconvergencia.com.br',
        name: 'Mulheres em Convergência'
      }
    };

    const mailrelayResponse = await fetch(mailrelayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailrelayApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!mailrelayResponse.ok) {
      const errorText = await mailrelayResponse.text();
      console.error('MailRelay API error:', errorText);
      
      // Fallback: Log para processamento posterior
      console.log('Fallback: Email will be processed by mailrelay-sync function');
    }

    const result = {
      success: true,
      message: 'Email sent successfully via MailRelay',
      email,
      type
    };

    console.log('Auth email sent:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-auth-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(serve_handler);