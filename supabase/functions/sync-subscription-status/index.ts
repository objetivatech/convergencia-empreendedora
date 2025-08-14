import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SupabaseUserSubscription {
  id: string;
  external_subscription_id: string;
  status: string;
  user_id: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[SYNC-SUBSCRIPTION] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verificar se é uma requisição autenticada
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Inicializar clientes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')!;
    
    if (!asaasApiKey) {
      throw new Error('ASAAS API key not configured');
    }

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obter usuário autenticado
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    logStep("User authenticated", { userId: user.id });

    // Buscar assinaturas pendentes do usuário
    const { data: pendingSubscriptions, error: fetchError } = await supabaseService
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (fetchError) {
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
    }

    logStep("Subscriptions found", { count: subscriptions?.length });

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No subscriptions found',
        updated: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updatedCount = 0;
    let deletedCount = 0;

    // Verificar cada assinatura no ASAAS
    for (const subscription of subscriptions as SupabaseUserSubscription[]) {
      if (!subscription.external_subscription_id) {
        logStep("Subscription without external ID, skipping", { id: subscription.id });
        continue;
      }

      try {
        // Verificar status no ASAAS
        const asaasUrl = `https://www.asaas.com/api/v3/subscriptions/${subscription.external_subscription_id}`;
        const asaasResponse = await fetch(asaasUrl, {
          method: "GET",
          headers: {
            "access_token": asaasApiKey,
            "Content-Type": "application/json",
          },
        });

        if (asaasResponse.status === 404) {
          // Subscription not found - check for individual payment
          logStep("Subscription not found, checking for individual payment");
          
          // Search for payment by externalReference
          const paymentResponse = await fetch(
            `https://www.asaas.com/api/v3/payments?externalReference=${subscription.external_subscription_id}`,
            {
              headers: {
                'access_token': asaasApiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            if (paymentResult.data && paymentResult.data.length > 0) {
              const payment = paymentResult.data[0];
              logStep("Found individual payment", { paymentId: payment.id, status: payment.status });
              
              // Map payment status
              let newStatus = subscription.status;
              switch (payment.status) {
                case 'CONFIRMED':
                case 'RECEIVED':
                  newStatus = 'active';
                  break;
                case 'PENDING':
                  newStatus = 'pending';
                  break;
                case 'OVERDUE':
                  newStatus = 'overdue';
                  break;
                default:
                  newStatus = 'expired';
              }

              if (newStatus !== subscription.status) {
                logStep("Updating subscription status based on payment", { 
                  subscriptionId: subscription.id, 
                  oldStatus: subscription.status, 
                  newStatus 
                });

                const { error: updateError } = await supabaseService
                  .from('user_subscriptions')
                  .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', subscription.id);

                if (updateError) {
                  logStep("Error updating subscription", { error: updateError.message });
                } else {
                  updatedCount++;
                  logStep("Subscription updated successfully");
                }
              }
              continue;
            }
          }

          // If neither subscription nor payment found, delete
          logStep("Neither subscription nor payment found in ASAAS, deleting", { 
            subscriptionId: subscription.id,
            externalId: subscription.external_subscription_id 
          });

          const { error: deleteError } = await supabaseService
            .from('user_subscriptions')
            .delete()
            .eq('id', subscription.id);

          if (deleteError) {
            logStep("Error deleting subscription", { error: deleteError.message });
          } else {
            deletedCount++;
            logStep("Subscription deleted successfully");
          }
          continue;
        }

        if (!asaasResponse.ok) {
          logStep("Error checking ASAAS subscription", { 
            status: asaasResponse.status,
            subscriptionId: subscription.external_subscription_id 
          });
          continue;
        }

        const asaasData = await asaasResponse.json();
        logStep("ASAAS subscription status", { 
          externalId: subscription.external_subscription_id,
          status: asaasData.status 
        });

        // Atualizar status se diferente
        if (asaasData.status && asaasData.status !== subscription.status) {
          const newStatus = asaasData.status.toLowerCase();
          
          logStep("Updating subscription status", { 
            subscriptionId: subscription.id,
            oldStatus: subscription.status,
            newStatus: newStatus 
          });

          const { error: updateError } = await supabaseService
            .from('user_subscriptions')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          if (updateError) {
            logStep("Error updating subscription", { error: updateError.message });
          } else {
            updatedCount++;
            logStep("Subscription updated successfully");
          }
        }

      } catch (error) {
        logStep("Error processing subscription", { 
          subscriptionId: subscription.id,
          error: error.message 
        });
      }
    }

    logStep("Sync completed", { 
      totalProcessed: subscriptions.length,
      updated: updatedCount,
      deleted: deletedCount 
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Sync completed: ${updatedCount} updated, ${deletedCount} deleted`,
      updated: updatedCount,
      deleted: deletedCount,
      total: subscriptions.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("Function error", { error: error.message });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});