import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
  Ban,
  Calendar,
  ChevronRight,
  Download,
  Eye,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
} from "lucide-react";

interface RiskAssessment {
  id: string;
  risk_classification: string;
  risk_score: number;
  legal_justification: string | null;
  relevant_articles: string[] | null;
  priority_actions: string[] | null;
  created_at: string;
  responses: unknown;
}

type RiskClassification = "PROIBIDO" | "ALTO_RISCO" | "RISCO_LIMITADO" | "RISCO_MINIMO" | "FORA_DE_ESCOPO";

const AssessmentHistory = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Erro ao carregar histórico de avaliações.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (classification: string) => {
    const configs: Record<string, { label: string; color: string; icon: typeof Ban }> = {
      PROIBIDO: { label: "Proibido", color: "text-risk-prohibited", icon: Ban },
      ALTO_RISCO: { label: "Alto Risco", color: "text-risk-high", icon: ShieldAlert },
      RISCO_LIMITADO: { label: "Risco Limitado", color: "text-risk-limited", icon: Eye },
      RISCO_MINIMO: { label: "Risco Mínimo", color: "text-risk-minimal", icon: Gauge },
      FORA_DE_ESCOPO: { label: "Fora do Âmbito", color: "text-muted-foreground", icon: ShieldOff },
    };
    return configs[classification] || configs.RISCO_MINIMO;
  };

  const generatePDFFromAssessment = useCallback((assessment: RiskAssessment) => {
    setGeneratingPDF(assessment.id);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * (fontSize * 0.4);
      };

      const checkNewPage = (neededSpace: number) => {
        if (yPos + neededSpace > 270) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Header
      doc.setFillColor(15, 30, 60);
      doc.rect(0, 0, pageWidth, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("EU AI-Compliance Master", margin, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório de Diagnóstico de Conformidade", margin, 30);

      doc.setFontSize(9);
      const createdDate = new Date(assessment.created_at).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Avaliação realizada em: ${createdDate}`, margin, 40);

      yPos = 60;

      // Risk Classification Box
      const riskLabels: Record<string, string> = {
        PROIBIDO: "SISTEMA PROIBIDO",
        ALTO_RISCO: "ALTO RISCO",
        RISCO_LIMITADO: "RISCO LIMITADO",
        RISCO_MINIMO: "RISCO MÍNIMO",
        FORA_DE_ESCOPO: "FORA DO ÂMBITO",
      };

      const riskColors: Record<string, [number, number, number]> = {
        PROIBIDO: [220, 38, 38],
        ALTO_RISCO: [234, 88, 12],
        RISCO_LIMITADO: [202, 138, 4],
        RISCO_MINIMO: [22, 163, 74],
        FORA_DE_ESCOPO: [100, 116, 139],
      };

      const classification = assessment.risk_classification as RiskClassification;
      const [r, g, b] = riskColors[classification] || [100, 116, 139];

      doc.setFillColor(r, g, b);
      doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Classificação: ${riskLabels[classification] || classification}`,
        pageWidth / 2,
        yPos + 16,
        { align: "center" }
      );

      yPos += 40;

      // Legal Justification
      if (assessment.legal_justification) {
        doc.setTextColor(15, 30, 60);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("1. Justificativa Legal", margin, yPos);

        yPos += 8;
        doc.setDrawColor(200, 168, 87);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, margin + 40, yPos);

        yPos += 10;
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        yPos = addWrappedText(assessment.legal_justification, margin, yPos, contentWidth, 10);

        yPos += 15;
      }

      // Relevant Articles
      if (assessment.relevant_articles && assessment.relevant_articles.length > 0) {
        checkNewPage(60);

        doc.setTextColor(15, 30, 60);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("2. Artigos Relevantes do EU AI Act", margin, yPos);

        yPos += 8;
        doc.setDrawColor(200, 168, 87);
        doc.line(margin, yPos, margin + 60, yPos);

        yPos += 10;

        assessment.relevant_articles.forEach((article) => {
          checkNewPage(10);
          doc.setFillColor(200, 168, 87);
          doc.circle(margin + 3, yPos - 2, 1.5, "F");

          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(article, margin + 10, yPos);
          yPos += 8;
        });

        yPos += 15;
      }

      // Priority Actions
      if (assessment.priority_actions && assessment.priority_actions.length > 0) {
        checkNewPage(60);

        doc.setTextColor(15, 30, 60);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("3. Ações Prioritárias", margin, yPos);

        yPos += 8;
        doc.setDrawColor(200, 168, 87);
        doc.line(margin, yPos, margin + 40, yPos);

        yPos += 10;

        assessment.priority_actions.forEach((action, idx) => {
          checkNewPage(12);
          doc.setFillColor(22, 163, 74);
          doc.roundedRect(margin, yPos - 4, 5, 5, 1, 1, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(`${idx + 1}`, margin + 1.5, yPos);

          doc.setTextColor(60, 60, 60);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          yPos = addWrappedText(action, margin + 10, yPos, contentWidth - 10, 10);
          yPos += 4;
        });
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(15, 30, 60);
        doc.rect(0, 285, pageWidth, 12, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("EU AI-Compliance Master | Regulamento (UE) 2024/1689", margin, 291);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 291, { align: "right" });
      }

      const fileName = `EU-AI-Act-Diagnostico-${new Date(assessment.created_at).toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGeneratingPDF(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Nenhuma avaliação encontrada
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete o diagnóstico de risco para ver seu histórico aqui.
        </p>
        <Button asChild>
          <a href="/assessment">Iniciar Diagnóstico</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {assessments.length} avaliação(ões) encontrada(s)
        </p>
        <Button variant="ghost" size="sm" onClick={fetchAssessments}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {assessments.map((assessment) => {
          const config = getRiskConfig(assessment.risk_classification);
          const Icon = config.icon;
          const createdDate = new Date(assessment.created_at);

          return (
            <div
              key={assessment.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${config.color}`}>
                      {config.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Score: {assessment.risk_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {createdDate.toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => generatePDFFromAssessment(assessment)}
                disabled={generatingPDF === assessment.id}
              >
                {generatingPDF === assessment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssessmentHistory;
