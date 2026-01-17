/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference types="https://esm.sh/stripe@18.5.0" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.57.2" />
/// <reference types="https://deno.land/x/types/index.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Valid price configurations (LIVE MODE)
const VALID_PRICES = {
  "price_1So0IyIV86RXPoUIiR2PXhM5": { mode: "payment", product_id: "prod_TlXNDRDgiLZ09U", plan_type: "premium" }, // 499€ one-time
  "price_1So0IyIV86RXPoUIweuHHwNB": { mode: "subscription", product_id: "prod_TlXNDRDgiLZ09U", plan_type: "monthly" }, // 99€/month
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey) {
    logStep("ERROR: Missing Supabase or Stripe environment variables");
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = claimsData.claims.sub;
    const email = (claimsData.claims.email as string | undefined) ?? null;
    if (!email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId });

    // Parse request body for price_id
    let price_id = "price_1So0IyIV86RXPoUIiR2PXhM5"; // default to one-time payment (LIVE MODE)
    try {
      const body = await req.json();
      if (body.price_id && VALID_PRICES[body.price_id as keyof typeof VALID_PRICES]) {
        price_id = body.price_id;
      }
    } catch {
      // Use default price if no body provided
    }

    const priceConfig = VALID_PRICES[price_id as keyof typeof VALID_PRICES];
    if (!priceConfig) {
      throw new Response(JSON.stringify({ error: "Invalid price_id provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Use plan_type directly from priceConfig
    const plan_type = priceConfig.plan_type;

    logStep("Price selected", { price_id, mode: priceConfig.mode, plan_type });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://aiact-master.eu"; // Updated fallback to production domain

    // Create checkout session with appropriate mode
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : email,
      client_reference_id: userId, // CRITICAL: Pass user ID for webhook lookup
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: priceConfig.mode as "payment" | "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        user_id: userId,
        user_email: email,
        price_id: price_id,
        plan_type, // Now explicitly from priceConfig
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url, mode: priceConfig.mode });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    const status = errorMessage === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});