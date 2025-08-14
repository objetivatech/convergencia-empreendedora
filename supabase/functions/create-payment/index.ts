import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentData {
  type: 'subscription' | 'product' | 'donation' | 'community';
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  customerData: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    address?: {
      street: string;
      number: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  // Para assinaturas
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  // Para produtos
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  // Para doações
  amount?: number;
  // Dados do cartão (se aplicável)
  cardData?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

function logStep(step: string, details?: any) {
  console.log(`[CREATE-PAYMENT] ${step}`, details ? JSON.stringify(details) : '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) {
      throw new Error('ASAAS API key not configured');
    }
    logStep("ASAAS API key verified");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const paymentData: PaymentData = await req.json();
    logStep("Payment data received", paymentData);

    // Buscar ou criar cliente no ASAAS
    let customerId: string;
    
    // Primeiro, buscar cliente existente
    const searchCustomerUrl = `https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(paymentData.customerData.email)}`;
    const searchResponse = await fetch(searchCustomerUrl, {
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
    });

    const searchResult = await searchResponse.json();
    
    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Criar novo cliente
      const createCustomerUrl = "https://www.asaas.com/api/v3/customers";
      const customerData: any = {
        name: paymentData.customerData.name,
        email: paymentData.customerData.email,
        cpfCnpj: paymentData.customerData.cpfCnpj,
      };

      if (paymentData.customerData.phone) {
        customerData.phone = paymentData.customerData.phone;
      }

      if (paymentData.customerData.address) {
        customerData.address = paymentData.customerData.address.street;
        customerData.addressNumber = paymentData.customerData.address.number;
        customerData.province = paymentData.customerData.address.city;
        customerData.city = paymentData.customerData.address.city;
        customerData.state = paymentData.customerData.address.state;
        customerData.postalCode = paymentData.customerData.address.postalCode;
      }

      const customerResponse = await fetch(createCustomerUrl, {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const customerResult = await customerResponse.json();
      if (!customerResponse.ok) {
        throw new Error(`Failed to create customer: ${JSON.stringify(customerResult)}`);
      }

      customerId = customerResult.id;
      logStep("New customer created", { customerId });
    }

    // Processar diferentes tipos de pagamento
    let value: number;
    let description: string;
    let externalReference: string;
    let subscriptionId: string | null = null;

    switch (paymentData.type) {
      case 'subscription':
        // Buscar dados do plano
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', paymentData.planId)
          .eq('is_active', true)
          .single();

        if (planError || !plan) {
          throw new Error('Plan not found or inactive');
        }

        value = paymentData.billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
        description = `${plan.display_name} - ${paymentData.billingCycle === 'yearly' ? 'Anual' : 'Mensal'}`;
        
        // Criar assinatura no ASAAS se for subscription recorrente
        const subscriptionData: any = {
          customer: customerId,
          billingType: paymentData.paymentMethod,
          value: value,
          nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: description,
          cycle: paymentData.billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY',
        };

        const subscriptionResponse = await fetch("https://www.asaas.com/api/v3/subscriptions", {
          method: 'POST',
          headers: {
            'access_token': asaasApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionData),
        });

        const subscriptionResult = await subscriptionResponse.json();
        if (!subscriptionResponse.ok) {
          throw new Error(`Failed to create subscription: ${JSON.stringify(subscriptionResult)}`);
        }

        subscriptionId = subscriptionResult.id;
        externalReference = subscriptionId;
        logStep("ASAAS subscription created", { subscriptionId, status: subscriptionResult.status });
        break;

      case 'product':
        if (!paymentData.items || paymentData.items.length === 0) {
          throw new Error('No items provided for product purchase');
        }
        
        value = paymentData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        description = `Produtos: ${paymentData.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}`;
        externalReference = `product_${Date.now()}`;
        break;

      case 'donation':
        if (!paymentData.amount || paymentData.amount <= 0) {
          throw new Error('Invalid donation amount');
        }
        
        value = paymentData.amount;
        description = `Doação - R$ ${value.toFixed(2)}`;
        externalReference = `donation_${Date.now()}`;
        break;

      case 'community':
        // Lógica específica para assinaturas da comunidade
        value = paymentData.amount || 29.90; // Valor padrão da comunidade
        description = "Assinatura da Comunidade";
        externalReference = `community_${Date.now()}`;
        break;

      default:
        throw new Error('Invalid payment type');
    }

    logStep("Payment details calculated", { value, description, type: paymentData.type });

    // Criar pagamento no ASAAS
    const createPaymentUrl = "https://www.asaas.com/api/v3/payments";
    const asaasPaymentData: any = {
      customer: customerId,
      billingType: paymentData.paymentMethod,
      value: value,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: description,
      externalReference: externalReference,
    };

    // Configurações específicas por método de pagamento
    switch (paymentData.paymentMethod) {
      case 'PIX':
        // PIX não precisa de configurações extras, o ASAAS gera automaticamente
        break;

      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        if (!paymentData.cardData) {
          throw new Error('Card data required for card payments');
        }
        
        asaasPaymentData.creditCard = {
          holderName: paymentData.cardData.holderName,
          number: paymentData.cardData.number,
          expiryMonth: paymentData.cardData.expiryMonth,
          expiryYear: paymentData.cardData.expiryYear,
          ccv: paymentData.cardData.ccv,
        };

        asaasPaymentData.creditCardHolderInfo = {
          name: paymentData.customerData.name,
          email: paymentData.customerData.email,
          cpfCnpj: paymentData.customerData.cpfCnpj,
          phone: paymentData.customerData.phone || '',
          postalCode: paymentData.customerData.address?.postalCode || '',
          addressNumber: paymentData.customerData.address?.number || '',
        };
        break;

      case 'BOLETO':
        // Boleto com prazo de 3 dias
        asaasPaymentData.dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }

    logStep("Creating payment in ASAAS", asaasPaymentData);

    const paymentResponse = await fetch(createPaymentUrl, {
      method: 'POST',
      headers: {
        'access_token': asaasApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asaasPaymentData),
    });

    const paymentResult = await paymentResponse.json();
    logStep("ASAAS payment response", { status: paymentResponse.status, result: paymentResult });
    
    if (!paymentResponse.ok) {
      logStep("ASAAS payment error", { 
        status: paymentResponse.status, 
        statusText: paymentResponse.statusText,
        error: paymentResult 
      });
      throw new Error(`Failed to create payment: ${JSON.stringify(paymentResult)}`);
    }

    logStep("Payment created in ASAAS", { paymentId: paymentResult.id, status: paymentResult.status });

    // Salvar transação no banco
    const transactionData: any = {
      customer_id: user.id,
      amount: value,
      currency: 'BRL',
      status: 'pending',
      type: paymentData.type,
      asaas_payment_id: paymentResult.id,
    };

    if (paymentData.type === 'product' && paymentData.items) {
      transactionData.product_id = paymentData.items[0].id; // Para compatibilidade
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      logStep("Error saving transaction", transactionError);
      throw new Error(`Failed to save transaction: ${transactionError.message}`);
    }

    logStep("Transaction saved to database", { transactionId: transaction.id });

    // Para assinaturas, salvar também na tabela user_subscriptions
    if (paymentData.type === 'subscription' && subscriptionId) {
      const subscriptionRecord = {
        user_id: user.id,
        plan_id: paymentData.planId!,
        status: 'pending',
        billing_cycle: paymentData.billingCycle!,
        external_subscription_id: subscriptionId,
        payment_provider: 'asaas',
        starts_at: new Date().toISOString(),
        expires_at: paymentData.billingCycle === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionRecord);

      if (subscriptionError) {
        logStep("Error saving subscription", subscriptionError);
      } else {
        logStep("Subscription saved to database");
      }

      // Adicionar role de business_owner
      try {
        await supabase.rpc('add_user_role', {
          user_uuid: user.id,
          new_role: 'business_owner'
        });
        logStep("Business owner role added successfully");
      } catch (roleError) {
        logStep("Error adding business owner role", roleError);
      }
    }

    // Preparar resposta com dados específicos do método de pagamento
    const responseData: any = {
      success: true,
      paymentId: paymentResult.id,
      transactionId: transaction.id,
      status: paymentResult.status,
      value: value,
      paymentMethod: paymentData.paymentMethod,
    };

    // Dados específicos por método de pagamento
    switch (paymentData.paymentMethod) {
      case 'PIX':
        responseData.pixQrCode = paymentResult.qrCode?.payload;
        responseData.pixCode = paymentResult.qrCode?.payload;
        responseData.pixExpirationDate = paymentResult.qrCode?.expirationDate;
        break;

      case 'BOLETO':
        responseData.boletoUrl = paymentResult.bankSlipUrl;
        responseData.barCode = paymentResult.identificationField;
        responseData.dueDate = paymentResult.dueDate;
        break;

      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        responseData.installmentNumber = paymentResult.installmentNumber;
        responseData.transactionReceiptUrl = paymentResult.transactionReceiptUrl;
        break;
    }

    if (paymentResult.invoiceUrl) {
      responseData.invoiceUrl = paymentResult.invoiceUrl;
    }

    logStep("Payment process completed successfully");

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("Error in create-payment function", { 
      message: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    console.error('Error in create-payment function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});