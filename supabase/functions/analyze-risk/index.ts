// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
// @ts-ignore
import { getCorsHeaders, handleOptions } from "../_shared/cors.ts";

serve(async (req: Request) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  // @ts-ignore
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // @ts-ignore
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { responses, questions: clientQuestions } = await req.json();
    if (!responses || !clientQuestions) throw new Error("Dados insuficientes");

    let hasProhibited = false;
    let hasHighRisk = false;
    let hasLimitedRisk = false;
    let hasOutOfScope = false;
    const triggeredQuestions = [];

    // 1. Mapear o que foi acionado
    for (const q of clientQuestions) {
      const questionKey = `q${q.id}`;
      if (responses[questionKey] === "yes") {
        triggeredQuestions.push({ question: questionKey, riskType: q.riskType });
        
        if (q.riskType === "prohibited") hasProhibited = true;
        else if (q.riskType === "high") hasHighRisk = true;
        else if (q.riskType === "limited") hasLimitedRisk = true;
        else if (q.riskType === "out_of_scope") hasOutOfScope = true;
      }
    }

    // 2. Determinar Classificação (Hierarquia AI Act)
    // A ordem importa: Proibido é o mais grave, Fora de Escopo é o mais leve.
    let riskClassification: "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO" = "RISCO_MINIMO";
    let complianceScore = 90; // Padrão Risco Mínimo

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

    return new Response(JSON.stringify({
      riskScore: { 
        score: complianceScore, 
        maxScore: 100, 
        percentage: complianceScore // Agora retorna o valor fixo que o Results.tsx espera
      },
      riskClassification,
      triggeredQuestions,
    }), {
      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },
      status: 500,
    });
  }
});