import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, handleOptions } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions(req);

  try {
    logStep("Function started");

    // Configuração do Cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Autenticação do Usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");

    // 2. Receber dados do Frontend
    const { answers } = await req.json();
    logStep("Answers received", { count: answers?.length });

    // 3. Buscar informações das questões no Banco de Dados
    // Usando os nomes reais: question_text e risk_level
    const { data: allQuestions, error: dbError } = await supabaseClient
      .from('risk_questions')
      .select('id, question_text, risk_level');

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 4. Filtrar apenas as questões respondidas como "SIM" (true)
    const triggeredQuestions = allQuestions.filter((q: any) => 
      answers.some((a: any) => a.questionId === q.id && a.answer === true)
    );

    // 5. LÓGICA DE DETECÇÃO (Corrigida)
    const hasProhibited = triggeredQuestions.some((q: any) => 
      q.risk_level?.toLowerCase().includes('prohibited') || q.risk_level?.toLowerCase().includes('proibido')
    );

    const hasHighRisk = triggeredQuestions.some((q: any) => 
      q.risk_level?.toLowerCase().includes('high') || q.risk_level?.toLowerCase().includes('alto')
    );

    const hasLimitedRisk = triggeredQuestions.some((q: any) => 
      q.risk_level?.toLowerCase().includes('limited') || q.risk_level?.toLowerCase().includes('limitado')
    );

    // Verificação de "Fora de Escopo" ou "Risco Mínimo"
    const hasTriggeredAnything = triggeredQuestions.length > 0;

    // 6. Lógica de Hierarquia (Score)
    let riskClassification: "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO" = "RISCO_MINIMO";
    let complianceScore = 90; 

    if (hasProhibited) {
      riskClassification = "PROIBIDO";
      complianceScore = 0;
    } else if (hasHighRisk) {
      riskClassification = "ALTO_RISCO";
      complianceScore = 30;
    } else if (hasLimitedRisk) {
      riskClassification = "RISCO_LIMITADO";
      complianceScore = 60;
    } else if (!hasTriggeredAnything) {
      // Se nenhuma pergunta de risco foi marcada como SIM
      riskClassification = "FORA_DE_ESCOPO";
      complianceScore = 100;
    }

    logStep("Analysis complete", { classification: riskClassification, score: complianceScore });

    // 7. Salvar o Diagnóstico no Banco de Dados (Fundamental para o Dashboard)
    const { data: assessment, error: insertError } = await supabaseClient
      .from('risk_assessments')
      .insert({
        user_id: user.id,
        risk_score: complianceScore,
        risk_classification: riskClassification,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) logStep("Warning: Could not save assessment", insertError);

    // 8. Retorno para o Frontend
    const responseData = {
      score: complianceScore,
      maxScore: 100,
      percentage: complianceScore,
      riskClassification: riskClassification,
      triggeredQuestions: triggeredQuestions,
      status: "success",
      timestamp: new Date().toISOString()
    };

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