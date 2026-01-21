import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-RISK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // CORREÇÃO: Declaramos o cliente apenas UMA vez
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Autenticação do Usuário
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const { data: userData } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = userData?.user?.id;
    }

    // 2. Receber dados do Frontend (com trava de segurança)
    const body = await req.json().catch(() => ({}));
    const answers = body.answers || [];

    // 3. Buscar informações das questões no Banco de Dados
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

    const levels = triggered.map((q: any) => String(q.risk_level).toLowerCase().trim());
    
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

    // 6. Salvar Resultado com tratamento de erro
    if (userId) {
      const { error: insertError } = await supabaseClient.from('risk_assessments').insert({
        user_id: userId,
        risk_score: complianceScore,
        risk_classification: riskClassification
      });
      if (insertError) logStep("Warning: Could not save assessment", insertError);
    }      

    // 8. Retorno Final Consolidado
    const finalResponse = {
      score: complianceScore,
      riskClassification: riskClassification,
      questionsData: answers
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