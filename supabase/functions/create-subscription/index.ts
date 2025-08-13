import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionData {
  planId: string;
  billingCycle: 'monthly' | 'yearly' | 'semestral';
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) {
      throw new Error("ASAAS_API_KEY not configured");
    }
    logStep("ASAAS API key verified");

    // Inicializar Supabase com service role para acessar dados
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    // Usar client com anon key para autenticação do usuário
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Obter dados da requisição
    const { planId, billingCycle }: SubscriptionData = await req.json();
    logStep("Request data received", { planId, billingCycle });

    // Buscar detalhes do plano
    const { data: plan, error: planError } = await supabaseService
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }
    logStep("Plan details retrieved", { planName: plan.name, displayName: plan.display_name });

    // Calcular valor baseado no ciclo de cobrança
    let value: number;
    let description: string;
    
    switch (billingCycle) {
      case 'monthly':
        value = plan.price_monthly;
        description = `${plan.display_name} - Mensal`;
        break;
      case 'yearly':
        value = plan.price_yearly;
        description = `${plan.display_name} - Anual`;
        break;
      case 'semestral':
        value = plan.features.semestral_price || (plan.price_monthly * 6);
        description = `${plan.display_name} - Semestral`;
        break;
      default:
        throw new Error("Invalid billing cycle");
    }

    logStep("Price calculated", { value, description, billingCycle });

    // Verificar se o cliente já existe no ASAAS
    const searchCustomerUrl = `https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(user.email)}`;
    const searchResponse = await fetch(searchCustomerUrl, {
      method: "GET",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
    });

    const searchData = await searchResponse.json();
    let customerId: string;

    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Criar novo cliente no ASAAS
      const createCustomerUrl = "https://www.asaas.com/api/v3/customers";
      const customerData = {
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        cpfCnpj: user.user_metadata?.cpf || undefined,
        phone: user.user_metadata?.phone || undefined,
      };

      const customerResponse = await fetch(createCustomerUrl, {
        method: "POST",
        headers: {
          "access_token": asaasApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const customerResult = await customerResponse.json();
      if (!customerResponse.ok) {
        throw new Error(`Failed to create customer: ${customerResult.errors?.[0]?.description || 'Unknown error'}`);
      }

      customerId = customerResult.id;
      logStep("New customer created", { customerId });
    }

    // Determinar ciclo de cobrança para o ASAAS
    let cycle: string;
    switch (billingCycle) {
      case 'monthly':
        cycle = 'MONTHLY';
        break;
      case 'yearly':
        cycle = 'YEARLY';
        break;
      case 'semestral':
        cycle = 'MONTHLY'; // Para semestral, vamos usar MONTHLY com valor total dividido por 6
        value = value / 6; // Dividir por 6 meses
        break;
    }

    // Criar assinatura no ASAAS
    const createSubscriptionUrl = "https://www.asaas.com/api/v3/subscriptions";
    const subscriptionData = {
      customer: customerId,
      billingType: "CREDIT_CARD", // Padrão cartão de crédito
      value: value,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      description: description,
      cycle: cycle,
      endDate: billingCycle === 'semestral' 
        ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 meses
        : undefined,
    };

    logStep("Creating subscription in ASAAS", subscriptionData);

    const subscriptionResponse = await fetch(createSubscriptionUrl, {
      method: "POST",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    const subscriptionResult = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      logStep("ASAAS subscription creation failed", subscriptionResult);
      throw new Error(`Failed to create subscription: ${subscriptionResult.errors?.[0]?.description || 'Unknown error'}`);
    }

    logStep("ASAAS subscription created successfully", { 
      subscriptionId: subscriptionResult.id,
      status: subscriptionResult.status 
    });

    // Como assinaturas não geram links de pagamento automaticamente,
    // vamos criar uma cobrança inicial para gerar o link de pagamento
    let paymentUrl = subscriptionResult.invoiceUrl;
    
    if (!paymentUrl) {
      logStep("No invoiceUrl found, creating initial payment");
      
      const createPaymentUrl = "https://www.asaas.com/api/v3/payments";
      const paymentData = {
        customer: customerId,
        billingType: "CREDIT_CARD",
        value: value,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        description: `${description} - Primeira cobrança`,
        externalReference: subscriptionResult.id, // Referência à assinatura
      };

      logStep("Creating initial payment", paymentData);

      const paymentResponse = await fetch(createPaymentUrl, {
        method: "POST",
        headers: {
          "access_token": asaasApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        logStep("ASAAS payment creation failed", paymentResult);
        throw new Error(`Failed to create payment: ${paymentResult.errors?.[0]?.description || 'Unknown error'}`);
      }

      paymentUrl = paymentResult.invoiceUrl;
      logStep("Initial payment created", { 
        paymentId: paymentResult.id,
        invoiceUrl: paymentResult.invoiceUrl 
      });
    }

    // Salvar assinatura no banco de dados (na tabela de assinaturas de usuário)
    const { error: insertError } = await supabaseService
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: 'pending',
        payment_provider: 'asaas',
        external_subscription_id: subscriptionResult.id,
        billing_cycle: billingCycle,
        starts_at: new Date().toISOString(),
        expires_at: billingCycle === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : billingCycle === 'semestral'
          ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    logStep("Subscription saved to database");

    // Adicionar role de business_owner ao usuário
    const { error: roleError } = await supabaseService.rpc('add_user_role', {
      user_uuid: user.id,
      new_role: 'business_owner'
    });

    if (roleError) {
      logStep("Error adding business_owner role", roleError);
    } else {
      logStep("Business owner role added successfully");
    }

    if (!paymentUrl) {
      throw new Error("Failed to generate payment URL");
    }

    return new Response(JSON.stringify({
      success: true,
      subscriptionId: subscriptionResult.id,
      paymentUrl: paymentUrl,
      status: subscriptionResult.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});