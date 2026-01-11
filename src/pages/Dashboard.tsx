import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SettingsModal from "@/components/dashboard/SettingsModal";
import AssessmentHistory from "@/components/dashboard/AssessmentHistory";
import DocumentsModal from "@/components/dashboard/DocumentsModal";
import { PopupModal } from "react-calendly";
import { jsPDF } from "jspdf";
import { generateAILiteracyGuidePDF } from "@/lib/generateAILiteracyGuidePDF";
import { supabase } from "@/integrations/supabase/client";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import PricingCards from "@/components/PricingCards";
import { toast } from "sonner";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileText,
  GraduationCap,
  History,
  Info,
  Loader2,
  Lock,
  LogOut,
  Settings,
  ShieldAlert,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Types for system updates
interface SystemUpdate {
  id: string;
  title: string;
  content: string;
  update_type: string;
  priority: number;
  published_at: string;
}

// Types for system announcements (global notifications)
interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  priority: number;
  published_at: string;
}

const documents = [
  {
    id: 1,
    name: "Dossiê Técnico Anexo IV",
    description: "Documentação técnica completa conforme Anexo IV do EU AI Act",
    format: "PDF",
    size: "78 KB",
    icon: FileText,
  },
  {
    id: 2,
    name: "Instruções de Uso Art. 13",
    description: "Instruções para utilizadores conforme Artigo 13",
    format: "PDF",
    size: "45 KB",
    icon: Eye,
  },
  {
    id: 3,
    name: "Guia de Literacia Art. 4",
    description: "Formação em literacia de IA conforme Artigo 4",
    format: "PDF",
    size: "2.3 MB",
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Registro de Logs de Auditoria",
    description: "Estrutura para rastreamento de decisões",
    format: "PDF",
    size: "32 KB",
    icon: ClipboardList,
  },
  {
    id: 5,
    name: "Avaliação de Impacto",
    description: "Metodologia de análise de riscos",
    format: "PDF",
    size: "56 KB",
    icon: ShieldAlert,
  },
  {
    id: 6,
    name: "Política de Supervisão Humana",
    description: "Definição de papéis e responsabilidades",
    format: "PDF",
    size: "38 KB",
    icon: Users,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const { hasCompliancePack, isPaymentFailed, loading: purchaseLoading, refresh: refreshPurchase } = usePurchaseStatus();
  const { 
    tasks, 
    initialLoading: tasksLoading, 
    toggleTask, 
    completedCount: completedTasks, 
    totalCount: totalTasks, 
    progressPercentage 
  } = useTaskProgress();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [generatingLiteracyGuide, setGeneratingLiteracyGuide] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdate[]>([]);
  const [systemAnnouncements, setSystemAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  const handleOpenCustomerPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        console.error("Customer portal error:", error);
        toast.error("Erro ao abrir portal de gestão. Tente novamente.");
        return;
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast.error("Erro ao abrir portal de gestão.");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleDownloadLiteracyGuide = async () => {
    if (isPaymentFailed) {
      toast.error("Assinatura Pendente: Por favor, atualize seus dados de pagamento para baixar documentos.");
      return;
    }
    if (!hasCompliancePack) {
      toast.error("Você precisa adquirir o Dossiê de Conformidade para baixar este documento.");
      return;
    }
    setGeneratingLiteracyGuide(true);
    try {
      // Fetch latest assessment for personalized content
      const { data: assessments } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const latestAssessment = assessments?.[0];
      
      generateAILiteracyGuidePDF(latestAssessment ? {
        risk_classification: latestAssessment.risk_classification,
        risk_score: latestAssessment.risk_score,
        legal_justification: latestAssessment.legal_justification,
        relevant_articles: latestAssessment.relevant_articles,
        priority_actions: latestAssessment.priority_actions,
      } : undefined);
    } catch (error) {
      console.error("Error generating AI Literacy Guide:", error);
    } finally {
      setGeneratingLiteracyGuide(false);
    }
  };

  const handleDocumentDownload = (docId: number, docName: string) => {
    if (isPaymentFailed) {
      toast.error("Assinatura Pendente: Por favor, atualize seus dados de pagamento para baixar documentos.");
      return;
    }
    if (!hasCompliancePack) {
      toast.error("Você precisa adquirir o Dossiê de Conformidade para baixar este documento.");
      return;
    }
    generateQuickPDF(docId, docName);
  };

  const documentPDFContent: Record<number, { title: string; sections: { heading: string; items: string[] }[] }> = {
    1: {
      title: "Dossiê Técnico — Anexo IV do Regulamento (UE) 2024/1689",
      sections: [
        {
          heading: "1. DESCRIÇÃO GERAL DO SISTEMA DE IA",
          items: [
            "Nome do sistema de IA e versão de lançamento",
            "Nome comercial e identidade jurídica do fornecedor (incluindo endereço da sede e contactos)",
            "Descrição clara e detalhada da finalidade pretendida do sistema de IA",
            "Data de colocação no mercado ou entrada em serviço e histórico de versões",
            "Descrição de como o sistema de IA interage com hardware ou software não integrado"
          ]
        },
        {
          heading: "2. ARQUITETURA E ALGORITMOS",
          items: [
            "Arquitetura geral do sistema com diagrama explicativo dos componentes principais",
            "Descrição detalhada dos elementos do sistema, incluindo algoritmos, modelos e processos computacionais",
            "Técnicas de machine learning utilizadas (supervisionado, não-supervisionado, por reforço, etc.)",
            "Metodologia de design e escolhas técnicas fundamentais",
            "Recursos computacionais necessários (hardware, tempo de processamento, memória)",
            "Especificações de inputs e outputs do sistema com formatos e limitações"
          ]
        },
        {
          heading: "3. GESTÃO DE RISCOS — Artigo 9",
          items: [
            "Sistema de gestão de riscos implementado e metodologia de identificação de perigos",
            "Identificação e análise de riscos conhecidos e razoavelmente previsíveis para a saúde, segurança ou direitos fundamentais",
            "Avaliação dos riscos que podem surgir quando o sistema é utilizado conforme a finalidade prevista e em condições de utilização indevida razoavelmente previsível",
            "Medidas de gestão de riscos adotadas, incluindo soluções técnicas e organizacionais",
            "Riscos residuais aceitáveis com justificação documentada",
            "Testes e validação das medidas de mitigação implementadas",
            "Procedimentos de monitorização contínua de riscos e atualização da avaliação"
          ]
        },
        {
          heading: "4. DADOS DE TREINAMENTO E GOVERNANÇA — Artigo 10",
          items: [
            "Descrição detalhada dos conjuntos de dados de treino, validação e teste utilizados",
            "Origem e proveniência dos dados, incluindo critérios de seleção e fontes",
            "Práticas de governança de dados implementadas (recolha, preparação, rotulagem, limpeza)",
            "Análise de vieses potenciais nos dados e medidas de mitigação",
            "Medidas de qualidade dos dados: completude, representatividade e adequação ao contexto geográfico/demográfico",
            "Descrição de lacunas ou deficiências conhecidas nos conjuntos de dados",
            "Procedimentos de proteção de dados pessoais conforme RGPD quando aplicável"
          ]
        },
        {
          heading: "5. MEDIDAS DE SUPERVISÃO HUMANA — Artigo 14",
          items: [
            "Descrição das medidas de interface homem-máquina que permitem supervisão efetiva",
            "Funcionalidades técnicas que permitem a uma pessoa singular compreender as capacidades e limitações do sistema",
            "Mecanismos que permitem monitorizar a operação do sistema de IA",
            "Capacidade de interpretar corretamente os outputs do sistema",
            "Funcionalidade de interrupção (botão de paragem) ou intervenção imediata",
            "Procedimentos para decidir não utilizar o sistema ou anular decisões automatizadas",
            "Formação requerida para operadores humanos e competências mínimas"
          ]
        },
        {
          heading: "6. DESEMPENHO E ROBUSTEZ — Artigo 15",
          items: [
            "Métricas de desempenho utilizadas e valores obtidos em testes",
            "Níveis esperados de precisão, incluindo métricas específicas por grupo demográfico",
            "Medidas de robustez face a erros, falhas ou inconsistências nos inputs",
            "Medidas de resiliência contra tentativas de manipulação por terceiros (adversarial attacks)",
            "Comportamento do sistema em situações não previstas (edge cases)",
            "Requisitos e medidas de cibersegurança implementadas"
          ]
        },
        {
          heading: "7. LOGGING E RASTREABILIDADE — Artigo 12",
          items: [
            "Capacidades de registo automático (logging) ao longo do ciclo de vida",
            "Dados registados para cada operação (timestamp, inputs, outputs, identificadores)",
            "Período de conservação dos registos e formato de armazenamento",
            "Procedimentos de acesso aos logs para fins de auditoria",
            "Mecanismos que garantem a integridade e autenticidade dos registos"
          ]
        }
      ]
    },
    2: {
      title: "Instruções de Uso — Artigo 13 do Regulamento (UE) 2024/1689",
      sections: [
        {
          heading: "1. INFORMAÇÕES DE IDENTIFICAÇÃO",
          items: [
            "Nome, endereço e contactos do fornecedor do sistema de IA",
            "Nome e versão do sistema de IA",
            "Data de emissão destas instruções e número de revisão"
          ]
        },
        {
          heading: "2. FINALIDADE PRETENDIDA E CONTEXTO DE UTILIZAÇÃO",
          items: [
            "Descrição clara da finalidade para a qual o sistema foi desenvolvido",
            "Contexto(s) específico(s) de utilização previstos pelo fornecedor",
            "Setores de atividade ou domínios de aplicação",
            "Grupos-alvo de utilizadores finais (operadores, afetados, público)",
            "Cenários de utilização aprovados e não aprovados"
          ]
        },
        {
          heading: "3. CAPACIDADES E LIMITAÇÕES DO SISTEMA",
          items: [
            "Descrição detalhada das capacidades funcionais do sistema",
            "LIMITAÇÕES CONHECIDAS: situações em que o sistema pode falhar ou ter desempenho inferior",
            "Circunstâncias previsíveis que podem afetar a precisão ou fiabilidade",
            "Condições de operação ideais e degradação esperada fora dessas condições",
            "Riscos conhecidos para saúde, segurança ou direitos fundamentais mesmo em uso correto",
            "Especificações de hardware/software necessário para funcionamento adequado"
          ]
        },
        {
          heading: "4. NÍVEIS DE PRECISÃO E MÉTRICAS DE DESEMPENHO",
          items: [
            "Métricas de precisão declaradas pelo fornecedor com metodologia de teste",
            "Desagregação de métricas por subgrupos relevantes (idade, género, origem, etc.)",
            "Taxa de falsos positivos e falsos negativos para o contexto de aplicação",
            "Intervalos de confiança ou margens de erro dos outputs",
            "Condições sob as quais as métricas foram obtidas (laboratório vs. campo)"
          ]
        },
        {
          heading: "5. COMO INTERPRETAR OS RESULTADOS — EVITAR VIÉS DE AUTOMAÇÃO",
          items: [
            "ATENÇÃO: Os outputs deste sistema são AUXILIARES e não substituem o julgamento humano",
            "Nunca aceite automaticamente uma decisão do sistema sem análise crítica",
            "Verifique sempre se o resultado faz sentido no contexto específico da situação",
            "Compare o output com outras fontes de informação disponíveis",
            "Considere fatores contextuais que o sistema pode não ter considerado",
            "Em caso de dúvida, consulte um especialista humano antes de prosseguir",
            "Documente suas razões quando aceitar ou rejeitar uma recomendação do sistema"
          ]
        },
        {
          heading: "6. SUPERVISÃO HUMANA REQUERIDA",
          items: [
            "Nível de supervisão humana obrigatório para cada tipo de decisão",
            "Competências e formação mínima exigida para operadores",
            "Procedimentos de intervenção quando o sistema apresenta outputs suspeitos",
            "Como utilizar a funcionalidade de interrupção de emergência",
            "Procedimentos de escalação para decisões de alto impacto"
          ]
        },
        {
          heading: "7. MANUTENÇÃO E ATUALIZAÇÕES",
          items: [
            "Frequência esperada de atualizações pelo fornecedor",
            "Como identificar a versão atual do sistema",
            "Procedimentos para instalação de atualizações de segurança",
            "Contactos de suporte técnico do fornecedor"
          ]
        }
      ]
    },
    3: {
      title: "Guia de Literacia em IA — Artigo 4 do Regulamento (UE) 2024/1689",
      sections: [
        {
          heading: "1. OBRIGAÇÃO LEGAL DE LITERACIA EM IA",
          items: [
            "O Artigo 4 do EU AI Act exige que provedores e operadores garantam literacia suficiente em IA",
            "Esta formação é OBRIGATÓRIA para todos os colaboradores que utilizam ou supervisionam sistemas de IA",
            "A literacia deve considerar: conhecimentos técnicos, experiência, educação e contexto de utilização",
            "O incumprimento pode resultar em sanções administrativas significativas"
          ]
        },
        {
          heading: "2. O QUE É INTELIGÊNCIA ARTIFICIAL",
          items: [
            "IA são sistemas computacionais que realizam tarefas normalmente requerendo inteligência humana",
            "Machine Learning: sistemas que aprendem padrões a partir de dados",
            "Deep Learning: redes neurais complexas para reconhecimento de padrões avançados",
            "IA Generativa: sistemas que criam conteúdo novo (texto, imagem, código)",
            "IMPORTANTE: A IA não tem consciência, compreensão real ou intenções próprias"
          ]
        },
        {
          heading: "3. SEUS DIREITOS COMO COLABORADOR",
          items: [
            "Direito a ser informado quando interage com um sistema de IA",
            "Direito a formação adequada sobre os sistemas de IA que utiliza",
            "Direito a compreender como as decisões de IA afetam seu trabalho",
            "Direito a questionar outputs de IA que pareçam incorretos ou injustos",
            "Direito a escalar preocupações sobre o funcionamento da IA",
            "Direito a não ser exclusivamente avaliado por decisões automatizadas"
          ]
        },
        {
          heading: "4. SUAS RESPONSABILIDADES",
          items: [
            "Utilizar os sistemas de IA conforme as diretrizes e formação recebida",
            "Manter supervisão crítica sobre todas as decisões assistidas por IA",
            "Reportar comportamentos inesperados ou resultados questionáveis",
            "Proteger dados sensíveis ao interagir com sistemas de IA",
            "Participar de formações e atualizações sobre literacia em IA",
            "Documentar incidentes ou anomalias conforme procedimentos internos"
          ]
        },
        {
          heading: "5. COMO IDENTIFICAR VIÉS (BIAS) EM OUTPUTS DE IA",
          items: [
            "Viés: erros sistemáticos que resultam em tratamento injusto de grupos ou indivíduos",
            "SINAIS DE ALERTA:",
            "- Padrões sistemáticos de resultados diferentes para grupos demográficos",
            "- Resultados que reforçam estereótipos conhecidos",
            "- Inconsistências para dados similares apresentados de formas diferentes",
            "- Dificuldade do sistema com nomes, idiomas ou referências culturais diversas",
            "CHECKLIST: O resultado é consistente? Há padrões suspeitos? Faz sentido no contexto?"
          ]
        },
        {
          heading: "6. PROCEDIMENTO DE REPORTE DE ERROS DE IA",
          items: [
            "PASSO 1: Documentar — capture screenshots, anote data/hora, inputs e outputs problemáticos",
            "PASSO 2: Classificar severidade — menor (não afeta decisões), moderado (pode afetar), crítico (dano potencial)",
            "PASSO 3: Reportar — utilize o canal oficial de compliance ou formulário de incidentes",
            "PASSO 4: Suspender uso se crítico — aguarde orientação da equipe técnica",
            "PASSO 5: Acompanhar — verifique se medidas corretivas foram implementadas",
            "PROTEÇÃO: A organização garante proteção a quem reportar incidentes de boa-fé"
          ]
        },
        {
          heading: "7. BOAS PRÁTICAS DIÁRIAS",
          items: [
            "ANTES: verifique formação, compreenda limitações, confirme qualidade dos dados de entrada",
            "DURANTE: mantenha supervisão crítica, não aceite tudo automaticamente, compare com seu conhecimento",
            "APÓS: revise qualidade das decisões, forneça feedback, mantenha-se atualizado",
            "PRINCÍPIO: A IA é ferramenta de apoio — VOCÊ é responsável pelas decisões finais"
          ]
        },
        {
          heading: "8. NÍVEIS DE RISCO DO EU AI ACT",
          items: [
            "RISCO INACEITÁVEL (PROIBIDO): manipulação subliminar, exploração de vulnerabilidades, pontuação social",
            "ALTO RISCO: recrutamento, educação, serviços essenciais (crédito/saúde), aplicação da lei",
            "RISCO LIMITADO: chatbots, deepfakes — requer transparência sobre natureza artificial",
            "RISCO MÍNIMO: filtros de spam, jogos — sem obrigações específicas além de boas práticas"
          ]
        }
      ]
    },
    4: {
      title: "Registro de Logs de Auditoria — Artigo 12 EU AI Act",
      sections: [
        {
          heading: "1. REQUISITOS DE LOGGING",
          items: [
            "Sistemas de IA de alto risco devem manter registos automáticos durante todo o ciclo de vida",
            "Os logs devem permitir rastrear o funcionamento do sistema e facilitar monitorização pós-comercialização"
          ]
        },
        {
          heading: "2. INFORMAÇÕES A REGISTRAR",
          items: [
            "Data e hora de cada utilização do sistema",
            "Identificação do operador/utilizador responsável",
            "Dados de entrada fornecidos ao sistema",
            "Outputs/decisões gerados pelo sistema",
            "Período mínimo de conservação dos registos: conforme regulamentação setorial aplicável"
          ]
        },
        {
          heading: "3. PROCEDIMENTOS DE ACESSO",
          items: [
            "Definir quem tem autorização para aceder aos logs",
            "Mecanismos de integridade para evitar adulteração",
            "Procedimentos de backup e recuperação"
          ]
        }
      ]
    },
    5: {
      title: "Avaliação de Impacto em Direitos Fundamentais — Artigo 27 EU AI Act",
      sections: [
        {
          heading: "1. IDENTIFICAÇÃO DO SISTEMA",
          items: [
            "Nome do sistema de IA",
            "Operador responsável pela implantação",
            "Data da avaliação"
          ]
        },
        {
          heading: "2. DIREITOS FUNDAMENTAIS IMPACTADOS",
          items: [
            "Dignidade humana — análise de impacto",
            "Liberdade e autonomia — análise de impacto",
            "Não-discriminação — análise de impacto",
            "Proteção de dados pessoais — análise de impacto",
            "Outros direitos relevantes ao contexto"
          ]
        },
        {
          heading: "3. MEDIDAS DE MITIGAÇÃO",
          items: [
            "Salvaguardas técnicas e organizacionais implementadas",
            "Procedimentos de supervisão humana",
            "Mecanismos de recurso para afetados"
          ]
        }
      ]
    },
    6: {
      title: "Política de Supervisão Humana — Artigo 14 EU AI Act",
      sections: [
        {
          heading: "1. OBJETIVO",
          items: [
            "Estabelecer diretrizes para supervisão humana adequada conforme Artigo 14 do EU AI Act"
          ]
        },
        {
          heading: "2. PRINCÍPIOS DE SUPERVISÃO",
          items: [
            "Capacidade de compreender o funcionamento do sistema",
            "Capacidade de monitorar a operação em tempo real",
            "Capacidade de intervir, corrigir ou interromper o sistema",
            "Capacidade de decidir não utilizar o sistema em casos específicos"
          ]
        },
        {
          heading: "3. RESPONSABILIDADES",
          items: [
            "Designação formal de responsáveis pela supervisão",
            "Formação obrigatória e certificação dos supervisores",
            "Procedimentos de escalação para decisões críticas",
            "Documentação de todas as intervenções humanas"
          ]
        }
      ]
    }
  };

  const generateQuickPDF = (docId: number, docName: string) => {
    const template = documentPDFContent[docId];
    if (!template) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;
    let pageNumber = 1;

    const addFooter = () => {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `EU AI Act Compliance Tool • Versão 1.0 • ${new Date().toLocaleDateString("pt-BR")} • Página ${pageNumber}`,
        margin,
        pageHeight - 10
      );
    };

    const checkPageBreak = (neededSpace: number = 30) => {
      if (yPosition > pageHeight - neededSpace - 25) {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = 30;
        // Add header on new page
        pdf.setFillColor(12, 25, 41);
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setFillColor(212, 175, 55);
        pdf.rect(0, 20, pageWidth, 2, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(template.title, margin, 13);
      }
    };

    // Header
    pdf.setFillColor(12, 25, 41);
    pdf.rect(0, 0, pageWidth, 45, "F");
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 45, pageWidth, 2, "F");

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(template.title, pageWidth - 2 * margin);
    pdf.text(titleLines, margin, 22);

    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Regulamento (UE) 2024/1689 — EU AI Act`, margin, 35);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, margin, 42);

    yPosition = 60;

    // Content
    for (const section of template.sections) {
      checkPageBreak(40);

      // Section heading with background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin - 3, yPosition - 5, pageWidth - 2 * margin + 6, 12, "F");
      pdf.setFillColor(212, 175, 55);
      pdf.rect(margin - 3, yPosition - 5, 3, 12, "F");

      pdf.setTextColor(12, 25, 41);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(section.heading, margin + 5, yPosition + 3);
      yPosition += 18;

      // Section items
      for (const item of section.items) {
        checkPageBreak(15);

        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        // Check if it's a sub-item (starts with -)
        const isSubItem = item.startsWith("-");
        const bulletX = isSubItem ? margin + 10 : margin;
        const textX = bulletX + 6;
        const textContent = isSubItem ? item.substring(2) : item;

        // Gold bullet
        pdf.setFillColor(212, 175, 55);
        pdf.circle(bulletX + 2, yPosition - 1.5, 1.2, "F");

        const lines = pdf.splitTextToSize(textContent, pageWidth - textX - margin);
        for (const line of lines) {
          checkPageBreak(8);
          pdf.text(line, textX, yPosition);
          yPosition += 5.5;
        }
        yPosition += 2;
      }

      yPosition += 8;
    }

    addFooter();
    pdf.save(`${docName.replace(/\s+/g, "_")}_v1.0_${new Date().toISOString().split("T")[0]}.pdf`);
  };


  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch system updates
  useEffect(() => {
    const fetchSystemUpdates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("system_updates")
          .select("*")
          .order("priority", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching system updates:", error);
        } else {
          setSystemUpdates(data || []);
        }
      } catch (error) {
        console.error("Error fetching system updates:", error);
      } finally {
        setUpdatesLoading(false);
      }
    };

    fetchSystemUpdates();
  }, [user]);

  // Fetch system announcements (global notifications)
  useEffect(() => {
    const fetchSystemAnnouncements = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("system_announcements")
          .select("*")
          .order("priority", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching system announcements:", error);
        } else {
          setSystemAnnouncements((data as SystemAnnouncement[]) || []);
        }
      } catch (error) {
        console.error("Error fetching system announcements:", error);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchSystemAnnouncements();
  }, [user]);

  // Verify payment if session_id is present in URL (redirect from Stripe)
  useEffect(() => {
    const verifyPaymentFromUrl = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId || !user || isVerifyingPayment) return;
      
      setIsVerifyingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) {
          console.error("Payment verification error:", error);
          toast.error("Erro ao verificar pagamento.");
        } else if (data?.paid) {
          toast.success("Pagamento confirmado! Documentos desbloqueados.");
          await refreshPurchase();
        }
      } catch (error) {
        console.error("Payment verification error:", error);
      } finally {
        setIsVerifyingPayment(false);
        // Clean up the URL
        searchParams.delete("session_id");
        setSearchParams(searchParams, { replace: true });
      }
    };

    verifyPaymentFromUrl();
  }, [searchParams, user, refreshPurchase, setSearchParams, isVerifyingPayment]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container-legal">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Painel de Conformidade
              </h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo, {user.email}! Acompanhe seu progresso rumo à conformidade total.
              </p>
            </div>
            {hasCompliancePack && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenCustomerPortal}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Gerir Assinatura / Faturação
              </Button>
            )}
          </div>

          {/* Payment Failed Warning Banner */}
          {isPaymentFailed && (
            <div className="legal-card p-6 mb-8 border-red-500/50 bg-red-500/10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-lg font-semibold text-red-500 mb-1">
                    ⚠️ Assinatura Pendente
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Houve um problema com o pagamento da sua assinatura. Os downloads de documentos estão temporariamente bloqueados.
                    Por favor, atualize seus dados de pagamento para continuar usando o serviço.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={handleOpenCustomerPortal}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Atualizar Pagamento
                </Button>
              </div>
            </div>
          )}

          {/* Global System Announcements Section */}
          {!announcementsLoading && systemAnnouncements.length > 0 && (
            <div className="legal-card p-6 mb-8 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Comunicados Importantes
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Mensagens importantes da administração
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {systemAnnouncements.map((announcement) => {
                  const getAnnouncementIcon = (type: string) => {
                    switch (type) {
                      case "urgent":
                        return <AlertTriangle className="w-4 h-4 text-red-500" />;
                      case "update":
                        return <Info className="w-4 h-4 text-blue-500" />;
                      case "maintenance":
                        return <Settings className="w-4 h-4 text-amber-500" />;
                      default:
                        return <Bell className="w-4 h-4 text-primary" />;
                    }
                  };
                  
                  const getAnnouncementBadge = (type: string) => {
                    switch (type) {
                      case "urgent":
                        return { bg: "bg-red-500/10", text: "text-red-500", label: "Urgente" };
                      case "update":
                        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Atualização" };
                      case "maintenance":
                        return { bg: "bg-amber-500/10", text: "text-amber-500", label: "Manutenção" };
                      default:
                        return { bg: "bg-primary/10", text: "text-primary", label: "Comunicado" };
                    }
                  };
                  
                  const badge = getAnnouncementBadge(announcement.announcement_type);
                  
                  return (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all bg-background"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getAnnouncementIcon(announcement.announcement_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-foreground">
                              {announcement.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(announcement.published_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System Notifications Section */}
          <div className="legal-card p-6 mb-8 border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Notificações do Sistema
                </h2>
                <p className="text-xs text-muted-foreground">
                  Atualizações regulatórias e novos templates
                </p>
              </div>
            </div>
            
            {updatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : systemUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {systemUpdates.map((update) => {
                  const getUpdateIcon = (type: string) => {
                    switch (type) {
                      case "regulation":
                        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                      case "template":
                        return <FileText className="w-4 h-4 text-green-500" />;
                      case "warning":
                        return <ShieldAlert className="w-4 h-4 text-red-500" />;
                      default:
                        return <Info className="w-4 h-4 text-blue-500" />;
                    }
                  };
                  
                  const getUpdateBadge = (type: string) => {
                    switch (type) {
                      case "regulation":
                        return { bg: "bg-amber-500/10", text: "text-amber-500", label: "Regulação" };
                      case "template":
                        return { bg: "bg-green-500/10", text: "text-green-500", label: "Template" };
                      case "warning":
                        return { bg: "bg-red-500/10", text: "text-red-500", label: "Alerta" };
                      default:
                        return { bg: "bg-blue-500/10", text: "text-blue-500", label: "Info" };
                    }
                  };
                  
                  const badge = getUpdateBadge(update.update_type);
                  
                  return (
                    <div
                      key={update.id}
                      className="p-4 rounded-lg border border-border hover:border-accent/30 transition-all bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getUpdateIcon(update.update_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-foreground">
                              {update.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {update.content}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(update.published_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assessment History Section */}
          <div className="legal-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <History className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Histórico de Avaliações
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suas avaliações de risco anteriores
                </p>
              </div>
            </div>
            <AssessmentHistory />
          </div>

          {/* Compliance Pack Status / Purchase CTA */}
          {!purchaseLoading && (
            <PricingCards hasCompliancePack={hasCompliancePack} />
          )}

          {/* AI Literacy Guide Section - Compliance Pack Feature (show only if purchased) */}
          {hasCompliancePack && (
            <div className="legal-card p-6 mb-8 bg-gradient-to-r from-gold/5 to-accent/5 border-gold/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Guia de Literacia em IA (Artigo 4)
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
                      ✓ Desbloqueado
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Documento profissional de 8 páginas baseado no EU AI Act 2026. Inclui introdução à IA para colaboradores, 
                    direitos e responsabilidades, identificação de vieses, e procedimentos internos de reporte.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <BookOpen className="h-3 w-3" /> Formação Completa
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Conformidade Art. 4
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
                      <FileText className="h-3 w-3" /> Personalizado
                    </span>
                  </div>
                </div>
                <Button 
                  variant="gold" 
                  size="lg"
                  onClick={handleDownloadLiteracyGuide}
                  disabled={generatingLiteracyGuide}
                  className="flex items-center gap-2 min-w-[180px]"
                >
                  {generatingLiteracyGuide ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {generatingLiteracyGuide ? "Gerando..." : "Download PDF"}
                </Button>
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className="legal-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-trust-gradient flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Progresso de Conformidade
                  </h2>
                  <span className="text-2xl font-bold text-accent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {completedTasks} de {totalTasks} tarefas concluídas • Prazo: Agosto 2026
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Documents Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Templates de Documentos
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => {
                  const DocIcon = doc.icon;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <DocIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.format} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-opacity ${hasCompliancePack ? 'opacity-0 group-hover:opacity-100' : 'opacity-50'}`}
                        onClick={() => handleDocumentDownload(doc.id, doc.name)}
                        title={hasCompliancePack ? "Download" : "Requer Dossiê de Conformidade"}
                      >
                        {hasCompliancePack ? (
                          <Download className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setDocumentsOpen(true)}
              >
                Ver Todos os Documentos
              </Button>
            </div>

            {/* Checklist Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Checklist de Obrigações
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedTasks}/{totalTasks}
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {tasks.map((task) => {
                  const isLocked = task.premium && !hasCompliancePack;
                  
                  return (
                    <div
                      key={task.key}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                        isLocked 
                          ? "border-border bg-muted/20 cursor-not-allowed opacity-60"
                          : task.completed
                            ? "border-accent/30 bg-accent/5 cursor-pointer"
                            : "border-border hover:border-accent/50 cursor-pointer"
                      } ${task.loading ? "opacity-70" : ""}`}
                      onClick={() => !task.loading && !isLocked && toggleTask(task.key)}
                    >
                      <div className="relative mt-0.5">
                        {task.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        ) : isLocked ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Lock className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adquira o Dossiê de Conformidade para desbloquear esta tarefa</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.key)}
                            disabled={isLocked}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isLocked
                              ? "text-muted-foreground"
                              : task.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                          }`}
                        >
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {task.category}
                          </span>
                          {isLocked && (
                            <span className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                      {task.completed && !task.loading && !isLocked && (
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Help Banner */}
          <div className="legal-card p-6 mt-8 bg-gradient-to-r from-primary/5 to-accent/10 border-accent/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Precisa de ajuda com a conformidade?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Nossa equipe de especialistas está pronta para auxiliar sua empresa 
                  em cada etapa do processo de adequação ao EU AI Act.
                </p>
                <p className="text-xs text-accent font-medium flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Precisa de uma implementação personalizada para sistemas de Alto Risco? Fale com um especialista.
                </p>
              </div>
              <Button 
                variant="gold" 
                onClick={() => setCalendlyOpen(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Agendar Consultoria
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <DocumentsModal open={documentsOpen} onOpenChange={setDocumentsOpen} />
      
      <PopupModal
        url="https://calendly.com/cletoguarda/30min"
        onModalClose={() => setCalendlyOpen(false)}
        open={calendlyOpen}
        rootElement={document.getElementById("root") as HTMLElement}
        pageSettings={{
          backgroundColor: "0c1929",
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: "d4af37",
          textColor: "f8fafc",
        }}
      />
    </div>
  );
};

export default Dashboard;
