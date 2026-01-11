import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PURCHASE] ${step}${detailsStr}`);
};

// Both prices unlock the Compliance Pack (TEST MODE)
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check for active purchase
    const { data: activePurchases, error: activeError } = await supabaseClient
      .from("user_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", VALID_PRODUCT_ID)
      .eq("status", "paid")
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
