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

// Both prices unlock the Compliance Pack (PRODUCTION)
const VALID_PRODUCT_ID = "prod_TlXNDRDgiLZ09U";

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

    // Check if user has any paid purchase for the Compliance Pack product
    const { data: purchases, error } = await supabaseClient
      .from("user_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", VALID_PRODUCT_ID)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      logStep("Error checking purchases", { error });
      throw new Error("Failed to check purchase status");
    }

    const hasCompliancePack = purchases && purchases.length > 0;
    const purchase = hasCompliancePack ? purchases[0] : null;
    
    logStep("Purchase check complete", { 
      hasCompliancePack, 
      purchaseCount: purchases?.length,
      priceId: purchase?.price_id 
    });

    return new Response(JSON.stringify({ 
      hasCompliancePack,
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
