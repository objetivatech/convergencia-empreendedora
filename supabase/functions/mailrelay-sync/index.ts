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

interface MailRelaySubscriber {
  email: string;
  name: string;
  custom_fields: {
    cpf?: string;
    user_type?: string;
    origin?: string;
    evolution_date?: string;
  };
}

class MailRelayAPI {
  private baseUrl = 'https://aconfraria.ipzmarketing.com/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any, retries: number = 3) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'X-AUTH-TOKEN': this.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
      timeout: 30000, // 30 seconds timeout
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to ${url}`, { data, retries });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        let responseData;
        
        try {
          responseData = await response.json();
        } catch (parseError) {
          responseData = { message: 'Invalid JSON response' };
        }
        
        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            console.log(`Server error ${response.status}, retrying... (${attempt}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`MailRelay API error: ${response.status} - ${JSON.stringify(responseData)}`);
        }

        console.log(`MailRelay API success:`, responseData);
        return responseData;
        
      } catch (error) {
        if (attempt === retries) {
          console.error(`MailRelay API failed after ${retries} attempts:`, error);
          throw error;
        }
        console.log(`Request failed, retrying... (${attempt}/${retries})`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Max retries exceeded');
  }

  async createSubscriber(subscriber: MailRelaySubscriber) {
    // Primeiro, verificar se o subscriber já existe
    const existing = await this.getSubscriber(subscriber.email);
    if (existing) {
      console.log(`Subscriber ${subscriber.email} already exists, updating instead`);
      return this.updateSubscriber(subscriber.email, subscriber);
    }
    return this.makeRequest('/subscribers', 'POST', subscriber);
  }

  async updateSubscriber(email: string, subscriber: Partial<MailRelaySubscriber>) {
    return this.makeRequest(`/subscribers/${encodeURIComponent(email)}`, 'PUT', subscriber);
  }

  async deleteSubscriber(email: string) {
    return this.makeRequest(`/subscribers/${encodeURIComponent(email)}`, 'DELETE');
  }

  async getSubscriber(email: string) {
    try {
      return await this.makeRequest(`/subscribers/${encodeURIComponent(email)}`);
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async addToGroup(email: string, groupId: string) {
    try {
      return await this.makeRequest(`/groups/${groupId}/subscribers`, 'POST', { email });
    } catch (error) {
      // Se o grupo não existir, criar ele
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log(`Group ${groupId} not found, creating it first`);
        await this.createGroup(groupId);
        return this.makeRequest(`/groups/${groupId}/subscribers`, 'POST', { email });
      }
      throw error;
    }
  }

  async createGroup(groupId: string) {
    const groupData = {
      name: this.getGroupName(groupId),
      description: this.getGroupDescription(groupId)
    };
    
    try {
      return await this.makeRequest('/groups', 'POST', groupData);
    } catch (error) {
      console.log(`Failed to create group ${groupId}:`, error.message);
      // Não falhar se o grupo já existir
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        return { id: groupId, name: groupData.name };
      }
      throw error;
    }
  }

  private getGroupName(groupId: string): string {
    const groupNames = {
      'grupo_newsletter': 'Newsletter Subscribers',
      'grupo_clientes': 'Clientes Registrados',
      'grupo_empreendedoras': 'Empreendedoras',
      'grupo_embaixadoras': 'Embaixadoras'
    };
    return groupNames[groupId] || groupId;
  }

  private getGroupDescription(groupId: string): string {
    const groupDescriptions = {
      'grupo_newsletter': 'Usuários inscritos na newsletter',
      'grupo_clientes': 'Clientes com perfil completo no portal',
      'grupo_empreendedoras': 'Empreendedoras cadastradas na plataforma',
      'grupo_embaixadoras': 'Embaixadoras do programa'
    };
    return groupDescriptions[groupId] || `Grupo ${groupId}`;
  }
}

async function processMailRelaySyncOperation(operation: any) {
  const mailrelay = new MailRelayAPI(mailrelayApiKey);
  
  try {
    const requestData = operation.request_data;
    let responseData = null;

    switch (operation.operation) {
      case 'create':
        const subscriberData: MailRelaySubscriber = {
          email: requestData.email,
          name: requestData.name,
          custom_fields: {
            cpf: requestData.cpf,
            user_type: requestData.user_type,
            origin: requestData.origin,
          }
        };

        responseData = await mailrelay.createSubscriber(subscriberData);
        
        // Atualizar o ID do MailRelay no banco local
        if (operation.entity_type === 'subscriber') {
          await supabase
            .from('newsletter_subscribers')
            .update({ 
              mailrelay_id: responseData.id,
              synced_at: new Date().toISOString()
            })
            .eq('id', operation.entity_id);
        }

        // Adicionar a grupos baseado no user_type
        const groupMapping = {
          'newsletter': 'grupo_newsletter',
          'profile': 'grupo_clientes',
          'business': 'grupo_empreendedoras',
          'ambassador': 'grupo_embaixadoras'
        };

        const groupId = groupMapping[requestData.user_type];
        if (groupId) {
          try {
            await mailrelay.addToGroup(requestData.email, groupId);
          } catch (error) {
            console.log(`Grupo ${groupId} não existe, continuando...`);
          }
        }
        break;

      case 'update':
        responseData = await mailrelay.updateSubscriber(requestData.email, {
          name: requestData.name,
          custom_fields: {
            cpf: requestData.cpf,
            user_type: requestData.user_type,
            origin: requestData.origin,
          }
        });
        break;

      case 'delete':
        responseData = await mailrelay.deleteSubscriber(requestData.email);
        break;

      default:
        throw new Error(`Operação não suportada: ${operation.operation}`);
    }

    // Atualizar log como sucesso
    await supabase
      .from('mailrelay_sync_log')
      .update({
        status: 'success',
        response_data: responseData,
        processed_at: new Date().toISOString()
      })
      .eq('id', operation.id);

    return { success: true, data: responseData };

  } catch (error) {
    console.error('Erro ao sincronizar com MailRelay:', error);
    
    // Atualizar log como erro
    await supabase
      .from('mailrelay_sync_log')
      .update({
        status: 'error',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', operation.id);

    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      // Processar operação específica
      const body = await req.text();
      if (!body.trim()) {
        return new Response(
          JSON.stringify({ error: 'Body da requisição vazio' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let jsonData;
      try {
        jsonData = JSON.parse(body);
      } catch (parseError) {
        return new Response(
          JSON.stringify({ error: 'JSON inválido no body da requisição' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { operation_id } = jsonData;
      
      const { data: operation } = await supabase
        .from('mailrelay_sync_log')
        .select('*')
        .eq('id', operation_id)
        .eq('status', 'pending')
        .single();

      if (!operation) {
        return new Response(
          JSON.stringify({ error: 'Operação não encontrada ou já processada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await processMailRelaySyncOperation(operation);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET - Processar operações pendentes em lote
    const { data: pendingOperations } = await supabase
      .from('mailrelay_sync_log')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (!pendingOperations || pendingOperations.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma operação pendente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = [];
    for (const operation of pendingOperations) {
      const result = await processMailRelaySyncOperation(operation);
      results.push({ operation_id: operation.id, ...result });
    }

    return new Response(JSON.stringify({ 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função mailrelay-sync:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});