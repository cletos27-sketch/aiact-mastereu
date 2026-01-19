import { jsPDF } from "jspdf";
import { toast } from "sonner"; // Import sonner toast

interface AssessmentData {
  risk_classification?: string;
  risk_score?: number;
  legal_justification?: string | null;
  relevant_articles?: string[] | null;
  priority_actions?: string[] | null;
}

export const generateAILiteracyGuidePDF = (assessmentData?: AssessmentData) => {
  try { // Adicionado bloco try-catch
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 0;
    const margin = 20; // Define margin here

    const addNewPage = () => {
      pdf.addPage();
      yPosition = 25;
    };

    const checkPageBreak = (neededSpace: number = 30) => {
      if (yPosition > pageHeight - neededSpace - 20) {
        addNewPage();
      }
    };

    const addHeader = (isFirstPage: boolean = false) => {
      // Navy blue header
      pdf.setFillColor(12, 25, 41);
      pdf.rect(0, 0, pageWidth, isFirstPage ? 55 : 25, "F");
      
      // Gold accent line
      pdf.setFillColor(212, 175, 55);
      pdf.rect(0, isFirstPage ? 55 : 25, pageWidth, 2, "F");
    };

    const addSectionTitle = (title: string, iconType?: "book" | "shield" | "alert" | "users" | "check") => {
      checkPageBreak(40);
      
      // Section background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 14, "F");
      
      // Left accent bar
      pdf.setFillColor(212, 175, 55);
      pdf.rect(margin - 5, yPosition - 5, 3, 14, "F");
      
      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 5, yPosition + 5);
      yPosition += 20;
    };

    const addSubsectionTitle = (title: string) => {
      checkPageBreak(25);
      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, yPosition);
      yPosition += 8;
    };

    const addParagraph = (text: string) => {
      checkPageBreak(20);
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      for (const line of lines) {
        checkPageBreak(8);
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 4;
    };

    const addBulletPoint = (text: string, indent: number = 0) => {
      checkPageBreak(15);
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const bulletX = margin + indent;
      const textX = bulletX + 8;
      const availableWidth = pageWidth - textX - margin;
      
      // Gold bullet
      pdf.setFillColor(212, 175, 55);
      pdf.circle(bulletX + 2, yPosition - 1.5, 1.5, "F");
      
      const lines = pdf.splitTextToSize(text, availableWidth);
      for (let i = 0; i < lines.length; i++) {
        checkPageBreak(8);
        pdf.text(lines[i], textX, yPosition);
        yPosition += 6;
      }
      yPosition += 2;
    };

    const addNumberedItem = (number: number, title: string, description: string) => {
      checkPageBreak(25);
      
      // Number circle
      pdf.setFillColor(12, 25, 41);
      pdf.circle(margin + 6, yPosition - 1, 6, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(number.toString(), margin + 4, yPosition + 1);
      
      // Title
      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 16, yPosition);
      yPosition += 7;
      
      // Description
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(description, pageWidth - margin - 36);
      for (const line of lines) {
        checkPageBreak(8);
        pdf.text(line, margin + 16, yPosition);
        yPosition += 5;
      }
      yPosition += 6;
    };

    const addHighlightBox = (title: string, content: string[], type: "info" | "warning" | "success" = "info") => {
      checkPageBreak(60);
      
      const boxHeight = 15 + content.length * 8;
      
      // Box background
      if (type === "warning") {
        pdf.setFillColor(254, 243, 199);
        pdf.setDrawColor(217, 119, 6);
      } else if (type === "success") {
        pdf.setFillColor(209, 250, 229);
        pdf.setDrawColor(22, 163, 74);
      } else {
        pdf.setFillColor(219, 234, 254);
        pdf.setDrawColor(59, 130, 246);
      }
      
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, "FD");
      
      yPosition += 8;
      
      // Title
      if (type === "warning") {
        pdf.setTextColor(146, 64, 14);
      } else if (type === "success") {
        pdf.setTextColor(21, 128, 61);
      } else {
        pdf.setTextColor(30, 64, 175);
      }
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 8, yPosition);
      yPosition += 8;
      
      // Content
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      for (const line of content) {
        pdf.text(line, margin + 8, yPosition);
        yPosition += 6;
      }
      
      yPosition += 10;
    };

    // ==================== PAGE 1: COVER ====================
    addHeader(true);
    
    // Main title
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("GUIA DE LITERACIA EM IA", margin, 30);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text("Artigo 4 — Regulamento Europeu de Inteligência Artificial", margin, 42);
    
    yPosition = 75;
    
    // Document info box
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, "F");
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text(`Data de geração: ${new Date().toLocaleDateString("pt-BR")}`, margin + 10, yPosition + 12);
    pdf.text(`Regulamento: (UE) 2024/1689 — EU AI Act`, margin + 10, yPosition + 22);
    if (assessmentData?.risk_classification) {
      pdf.text(`Classificação do sistema: ${assessmentData.risk_classification} (Score: ${assessmentData.risk_score || "N/A"})`, margin + 10, yPosition + 32);
    }
    
    yPosition += 55;
    
    // Introduction
    addParagraph("Este documento foi desenvolvido para cumprir os requisitos do Artigo 4 do Regulamento Europeu de Inteligência Artificial (EU AI Act), que estabelece obrigações de literacia em IA para provedores e operadores de sistemas de inteligência artificial.");
    
    addParagraph("O objetivo é garantir que todos os colaboradores que interagem com sistemas de IA tenham conhecimento suficiente para operá-los de forma segura, ética e em conformidade com a legislação europeia, considerando o contexto de utilização e as pessoas afetadas.");
    
    yPosition += 5;
    
    addHighlightBox(
      "⚖️ OBRIGAÇÃO LEGAL — Artigo 4 do EU AI Act",
      [
        "Os provedores e operadores de sistemas de IA devem garantir que sua equipe",
        "tenha um nível suficiente de literacia em IA, considerando os seus conhecimentos",
        "técnicos, experiência, educação e formação, bem como o contexto de utilização."
      ],
      "warning"
    );

    // ==================== PAGE 2: INTRODUCTION TO AI ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("1. INTRODUÇÃO À INTELIGÊNCIA ARTIFICIAL PARA COLABORADORES");
    
    addSubsectionTitle("1.1 O que é Inteligência Artificial?");
    addParagraph("Inteligência Artificial (IA) refere-se a sistemas computacionais projetados para realizar tarefas que normalmente requerem inteligência humana. Estes sistemas podem aprender com dados, identificar padrões, tomar decisões e melhorar seu desempenho ao longo do tempo.");
    
    addSubsectionTitle("1.2 Tipos de Sistemas de IA");
    addNumberedItem(1, "IA Baseada em Regras", "Sistemas que seguem regras predefinidas por programadores. São previsíveis mas limitados a cenários específicos.");
    addNumberedItem(2, "Machine Learning (Aprendizado de Máquina)", "Sistemas que aprendem padrões a partir de grandes volumes de dados, melhorando seu desempenho com experiência.");
    addNumberedItem(3, "Deep Learning (Aprendizado Profundo)", "Subcategoria de ML que utiliza redes neurais complexas para tarefas como reconhecimento de imagem e processamento de linguagem.");
    addNumberedItem(4, "IA Generativa", "Sistemas capazes de criar novo conteúdo como texto, imagens, código ou música a partir de instruções.");
    
    addSubsectionTitle("1.3 Como a IA Funciona na Nossa Organização");
    addParagraph("Os sistemas de IA implementados na nossa organização são utilizados para auxiliar processos de decisão, automatizar tarefas repetitivas e fornecer insights baseados em dados. É fundamental compreender que estes sistemas são ferramentas de apoio e não substituem o julgamento humano.");
    
    addHighlightBox(
      "💡 CONCEITO IMPORTANTE",
      [
        "A IA não possui consciência, compreensão real ou intenções.",
        "Ela processa padrões estatísticos em dados e produz outputs",
        "baseados nesses padrões. A supervisão humana é essencial."
      ],
      "info"
    );

    // ==================== PAGE 3: RIGHTS AND RESPONSIBILITIES ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("2. DIREITOS E RESPONSABILIDADES SOB O EU AI ACT");
    
    addSubsectionTitle("2.1 Seus Direitos como Colaborador");
    addBulletPoint("Direito a ser informado quando interage com um sistema de IA");
    addBulletPoint("Direito a formação adequada sobre os sistemas de IA que utiliza");
    addBulletPoint("Direito a compreender como as decisões de IA afetam seu trabalho");
    addBulletPoint("Direito a questionar outputs de IA que pareçam incorretos ou injustos");
    addBulletPoint("Direito a escalar preocupações sobre o funcionamento da IA");
    addBulletPoint("Direito a não ser exclusivamente avaliado por decisões automatizadas");
    
    yPosition += 5;
    
    addSubsectionTitle("2.2 Suas Responsabilidades");
    addBulletPoint("Utilizar os sistemas de IA conforme as diretrizes e formação recebida");
    addBulletPoint("Reportar comportamentos inesperados ou resultados questionáveis");
    addBulletPoint("Manter supervisão adequada sobre decisões assistidas por IA");
    addBulletPoint("Participar de formações e atualizações sobre literacia em IA");
    addBulletPoint("Proteger dados sensíveis ao interagir com sistemas de IA");
    addBulletPoint("Documentar incidentes ou anomalias conforme procedimentos internos");
    
    yPosition += 5;
    
    addSubsectionTitle("2.3 Classificação de Risco do EU AI Act");
    addParagraph("O EU AI Act classifica os sistemas de IA em quatro níveis de risco, cada um com obrigações específicas:");
    
    addHighlightBox(
      "🚫 RISCO INACEITÁVEL — Sistemas Proibidos",
      [
        "• Manipulação subliminar prejudicial",
        "• Exploração de vulnerabilidades de grupos específicos",
        "• Pontuação social por autoridades públicas",
        "• Reconhecimento facial em tempo real em espaços públicos (exceções limitadas)"
      ],
      "warning"
    );
    
    addHighlightBox(
      "⚠️ ALTO RISCO — Requisitos Rigorosos",
      [
        "• Sistemas de recrutamento e gestão de trabalhadores",
        "• Acesso a educação e formação profissional",
        "• Serviços essenciais (crédito, saúde, seguros)",
        "• Aplicação da lei e gestão de fronteiras"
      ],
      "warning"
    );

    // ==================== PAGE 4: IDENTIFYING BIASED OUTPUTS ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("3. COMO IDENTIFICAR OUTPUTS ENVIESADOS (BIASED)");
    
    addSubsectionTitle("3.1 O que é Viés em IA?");
    addParagraph("Viés (bias) em IA refere-se a erros sistemáticos nos outputs de um sistema que resultam em tratamento injusto ou discriminatório de determinados grupos ou indivíduos. Estes vieses podem originar-se dos dados de treino, do design do algoritmo ou da forma como o sistema é utilizado.");
    
    addSubsectionTitle("3.2 Tipos Comuns de Viés");
    addNumberedItem(1, "Viés de Amostragem", "Quando os dados de treino não representam adequadamente todos os grupos da população, levando a predições menos precisas para grupos sub-representados.");
    addNumberedItem(2, "Viés de Confirmação", "Quando o sistema reforça estereótipos ou preconceitos existentes presentes nos dados históricos.");
    addNumberedItem(3, "Viés de Automatização", "Tendência humana de confiar excessivamente em outputs de IA, ignorando evidências contrárias.");
    addNumberedItem(4, "Viés de Contexto", "Quando o sistema não considera adequadamente o contexto específico de uma situação.");
    
    addSubsectionTitle("3.3 Sinais de Alerta para Identificar");
    addBulletPoint("Padrões sistemáticos de resultados diferentes para grupos demográficos específicos");
    addBulletPoint("Resultados que parecem reforçar estereótipos conhecidos");
    addBulletPoint("Inconsistências quando os mesmos dados são apresentados de formas ligeiramente diferentes");
    addBulletPoint("Outputs extremos ou inesperados para casos que parecem similares a outros");
    addBulletPoint("Falta de diversidade nas recomendações ou sugestões do sistema");
    addBulletPoint("Dificuldade do sistema em processar nomes, idiomas ou referências culturais diversas");
    
    yPosition += 5;
    
    addHighlightBox(
      "🔍 CHECKLIST DE VERIFICAÇÃO DE VIÉS",
      [
        "□ O resultado é consistente com casos similares?",
        "□ Há padrões suspeitos relacionados a género, idade, etnia ou origem?",
        "□ O output faz sentido no contexto específico desta situação?",
        "□ Existem evidências externas que contradigam o resultado?",
        "□ Outros colaboradores chegariam à mesma conclusão?"
      ],
      "info"
    );

    // ==================== PAGE 5: INTERNAL REPORTING ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("4. PROCEDIMENTOS INTERNOS PARA REPORTAR ERROS DE IA");
    
    addSubsectionTitle("4.1 Quando Reportar");
    addParagraph("É fundamental reportar qualquer situação em que o sistema de IA apresente comportamento inesperado, potencialmente prejudicial ou que viole os princípios de ética e conformidade estabelecidos.");
    
    addBulletPoint("Output claramente incorreto ou que contradiz evidências disponíveis");
    addBulletPoint("Suspeita de viés ou discriminação nos resultados");
    addBulletPoint("Comportamento inconsistente do sistema");
    addBulletPoint("Violações de privacidade ou tratamento inadequado de dados");
    addBulletPoint("Situações em que o sistema não consegue processar entradas válidas");
    addBulletPoint("Qualquer output que possa causar dano a indivíduos ou grupos");
    
    yPosition += 5;
    
    addSubsectionTitle("4.2 Processo de Reporte (5 Passos)");
    addNumberedItem(1, "Documentar o Incidente", "Capture screenshots, anote o momento exato, dados de entrada utilizados e o output problemático. Preserve todas as evidências.");
    addNumberedItem(2, "Classificar a Severidade", "Determine se é um erro menor (não afeta decisões críticas), moderado (pode afetar decisões) ou crítico (potencial de dano imediato).");
    addNumberedItem(3, "Reportar ao Canal Apropriado", "Utilize o formulário de incidentes de IA ou contacte diretamente o Responsável de Conformidade de IA para casos urgentes.");
    addNumberedItem(4, "Suspender Uso se Necessário", "Para incidentes críticos, suspenda a utilização do sistema até orientação da equipe técnica.");
    addNumberedItem(5, "Acompanhar a Resolução", "Verifique se o incidente foi investigado e se medidas corretivas foram implementadas.");
    
    addSubsectionTitle("4.3 Canais de Reporte");
    addHighlightBox(
      "📞 CONTACTOS PARA REPORTE DE INCIDENTES DE IA",
      [
        "• Email: compliance-ia@empresa.com",
        "• Formulário interno: [Portal de Compliance > Incidentes IA]",
        "• Responsável de Conformidade IA: [Nome] — Ext. XXXX",
        "• Para emergências: Linha direta de Compliance"
      ],
      "success"
    );
    
    addSubsectionTitle("4.4 Proteção do Denunciante");
    addParagraph("A organização garante proteção total a colaboradores que reportem incidentes de IA de boa-fé. Nenhuma retaliação será tolerada contra quem identifique problemas ou preocupações legítimas.");

    // ==================== PAGE 6: PRACTICAL GUIDELINES ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("5. BOAS PRÁTICAS PARA O USO DIÁRIO DE IA");
    
    addSubsectionTitle("5.1 Antes de Utilizar um Sistema de IA");
    addBulletPoint("Verifique se recebeu formação adequada para o sistema específico");
    addBulletPoint("Compreenda as limitações conhecidas do sistema");
    addBulletPoint("Confirme que os dados de entrada são precisos e atualizados");
    addBulletPoint("Tenha clareza sobre como os outputs serão utilizados na decisão final");
    
    addSubsectionTitle("5.2 Durante a Utilização");
    addBulletPoint("Mantenha sempre supervisão crítica sobre os outputs");
    addBulletPoint("Não aceite automaticamente todas as recomendações da IA");
    addBulletPoint("Compare outputs com seu conhecimento profissional e bom senso");
    addBulletPoint("Documente decisões importantes e o papel da IA nelas");
    
    addSubsectionTitle("5.3 Após a Utilização");
    addBulletPoint("Revise periodicamente a qualidade das decisões assistidas por IA");
    addBulletPoint("Forneça feedback sobre a precisão e utilidade do sistema");
    addBulletPoint("Participe de sessões de calibração e melhoria contínua");
    addBulletPoint("Mantenha-se atualizado sobre mudanças e atualizações do sistema");
    
    yPosition += 5;
    
    addHighlightBox(
      "✅ PRINCÍPIO FUNDAMENTAL",
      [
        "A IA é uma ferramenta de apoio, não um substituto do julgamento humano.",
        "Você é responsável pelas decisões finais que afetam pessoas.",
        "Em caso de dúvida, consulte um supervisor ou o Responsável de Conformidade."
      ],
      "success"
    );

    // ==================== PAGE 7: GLOSSARY ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle("6. GLOSSÁRIO DE TERMOS ESSENCIAIS");
    
    const glossaryTerms = [
      { term: "Algoritmo", def: "Conjunto de regras ou instruções que um sistema de IA segue para processar dados e produzir outputs." },
      { term: "Dados de Treino", def: "Conjunto de dados históricos utilizados para ensinar um modelo de IA a identificar padrões." },
      { term: "EU AI Act", def: "Regulamento (UE) 2024/1689 do Parlamento Europeu que estabelece regras harmonizadas sobre IA." },
      { term: "Explicabilidade", def: "Capacidade de compreender e explicar como um sistema de IA chegou a determinado output." },
      { term: "Literacia em IA", def: "Competências, conhecimentos e compreensão necessários para utilizar sistemas de IA de forma informada." },
      { term: "Modelo de IA", def: "Representação matemática treinada em dados para fazer predições ou tomar decisões." },
      { term: "Output", def: "Resultado ou resposta produzida por um sistema de IA após processar dados de entrada." },
      { term: "Supervisão Humana", def: "Monitorização e controlo exercidos por pessoas sobre o funcionamento de sistemas de IA." },
      { term: "Viés (Bias)", def: "Erro sistemático que resulta em tratamento injusto ou impreciso de determinados grupos ou situações." },
    ];
    
    for (const item of glossaryTerms) {
      checkPageBreak(20);
      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(item.term + ":", margin, yPosition);
      yPosition += 6;
      
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(item.def, pageWidth - 2 * margin);
      for (const line of lines) {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 4;
    }

    // ==================== PAGE 8: ASSESSMENT DATA (if available) ====================
    const relevantArticlesFromAssessment = Array.isArray(assessmentData?.relevant_articles) ? assessmentData.relevant_articles : [];
    const priorityActionsFromAssessment = Array.isArray(assessmentData?.priority_actions) ? assessmentData.priority_actions : [];

    if (assessmentData?.legal_justification || relevantArticlesFromAssessment.length > 0 || priorityActionsFromAssessment.length > 0) {
      addNewPage();
      addHeader();
      yPosition = 40;
      
      addSectionTitle("7. INFORMAÇÕES DO SEU DIAGNÓSTICO DE RISCO");
      
      if (assessmentData.risk_classification) {
        addParagraph(`Classificação de Risco: ${assessmentData.risk_classification} (Score: ${assessmentData.risk_score || "N/A"})`);
      }
      
      if (assessmentData.legal_justification) {
        addSubsectionTitle("Justificativa Legal");
        addParagraph(assessmentData.legal_justification);
      }
      
      if (relevantArticlesFromAssessment.length > 0) {
        addSubsectionTitle("Artigos Relevantes do EU AI Act");
        for (const article of relevantArticlesFromAssessment) {
          addBulletPoint(article);
        }
      }
      
      if (priorityActionsFromAssessment.length > 0) {
        addSubsectionTitle("Ações Prioritárias Recomendadas");
        for (const action of priorityActionsFromAssessment) {
          addBulletPoint(action);
        }
      }
    }

    // ==================== ADD FOOTER TO ALL PAGES ====================
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer background
      pdf.setFillColor(12, 25, 41);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, "F");
      
      // Footer text
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text("EU AI Act Compliance Tool • Guia de Literacia em IA (Artigo 4)", margin, pageHeight - 6);
      
      pdf.setTextColor(212, 175, 55);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 25, pageHeight - 6);
    }

    pdf.save(`Guia_Literacia_IA_Artigo4_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF gerado com sucesso!"); // Adicionado toast de sucesso
  } catch (error: any) { // Captura o erro para exibir a mensagem
    console.error("Error generating AI Literacy Guide PDF:", error);
    toast.error(`Erro ao gerar PDF do Guia de Literacia: ${error.message || 'Erro desconhecido'}`);
  }
};