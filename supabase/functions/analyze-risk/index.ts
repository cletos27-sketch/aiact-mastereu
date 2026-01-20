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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Configuração do Cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Autenticação do Usuário
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const { data } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = data?.user?.id;
    }

    // 2. Receber dados do Frontend
    const body = await req.json().catch(() => ({}));
    const answers = body.answers || [];

    // 3. Buscar informações das questões no Banco de Dados
    // Usando os nomes reais: question_text e risk_level
    const { data: questions } = await supabaseClient
      .from('risk_questions')
      .select('id, risk_level');

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 4. Filtrar questões ativadas (Sim)
    const triggered = (questions || []).filter(q => 
      safeAnswers.some((a: any) => a.questionId === q.id && a.answer === true)
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

    // 5. Lógica de Score (Versão Robusta)
    let score = 90;
    let classification = "RISCO_MINIMO";

    // Debug: Vamos ver o que está a chegar (verifique os logs do Supabase depois)
    console.log("Questões ativadas:", JSON.stringify(triggered));

    const levels = triggered.map(t => String(t.risk_level).toLowerCase().trim());
    
    // Verificamos se alguma das questões ativadas tem o nível correspondente
    if (levels.includes('prohibited') || levels.includes('proibido')) {
      score = 0; 
      classification = "PROIBIDO";
    } else if (levels.includes('high') || levels.includes('alto')) {
      score = 30; 
      classification = "ALTO_RISCO";
    } else if (levels.includes('limited') || levels.includes('limitado')) {
      score = 60; 
      classification = "RISCO_LIMITADO";
    } else if (triggered.length === 0) {
      score = 100; 
      classification = "FORA_DE_ESCOPO";
    }

    logStep("Analysis complete", { classification: riskClassification, score: complianceScore });

    // 6. Salvar Resultado
    await supabaseClient.from('risk_assessments').insert({
      user_id: user.id,
      risk_score: score,
      risk_classification: classification
    });

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

    return new Response(JSON.stringify({ score, riskClassification: classification }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' },
      status: 200
    });

  } } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' },
      status: 500
    });
  }
)