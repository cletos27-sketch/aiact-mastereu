// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

interface QuestionData {
  id: number;
  risk_level: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 2. Receber dados do Frontend (esperando 'answers')
    const body = await req.json().catch(() => ({}));
    const answers = body.answers || []; 

    if (!Array.isArray(answers)) {
        throw new Error("Invalid input format: 'answers' must be an array.");
    }

    // 3. Buscar informações das questões no Banco de Dados
    // NOTE: Assuming 'risk_questions' table exists and contains 'id' and 'risk_level'
    const { data: allQuestions, error: dbError } = await supabaseClient
      .from('risk_questions')
      .select('id, risk_level');

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 4. Filtrar questões ativadas (Sim)
    const triggered = (allQuestions || []).filter((q: any) => 
      answers.some((a: any) => String(a.questionId) === String(q.id) && a.answer === true)
    );

    // 5. Lógica de Score
    let complianceScore = 90;
    let riskClassification = "RISCO_MINIMO";

    logStep("Questões ativadas", triggered);

    const levels = triggered.map((q: QuestionData) => String(q.risk_level).toLowerCase().trim());
    
    if (levels.includes('prohibited') || levels.includes('proibido')) {
      complianceScore = 0;
      riskClassification = "PROIBIDO";
    } else if (levels.includes('high') || levels.includes('alto')) {
      complianceScore = 30;
      riskClassification = "ALTO_RISCO";
    } else if (levels.includes('limited') || levels.includes('limitado')) {
      complianceScore = 60;
      riskClassification = "RISCO_LIMITADO";
    } else if (triggered.length === 0) {
      complianceScore = 100;
      riskClassification = "FORA_DE_ESCOPO";
    }

    logStep("Analysis complete", { classification: riskClassification, score: complianceScore });

    // 6. Retorno Final Consolidado
    const finalResponse = {
      score: complianceScore,
      riskClassification: riskClassification,
      // Retornando as questões ativadas para o frontend
      triggeredQuestions: triggered.map((q: QuestionData) => ({ id: q.id, risk_level: q.risk_level }))
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