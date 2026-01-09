import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Question {
  id: number;
  question: string;
  category: string;
  selectedOption: string;
  riskWeight: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, questions, riskScore } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a detailed prompt with the user's responses
    const answersDetails = questions.map((q: Question) => {
      return `- ${q.category} | ${q.question}: ${q.selectedOption} (peso de risco: ${q.riskWeight}/5)`;
    }).join("\n");

    const systemPrompt = `Você é um especialista jurídico em regulamentação de Inteligência Artificial, especialmente no EU AI Act (Regulamento UE 2024/1689). 

Sua tarefa é analisar as respostas de um questionário de avaliação de risco de sistemas de IA e fornecer:
1. A classificação de risco exata conforme o EU AI Act (Proibido, Alto Risco, Risco Limitado ou Risco Mínimo)
2. Uma justificativa jurídica breve e precisa baseada nos artigos e anexos relevantes do EU AI Act

Critérios do EU AI Act 2024/2026:
- PROIBIDO (Artigo 5): Sistemas de identificação biométrica em tempo real em espaços públicos, pontuação social, manipulação subliminar, exploração de vulnerabilidades
- ALTO RISCO (Anexo III): Biometria, infraestruturas críticas, educação, emprego, serviços essenciais, aplicação da lei, migração, justiça
- RISCO LIMITADO (Artigo 50): Sistemas que interagem com pessoas, geram conteúdo sintético, ou fazem categorização de emoções - requerem obrigações de transparência
- RISCO MÍNIMO: Todos os outros sistemas de IA - sem obrigações específicas além de boas práticas

Prazos importantes:
- Fevereiro 2025: Proibições entram em vigor
- Agosto 2025: Obrigações de literacia em IA (Artigo 4)
- Agosto 2026: Maioria das obrigações para sistemas de alto risco`;

    const userPrompt = `Analise as seguintes respostas do questionário de classificação de risco de IA:

PONTUAÇÃO DE RISCO CALCULADA: ${riskScore.score}/${riskScore.maxScore} (${riskScore.percentage}%)

RESPOSTAS DO QUESTIONÁRIO:
${answersDetails}

Por favor, forneça:
1. CLASSIFICAÇÃO: [Proibido/Alto Risco/Risco Limitado/Risco Mínimo]
2. JUSTIFICATIVA JURÍDICA: Uma explicação de 2-3 parágrafos baseada nos artigos e anexos específicos do EU AI Act que fundamentam esta classificação.
3. ARTIGOS RELEVANTES: Liste os artigos e anexos do EU AI Act aplicáveis.
4. AÇÕES PRIORITÁRIAS: Liste 3-5 ações imediatas que a organização deve tomar.

Responda em português de Portugal.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Análise não disponível.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-risk function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
