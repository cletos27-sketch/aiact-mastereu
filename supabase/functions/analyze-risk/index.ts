// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
// @ts-ignore
import { getCorsHeaders, handleOptions } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

serve(async (req: Request) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  // @ts-ignore
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // @ts-ignore
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    logStep("Function started");

    // 1. Autenticação do Usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");

    // LÓGICA DE DETECÇÃO FLEXÍVEL
const hasProhibited = triggeredQuestions.some(q => 
  q.riskType?.toLowerCase().includes('prohibited') || q.riskType?.toLowerCase().includes('proibido')
);

const hasHighRisk = triggeredQuestions.some(q => 
  q.riskType?.toLowerCase().includes('high') || q.riskType?.toLowerCase().includes('alto')
);

const hasLimitedRisk = triggeredQuestions.some(q => 
  q.riskType?.toLowerCase().includes('limited') || q.riskType?.toLowerCase().includes('limitado')
);

    // 4. Lógica de Hierarquia (O Risco mais alto define a classificação)
    let riskClassification: "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO" = "RISCO_MINIMO";
    let complianceScore = 90; // Valor padrão para risco mínimo

    if (hasProhibited) {
      riskClassification = "PROIBIDO";
      complianceScore = 0;
    } else if (hasHighRisk) {
      riskClassification = "ALTO_RISCO";
      complianceScore = 30;
    } else if (hasLimitedRisk) {
      riskClassification = "RISCO_LIMITADO";
      complianceScore = 60;
    } else if (hasOutOfScope || triggeredQuestions.length === 0) {
      riskClassification = "FORA_DE_ESCOPO";
      complianceScore = 100;
    }

    logStep("Analysis complete", { classification: riskClassification, score: complianceScore });

    // 5. Retorno para o Frontend (Ajustado para o Results.tsx)
    const responseData = {
      score: complianceScore, // O valor real (0, 30, 60, 90, 100)
      maxScore: 100,
      percentage: complianceScore,
      riskClassification: riskClassification,
      triggeredQuestions: triggeredQuestions,
      status: "success",
      timestamp: new Date().toISOString()
    };

    logStep("Sending response to frontend", responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR in analyze-risk", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
      status: 500,
    });
  }
});