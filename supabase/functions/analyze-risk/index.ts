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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
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
      console.error("JSON parse error:", parseError, "Content:", content);
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
        fullAnalysis: content || "Análise detalhada não disponível. Por favor, consulte um especialista jurídico."
      };
    }

    return new Response(JSON.stringify(analysisResult), {
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
