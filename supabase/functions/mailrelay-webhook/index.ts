import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MailRelayWebhookEvent {
  event: string; // 'subscribe', 'unsubscribe', 'bounce', 'click', 'open'
  email: string;
  timestamp: string;
  data?: any;
}

async function handleMailRelayWebhook(event: MailRelayWebhookEvent) {
  console.log('Processando webhook MailRelay:', event);

  try {
    switch (event.event) {
      case 'unsubscribe':
        // Atualizar newsletter_subscribers
        await supabase
          .from('newsletter_subscribers')
          .update({ active: false })
          .eq('email', event.email);

        // Atualizar profiles se existir
        await supabase
          .from('profiles')
          .update({ newsletter_subscribed: false })
          .eq('email', event.email);

        console.log(`Usuário ${event.email} removido da newsletter via webhook`);
        break;

      case 'subscribe':
        // Verificar se já existe o subscriber
        const { data: existingSubscriber } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .eq('email', event.email)
          .single();

        if (!existingSubscriber) {
          // Criar novo subscriber
          await supabase
            .from('newsletter_subscribers')
            .insert({
              email: event.email,
              name: event.data?.name || event.email.split('@')[0],
              source: 'mailrelay_webhook',
              origin: 'mailrelay'
            });
        } else {
          // Reativar subscriber existente
          await supabase
            .from('newsletter_subscribers')
            .update({ active: true })
            .eq('email', event.email);
        }

        console.log(`Usuário ${event.email} inscrito via webhook`);
        break;

      case 'bounce':
        // Marcar email como bounce
        await supabase
          .from('newsletter_subscribers')
          .update({ 
            active: false,
            last_sync_error: `Bounce: ${event.data?.reason || 'Email rejeitado'}`
          })
          .eq('email', event.email);

        console.log(`Email ${event.email} marcado como bounce`);
        break;

      default:
        console.log(`Evento ${event.event} não tratado`);
    }

    // Registrar no log
    await supabase
      .from('mailrelay_sync_log')
      .insert({
        operation_type: 'sync_from_mailrelay',
        entity_type: 'webhook',
        operation: event.event,
        status: 'success',
        request_data: event,
        processed_at: new Date().toISOString()
      });

    return { success: true };

  } catch (error) {
    console.error('Erro ao processar webhook MailRelay:', error);
    
    // Registrar erro no log
    await supabase
      .from('mailrelay_sync_log')
      .insert({
        operation_type: 'sync_from_mailrelay',
        entity_type: 'webhook',
        operation: event.event,
        status: 'error',
        error_message: error.message,
        request_data: event,
        processed_at: new Date().toISOString()
      });

    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Método não permitido', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const webhookEvent: MailRelayWebhookEvent = await req.json();
    
    const result = await handleMailRelayWebhook(webhookEvent);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função mailrelay-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});