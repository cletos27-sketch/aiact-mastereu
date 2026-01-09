import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const MAX_QUESTIONS = 50;
const MAX_STRING_LENGTH = 1000;
const MAX_REQUEST_SIZE = 100 * 1024; // 100KB

interface Question {
  id: number;
  question: string;
  category: string;
  selectedOption: string;
  riskWeight: number;
}

interface RiskScore {
  score: number;
  maxScore: number;
  percentage: number;
}

interface RequestBody {
  answers: Record<string, string>;
  questions: Question[];
  riskScore: RiskScore;
}

function validateRequest(body: unknown): { valid: true; data: RequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const { answers, questions, riskScore } = body as Record<string, unknown>;

  // Validate answers
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { valid: false, error: 'answers must be an object' };
  }

  // Validate questions array
  if (!Array.isArray(questions)) {
    return { valid: false, error: 'questions must be an array' };
  }

  if (questions.length > MAX_QUESTIONS) {
    return { valid: false, error: `questions array exceeds maximum of ${MAX_QUESTIONS} items` };
  }

  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== 'object') {
      return { valid: false, error: `questions[${i}] must be an object` };
    }

    if (typeof q.id !== 'number') {
      return { valid: false, error: `questions[${i}].id must be a number` };
    }

    if (typeof q.question !== 'string' || q.question.length > MAX_STRING_LENGTH) {
      return { valid: false, error: `questions[${i}].question must be a string with max ${MAX_STRING_LENGTH} chars` };
    }

    if (typeof q.category !== 'string' || q.category.length > MAX_STRING_LENGTH) {
      return { valid: false, error: `questions[${i}].category must be a string with max ${MAX_STRING_LENGTH} chars` };
    }

    if (typeof q.selectedOption !== 'string' || q.selectedOption.length > MAX_STRING_LENGTH) {
      return { valid: false, error: `questions[${i}].selectedOption must be a string with max ${MAX_STRING_LENGTH} chars` };
    }

    if (typeof q.riskWeight !== 'number' || q.riskWeight < 0 || q.riskWeight > 10) {
      return { valid: false, error: `questions[${i}].riskWeight must be a number between 0 and 10` };
    }
  }

  // Validate riskScore
  if (!riskScore || typeof riskScore !== 'object') {
    return { valid: false, error: 'riskScore must be an object' };
  }

  const rs = riskScore as Record<string, unknown>;
  if (typeof rs.score !== 'number' || typeof rs.maxScore !== 'number' || typeof rs.percentage !== 'number') {
    return { valid: false, error: 'riskScore must have score, maxScore, and percentage as numbers' };
  }

  return {
    valid: true,
    data: {
      answers: answers as Record<string, string>,
      questions: questions as Question[],
      riskScore: riskScore as RiskScore
    }
  };
}

// Sanitize string to prevent prompt injection
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, MAX_STRING_LENGTH);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Authentication failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // === REQUEST SIZE CHECK ===
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === INPUT VALIDATION ===
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { questions, riskScore } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a detailed prompt with sanitized user responses
    const answersDetails = questions.map((q: Question) => {
      const sanitizedCategory = sanitizeString(q.category);
      const sanitizedQuestion = sanitizeString(q.question);
      const sanitizedOption = sanitizeString(q.selectedOption);
      return `- ${sanitizedCategory} | ${sanitizedQuestion}: ${sanitizedOption} (peso de risco: ${q.riskWeight}/5)`;
    }).join("\n");

    const systemPrompt = `Você é um especialista jurídico em regulamentação de Inteligência Artificial, especialmente no EU AI Act (Regulamento UE 2024/1689). 

Sua tarefa é analisar as respostas de um questionário de avaliação de risco de sistemas de IA e fornecer uma análise estruturada em formato JSON.

Critérios do EU AI Act 2024/2026:
- PROIBIDO (Artigo 5): Sistemas de identificação biométrica em tempo real em espaços públicos, pontuação social, manipulação subliminar, exploração de vulnerabilidades
- ALTO (Anexo III): Biometria, infraestruturas críticas, educação, emprego, serviços essenciais, aplicação da lei, migração, justiça
- LIMITADO (Artigo 50): Sistemas que interagem com pessoas, geram conteúdo sintético, ou fazem categorização de emoções - requerem obrigações de transparência
- MÍNIMO: Todos os outros sistemas de IA - sem obrigações específicas além de boas práticas

IMPORTANTE: Responda APENAS com um objeto JSON válido, sem markdown ou texto adicional.`;

    const userPrompt = `Analise as seguintes respostas do questionário de classificação de risco de IA:

PONTUAÇÃO DE RISCO CALCULADA: ${riskScore.score}/${riskScore.maxScore} (${riskScore.percentage}%)

RESPOSTAS DO QUESTIONÁRIO:
${answersDetails}

Retorne APENAS um objeto JSON com esta estrutura exata:
{
  "riskClassification": "PROIBIDO" ou "ALTO" ou "LIMITADO" ou "MÍNIMO",
  "legalJustification": "Justificativa jurídica de 2-3 parágrafos baseada nos artigos específicos do EU AI Act",
  "relevantArticles": ["Artigo X", "Artigo Y", "Anexo Z"],
  "priorityActions": ["Ação 1", "Ação 2", "Ação 3", "Ação 4", "Ação 5"],
  "fullAnalysis": "Análise completa em texto corrido para exibição ao usuário"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Analysis service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysisResult;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error, using fallback");
      // Fallback structure based on score
      const classification = riskScore.percentage >= 75 ? "PROIBIDO" : 
                            riskScore.percentage >= 50 ? "ALTO" : 
                            riskScore.percentage >= 25 ? "LIMITADO" : "MÍNIMO";
      analysisResult = {
        riskClassification: classification,
        legalJustification: `Com base na pontuação de ${riskScore.percentage}%, o sistema foi classificado como ${classification}. Recomenda-se uma análise jurídica detalhada para confirmar esta classificação.`,
        relevantArticles: ["Artigo 5", "Artigo 6", "Anexo III"],
        priorityActions: [
          "Realizar avaliação de conformidade detalhada",
          "Documentar sistema de gestão de riscos",
          "Implementar supervisão humana adequada",
          "Preparar documentação técnica",
          "Estabelecer plano de literacia em IA"
        ],
        fullAnalysis: "Análise detalhada não disponível. Por favor, consulte um especialista jurídico."
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-risk function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
