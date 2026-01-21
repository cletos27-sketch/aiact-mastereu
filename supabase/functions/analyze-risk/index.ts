// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"; // Removed unused import

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

interface TriggeredQuestion {
  id: number;
  riskType: string;
  legalReference: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1. Receber dados do Frontend (esperando 'triggeredQuestions')
    const body = await req.json().catch(() => ({}));
    const triggeredQuestions = body.triggeredQuestions as TriggeredQuestion[] || []; 

    if (!Array.isArray(triggeredQuestions)) {
        throw new Error("Invalid input format: 'triggeredQuestions' must be an array.");
    }

    // 2. Lógica de Score e Classificação
    let complianceScore = 90;
    let riskClassification = "RISCO_MINIMO";

    logStep("Questões ativadas", triggeredQuestions);

    const levels = triggeredQuestions.map(q => String(q.riskType).toLowerCase().trim());
    
    // Check for 'out_of_scope' first (Question 15)
    if (levels.includes('out_of_scope')) {
        complianceScore = 100;
        riskClassification = "FORA_DE_ESCOPO";
    } else if (levels.includes('prohibited')) {
      complianceScore = 0;
      riskClassification = "PROIBIDO";
    } else if (levels.includes('high')) {
      complianceScore = 30;
      riskClassification = "ALTO_RISCO";
    } else if (levels.includes('limited')) {
      complianceScore = 60;
      riskClassification = "RISCO_LIMITADO";
    } else if (triggeredQuestions.length === 0) {
      complianceScore = 100;
      riskClassification = "RISCO_MINIMO"; // If no questions answered 'yes', it's minimal risk
    }

    logStep("Analysis complete", { classification: riskClassification, score: complianceScore });

    // 3. Retorno Final Consolidado
    const finalResponse = {
      score: complianceScore,
      riskClassification: riskClassification,
      // Retornando as questões ativadas para o frontend (incluindo legalReference)
      triggeredQuestions: triggeredQuestions.map(q => ({ 
        id: q.id, 
        riskType: q.riskType,
        legalReference: q.legalReference
      }))
    };

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error("Erro fatal na função:", error.message);
    return new Response(
      JSON.stringify({ error: error.message, score: 0 }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});