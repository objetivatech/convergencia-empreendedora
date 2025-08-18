import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mailrelayApiKey = Deno.env.get('MAILRELAY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing MailRelay connection...');

    // Test 1: Verificar se a API key está configurada
    if (!mailrelayApiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'MAILRELAY_API_KEY não configurado' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test 2: Testar conexão com MailRelay
    const mailrelayResponse = await fetch('https://aconfraria.ipzmarketing.com/api/v1/subscribers?limit=1', {
      method: 'GET',
      headers: {
        'X-AUTH-TOKEN': mailrelayApiKey,
        'Content-Type': 'application/json',
      }
    });

    let mailrelayData;
    try {
      mailrelayData = await mailrelayResponse.json();
    } catch {
      mailrelayData = { message: 'Invalid JSON response' };
    }

    const mailrelayTest = {
      status: mailrelayResponse.status,
      success: mailrelayResponse.ok,
      data: mailrelayData
    };

    // Test 3: Verificar operações pendentes no banco
    const { data: pendingOps, error: dbError } = await supabase
      .from('mailrelay_sync_log')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    // Test 4: Verificar subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(10);

    const result = {
      success: true,
      tests: {
        api_key_configured: !!mailrelayApiKey,
        mailrelay_connection: mailrelayTest,
        database_connection: !dbError,
        pending_operations: pendingOps?.length || 0,
        subscribers_count: subscribers?.length || 0
      },
      debug: {
        pending_operations: pendingOps,
        recent_subscribers: subscribers,
        database_errors: {
          pending_ops: dbError?.message,
          subscribers: subscribersError?.message
        }
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro no teste MailRelay:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});