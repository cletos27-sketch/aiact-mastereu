import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface AssessmentData {
  risk_classification?: string;
  risk_score?: number;
  legal_justification?: string | null;
  relevant_articles?: string[] | null;
  priority_actions?: string[] | null;
}

type Language = 'pt' | 'en';

const content = {
  pt: {
    title: "GUIA DE LITERACIA EM IA",
    subtitle: "Artigo 4 — Regulamento Europeu de Inteligência Artificial",
    date: (date: string) => `Data de geração: ${date}`,
    regulation: "Regulamento: (UE) 2024/1689 — EU AI Act",
    classification: (c: string, s: number | string) => `Classificação do sistema: ${c} (Score: ${s})`,
    obligationTitle: "⚖️ OBRIGAÇÃO LEGAL — Artigo 4 do EU AI Act",
    obligationText: [
      "Os provedores e operadores de sistemas de IA devem garantir que sua equipe",
      "tenha um nível suficiente de literacia em IA, considerando os seus conhecimentos",
      "técnicos, experiência, educação e formação, bem como o contexto de utilização."
    ],
    introTitle: "1. INTRODUÇÃO À INTELIGÊNCIA ARTIFICIAL PARA COLABORADORES",
    whatIsAI: "1.1 O que é Inteligência Artificial?",
    whatIsAIText: "Inteligência Artificial (IA) refere-se a sistemas computacionais projetados para realizar tarefas que normalmente requerem inteligência humana. Estes sistemas podem aprender com dados, identificar padrões, tomar decisões e melhorar seu desempenho ao longo do tempo.",
    typesTitle: "1.2 Tipos de Sistemas de IA",
    type1: { title: "IA Baseada em Regras", desc: "Sistemas que seguem regras predefinidas por programadores. São previsíveis mas limitados a cenários específicos." },
    type2: { title: "Machine Learning (Aprendizado de Máquina)", desc: "Sistemas que aprendem padrões a partir de grandes volumes de dados, melhorando seu desempenho com experiência." },
    type3: { title: "Deep Learning (Aprendizado Profundo)", desc: "Subcategoria de ML que utiliza redes neurais complexas para tarefas como reconhecimento de imagem e processamento de linguagem." },
    type4: { title: "IA Generativa", desc: "Sistemas capazes de criar novo conteúdo como texto, imagens, código ou música a partir de instruções." },
    howAIWorks: "1.3 Como a IA Funciona na Nossa Organização",
    howAIWorksText: "Os sistemas de IA implementados na nossa organização são utilizados para auxiliar processos de decisão, automatizar tarefas repetitivas e fornecer insights baseados em dados. É fundamental compreender que estes sistemas são ferramentas de apoio e não substituem o julgamento humano.",
    conceptTitle: "💡 CONCEITO IMPORTANTE",
    conceptText: [
      "A IA não possui consciência, compreensão real ou intenções.",
      "Ela processa padrões estatísticos em dados e produz outputs",
      "baseados nesses padrões. A supervisão humana é essencial."
    ],
    rightsTitle: "2. DIREITOS E RESPONSABILIDADES SOB O EU AI ACT",
    rightsSubtitle: "2.1 Seus Direitos como Colaborador",
    rightsList: [
      "Direito a ser informado quando interage com um sistema de IA",
      "Direito a formação adequada sobre os sistemas de IA que utiliza",
      "Direito a compreender como as decisões de IA afetam seu trabalho",
      "Direito a questionar outputs de IA que pareçam incorretos ou injustos",
      "Direito a escalar preocupações sobre o funcionamento da IA",
      "Direito a não ser exclusivamente avaliado por decisões automatizadas"
    ],
    responsibilitiesSubtitle: "2.2 Suas Responsabilidades",
    responsibilitiesList: [
      "Utilizar os sistemas de IA conforme as diretrizes e formação recebida",
      "Reportar comportamentos inesperados ou resultados questionáveis",
      "Manter supervisão adequada sobre decisões assistidas por IA",
      "Participar de formações e atualizações sobre literacia em IA",
      "Proteger dados sensíveis ao interagir com sistemas de IA",
      "Documentar incidentes ou anomalias conforme procedimentos internos"
    ],
    riskClassificationTitle: "2.3 Classificação de Risco do EU AI Act",
    riskClassificationText: "O EU AI Act classifica os sistemas de IA em quatro níveis de risco, cada um com obrigações específicas:",
    riskUnacceptable: "🚫 RISCO INACEITÁVEL — Sistemas Proibidos",
    riskUnacceptableList: [
      "• Manipulação subliminar prejudicial",
      "• Exploração de vulnerabilidades de grupos específicos",
      "• Pontuação social por autoridades públicas",
      "• Reconhecimento facial em tempo real em espaços públicos (exceções limitadas)"
    ],
    riskHigh: "⚠️ ALTO RISCO — Requisitos Rigorosos",
    riskHighList: [
      "• Sistemas de recrutamento e gestão de trabalhadores",
      "• Acesso a educação e formação profissional",
      "• Serviços essenciais (crédito, saúde, seguros)",
      "• Aplicação da lei e gestão de fronteiras"
    ],
    biasTitle: "3. COMO IDENTIFICAR OUTPUTS ENVIESADOS (BIASED)",
    whatIsBias: "3.1 O que é Viés em IA?",
    whatIsBiasText: "Viés (bias) em IA refere-se a erros sistemáticos nos outputs de um sistema que resultam em tratamento injusto ou discriminatório de determinados grupos ou indivíduos. Estes vieses podem originar-se dos dados de treino, do design do algoritmo ou da forma como o sistema é utilizado.",
    typesOfBias: "3.2 Tipos Comuns de Viés",
    biasType1: { title: "Viés de Amostragem", desc: "Quando os dados de treino não representam adequadamente todos os grupos da população, levando a predições menos precisas para grupos sub-representados." },
    biasType2: { title: "Viés de Confirmação", desc: "Quando o sistema reforça estereótipos ou preconceitos existentes presentes nos dados históricos." },
    biasType3: { title: "Viés de Automatização", desc: "Tendência humana de confiar excessivamente em outputs de IA, ignorando evidências contrárias." },
    biasType4: { title: "Viés de Contexto", desc: "Quando o sistema não considera adequadamente o contexto específico de uma situação." },
    alertSignals: "3.3 Sinais de Alerta para Identificar",
    alertSignalsList: [
      "Padrões sistemáticos de resultados diferentes para grupos demográficos específicos",
      "Resultados que parecem reforçar estereótipos conhecidos",
      "Inconsistências quando os mesmos dados são apresentados de formas ligeiramente diferentes",
      "Outputs extremos ou inesperados para casos que parecem similares a outros",
      "Falta de diversidade nas recomendações ou sugestões do sistema",
      "Dificuldade do sistema em processar nomes, idiomas ou referências culturais diversas"
    ],
    checklistTitle: "🔍 CHECKLIST DE VERIFICAÇÃO DE VIÉS",
    checklistText: [
      "□ O resultado é consistente com casos similares?",
      "□ Há padrões suspeitos relacionados a género, idade, etnia ou origem?",
      "□ O output faz sentido no contexto específico desta situação?",
      "□ Existem evidências externas que contradigam o resultado?",
      "□ Outros colaboradores chegariam à mesma conclusão?"
    ],
    reportingTitle: "4. PROCEDIMENTOS INTERNOS PARA REPORTAR ERROS DE IA",
    whenToReport: "4.1 Quando Reportar",
    whenToReportText: "É fundamental reportar qualquer situação em que o sistema de IA apresente comportamento inesperado, potencialmente prejudicial ou que viole os princípios de ética e conformidade estabelecidos.",
    whenToReportList: [
      "Output claramente incorreto ou que contradiz evidências disponíveis",
      "Suspeita de viés ou discriminação nos resultados",
      "Comportamento inconsistente do sistema",
      "Violações de privacidade ou tratamento inadequado de dados",
      "Situações em que o sistema não consegue processar entradas válidas",
      "Qualquer output que possa causar dano a indivíduos ou grupos"
    ],
    reportProcess: "4.2 Processo de Reporte (5 Passos)",
    reportStep1: { title: "Documentar o Incidente", desc: "Capture screenshots, anote o momento exato, dados de entrada utilizados e o output problemático. Preserve todas as evidências." },
    reportStep2: { title: "Classificar a Severidade", desc: "Determine se é um erro menor (não afeta decisões críticas), moderado (pode afetar decisões) ou crítico (potencial de dano imediato)." },
    reportStep3: { title: "Reportar ao Canal Apropriado", desc: "Utilize o formulário de incidentes de IA ou contacte diretamente o Responsável de Conformidade de IA para casos urgentes." },
    reportStep4: { title: "Suspender Uso se Necessário", desc: "Para incidentes críticos, suspenda a utilização do sistema até orientação da equipe técnica." },
    reportStep5: { title: "Acompanhar a Resolução", desc: "Verifique se o incidente foi investigado e se medidas corretivas foram implementadas." },
    reportChannels: "4.3 Canais de Reporte",
    reportChannelsBox: "📞 CONTACTOS PARA REPORTE DE INCIDENTES DE IA",
    reportChannelsList: [
      "• Email: compliance-ia@empresa.com",
      "• Formulário interno: [Portal de Compliance > Incidentes IA]",
      "• Responsável de Conformidade IA: [Nome] — Ext. XXXX",
      "• Para emergências: Linha direta de Compliance"
    ],
    whistleblower: "4.4 Proteção do Denunciante",
    whistleblowerText: "A organização garante proteção total a colaboradores que reportem incidentes de IA de boa-fé. Nenhuma retaliação será tolerada contra quem identifique problemas ou preocupações legítimas.",
    guidelinesTitle: "5. BOAS PRÁTICAS PARA O USO DIÁRIO DE IA",
    beforeUse: "5.1 Antes de Utilizar um Sistema de IA",
    beforeUseList: [
      "Verifique se recebeu formação adequada para o sistema específico",
      "Compreenda as limitações conhecidas do sistema",
      "Confirme que os dados de entrada são precisos e atualizados",
      "Tenha clareza sobre como os outputs serão utilizados na decisão final"
    ],
    duringUse: "5.2 Durante a Utilização",
    duringUseList: [
      "Mantenha sempre supervisão crítica sobre os outputs",
      "Não aceite automaticamente todas as recomendações da IA",
      "Compare outputs com seu conhecimento profissional e bom senso",
      "Documente decisões importantes e o papel da IA nelas"
    ],
    afterUse: "5.3 Após a Utilização",
    afterUseList: [
      "Revise periodicamente a qualidade das decisões assistidas por IA",
      "Forneça feedback sobre a precisão e utilidade do sistema",
      "Participe de sessões de calibração e melhoria contínua",
      "Mantenha-se atualizado sobre mudanças e atualizações do sistema"
    ],
    principleTitle: "✅ PRINCÍPIO FUNDAMENTAL",
    principleText: [
      "A IA é uma ferramenta de apoio, não um substituto do julgamento humano.",
      "Você é responsável pelas decisões finais que afetam pessoas.",
      "Em caso de dúvida, consulte um supervisor ou o Responsável de Conformidade."
    ],
    glossaryTitle: "6. GLOSSÁRIO DE TERMOS ESSENCIAIS",
    glossaryTerms: [
      { term: "Algoritmo", def: "Conjunto de regras ou instruções que um sistema de IA segue para processar dados e produzir outputs." },
      { term: "Dados de Treino", def: "Conjunto de dados históricos utilizados para ensinar um modelo de IA a identificar padrões." },
      { term: "EU AI Act", def: "Regulamento (UE) 2024/1689 do Parlamento Europeu que estabelece regras harmonizadas sobre IA." },
      { term: "Explicabilidade", def: "Capacidade de compreender e explicar como um sistema de IA chegou a determinado output." },
      { term: "Literacia em IA", def: "Competências, conhecimentos e compreensão necessários para utilizar sistemas de IA de forma informada." },
      { term: "Modelo de IA", def: "Representação matemática treinada em dados para fazer predições ou tomar decisões." },
      { term: "Output", def: "Resultado ou resposta produzida por um sistema de IA após processar dados de entrada." },
      { term: "Supervisão Humana", def: "Monitorização e controlo exercidos por pessoas sobre o funcionamento de sistemas de IA." },
      { term: "Viés (Bias)", def: "Erro sistemático que resulta em tratamento injusto ou impreciso de determinados grupos ou situações." },
    ],
    assessmentTitle: "7. INFORMAÇÕES DO SEU DIAGNÓSTICO DE RISCO",
    legalJustification: "Justificativa Legal",
    relevantArticles: "Artigos Relevantes do EU AI Act",
    priorityActions: "Ações Prioritárias Recomendadas",
    footer: "EU AI Act Compliance Tool • Guia de Literacia em IA (Artigo 4)",
    page: (i: number, total: number) => `Página ${i} de ${total}`,
    fileName: (date: string) => `Guia_Literacia_IA_Artigo4_${date}.pdf`,
    toastSuccess: "PDF gerado com sucesso!",
    toastError: (msg: string) => `Erro ao gerar PDF do Guia de Literacia: ${msg}`,
  },
  en: {
    title: "AI LITERACY GUIDE",
    subtitle: "Article 4 — European Artificial Intelligence Regulation",
    date: (date: string) => `Generation Date: ${date}`,
    regulation: "Regulation: (EU) 2024/1689 — EU AI Act",
    classification: (c: string, s: number | string) => `System Classification: ${c} (Score: ${s})`,
    obligationTitle: "⚖️ LEGAL OBLIGATION — Article 4 of the EU AI Act",
    obligationText: [
      "Providers and operators of AI systems must ensure that their staff",
      "have a sufficient level of AI literacy, considering their technical knowledge,",
      "experience, education, and training, as well as the context of use."
    ],
    introTitle: "1. INTRODUCTION TO ARTIFICIAL INTELLIGENCE FOR EMPLOYEES",
    whatIsAI: "1.1 What is Artificial Intelligence?",
    whatIsAIText: "Artificial Intelligence (AI) refers to computational systems designed to perform tasks that typically require human intelligence. These systems can learn from data, identify patterns, make decisions, and improve their performance over time.",
    typesTitle: "1.2 Types of AI Systems",
    type1: { title: "Rule-Based AI", desc: "Systems that follow predefined rules set by programmers. They are predictable but limited to specific scenarios." },
    type2: { title: "Machine Learning", desc: "Systems that learn patterns from large volumes of data, improving their performance with experience." },
    type3: { title: "Deep Learning", desc: "A subcategory of ML that uses complex neural networks for tasks like image recognition and language processing." },
    type4: { title: "Generative AI", desc: "Systems capable of creating new content such as text, images, code, or music from instructions." },
    howAIWorks: "1.3 How AI Works in Our Organization",
    howAIWorksText: "The AI systems implemented in our organization are used to assist decision-making processes, automate repetitive tasks, and provide data-driven insights. It is crucial to understand that these systems are support tools and do not replace human judgment.",
    conceptTitle: "💡 IMPORTANT CONCEPT",
    conceptText: [
      "AI does not possess consciousness, real understanding, or intentions.",
      "It processes statistical patterns in data and produces outputs",
      "based on those patterns. Human supervision is essential."
    ],
    rightsTitle: "2. RIGHTS AND RESPONSIBILITIES UNDER THE EU AI ACT",
    rightsSubtitle: "2.1 Your Rights as an Employee",
    rightsList: [
      "Right to be informed when interacting with an AI system",
      "Right to adequate training on the AI systems you use",
      "Right to understand how AI decisions affect your work",
      "Right to question AI outputs that seem incorrect or unfair",
      "Right to escalate concerns about AI functioning",
      "Right not to be exclusively evaluated by automated decisions"
    ],
    responsibilitiesSubtitle: "2.2 Your Responsibilities",
    responsibilitiesList: [
      "Use AI systems according to received guidelines and training",
      "Report unexpected behavior or questionable results",
      "Maintain adequate supervision over AI-assisted decisions",
      "Participate in AI literacy training and updates",
      "Protect sensitive data when interacting with AI systems",
      "Document incidents or anomalies according to internal procedures"
    ],
    riskClassificationTitle: "2.3 EU AI Act Risk Classification",
    riskClassificationText: "The EU AI Act classifies AI systems into four risk levels, each with specific obligations:",
    riskUnacceptable: "🚫 UNACCEPTABLE RISK — Prohibited Systems",
    riskUnacceptableList: [
      "• Harmful subliminal manipulation",
      "• Exploitation of vulnerabilities of specific groups",
      "• Social scoring by public authorities",
      "• Real-time biometric identification in public spaces (limited exceptions)"
    ],
    riskHigh: "⚠️ HIGH RISK — Strict Requirements",
    riskHighList: [
      "• Systems for recruitment and worker management",
      "• Access to education and professional training",
      "• Essential services (credit, health, insurance)",
      "• Law enforcement and border management"
    ],
    biasTitle: "3. HOW TO IDENTIFY BIASED OUTPUTS",
    whatIsBias: "3.1 What is Bias in AI?",
    whatIsBiasText: "Bias in AI refers to systematic errors in a system's outputs that result in unfair or discriminatory treatment of certain groups or individuals. These biases can originate from training data, algorithm design, or how the system is used.",
    typesOfBias: "3.2 Common Types of Bias",
    biasType1: { title: "Sampling Bias", desc: "When training data does not adequately represent all population groups, leading to less accurate predictions for underrepresented groups." },
    biasType2: { title: "Confirmation Bias", desc: "When the system reinforces existing stereotypes or prejudices present in historical data." },
    biasType3: { title: "Automation Bias", desc: "The human tendency to overly rely on AI outputs, ignoring contradictory evidence." },
    biasType4: { title: "Context Bias", desc: "When the system does not adequately consider the specific context of a situation." },
    alertSignals: "3.3 Warning Signs to Identify",
    alertSignalsList: [
      "Systematic patterns of different results for specific demographic groups",
      "Results that seem to reinforce known stereotypes",
      "Inconsistencies when the same data is presented in slightly different ways",
      "Extreme or unexpected outputs for cases that seem similar to others",
      "Lack of diversity in the system's recommendations or suggestions",
      "Difficulty for the system to process diverse names, languages, or cultural references"
    ],
    checklistTitle: "🔍 BIAS CHECKLIST",
    checklistText: [
      "□ Is the result consistent with similar cases?",
      "□ Are there suspicious patterns related to gender, age, ethnicity, or origin?",
      "□ Does the output make sense in the specific context of this situation?",
      "□ Is there external evidence that contradicts the result?",
      "□ Would other employees reach the same conclusion?"
    ],
    reportingTitle: "4. INTERNAL PROCEDURES FOR REPORTING AI ERRORS",
    whenToReport: "4.1 When to Report",
    whenToReportText: "It is essential to report any situation where the AI system exhibits unexpected, potentially harmful behavior, or violates established ethical and compliance principles.",
    whenToReportList: [
      "Output clearly incorrect or contradicting available evidence",
      "Suspicion of bias or discrimination in results",
      "Inconsistent system behavior",
      "Privacy violations or improper data handling",
      "Situations where the system fails to process valid inputs",
      "Any output that could cause harm to individuals or groups"
    ],
    reportProcess: "4.2 Reporting Process (5 Steps)",
    reportStep1: { title: "Document the Incident", desc: "Capture screenshots, note the exact time, input data used, and the problematic output. Preserve all evidence." },
    reportStep2: { title: "Classify Severity", desc: "Determine if it is a minor error (does not affect critical decisions), moderate (may affect decisions), or critical (potential for immediate harm)." },
    reportStep3: { title: "Report to the Appropriate Channel", desc: "Use the AI incident form or contact the AI Compliance Officer directly for urgent cases." },
    reportStep4: { title: "Suspend Use if Necessary", desc: "For critical incidents, suspend system use until advised by the technical team." },
    reportStep5: { title: "Follow Up on Resolution", desc: "Verify that the incident has been investigated and corrective measures have been implemented." },
    reportChannels: "4.3 Reporting Channels",
    reportChannelsBox: "📞 CONTACTS FOR AI INCIDENT REPORTING",
    reportChannelsList: [
      "• Email: compliance-ai@company.com",
      "• Internal Form: [Compliance Portal > AI Incidents]",
      "• AI Compliance Officer: [Name] — Ext. XXXX",
      "• For emergencies: Compliance Hotline"
    ],
    whistleblower: "4.4 Whistleblower Protection",
    whistleblowerText: "The organization guarantees full protection to employees who report AI incidents in good faith. No retaliation will be tolerated against anyone who identifies legitimate problems or concerns.",
    guidelinesTitle: "5. BEST PRACTICES FOR DAILY AI USE",
    beforeUse: "5.1 Before Using an AI System",
    beforeUseList: [
      "Verify that you have received adequate training for the specific system",
      "Understand the known limitations of the system",
      "Confirm that input data is accurate and up-to-date",
      "Be clear about how the outputs will be used in the final decision"
    ],
    duringUse: "5.2 During Use",
    duringUseList: [
      "Always maintain critical supervision over outputs",
      "Do not automatically accept all AI recommendations",
      "Compare outputs with your professional knowledge and common sense",
      "Document important decisions and the role of AI in them"
    ],
    afterUse: "5.3 After Use",
    afterUseList: [
      "Periodically review the quality of AI-assisted decisions",
      "Provide feedback on the system's accuracy and usefulness",
      "Participate in calibration and continuous improvement sessions",
      "Stay updated on system changes and updates"
    ],
    principleTitle: "✅ FUNDAMENTAL PRINCIPLE",
    principleText: [
      "AI is a support tool, not a substitute for human judgment.",
      "You are responsible for the final decisions that affect people.",
      "If in doubt, consult a supervisor or the Compliance Officer."
    ],
    glossaryTitle: "6. ESSENTIAL TERMS GLOSSARY",
    glossaryTerms: [
      { term: "Algorithm", def: "A set of rules or instructions that an AI system follows to process data and produce outputs." },
      { term: "Training Data", def: "The set of historical data used to teach an AI model to identify patterns." },
      { term: "EU AI Act", def: "Regulation (EU) 2024/1689 of the European Parliament establishing harmonized rules on AI." },
      { term: "Explainability", def: "The ability to understand and explain how an AI system arrived at a specific output." },
      { term: "AI Literacy", def: "The skills, knowledge, and understanding necessary to use AI systems in an informed manner." },
      { term: "AI Model", def: "A mathematical representation trained on data to make predictions or decisions." },
      { term: "Output", def: "The result or response produced by an AI system after processing input data." },
      { term: "Human Oversight", def: "Monitoring and control exercised by people over the functioning of AI systems." },
      { term: "Bias", def: "A systematic error that results in unfair or inaccurate treatment of certain groups or situations." },
    ],
    assessmentTitle: "7. YOUR RISK DIAGNOSIS INFORMATION",
    legalJustification: "Legal Justification",
    relevantArticles: "Relevant Articles of the EU AI Act",
    priorityActions: "Recommended Priority Actions",
    footer: "EU AI Act Compliance Tool • AI Literacy Guide (Article 4)",
    page: (i: number, total: number) => `Page ${i} of ${total}`,
    fileName: (date: string) => `AI_Literacy_Guide_Article4_${date}.pdf`,
    toastSuccess: "PDF generated successfully!",
    toastError: (msg: string) => `Error generating Literacy Guide PDF: ${msg}`,
  }
};

export const generateAILiteracyGuidePDF = (assessmentData?: AssessmentData, lang: Language = 'en') => {
  const t = content[lang];
  
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 0;
    const margin = 20;

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

    const addSectionTitle = (title: string) => {
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
    pdf.text(t.title, margin, 30);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(t.subtitle, margin, 42);
    
    yPosition = 75;
    
    // Document info box
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, "F");
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    const dateString = new Date().toLocaleDateString(lang === 'pt' ? "pt-BR" : "en-US");
    pdf.text(t.date(dateString), margin + 10, yPosition + 12);
    pdf.text(t.regulation, margin + 10, yPosition + 22);
    if (assessmentData?.risk_classification) {
      pdf.text(t.classification(assessmentData.risk_classification, assessmentData.risk_score || "N/A"), margin + 10, yPosition + 32);
    }
    
    yPosition += 55;
    
    // Introduction
    addParagraph(t.whatIsAIText); // Reusing the text for introduction
    
    addParagraph(t.howAIWorksText); // Reusing the text for introduction
    
    yPosition += 5;
    
    addHighlightBox(
      t.obligationTitle,
      t.obligationText,
      "warning"
    );

    // ==================== PAGE 2: INTRODUCTION TO AI ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.introTitle);
    
    addSubsectionTitle(t.whatIsAI);
    addParagraph(t.whatIsAIText);
    
    addSubsectionTitle(t.typesTitle);
    addNumberedItem(1, t.type1.title, t.type1.desc);
    addNumberedItem(2, t.type2.title, t.type2.desc);
    addNumberedItem(3, t.type3.title, t.type3.desc);
    addNumberedItem(4, t.type4.title, t.type4.desc);
    
    addSubsectionTitle(t.howAIWorks);
    addParagraph(t.howAIWorksText);
    
    addHighlightBox(
      t.conceptTitle,
      t.conceptText,
      "info"
    );

    // ==================== PAGE 3: RIGHTS AND RESPONSIBILITIES ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.rightsTitle);
    
    addSubsectionTitle(t.rightsSubtitle);
    t.rightsList.forEach(item => addBulletPoint(item));
    
    yPosition += 5;
    
    addSubsectionTitle(t.responsibilitiesSubtitle);
    t.responsibilitiesList.forEach(item => addBulletPoint(item));
    
    yPosition += 5;
    
    addSubsectionTitle(t.riskClassificationTitle);
    addParagraph(t.riskClassificationText);
    
    addHighlightBox(
      t.riskUnacceptable,
      t.riskUnacceptableList,
      "warning"
    );
    
    addHighlightBox(
      t.riskHigh,
      t.riskHighList,
      "warning"
    );

    // ==================== PAGE 4: IDENTIFYING BIASED OUTPUTS ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.biasTitle);
    
    addSubsectionTitle(t.whatIsBias);
    addParagraph(t.whatIsBiasText);
    
    addSubsectionTitle(t.typesOfBias);
    addNumberedItem(1, t.biasType1.title, t.biasType1.desc);
    addNumberedItem(2, t.biasType2.title, t.biasType2.desc);
    addNumberedItem(3, t.biasType3.title, t.biasType3.desc);
    addNumberedItem(4, t.biasType4.title, t.biasType4.desc);
    
    addSubsectionTitle(t.alertSignals);
    t.alertSignalsList.forEach(item => addBulletPoint(item));
    
    yPosition += 5;
    
    addHighlightBox(
      t.checklistTitle,
      t.checklistText,
      "info"
    );

    // ==================== PAGE 5: INTERNAL REPORTING ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.reportingTitle);
    
    addSubsectionTitle(t.whenToReport);
    addParagraph(t.whenToReportText);
    
    t.whenToReportList.forEach(item => addBulletPoint(item));
    
    yPosition += 5;
    
    addSubsectionTitle(t.reportProcess);
    addNumberedItem(1, t.reportStep1.title, t.reportStep1.desc);
    addNumberedItem(2, t.reportStep2.title, t.reportStep2.desc);
    addNumberedItem(3, t.reportStep3.title, t.reportStep3.desc);
    addNumberedItem(4, t.reportStep4.title, t.reportStep4.desc);
    addNumberedItem(5, t.reportStep5.title, t.reportStep5.desc);
    
    addSubsectionTitle(t.reportChannels);
    addHighlightBox(
      t.reportChannelsBox,
      t.reportChannelsList,
      "success"
    );
    
    addSubsectionTitle(t.whistleblower);
    addParagraph(t.whistleblowerText);

    // ==================== PAGE 6: PRACTICAL GUIDELINES ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.guidelinesTitle);
    
    addSubsectionTitle(t.beforeUse);
    t.beforeUseList.forEach(item => addBulletPoint(item));
    
    addSubsectionTitle(t.duringUse);
    t.duringUseList.forEach(item => addBulletPoint(item));
    
    addSubsectionTitle(t.afterUse);
    t.afterUseList.forEach(item => addBulletPoint(item));
    
    yPosition += 5;
    
    addHighlightBox(
      t.principleTitle,
      t.principleText,
      "success"
    );

    // ==================== PAGE 7: GLOSSARY ====================
    addNewPage();
    addHeader();
    yPosition = 40;
    
    addSectionTitle(t.glossaryTitle);
    
    for (const item of t.glossaryTerms) {
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
      
      addSectionTitle(t.assessmentTitle);
      
      if (assessmentData?.risk_classification) {
        addParagraph(t.classification(assessmentData.risk_classification, assessmentData.risk_score || "N/A"));
      }
      
      if (assessmentData?.legal_justification) {
        addSubsectionTitle(t.legalJustification);
        addParagraph(assessmentData.legal_justification);
      }
      
      if (relevantArticlesFromAssessment.length > 0) {
        addSubsectionTitle(t.relevantArticles);
        for (const article of relevantArticlesFromAssessment) {
          addBulletPoint(article);
        }
      }
      
      if (priorityActionsFromAssessment.length > 0) {
        addSubsectionTitle(t.priorityActions);
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
      pdf.text(t.footer, margin, pageHeight - 6);
      
      pdf.setTextColor(212, 175, 55);
      pdf.text(t.page(i, totalPages), pageWidth - margin - 25, pageHeight - 6);
    }

    pdf.save(t.fileName(new Date().toISOString().split("T")[0]));
    toast.success(t.toastSuccess);
  } catch (error: any) {
    console.error("Error generating AI Literacy Guide PDF:", error);
    toast.error(t.toastError(error.message || 'Unknown error'));
  }
};