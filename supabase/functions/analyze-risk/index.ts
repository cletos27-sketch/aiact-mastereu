// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
// @ts-ignore
import { corsHeaders, handleOptions } from "../_shared/cors.ts"; // Import atualizado

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

serve(async (req: Request) => {
  // Handle CORS preflight
  const optionsResponse = handleOptions(req);
  if (optionsResponse) {
    return optionsResponse;
  }

  // @ts-ignore
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // @ts-ignore
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

    const { responses } = await req.json();
    if (!responses) throw new Error("No responses provided");
    logStep("Received responses", { responsesCount: Object.keys(responses).length });

    // Simplified risk analysis logic (replace with actual AI Act logic)
    let riskScore = 0;
    let riskClassification = "RISCO_MINIMO";
    const triggeredQuestions: Array<{ question: string; legalReference: string; }> = [];

    // Example logic:
    if (responses.q1 === "yes") { // Example: System uses AI for critical infrastructure
      riskScore += 50;
      riskClassification = "ALTO_RISCO";
      triggeredQuestions.push({ question: "q1", legalReference: "Artigo 6, Anexo III" });
    }
    if (responses.q2 === "yes") { // Example: System uses biometric identification
      riskScore += 100;
      riskClassification = "PROIBIDO";
      triggeredQuestions.push({ question: "q2", legalReference: "Artigo 5" });
    }
    if (responses.q3 === "yes") { // Example: System interacts with humans
      riskScore += 10;
      if (riskClassification === "RISCO_MINIMO") riskClassification = "RISCO_LIMITADO";
      triggeredQuestions.push({ question: "q3", legalReference: "Artigo 52" });
    }
    if (responses.q4 === "yes") { // Example: System is for personal non-professional use
      riskClassification = "FORA_DE_ESCOPO";
      riskScore = 0;
      triggeredQuestions.push({ question: "q4", legalReference: "Artigo 2(5)(c)" });
    }

    // Determine final classification based on score and specific triggers
    if (riskClassification === "PROIBIDO") {
      // Already set
    } else if (riskScore >= 70) {
      riskClassification = "ALTO_RISCO";
    } else if (riskScore >= 30) {
      riskClassification = "RISCO_LIMITADO";
    } else if (riskScore > 0) {
      riskClassification = "RISCO_MINIMO";
    } else {
      riskClassification = "RISCO_MINIMO"; // Default if no specific triggers
    }

    return new Response(JSON.stringify({
      riskScore: { score: riskScore, maxScore: 100, percentage: Math.min(100, riskScore) },
      riskClassification,
      triggeredQuestions,
      questionsData: Object.keys(responses).map(key => ({
        id: key,
        question: `Question ${key}`, // Placeholder
        category: "General", // Placeholder
        riskType: "low", // Placeholder
        legalReference: "N/A", // Placeholder
        answer: responses[key],
        triggersClassification: triggeredQuestions.some(q => q.question === key)
      }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in analyze-risk", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});