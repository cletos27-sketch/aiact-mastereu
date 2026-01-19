import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PURCHASE] ${step}${detailsStr}`);
};

// Product ID for Compliance Pack (LIVE MODE)
const VALID_PRODUCT_ID = "prod_TlXNDRDgiLZ09U";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    logStep("ERROR: Missing Supabase environment variables");
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

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

    // First, check for active purchase (accept both "paid" and "active" for backward compatibility)
    const { data: activePurchases, error: activeError } = await supabaseClient
      .from("user_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", VALID_PRODUCT_ID)
      .in("status", ["paid", "active"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (activeError) {
      logStep("Error checking active purchases", { error: activeError });
      throw new Error("Failed to check purchase status");
    }

    // If no active purchase, check for payment_failed status
    let purchase = activePurchases?.[0] || null;
    let status = purchase ? "paid" : null;

    if (!purchase) {
      const { data: failedPurchases, error: failedError } = await supabaseClient
        .from("user_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", VALID_PRODUCT_ID)
        .eq("status", "payment_failed")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!failedError && failedPurchases && failedPurchases.length > 0) {
        purchase = failedPurchases[0];
        status = "payment_failed";
      }
    }

    const hasCompliancePack = status === "paid";
    
    logStep("Purchase check complete", { 
      hasCompliancePack, 
      status,
      priceId: purchase?.price_id 
    });

    return new Response(JSON.stringify({ 
      hasCompliancePack,
      status,
      purchase: purchase
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});