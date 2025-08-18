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

class MailRelayAPI {
  private baseUrl = 'https://aconfraria.ipzmarketing.com/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createSubscriber(email: string, name: string, customFields: any = {}) {
    const url = `${this.baseUrl}/subscribers`;
    console.log(`Creating subscriber: ${email}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-AUTH-TOKEN': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || email,
          custom_fields: customFields
        }),
      });

      const data = await response.json();
      console.log(`MailRelay response for ${email}:`, data);

      if (!response.ok) {
        throw new Error(`MailRelay API error: ${JSON.stringify(data)}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Error creating subscriber ${email}:`, error);
      return { success: false, error: error.message };
    }
  }

  async deleteSubscriber(email: string) {
    const url = `${this.baseUrl}/subscribers/${email}`;
    console.log(`Deleting subscriber: ${email}`);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-AUTH-TOKEN': this.apiKey,
        },
      });

      if (response.status === 404) {
        console.log(`Subscriber ${email} not found in MailRelay, considering as success`);
        return { success: true, data: { message: 'Subscriber not found' } };
      }

      const data = await response.json();
      console.log(`MailRelay delete response for ${email}:`, data);

      if (!response.ok) {
        throw new Error(`MailRelay API error: ${JSON.stringify(data)}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Error deleting subscriber ${email}:`, error);
      return { success: false, error: error.message };
    }
  }
}

async function processPendingOperations() {
  console.log('Starting to process pending operations...');
  
  const { data: operations, error } = await supabase
    .from('mailrelay_sync_log')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error fetching pending operations:', error);
    return { success: false, error: error.message };
  }

  if (!operations || operations.length === 0) {
    console.log('No pending operations found');
    return { success: true, message: 'No pending operations' };
  }

  console.log(`Found ${operations.length} pending operations`);
  const mailRelayAPI = new MailRelayAPI(mailrelayApiKey);
  
  let processed = 0;
  let errors = 0;

  for (const operation of operations) {
    try {
      console.log(`Processing operation ${operation.id}: ${operation.operation} for ${operation.request_data?.email}`);
      
      let result;
      
      if (operation.operation === 'create' || operation.operation === 'update') {
        result = await mailRelayAPI.createSubscriber(
          operation.request_data?.email,
          operation.request_data?.name || operation.request_data?.email,
          {
            cpf: operation.request_data?.cpf,
            user_type: operation.request_data?.user_type || 'newsletter',
            origin: operation.request_data?.origin || 'website'
          }
        );
      } else if (operation.operation === 'delete') {
        result = await mailRelayAPI.deleteSubscriber(operation.request_data?.email);
      } else {
        console.log(`Unknown operation: ${operation.operation}`);
        continue;
      }

      // Update operation status
      const updateData = {
        status: result.success ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
        response_data: result.data,
        error_message: result.success ? null : result.error
      };

      await supabase
        .from('mailrelay_sync_log')
        .update(updateData)
        .eq('id', operation.id);

      if (result.success) {
        processed++;
        console.log(`✓ Operation ${operation.id} completed successfully`);
      } else {
        errors++;
        console.error(`✗ Operation ${operation.id} failed: ${result.error}`);
      }

    } catch (error) {
      errors++;
      console.error(`Error processing operation ${operation.id}:`, error);
      
      await supabase
        .from('mailrelay_sync_log')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', operation.id);
    }
  }

  return {
    success: true,
    processed,
    errors,
    total: operations.length,
    message: `Processed ${processed} operations successfully, ${errors} errors`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${req.method} request to mailrelay-force-sync`);
    
    const result = await processPendingOperations();
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500,
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});