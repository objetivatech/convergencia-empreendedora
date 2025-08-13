import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  observations?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "product" | "subscription" | "donation";
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASAAS-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasApiKey) {
      throw new Error("ASAAS_API_KEY is not configured");
    }

    // Create Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { customer, items, paymentMethod, totalValue }: {
      customer: CustomerData;
      items: CartItem[];
      paymentMethod: string;
      totalValue: number;
    } = await req.json();

    logStep("Received payment request", { 
      customerEmail: customer.email, 
      itemsCount: items.length, 
      totalValue,
      paymentMethod 
    });

    // Step 1: Create or get customer in ASAAS
    let asaasCustomerId;
    
    // Check if customer already exists in ASAAS
    const searchCustomerResponse = await fetch(
      `https://sandbox.asaas.com/api/v3/customers?email=${encodeURIComponent(customer.email)}`,
      {
        method: "GET",
        headers: {
          "access_token": asaasApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const searchResult = await searchCustomerResponse.json();
    
    if (searchResult.data && searchResult.data.length > 0) {
      asaasCustomerId = searchResult.data[0].id;
      logStep("Found existing customer", { asaasCustomerId });
    } else {
      // Create new customer
      const createCustomerResponse = await fetch("https://sandbox.asaas.com/api/v3/customers", {
        method: "POST",
        headers: {
          "access_token": asaasApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          cpfCnpj: customer.cpfCnpj,
          phone: customer.phone,
          address: customer.address,
          addressNumber: "S/N",
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
        }),
      });

      const newCustomer = await createCustomerResponse.json();
      if (!createCustomerResponse.ok) {
        throw new Error(`Failed to create customer: ${JSON.stringify(newCustomer)}`);
      }
      
      asaasCustomerId = newCustomer.id;
      logStep("Created new customer", { asaasCustomerId });
    }

    // Step 2: Calculate commission for ambassadors (if applicable)
    let totalCommission = 0;
    const commissionDetails = [];

    for (const item of items) {
      // Get product details to check commission rate
      const { data: product } = await supabaseClient
        .from("products")
        .select("commission_rate")
        .eq("id", item.id)
        .single();

      if (product && product.commission_rate) {
        const itemTotal = item.price * item.quantity;
        const itemCommission = (itemTotal * product.commission_rate) / 100;
        totalCommission += itemCommission;
        
        commissionDetails.push({
          productId: item.id,
          productName: item.name,
          commissionRate: product.commission_rate,
          commissionAmount: itemCommission,
        });
      }
    }

    // Step 3: Create payment in ASAAS
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const paymentData = {
      customer: asaasCustomerId,
      billingType: paymentMethod === "pix" ? "PIX" : 
                  paymentMethod === "credit_card" ? "CREDIT_CARD" : "BOLETO",
      value: totalValue,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Pedido - ${items.map(item => item.name).join(", ")}`,
      externalReference: `ECOMMERCE-${Date.now()}`,
      postalService: false,
    };

    if (customer.observations) {
      paymentData.description += ` - Obs: ${customer.observations}`;
    }

    logStep("Creating payment in ASAAS", paymentData);

    const createPaymentResponse = await fetch("https://sandbox.asaas.com/api/v3/payments", {
      method: "POST",
      headers: {
        "access_token": asaasApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const payment = await createPaymentResponse.json();
    if (!createPaymentResponse.ok) {
      throw new Error(`Failed to create payment: ${JSON.stringify(payment)}`);
    }

    logStep("Payment created successfully", { paymentId: payment.id, status: payment.status });

    // Step 4: Save transaction to database
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        asaas_payment_id: payment.id,
        amount: totalValue,
        commission_amount: totalCommission,
        type: items[0].type, // Use first item type as primary type
        status: "pending",
        currency: "BRL",
        asaas_webhook_data: {
          payment_data: payment,
          commission_details: commissionDetails,
          customer_data: customer,
          items: items,
        },
      })
      .select()
      .single();

    if (transactionError) {
      logStep("Error saving transaction", transactionError);
      throw new Error(`Failed to save transaction: ${transactionError.message}`);
    }

    logStep("Transaction saved to database", { transactionId: transaction.id });

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      orderId: transaction.id,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      pixQrCode: payment.pixQrCode,
      pixCopiaECola: payment.pixCopiaECola,
      bankSlipUrl: payment.bankSlipUrl,
      status: payment.status,
      dueDate: payment.dueDate,
      totalValue: payment.value,
      commission: totalCommission,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-asaas-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});