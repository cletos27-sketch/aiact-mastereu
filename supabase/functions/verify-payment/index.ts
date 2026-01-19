import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey || !stripeSecretKey) {
    logStep("ERROR: Missing Supabase or Stripe environment variables");
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) {
      logStep("Authentication error", { error: authError.message });
      throw new Error(`Authentication error: ${authError.message}`);
    }
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { session_id } = await req.json();
    if (!session_id) throw new Error("No session_id provided");
    logStep("Verifying session", { session_id });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price"],
    });
    logStep("Session retrieved", { 
      status: session.payment_status, 
      customerId: session.customer,
      mode: session.mode,
      clientReferenceId: session.client_reference_id,
      customerEmail: session.customer_email
    });

    // Validate session ownership - ensure the authenticated user owns this session
    const sessionUserId = session.client_reference_id;
    const sessionEmail = session.customer_email;
    
    if (sessionUserId && sessionUserId !== user.id) {
      logStep("Session ownership mismatch by user ID", {
        sessionUserId,
        authenticatedUserId: user.id
      });
      return new Response(JSON.stringify({ 
        error: "Session does not belong to authenticated user" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    if (!sessionUserId && sessionEmail && sessionEmail !== user.email) {
      logStep("Session ownership mismatch by email", {
        sessionEmail,
        authenticatedEmail: user.email
      });
      return new Response(JSON.stringify({ 
        error: "Session does not belong to authenticated user" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    logStep("Session ownership verified", { 
      method: sessionUserId ? "user_id" : "email",
      match: true 
    });

    const isPaid = session.payment_status === "paid" || 
                   (session.mode === "subscription" && session.status === "complete");

    if (isPaid) {
      // Extract product and price info from the session
      const lineItem = session.line_items?.data[0];
      const price = lineItem?.price;
      const priceId = price?.id || session.metadata?.price_id || "unknown";
      const productId = typeof price?.product === "string" ? price.product : "prod_TlXNDRDgiLZ09U"; // LIVE MODE product
      const amount = session.amount_total || 0;
      const currency = session.currency || "eur";

      logStep("Extracting purchase details", { priceId, productId, amount, currency, mode: session.mode });

      // Record the purchase in the database using admin client to bypass RLS
      const { error: insertError } = await supabaseAdmin
        .from("user_purchases")
        .upsert({
          user_id: user.id,
          user_email: user.email,
          stripe_session_id: session_id,
          stripe_customer_id: session.customer as string,
          product_id: productId,
          price_id: priceId,
          amount: amount,
          currency: currency,
          status: "paid",
          purchased_at: new Date().toISOString(),
        }, {
          onConflict: "stripe_session_id"
        });

      if (insertError) {
        logStep("Error recording purchase", { error: insertError });
      } else {
        logStep("Purchase recorded successfully", { mode: session.mode });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        paid: true,
        message: "Payment verified and recorded",
        mode: session.mode,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      paid: false,
      message: "Payment not completed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});