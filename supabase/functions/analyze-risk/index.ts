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


  if (!supabaseUrl || !supabaseAnonKey) {

    logStep("ERROR: Missing Supabase environment variables");

    return new Response(JSON.stringify({ error: "Missing environment variables" }), {

      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },

      status: 500,

    });

  }



  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);



try {
    const { responses, questions: clientQuestions } = await req.json();
    if (!responses || !clientQuestions) throw new Error("Dados não fornecidos");

    let hasProhibited = false;
    let hasHighRisk = false;
    let hasLimitedRisk = false;
    let hasOutOfScope = false;
    const triggeredQuestions = [];

    const user = data.user;

    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });



    const { responses, questions: clientQuestions } = await req.json(); // Recebe o array de questions

    if (!responses || !clientQuestions) throw new Error("No responses or questions provided");

    logStep("Received data", { responsesCount: Object.keys(responses).length, questionsCount: clientQuestions.length });



    let riskScore = 0;

    let riskClassification: "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO" = "RISCO_MINIMO";

    const triggeredQuestions: Array<{ question: string; riskType: "prohibited" | "high" | "limited" | "out_of_scope"; }> = [];



    // Prioridade de classificação: PROIBIDO > ALTO_RISCO > RISCO_LIMITADO > FORA_DE_ESCOPO > RISCO_MINIMO

    let hasProhibited = false;

    let hasHighRisk = false;

    let hasLimitedRisk = false;

    let hasOutOfScope = false;



    for (const q of clientQuestions) {

      const questionKey = `q${q.id}`;

      if (responses[questionKey] === "yes") {

        triggeredQuestions.push({

          question: questionKey,

          riskType: q.riskType,

        });



        if (q.riskType === "prohibited") {

          hasProhibited = true;

          riskScore += 100; // Pontuação alta para proibido

        } else if (q.riskType === "high") {

          hasHighRisk = true;

          riskScore += 50; // Pontuação média-alta para alto risco

        } else if (q.riskType === "limited") {

          hasLimitedRisk = true;

          riskScore += 10; // Pontuação baixa para risco limitado

        } else if (q.riskType === "out_of_scope") {

          hasOutOfScope = true;

        }

      }

    }



    // Determinar a classificação final com base na prioridade

    if (hasOutOfScope) {

      riskClassification = "FORA_DE_ESCOPO";

      riskScore = 0; // Se está fora de escopo, não há risco pelo AI Act

      // Limpar triggeredQuestions se for fora de escopo, exceto a própria pergunta de fora de escopo

      triggeredQuestions.length = 0;

      const outOfScopeQ = clientQuestions.find((q: any) => q.riskType === "out_of_scope" && responses[`q${q.id}`] === "yes");

      if (outOfScopeQ) {

        triggeredQuestions.push({ question: `q${outOfScopeQ.id}`, riskType: "out_of_scope" });

      }

    } else if (hasProhibited) {

      riskClassification = "PROIBIDO";

    } else if (hasHighRisk) {

      riskClassification = "ALTO_RISCO";

    } else if (hasLimitedRisk) {

      riskClassification = "RISCO_LIMITADO";

    } else if (riskScore > 0) {

      riskClassification = "RISCO_MINIMO"; // Se houver respostas 'sim' mas não em categorias de risco mais altas

    } else {

      riskClassification = "RISCO_MINIMO"; // Padrão se nenhuma pergunta 'sim' ou nenhum trigger específico

    }



    // Garantir que o riskScore não exceda o máximo

    const maxScore = 100;

    const finalRiskScore = Math.min(riskScore, maxScore);

    const percentage = (finalRiskScore / maxScore) * 100;



    return new Response(JSON.stringify({

      riskScore: { score: finalRiskScore, maxScore: maxScore, percentage: percentage },

      riskClassification,

      triggeredQuestions,

    }), {

      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },

      status: 200,

    });

  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : String(error);

    logStep("ERROR in analyze-risk", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {

      headers: { ...getCorsHeaders(), "Content-Type": "application/json" },

      status: 500,

    });

  }

});